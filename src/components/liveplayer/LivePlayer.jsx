import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Artplayer from "artplayer";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

// External m3u8 proxy if configured, otherwise the proxy built into the Vite
// dev/preview server (see vite.config.js).
const PROXY_BASE =
  import.meta.env.VITE_M3U8_PROXY_URL?.split(",")[0] ||
  (import.meta.env.DEV ? "/hls-proxy?url=" : "");

// Hosts known to reject browser origins, so skip straight to the proxy
const CORS_LOCKED = /(^|\.)(jmp2\.uk|pluto\.tv)$/i;

function buildProxyUrl(url, referrer, userAgent) {
  const headers = {};
  if (referrer) headers.referer = referrer;
  if (userAgent) headers["user-agent"] = userAgent;
  return (
    PROXY_BASE +
    encodeURIComponent(url) +
    (Object.keys(headers).length
      ? "&headers=" + encodeURIComponent(JSON.stringify(headers))
      : "")
  );
}

function needsProxy(url, referrer, userAgent) {
  try {
    const { protocol, hostname } = new URL(url);
    return (
      Boolean(referrer || userAgent) ||
      CORS_LOCKED.test(hostname) ||
      (protocol === "http:" && window.location.protocol === "https:")
    );
  } catch {
    return false;
  }
}

function LivePlayer({ url, referrer, userAgent, name, geoBlocked }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url || !containerRef.current) return;
    setStatus("loading");

    let usingProxy = Boolean(PROXY_BASE) && needsProxy(url, referrer, userAgent);
    const startUrl = usingProxy ? buildProxyUrl(url, referrer, userAgent) : url;

    const fail = (art) => {
      if (!usingProxy && PROXY_BASE) {
        usingProxy = true;
        art.switchUrl(buildProxyUrl(url, referrer, userAgent));
        return;
      }
      setStatus("error");
    };

    const art = new Artplayer({
      container: containerRef.current,
      url: startUrl,
      type: "m3u8",
      isLive: true,
      autoplay: true,
      volume: 1,
      setting: true,
      pip: true,
      fullscreen: true,
      fullscreenWeb: true,
      mutex: true,
      playsInline: true,
      lock: true,
      airplay: true,
      autoOrientation: true,
      aspectRatio: true,
      theme: "#00ff66",
      moreVideoAttr: { crossOrigin: "anonymous", playsInline: true },
      plugins: [
        artplayerPluginHlsControl({
          quality: {
            setting: true,
            getName: (level) => (level.height ? level.height + "P" : "Auto"),
            title: "Quality",
            auto: "Auto",
          },
          audio: {
            setting: true,
            getName: (track) => track.name || track.lang || "Default",
            title: "Audio",
            auto: "Auto",
          },
        }),
      ],
      customType: {
        m3u8(video, src, player) {
          if (player.hls) player.hls.destroy();
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (!data.fatal) return;
              if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
                player.hls = null;
                fail(player);
              }
            });
            player.hls = hls;
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.addEventListener("error", () => fail(player), { once: true });
          } else {
            setStatus("unsupported");
          }
        },
      },
    });

    art.on("video:playing", () => setStatus("playing"));
    art.on("destroy", () => art.hls?.destroy());

    return () => {
      art.hls?.destroy();
      art.destroy(false);
    };
  }, [url, referrer, userAgent, attempt]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {(status === "error" || status === "unsupported") && (
        <div className="absolute inset-0 z-[200] bg-[#050b07]/95 flex flex-col items-center justify-center text-center gap-y-3 px-6">
          <p className="text-xl font-bold text-[#00ff66]">
            {status === "unsupported"
              ? "Your browser can't play HLS streams"
              : `${name || "This channel"} isn't playing right now`}
          </p>
          <p className="text-white/70 max-w-[520px] text-[14px]">
            Free streams come and go. The channel may be offline or not 24/7
            {geoBlocked ? ", or it's geo-blocked outside its home country" : ""}.
            {!PROXY_BASE &&
              " Some streams block browser playback. Set VITE_M3U8_PROXY_URL so they play through a proxy."}
          </p>
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <button
              onClick={() => setAttempt((n) => n + 1)}
              className="bg-[#00ff66] text-black font-semibold px-5 py-2 rounded-3xl hover:bg-white"
            >
              Try again
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 text-white font-semibold px-5 py-2 rounded-3xl hover:bg-white/20"
            >
              Open stream URL (VLC etc.)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default LivePlayer;

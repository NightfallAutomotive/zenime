import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Artplayer from "artplayer";
import {
  reportPlayback,
  stopEncoding,
  streamUrl,
} from "@/src/utils/jellyfin.utils";

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

const PROGRESS_INTERVAL = 10_000;

// Plays a Jellyfin movie/episode over HLS and reports progress back to the
// server so resume points and watched status stay in sync.
function JellyfinPlayer({ jf, item, startAt = 0, audioIndex, subtitleIndex, onEnded }) {
  const containerRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  const positionRef = useRef(startAt);
  const [error, setError] = useState(null);
  onEndedRef.current = onEnded;

  // New item: start from its resume point. Track changes keep the position.
  useEffect(() => {
    positionRef.current = startAt;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.Id]);

  useEffect(() => {
    if (!containerRef.current) return;
    const startFrom = positionRef.current || 0;
    setError(null);
    const playSessionId = crypto.randomUUID().replace(/-/g, "");
    const url = streamUrl(jf, item, { playSessionId, audioIndex, subtitleIndex });
    const session = { item, playSessionId };
    let started = false;
    let timer;

    const art = new Artplayer({
      container: containerRef.current,
      url,
      type: "m3u8",
      autoplay: true,
      volume: 1,
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      pip: true,
      fullscreen: true,
      fullscreenWeb: true,
      mutex: true,
      playsInline: true,
      lock: true,
      airplay: true,
      autoOrientation: true,
      fastForward: true,
      hotkey: true,
      theme: "#00ff66",
      customType: {
        m3u8(video, src, player) {
          if (player.hls) player.hls.destroy();
          if (Hls.isSupported()) {
            const hls = new Hls({ startPosition: startFrom || -1 });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (!data.fatal) return;
              if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
              else setError(data.response?.code ? `Server returned ${data.response.code}` : data.details);
            });
            player.hls = hls;
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            if (startFrom) video.addEventListener("loadedmetadata", () => (video.currentTime = startFrom), { once: true });
          } else {
            setError("This browser can't play HLS.");
          }
        },
      },
    });

    art.on("video:playing", () => {
      if (!started) {
        started = true;
        reportPlayback(jf, "start", { ...session, seconds: art.currentTime });
        timer = setInterval(
          () => reportPlayback(jf, "progress", { ...session, seconds: art.currentTime, paused: !art.playing }),
          PROGRESS_INTERVAL
        );
      }
    });
    art.on("pause", () => started && reportPlayback(jf, "progress", { ...session, seconds: art.currentTime, paused: true }));
    art.on("video:timeupdate", () => (positionRef.current = art.currentTime));
    art.on("video:ended", () => onEndedRef.current?.());

    return () => {
      clearInterval(timer);
      if (started) reportPlayback(jf, "stop", { ...session, seconds: art.currentTime });
      stopEncoding(jf, playSessionId);
      art.hls?.destroy();
      art.destroy(false);
    };
  }, [jf, item, audioIndex, subtitleIndex]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      {error && (
        <div className="absolute inset-0 z-[200] bg-[#050b07]/95 flex flex-col items-center justify-center text-center gap-y-3 px-6">
          <p className="text-xl font-bold text-[#00ff66]">Playback failed</p>
          <p className="text-white/70 text-[14px] max-w-[480px]">
            {error}. Check that transcoding is allowed for your user in
            Jellyfin (Dashboard → Users → Media playback).
          </p>
        </div>
      )}
    </div>
  );
}

export default JellyfinPlayer;

import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LivePlayer from "@/src/components/liveplayer/LivePlayer";
import ChannelGrid from "@/src/components/channelcard/ChannelGrid";
import { ChannelLogo } from "@/src/components/channelcard/ChannelCard";
import { PlayOnKodi } from "@/src/components/kodi/KodiControls";
import { kodiFileForChannel } from "@/src/utils/kodi.utils";
import {
  getAllChannels,
  getAnimeChannels,
  getCategoryChannels,
  getCountryChannels,
} from "@/src/utils/iptv.utils";

// `from` is where the viewer came from: "anime", "index",
// "category:<id>" or "country:<code>"
function loaderFor(from) {
  if (from === "anime") return getAnimeChannels;
  const [kind, id] = (from || "").split(":");
  if (kind === "category") return () => getCategoryChannels(id);
  if (kind === "country") return () => getCountryChannels(id);
  return getAllChannels;
}

function Watch() {
  const [params] = useSearchParams();
  const url = params.get("url");
  const name = params.get("name") || "Live channel";
  const logo = params.get("logo") || "";
  const categories = (params.get("cat") || "").split(";").filter(Boolean);
  const from = params.get("from") || "";
  const geoBlocked = params.get("geo") === "1";

  const loadMore = useCallback(
    () =>
      loaderFor(from)().then((list) =>
        list.filter((c) => c.url !== url).slice(0, 18)
      ),
    [from, url]
  );

  if (!url) {
    return (
      <div className="pt-[120px] px-4 text-center">
        <p className="text-xl">No channel selected.</p>
        <Link to="/live" className="text-[#00ff66] underline">
          Browse live TV
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-[90px] max-[600px]:pt-[110px]">
      <div className="max-w-[1200px] mx-auto">
        <LivePlayer
          key={url}
          url={url}
          name={name}
          referrer={params.get("ref") || ""}
          userAgent={params.get("ua") || ""}
          geoBlocked={geoBlocked}
        />
        <div className="flex items-center gap-x-4 mt-5">
          <div className="w-24 h-14 shrink-0 bg-[#0c1a12] rounded-lg flex items-center justify-center">
            <ChannelLogo name={name} logo={logo} compact className="!text-xl" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-7 line-clamp-1">{name}</h1>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="bg-[#e4002b] text-white text-[11px] font-bold px-[6px] rounded-[3px] uppercase">
                Live
              </span>
              {categories.map((c) => (
                <Link
                  key={c}
                  to={`/live?category=${c.toLowerCase()}`}
                  className="bg-white/10 hover:bg-white/20 text-[11px] font-semibold px-[6px] rounded-[3px]"
                >
                  {c}
                </Link>
              ))}
              {geoBlocked && (
                <span className="bg-[#FF5700] text-white text-[11px] font-bold px-[6px] rounded-[3px]">
                  Geo-blocked
                </span>
              )}
            </div>
          </div>
        </div>
        <PlayOnKodi
          className="mt-4"
          file={kodiFileForChannel({
            url,
            referrer: params.get("ref") || "",
            userAgent: params.get("ua") || "",
          })}
        />
      </div>
      <ChannelGrid
        label="More channels"
        load={loadMore}
        from={from}
        className="mt-14"
      />
    </div>
  );
}

export default Watch;

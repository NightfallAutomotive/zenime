import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBaby,
  faBriefcase,
  faCar,
  faChurch,
  faDragon,
  faFaceLaughBeam,
  faFilm,
  faFlask,
  faFutbol,
  faGraduationCap,
  faLandmark,
  faMusic,
  faNewspaper,
  faPlay,
  faPlaneDeparture,
  faShoppingBag,
  faTv,
  faUtensils,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { watchLink } from "@/src/utils/iptv.utils";
import { imageBlockedInRegion } from "@/src/config/region";

const CATEGORY_ICONS = {
  animation: faDragon,
  auto: faCar,
  business: faBriefcase,
  classic: faFilm,
  comedy: faFaceLaughBeam,
  cooking: faUtensils,
  documentary: faVideo,
  education: faGraduationCap,
  kids: faBaby,
  legislative: faLandmark,
  movies: faFilm,
  music: faMusic,
  news: faNewspaper,
  religious: faChurch,
  science: faFlask,
  series: faTv,
  shop: faShoppingBag,
  sports: faFutbol,
  travel: faPlaneDeparture,
};

const iconFor = (categories = []) =>
  categories.map((c) => CATEGORY_ICONS[c.toLowerCase()]).find(Boolean) || faTv;

// Channel logo, or a styled name card when there's no usable logo (missing,
// broken, or on a host that's blocked in this region).
// `compact` is for small spots like search suggestions: initials only.
export function ChannelLogo({ name, logo, categories, compact = false, className = "" }) {
  const [failed, setFailed] = useState(false);
  const usable = logo && !failed && !imageBlockedInRegion(logo);

  if (usable) {
    return (
      <img
        src={logo}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`max-w-[75%] max-h-[70%] object-contain ${className}`}
      />
    );
  }

  if (compact) {
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    return (
      <span className={`font-logo text-[#00ff66] text-sm [text-shadow:0_0_8px_rgba(0,255,102,.6)] ${className}`}>
        {initials}
      </span>
    );
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center gap-y-2 px-4 text-center bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,.14),transparent_70%)] ${className}`}
    >
      {/* faint CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(0,0,0,.45)_3px)]" />
      <FontAwesomeIcon icon={iconFor(categories)} className="relative text-[#00ff66]/70 text-xl" />
      <span className="relative font-logo uppercase leading-tight text-[#00ff66] text-[clamp(14px,1.5vw,22px)] line-clamp-2 [text-shadow:0_0_10px_rgba(0,255,102,.55)]">
        {name}
      </span>
    </div>
  );
}

function ChannelCard({ channel, from }) {
  return (
    <Link
      to={watchLink(channel, from)}
      className="flex flex-col gap-y-2 group"
      title={channel.name}
    >
      <div className="relative w-full aspect-video rounded-lg bg-[#0c1a12] flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-[#00ff66]/60 transition-all">
        <ChannelLogo
          name={channel.name}
          logo={channel.logo}
          categories={channel.categories}
          className="group-hover:blur-[3px] transition-all duration-300"
        />
        <FontAwesomeIcon
          icon={faPlay}
          className="absolute text-[34px] text-white opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute left-2 bottom-2 flex gap-x-1">
          <span className="flex items-center gap-x-1 bg-[#e4002b] text-white text-[11px] font-bold px-[6px] rounded-[3px] uppercase">
            <span className="w-[6px] h-[6px] rounded-full bg-white animate-pulse" />
            Live
          </span>
          {channel.quality && (
            <span className="bg-[#b8ffd2] text-black text-[11px] font-bold px-[6px] rounded-[3px]">
              {channel.quality}
            </span>
          )}
        </div>
        {channel.geoBlocked && (
          <span className="absolute right-2 top-2 bg-[#FF5700] text-white text-[10px] font-bold px-[6px] rounded-[3px]">
            Geo-blocked
          </span>
        )}
      </div>
      <div>
        <p className="font-semibold text-[15px] leading-5 line-clamp-1 group-hover:text-[#00ff66]">
          {channel.name}
        </p>
        <p className="text-[12px] text-white/50 line-clamp-1">
          {channel.categories.join(" · ") || "Live TV"}
          {channel.notAlways && " · Not 24/7"}
        </p>
      </div>
    </Link>
  );
}

export default ChannelCard;

import { Link } from "react-router-dom";
import { FaYoutube } from "react-icons/fa";

function YouTubeCard({ channel }) {
  return (
    <Link
      to={`/ondemand/youtube/${channel.id}`}
      className="group flex flex-col gap-y-3 bg-[#0c1a12] rounded-xl p-4 border border-white/5 hover:border-[#00ff66]/60 transition-all"
    >
      <div className="flex items-center gap-x-3">
        <div
          className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center text-2xl text-white"
          style={{ background: channel.color }}
        >
          <FaYoutube />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[16px] leading-5 line-clamp-1 group-hover:text-[#00ff66]">
            {channel.name}
          </p>
          <p className="text-[12px] text-white/50">Plays here · via YouTube</p>
        </div>
      </div>
      <p className="text-[14px] text-white/75 leading-5">{channel.description}</p>
      <div className="flex flex-wrap gap-1 mt-auto">
        {channel.tags.map((tag) => (
          <span
            key={tag}
            className={`text-[11px] font-semibold px-2 py-[1px] rounded-[3px] capitalize ${
              tag === "anime" ? "bg-[#00ff66] text-black" : "bg-white/10 text-white/80"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function YouTubeGrid({ channels, className = "" }) {
  return (
    <div
      className={`grid grid-cols-4 gap-4 max-[1300px]:grid-cols-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 ${className}`}
    >
      {channels.map((channel) => (
        <YouTubeCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
}

export default YouTubeCard;

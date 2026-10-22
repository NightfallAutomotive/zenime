import { useEffect, useState } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import { FaChevronRight, FaExternalLinkAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ChannelLogo } from "../channelcard/ChannelCard";
import { searchServices } from "@/src/data/services";
import {
  getAllChannels,
  searchChannels,
  watchLink,
} from "@/src/utils/iptv.utils";

const rowClass =
  "group py-2 flex items-center gap-x-3 hover:bg-[#143322] cursor-pointer px-[10px] border-b border-dashed border-white/[.075]";

function Suggestion({ keyword, className }) {
  const [channels, setChannels] = useState(null);
  const [error, setError] = useState(null);
  const services = searchServices(keyword).slice(0, 3);

  useEffect(() => {
    if (!keyword) return;
    let active = true;
    setChannels(null);
    getAllChannels()
      .then((all) => active && setChannels(searchChannels(all, keyword, 6)))
      .catch((err) => active && setError(err));
    return () => {
      active = false;
    };
  }, [keyword]);

  const loading = !channels && !error;
  const empty = channels && channels.length === 0 && services.length === 0;

  return (
    <div
      className={`bg-[#07130c] ${className} flex flex-col ${loading ? "items-center py-7" : ""}`}
      style={{ boxShadow: "0 20px 20px rgba(0, 0, 0, .3)" }}
    >
      {loading ? (
        <BouncingLoader />
      ) : error ? (
        <p className="p-3">Error loading suggestions</p>
      ) : empty ? (
        <p className="p-3 text-[17px]">No results found!</p>
      ) : (
        <div className="w-full flex flex-col pt-2 overflow-y-auto">
          {services.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={rowClass}
            >
              <div
                className="w-[50px] h-[32px] shrink-0 rounded flex items-center justify-center font-extrabold text-white"
                style={{ background: s.color }}
              >
                {s.name[0]}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 leading-5 font-bold text-[15px] group-hover:text-[#00ff66]">
                  {s.name}
                </p>
                <p className="text-[12px] text-[#8fa897]">Free service</p>
              </div>
              <FaExternalLinkAlt className="ml-auto text-[11px] text-white/40" />
            </a>
          ))}
          {channels.map((c) => (
            <Link key={c.key} to={watchLink(c, "index")} className={rowClass}>
              <div className="w-[50px] h-[32px] shrink-0 rounded bg-[#050b07] flex items-center justify-center overflow-hidden">
                <ChannelLogo name={c.name} logo={c.logo} compact />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 leading-5 font-bold text-[15px] group-hover:text-[#00ff66]">
                  {c.name}
                </p>
                <p className="text-[12px] text-[#8fa897] line-clamp-1">
                  Live · {c.categories.join(", ") || "TV"}
                </p>
              </div>
            </Link>
          ))}
          <Link
            className="w-full flex py-4 justify-center items-center bg-[#00ff66]"
            to={`/search?keyword=${encodeURIComponent(keyword)}`}
          >
            <div className="flex w-fit items-center gap-x-2">
              <p className="text-[17px] font-light text-black">View all results</p>
              <FaChevronRight className="text-black text-[12px] font-black mt-[2px]" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Suggestion;

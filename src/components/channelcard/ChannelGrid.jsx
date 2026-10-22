import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import ChannelCard from "./ChannelCard";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";

// Grid of live channels. Pass `channels` directly, or a `load` function that
// resolves to a channel list (used on the home page rows).
function ChannelGrid({
  label,
  channels: given,
  load,
  limit,
  viewMore,
  from,
  pageSize,
  className = "",
  emptyText = "No channels found.",
}) {
  const [loaded, setLoaded] = useState(null);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(pageSize || Infinity);

  useEffect(() => {
    if (!load) return;
    let active = true;
    setLoaded(null);
    setError(null);
    load()
      .then((data) => active && setLoaded(data))
      .catch((err) => active && setError(err));
    return () => {
      active = false;
    };
  }, [load]);

  useEffect(() => {
    setVisible(pageSize || Infinity);
  }, [given, loaded, pageSize]);

  const channels = given || loaded;
  const shown = channels?.slice(0, Math.min(limit || Infinity, visible));

  return (
    <section className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-2xl text-[#00ff66] max-[478px]:text-[18px] capitalize">
            {label}
            {channels && (
              <span className="ml-3 text-sm font-normal text-white/40">
                {channels.length.toLocaleString()} channels
              </span>
            )}
          </h2>
          {viewMore && (
            <Link to={viewMore} className="flex w-fit items-baseline gap-x-1 group">
              <p className="text-white text-[12px] font-semibold group-hover:text-[#00ff66]">
                View more
              </p>
              <FaChevronRight className="text-white text-[10px] group-hover:text-[#00ff66]" />
            </Link>
          )}
        </div>
      )}
      {error ? (
        <p className="text-white/60">Couldn&apos;t load channels: {error.message}</p>
      ) : !channels ? (
        <div className="flex justify-center py-10">
          <BouncingLoader />
        </div>
      ) : channels.length === 0 ? (
        <p className="text-white/60">{emptyText}</p>
      ) : (
        <>
          <div className="grid grid-cols-6 gap-x-4 gap-y-6 max-[1400px]:grid-cols-5 max-[1100px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2">
            {shown.map((channel) => (
              <ChannelCard key={channel.key} channel={channel} from={from} />
            ))}
          </div>
          {pageSize && shown.length < channels.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisible((v) => v + pageSize)}
                className="bg-[#00ff66] text-black font-semibold px-6 py-2 rounded-3xl hover:bg-white transition-colors"
              >
                Show more ({(channels.length - shown.length).toLocaleString()} left)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ChannelGrid;

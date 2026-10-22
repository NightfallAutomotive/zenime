import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChannelGrid from "@/src/components/channelcard/ChannelGrid";
import { YouTubeGrid } from "@/src/components/youtubecard/YouTubeCard";
import { YOUTUBE_CHANNELS } from "@/src/data/ondemand";
import { ServiceGrid } from "@/src/components/servicecard/ServiceCard";
import { searchServices } from "@/src/data/services";
import { getAllChannels, searchChannels } from "@/src/utils/iptv.utils";

function Search() {
  const [params] = useSearchParams();
  const keyword = params.get("keyword") || "";
  const [channels, setChannels] = useState(null);
  const [error, setError] = useState(null);
  const services = searchServices(keyword);
  const q = keyword.trim().toLowerCase();
  const youtube = q
    ? YOUTUBE_CHANNELS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q))
      )
    : [];

  useEffect(() => {
    let active = true;
    setChannels(null);
    setError(null);
    getAllChannels()
      .then((all) => active && setChannels(searchChannels(all, keyword)))
      .catch((err) => active && setError(err));
    return () => {
      active = false;
    };
  }, [keyword]);

  return (
    <div className="w-full px-4 pt-[100px] max-[600px]:pt-[120px] flex flex-col gap-y-12">
      <h1 className="text-3xl font-extrabold">
        Results for <span className="text-[#00ff66]">&ldquo;{keyword}&rdquo;</span>
      </h1>
      {services.length > 0 && (
        <section>
          <h2 className="font-bold text-2xl text-[#00ff66] mb-5">Services</h2>
          <ServiceGrid services={services} />
        </section>
      )}
      {youtube.length > 0 && (
        <section>
          <h2 className="font-bold text-2xl text-[#00ff66] mb-5">Official Channels</h2>
          <YouTubeGrid channels={youtube} />
        </section>
      )}
      {error ? (
        <p className="text-white/60">Couldn&apos;t load channels: {error.message}</p>
      ) : (
        <ChannelGrid
          label="Live channels"
          channels={channels}
          pageSize={36}
          from="index"
          emptyText="No live channels match that search."
        />
      )}
    </div>
  );
}

export default Search;

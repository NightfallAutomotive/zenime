import ChannelGrid from "@/src/components/channelcard/ChannelGrid";
import { ServiceGrid } from "@/src/components/servicecard/ServiceCard";
import { animeServices } from "@/src/data/services";
import { YouTubeGrid } from "@/src/components/youtubecard/YouTubeCard";
import { YOUTUBE_CHANNELS } from "@/src/data/ondemand";

const animeChannels = YOUTUBE_CHANNELS.filter((c) => c.tags.includes("anime"));
import { getAnimeChannels, getCategoryChannels } from "@/src/utils/iptv.utils";

const loadAnimation = () => getCategoryChannels("animation");

function Anime() {
  return (
    <div className="w-full px-4 pt-[100px] max-[600px]:pt-[120px] flex flex-col gap-y-14">
      <div>
        <h1 className="text-3xl font-extrabold">
          Free <span className="text-[#00ff66]">Anime</span>
        </h1>
        <p className="text-white/60 mt-1 text-[14px] max-w-[760px]">
          Legal ways to watch anime for free: 24/7 live anime channels that
          play right here, official publisher channels on YouTube, and free
          ad-supported services.
        </p>
      </div>
      <ChannelGrid
        label="Live Anime Channels"
        load={getAnimeChannels}
        from="anime"
      />
      <section>
        <h2 className="font-bold text-2xl text-[#00ff66] mb-5">
          Free Anime Streaming Services
        </h2>
        <ServiceGrid services={animeServices} />
      </section>
      <section>
        <h2 className="font-bold text-2xl text-[#00ff66] mb-1">
          Official Anime on YouTube
        </h2>
        <p className="text-white/60 text-[14px] mb-5">
          Full episodes uploaded by the licence holders. They play right here.
        </p>
        <YouTubeGrid channels={animeChannels} />
      </section>
      <ChannelGrid
        label="Animation Channels"
        load={loadAnimation}
        pageSize={24}
        from="category:animation"
      />
    </div>
  );
}

export default Anime;

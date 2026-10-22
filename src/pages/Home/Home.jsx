import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv, faDragon, faFilm, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { FaChevronRight } from "react-icons/fa";
import website_name from "@/src/config/website.js";
import ChannelGrid from "@/src/components/channelcard/ChannelGrid";
import { YouTubeGrid } from "@/src/components/youtubecard/YouTubeCard";
import { YOUTUBE_CHANNELS } from "@/src/data/ondemand";
import { ServiceGrid } from "@/src/components/servicecard/ServiceCard";
import { catchupServices, featuredServices } from "@/src/data/services";
import {
  getAnimeChannels,
  getCategoryChannels,
  getCountryChannels,
  homeCountry,
} from "@/src/utils/iptv.utils";

const ROWS = [
  { id: "movies", label: "Movie Channels" },
  { id: "series", label: "TV Series" },
  { id: "comedy", label: "Comedy" },
  { id: "classic", label: "Classic TV" },
  { id: "kids", label: "Kids" },
  { id: "documentary", label: "Documentary" },
];

// Stable loader references so ChannelGrid doesn't refetch on every render
const loaders = Object.fromEntries(
  ROWS.map((row) => [row.id, () => getCategoryChannels(row.id)])
);
const country = homeCountry();
const loadLocal = () => getCountryChannels(country);
const countryName =
  new Intl.DisplayNames(["en"], { type: "region" }).of(country) || country;

function Hero() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d3320]/90 via-[#0c1a12]/80 to-[#050b07]/40 border border-[#00ff66]/15 backdrop-blur-[2px] px-14 py-16 max-[900px]:px-6 max-[900px]:py-10 max-[1200px]:rounded-none">
      <div className="absolute -right-20 -top-20 w-[420px] h-[420px] rounded-full bg-[#00ff66]/10 blur-3xl" />
      <p className="text-[#00ff66] font-semibold">Free &amp; legal, no sign-up</p>
      <h1 className="font-logo text-5xl mt-3 max-w-[760px] leading-tight max-[600px]:text-3xl">
        Live TV, movies and anime in one place, all free.
      </h1>
      <p className="mt-4 text-white/70 max-w-[640px] text-[17px] max-[600px]:text-[15px]">
        {website_name} plays thousands of free-to-air live channels and
        full-length films and series right here, and points you to the best free streaming services, including where to
        watch anime legally for free.
      </p>
      <div className="flex gap-3 mt-8 flex-wrap">
        {[
          { to: "/live", label: "Watch Live TV", icon: faTv, primary: true },
          { to: "/ondemand", label: "On Demand", icon: faFilm },
          { to: "/anime", label: "Free Anime", icon: faDragon },
          { to: "/services", label: "Free Services", icon: faLayerGroup },
        ].map((b) => (
          <Link
            key={b.to}
            to={b.to}
            className={`flex items-center gap-x-2 px-6 py-3 rounded-3xl font-semibold transition-colors ${
              b.primary
                ? "bg-[#00ff66] text-black hover:bg-white"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <FontAwesomeIcon icon={b.icon} />
            {b.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="px-4 w-full max-[1200px]:px-0 pt-[88px] max-[600px]:pt-[110px]">
      <Hero />
      <div className="flex flex-col gap-y-14 mt-12 max-[1200px]:px-4">
        <ChannelGrid
          label="Live Anime Channels"
          load={getAnimeChannels}
          limit={12}
          viewMore="/anime"
          from="anime"
        />
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-2xl text-[#00ff66] max-[478px]:text-[18px]">
              Watch On Demand
            </h2>
            <Link to="/ondemand" className="flex items-baseline gap-x-1 group">
              <p className="text-[12px] font-semibold group-hover:text-[#00ff66]">
                View all
              </p>
              <FaChevronRight className="text-[10px] group-hover:text-[#00ff66]" />
            </Link>
          </div>
          <YouTubeGrid channels={YOUTUBE_CHANNELS.slice(0, 4)} />
        </section>
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-2xl text-[#00ff66] max-[478px]:text-[18px]">
              Free Streaming Services
            </h2>
            <Link to="/services" className="flex items-baseline gap-x-1 group">
              <p className="text-[12px] font-semibold group-hover:text-[#00ff66]">
                View all
              </p>
              <FaChevronRight className="text-[10px] group-hover:text-[#00ff66]" />
            </Link>
          </div>
          <ServiceGrid services={featuredServices} />
        </section>
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-2xl text-[#00ff66] max-[478px]:text-[18px]">
              UK Catch-up &amp; On-Demand
            </h2>
            <Link to="/services?tag=catchup" className="flex items-baseline gap-x-1 group">
              <p className="text-[12px] font-semibold group-hover:text-[#00ff66]">
                View all
              </p>
              <FaChevronRight className="text-[10px] group-hover:text-[#00ff66]" />
            </Link>
          </div>
          <ServiceGrid services={catchupServices} />
        </section>
        <ChannelGrid
          label={`Live in ${countryName}`}
          load={loadLocal}
          limit={12}
          viewMore={`/live?country=${country}`}
          from={`country:${country}`}
          emptyText={`No free channels listed for ${countryName}.`}
        />
        {ROWS.map((row) => (
          <ChannelGrid
            key={row.id}
            label={row.label}
            load={loaders[row.id]}
            limit={12}
            viewMore={`/live?category=${row.id}&country=`}
            from={`category:${row.id}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;

import { YouTubeGrid } from "@/src/components/youtubecard/YouTubeCard";
import { YOUTUBE_CHANNELS } from "@/src/data/ondemand";

const SECTIONS = [
  { tag: "movies", label: "Movies" },
  { tag: "anime", label: "Anime" },
  { tag: "documentary", label: "Documentaries" },
];

function OnDemand() {
  return (
    <div className="w-full px-4 pt-[100px] max-[600px]:pt-[120px] flex flex-col gap-y-14">
      <div>
        <h1 className="text-3xl font-extrabold">
          On <span className="text-[#00ff66]">Demand</span>
        </h1>
        <p className="text-white/60 mt-1 text-[14px] max-w-[760px]">
          Full-length films, series and documentaries from official channels
          that upload them for free. They play right here.
        </p>
      </div>
      {SECTIONS.map((section) => (
        <section key={section.tag}>
          <h2 className="font-bold text-2xl text-[#00ff66] mb-5">{section.label}</h2>
          <YouTubeGrid
            channels={YOUTUBE_CHANNELS.filter((c) => c.tags.includes(section.tag))}
          />
        </section>
      ))}
    </div>
  );
}

export default OnDemand;

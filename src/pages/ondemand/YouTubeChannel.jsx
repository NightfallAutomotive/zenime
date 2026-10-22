import { Link, useParams } from "react-router-dom";
import { FaYoutube } from "react-icons/fa";
import Error from "@/src/components/error/Error";
import { YouTubeGrid } from "@/src/components/youtubecard/YouTubeCard";
import { YOUTUBE_CHANNELS, longFormPlaylist, youtubeById } from "@/src/data/ondemand";
import { PlayOnKodi } from "@/src/components/kodi/KodiControls";
import { kodiFileForYouTubePlaylist } from "@/src/utils/kodi.utils";

function YouTubeChannel() {
  const { id } = useParams();
  const channel = youtubeById(id);
  if (!channel) return <Error error="404" />;

  const playlist = longFormPlaylist(channel.id);

  return (
    <div className="w-full px-4 pt-[90px] max-[600px]:pt-[110px]">
      <div className="max-w-[1200px] mx-auto">
        <Link to="/ondemand" className="text-[13px] text-white/50 hover:text-[#00ff66]">
          ← On Demand
        </Link>
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mt-2">
          {/* Privacy-enhanced embed of the channel's full-length uploads */}
          <iframe
            key={playlist}
            src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlist}&rel=0&modestbranding=1`}
            title={channel.name}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="flex items-start gap-x-4 mt-5">
          <div
            className="w-14 h-14 shrink-0 rounded-lg flex items-center justify-center text-3xl text-white"
            style={{ background: channel.color }}
          >
            <FaYoutube />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{channel.name}</h1>
            <p className="text-white/70 text-[14px] mt-1">{channel.description}</p>
            <p className="text-white/50 text-[13px] mt-2">
              Use the playlist button in the top-right of the player to pick a
              video.{" "}
              <a
                href={`https://www.youtube.com/playlist?list=${playlist}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#00ff66]"
              >
                Open on YouTube ↗
              </a>
            </p>
            <PlayOnKodi
              className="mt-3"
              label="Play on Kodi (needs YouTube add-on)"
              file={kodiFileForYouTubePlaylist(playlist)}
            />
          </div>
        </div>
      </div>
      <section className="mt-14">
        <h2 className="font-bold text-2xl text-[#00ff66] mb-5">More Channels</h2>
        <YouTubeGrid channels={YOUTUBE_CHANNELS.filter((c) => c.id !== channel.id)} />
      </section>
    </div>
  );
}

export default YouTubeChannel;

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlay, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { useConnections } from "@/src/context/ConnectionsContext";
import JellyfinPlayer from "@/src/components/jellyfinplayer/JellyfinPlayer";
import { JellyfinGrid } from "@/src/components/jellyfincard/JellyfinCard";
import { PlayOnKodi } from "@/src/components/kodi/KodiControls";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import {
  backdropUrl,
  directStreamUrl,
  getEpisodes,
  getItem,
  getItems,
  getSeasons,
  imageUrl,
  isPlayable,
  mediaStreams,
  progressPercent,
  resumeSeconds,
  runtime,
} from "@/src/utils/jellyfin.utils";
import { NotConnected, useJellyfinErrorHandler } from "./JellyfinHome";

const select =
  "bg-[#0c1a12] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#00ff66] text-[14px] max-w-full";

function EpisodeList({ jf, episodes, currentId }) {
  return (
    <div className="flex flex-col gap-y-2">
      {episodes.map((ep) => {
        const img = imageUrl(jf, ep, { height: 180 });
        const progress = progressPercent(ep);
        return (
          <Link
            key={ep.Id}
            to={`/jellyfin/item/${ep.Id}?play=1`}
            className={`flex gap-x-4 p-2 rounded-lg border hover:border-[#00ff66]/60 group ${
              ep.Id === currentId ? "border-[#00ff66]/60 bg-[#143322]" : "border-white/5 bg-[#0c1a12]/80"
            }`}
          >
            <div className="relative w-[180px] shrink-0 aspect-video rounded bg-black overflow-hidden max-[600px]:w-[120px]">
              {img && <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />}
              {progress > 0 && (
                <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-black/60">
                  <div className="h-full bg-[#00ff66]" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold group-hover:text-[#00ff66] line-clamp-1">
                {ep.IndexNumber != null && `${ep.IndexNumber}. `}
                {ep.Name}
                {ep.UserData?.Played && <FontAwesomeIcon icon={faCheck} className="ml-2 text-[#00ff66] text-[12px]" />}
              </p>
              <p className="text-[12px] text-white/50">{runtime(ep.RunTimeTicks)}</p>
              <p className="text-[13px] text-white/60 line-clamp-2 mt-1 max-[600px]:hidden">{ep.Overview}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SeriesView({ jf, series }) {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState(null);
  const [seasonId, setSeasonId] = useState(null);
  const [episodes, setEpisodes] = useState(null);

  useEffect(() => {
    getSeasons(jf, series.Id).then((list) => {
      setSeasons(list);
      // Open the first season that still has unwatched episodes
      const next = list.find((s) => !s.UserData?.Played) || list[0];
      setSeasonId(next?.Id || null);
    });
  }, [jf, series.Id]);

  useEffect(() => {
    if (!seasonId) return;
    setEpisodes(null);
    getEpisodes(jf, series.Id, seasonId).then(setEpisodes);
  }, [jf, series.Id, seasonId]);

  const nextUp = episodes?.find((e) => !e.UserData?.Played) || episodes?.[0];

  return (
    <div className="mt-8">
      {nextUp && (
        <button
          onClick={() => navigate(`/jellyfin/item/${nextUp.Id}?play=1`)}
          className="flex items-center gap-x-2 bg-[#00ff66] text-black font-semibold px-6 py-2 rounded-3xl hover:bg-white mb-6"
        >
          <FontAwesomeIcon icon={faPlay} />
          {nextUp.UserData?.PlaybackPositionTicks ? "Resume" : "Play"} {nextUp.ParentIndexNumber != null && `S${nextUp.ParentIndexNumber}:E${nextUp.IndexNumber}`}
        </button>
      )}
      {seasons && seasons.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {seasons.map((s) => (
            <button
              key={s.Id}
              onClick={() => setSeasonId(s.Id)}
              className={`px-4 py-1 rounded-3xl text-[14px] font-semibold ${
                s.Id === seasonId ? "bg-[#00ff66] text-black" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {s.Name}
            </button>
          ))}
        </div>
      )}
      {!episodes ? (
        <div className="flex justify-center py-8">
          <BouncingLoader />
        </div>
      ) : (
        <EpisodeList jf={jf} episodes={episodes} />
      )}
    </div>
  );
}

function CollectionView({ jf, item }) {
  const [children, setChildren] = useState(null);
  useEffect(() => {
    getItems(jf, { parentId: item.Id, limit: 200 }).then((r) => setChildren(r.Items || []));
  }, [jf, item.Id]);
  if (!children) return <div className="flex justify-center py-8"><BouncingLoader /></div>;
  return (
    <div className="mt-8">
      <JellyfinGrid jf={jf} items={children} />
    </div>
  );
}

function PlayableView({ jf, item }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const playing = params.get("play") === "1";
  const audioTracks = mediaStreams(item, "Audio");
  const subtitleTracks = mediaStreams(item, "Subtitle");
  const defaultAudio = item.MediaSources?.[0]?.DefaultAudioStreamIndex ?? audioTracks.find((t) => t.IsDefault)?.Index;
  const [audioIndex, setAudioIndex] = useState(defaultAudio);
  const [subtitleIndex, setSubtitleIndex] = useState(undefined);
  const [siblings, setSiblings] = useState([]);
  const resumeAt = resumeSeconds(item);
  // ?t= carries "start over" across the switch into the player
  const startAt = params.has("t") ? Number(params.get("t")) || 0 : resumeAt;

  useEffect(() => {
    setAudioIndex(defaultAudio);
    setSubtitleIndex(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.Id]);

  // Other episodes in the season, for "next episode" and the side list
  useEffect(() => {
    if (item.Type !== "Episode" || !item.SeriesId) return setSiblings([]);
    getEpisodes(jf, item.SeriesId, item.SeasonId).then(setSiblings).catch(() => setSiblings([]));
  }, [jf, item.Id, item.Type, item.SeriesId, item.SeasonId]);

  const next = useMemo(() => {
    const i = siblings.findIndex((e) => e.Id === item.Id);
    return i >= 0 ? siblings[i + 1] : null;
  }, [siblings, item.Id]);

  const play = (fromStart) => setParams(fromStart ? { play: "1", t: "0" } : { play: "1" });

  return (
    <>
      {playing && (
        <div className="mt-2">
          <JellyfinPlayer
            jf={jf}
            item={item}
            startAt={startAt}
            audioIndex={audioIndex}
            subtitleIndex={subtitleIndex}
            onEnded={() => next && navigate(`/jellyfin/item/${next.Id}?play=1`)}
          />
          <div className="flex flex-wrap gap-3 mt-3 items-center">
            {audioTracks.length > 1 && (
              <select className={select} value={audioIndex ?? ""} onChange={(e) => setAudioIndex(Number(e.target.value))}>
                {audioTracks.map((t) => (
                  <option key={t.Index} value={t.Index}>
                    Audio: {t.DisplayTitle || t.Language || `Track ${t.Index}`}
                  </option>
                ))}
              </select>
            )}
            {subtitleTracks.length > 0 && (
              <select
                className={select}
                value={subtitleIndex ?? ""}
                onChange={(e) => setSubtitleIndex(e.target.value === "" ? undefined : Number(e.target.value))}
              >
                <option value="">Subtitles: Off</option>
                {subtitleTracks.map((t) => (
                  <option key={t.Index} value={t.Index}>
                    Subtitles: {t.DisplayTitle || t.Language || `Track ${t.Index}`}
                  </option>
                ))}
              </select>
            )}
            {next && (
              <Link to={`/jellyfin/item/${next.Id}?play=1`} className="text-[14px] font-semibold hover:text-[#00ff66]">
                Next: {next.IndexNumber}. {next.Name} →
              </Link>
            )}
          </div>
        </div>
      )}
      {!playing && (
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => play(false)}
            className="flex items-center gap-x-2 bg-[#00ff66] text-black font-semibold px-6 py-2 rounded-3xl hover:bg-white"
          >
            <FontAwesomeIcon icon={faPlay} />
            {resumeAt > 0 ? `Resume from ${runtime(resumeAt * 10_000_000)}` : "Play"}
          </button>
          {resumeAt > 0 && (
            <button
              onClick={() => play(true)}
              className="flex items-center gap-x-2 bg-white/10 hover:bg-white/20 font-semibold px-5 py-2 rounded-3xl"
            >
              <FontAwesomeIcon icon={faRotateRight} />
              Start over
            </button>
          )}
        </div>
      )}
      <PlayOnKodi file={directStreamUrl(jf, item)} className="mt-4" />
      {siblings.length > 1 && (
        <section className="mt-10">
          <h2 className="font-bold text-xl text-[#00ff66] mb-4">{item.SeasonName || "Episodes"}</h2>
          <EpisodeList jf={jf} episodes={siblings} currentId={item.Id} />
        </section>
      )}
    </>
  );
}

function JellyfinItem() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { jellyfin: jf } = useConnections();
  const onError = useJellyfinErrorHandler();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jf) return;
    let active = true;
    setItem(null);
    setError(null);
    getItem(jf, id)
      .then((data) => active && setItem(data))
      .catch((err) => {
        onError(err);
        if (active) setError(err);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jf, id]);

  if (!jf) return <NotConnected />;
  if (error) return <p className="pt-[140px] px-4 text-center text-white/70">{error.message}</p>;
  if (!item) {
    return (
      <div className="pt-[160px] flex justify-center">
        <BouncingLoader />
      </div>
    );
  }

  const playing = params.get("play") === "1" && isPlayable(item);
  const backdrop = backdropUrl(jf, item);
  const poster = imageUrl(jf, item, { height: 480 });
  const meta = [
    item.ProductionYear,
    runtime(item.RunTimeTicks),
    item.OfficialRating,
    item.CommunityRating && `★ ${item.CommunityRating.toFixed(1)}`,
    item.Genres?.slice(0, 3).join(", "),
  ].filter(Boolean);

  return (
    <div className="w-full px-4 pt-[90px] max-[600px]:pt-[110px]">
      {!playing && backdrop && (
        <div className="absolute left-0 right-0 top-0 h-[520px] -z-0 pointer-events-none overflow-hidden">
          <img src={backdrop} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050b07]/60 to-[#050b07]" />
        </div>
      )}
      <div className="relative max-w-[1300px] mx-auto">
        <Link
          to={item.SeriesId ? `/jellyfin/item/${item.SeriesId}` : "/jellyfin"}
          className="text-[13px] text-white/50 hover:text-[#00ff66]"
        >
          ← {item.SeriesName || "My Media"}
        </Link>
        {isPlayable(item) && playing ? (
          <PlayableView jf={jf} item={item} />
        ) : null}
        <div className={`flex gap-8 ${playing ? "mt-6" : "mt-4"} max-[700px]:flex-col`}>
          {!playing && poster && item.Type !== "Episode" && (
            <img src={poster} alt="" className="w-[220px] shrink-0 rounded-lg self-start max-[700px]:w-[160px]" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold leading-tight">
              {item.Type === "Episode" && item.IndexNumber != null && (
                <span className="text-[#00ff66]">
                  S{item.ParentIndexNumber}:E{item.IndexNumber}{" "}
                </span>
              )}
              {item.Name}
            </h1>
            {meta.length > 0 && <p className="text-white/60 text-[14px] mt-2">{meta.join(" · ")}</p>}
            {item.Overview && <p className="text-white/80 text-[15px] mt-4 max-w-[900px] whitespace-pre-line">{item.Overview}</p>}
            {isPlayable(item) && !playing && <PlayableView jf={jf} item={item} />}
          </div>
        </div>
        {item.Type === "Series" && <SeriesView jf={jf} series={item} />}
        {(item.Type === "BoxSet" || item.Type === "Season") && <CollectionView jf={jf} item={item} />}
      </div>
    </div>
  );
}

export default JellyfinItem;

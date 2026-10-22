import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { useConnections } from "@/src/context/ConnectionsContext";
import { JellyfinGrid } from "@/src/components/jellyfincard/JellyfinCard";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import {
  VIDEO_COLLECTIONS,
  getLatest,
  getResume,
  getViews,
  imageUrl,
} from "@/src/utils/jellyfin.utils";

export function NotConnected() {
  return (
    <div className="w-full px-4 pt-[140px] flex flex-col items-center text-center gap-y-4">
      <h1 className="text-3xl font-extrabold">
        My <span className="text-[#00ff66]">Media</span>
      </h1>
      <p className="text-white/70 max-w-[520px]">
        Connect your Jellyfin server to browse and play your own movies and
        shows right here.
      </p>
      <Link
        to="/connect"
        className="bg-[#00ff66] text-black font-semibold px-6 py-2 rounded-3xl hover:bg-white"
      >
        Connect Jellyfin
      </Link>
    </div>
  );
}

export function useJellyfinErrorHandler() {
  const { setJellyfin } = useConnections();
  return (err) => {
    // Token revoked or expired: drop it so the user is asked to sign in again
    if (err?.status === 401) setJellyfin(null);
  };
}

function SectionHeader({ title, to }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="font-bold text-2xl text-[#00ff66] max-[478px]:text-[18px]">{title}</h2>
      {to && (
        <Link to={to} className="flex items-baseline gap-x-1 group">
          <p className="text-[12px] font-semibold group-hover:text-[#00ff66]">View all</p>
          <FaChevronRight className="text-[10px] group-hover:text-[#00ff66]" />
        </Link>
      )}
    </div>
  );
}

function JellyfinHome() {
  const { jellyfin: jf } = useConnections();
  const onError = useJellyfinErrorHandler();
  const [views, setViews] = useState(null);
  const [resume, setResume] = useState([]);
  const [latest, setLatest] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jf) return;
    let active = true;
    (async () => {
      try {
        const all = await getViews(jf);
        const video = all.filter((v) => VIDEO_COLLECTIONS.has(v.CollectionType));
        if (!active) return;
        setViews(video);
        getResume(jf).then((r) => active && setResume(r)).catch(() => {});
        for (const view of video) {
          getLatest(jf, view.Id)
            .then((items) => active && setLatest((prev) => ({ ...prev, [view.Id]: items })))
            .catch(() => {});
        }
      } catch (err) {
        onError(err);
        if (active) setError(err);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jf]);

  if (!jf) return <NotConnected />;

  return (
    <div className="w-full px-4 pt-[100px] max-[600px]:pt-[120px] flex flex-col gap-y-12">
      <div>
        <h1 className="text-3xl font-extrabold">
          My <span className="text-[#00ff66]">Media</span>
        </h1>
        <p className="text-white/60 mt-1 text-[14px]">
          {jf.serverName} · signed in as {jf.userName} ·{" "}
          <Link to="/connect" className="underline hover:text-[#00ff66]">
            manage
          </Link>
        </p>
      </div>
      {error ? (
        <p className="text-white/70">{error.message}</p>
      ) : !views ? (
        <div className="flex justify-center py-10">
          <BouncingLoader />
        </div>
      ) : (
        <>
          {resume.length > 0 && (
            <section>
              <SectionHeader title="Continue Watching" />
              <JellyfinGrid jf={jf} items={resume} wide />
            </section>
          )}
          <section>
            <SectionHeader title="Libraries" />
            <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2">
              {views.map((view) => {
                const img = imageUrl(jf, view, { height: 300 });
                return (
                  <Link
                    key={view.Id}
                    to={`/jellyfin/library/${view.Id}`}
                    className="relative aspect-video rounded-lg overflow-hidden bg-[#0c1a12] border border-white/10 hover:border-[#00ff66]/60 group flex items-end"
                  >
                    {img && <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />}
                    <span className="relative w-full px-3 py-2 font-bold text-lg bg-gradient-to-t from-black/90 to-transparent group-hover:text-[#00ff66]">
                      {view.Name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
          {views.map(
            (view) =>
              latest[view.Id]?.length > 0 && (
                <section key={view.Id}>
                  <SectionHeader title={`Latest in ${view.Name}`} to={`/jellyfin/library/${view.Id}`} />
                  <JellyfinGrid jf={jf} items={latest[view.Id].slice(0, 14)} />
                </section>
              )
          )}
        </>
      )}
    </div>
  );
}

export default JellyfinHome;

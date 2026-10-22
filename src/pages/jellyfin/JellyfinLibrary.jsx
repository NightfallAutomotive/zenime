import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useConnections } from "@/src/context/ConnectionsContext";
import { JellyfinGrid } from "@/src/components/jellyfincard/JellyfinCard";
import BouncingLoader from "@/src/components/ui/bouncingloader/Bouncingloader";
import { getItem, getItems } from "@/src/utils/jellyfin.utils";
import { NotConnected, useJellyfinErrorHandler } from "./JellyfinHome";

const PAGE = 60;
const SORTS = [
  { id: "SortName|Ascending", label: "A–Z" },
  { id: "DateCreated|Descending", label: "Recently added" },
  { id: "PremiereDate|Descending", label: "Newest" },
  { id: "CommunityRating|Descending", label: "Top rated" },
];
const control =
  "bg-[#0c1a12] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#00ff66]";

function JellyfinLibrary() {
  const { id } = useParams();
  const { jellyfin: jf } = useConnections();
  const onError = useJellyfinErrorHandler();
  const [library, setLibrary] = useState(null);
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState(SORTS[0].id);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(filter.trim()), 400);
    return () => clearTimeout(t);
  }, [filter]);

  const query = (startIndex) => {
    const [sortBy, sortOrder] = sort.split("|");
    return getItems(jf, {
      parentId: id,
      collectionType: library?.CollectionType,
      startIndex,
      limit: PAGE,
      searchTerm: search || undefined,
      sortBy,
      sortOrder,
    });
  };

  useEffect(() => {
    if (!jf) return;
    setLibrary(null);
    getItem(jf, id)
      .then(setLibrary)
      .catch((err) => {
        onError(err);
        setError(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jf, id]);

  useEffect(() => {
    if (!jf || !library) return;
    let active = true;
    setItems(null);
    query(0)
      .then((res) => {
        if (!active) return;
        setItems(res.Items || []);
        setTotal(res.TotalRecordCount || 0);
      })
      .catch((err) => {
        onError(err);
        if (active) setError(err);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jf, library, sort, search]);

  if (!jf) return <NotConnected />;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await query(items.length);
      setItems((prev) => [...prev, ...(res.Items || [])]);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="w-full px-4 pt-[100px] max-[600px]:pt-[120px]">
      <Link to="/jellyfin" className="text-[13px] text-white/50 hover:text-[#00ff66]">
        ← My Media
      </Link>
      <h1 className="text-3xl font-extrabold mt-1">{library?.Name || "Library"}</h1>
      <div className="flex flex-wrap gap-3 mt-5">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search this library..."
          className={`${control} w-[300px] max-[600px]:w-full`}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={control}>
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        {items && <span className="self-center text-white/40 text-[13px]">{total.toLocaleString()} items</span>}
      </div>
      <div className="mt-8">
        {error ? (
          <p className="text-white/70">{error.message}</p>
        ) : !items ? (
          <div className="flex justify-center py-10">
            <BouncingLoader />
          </div>
        ) : items.length === 0 ? (
          <p className="text-white/60">Nothing here.</p>
        ) : (
          <>
            <JellyfinGrid jf={jf} items={items} />
            {items.length < total && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-[#00ff66] text-black font-semibold px-6 py-2 rounded-3xl hover:bg-white disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : `Load more (${(total - items.length).toLocaleString()} left)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default JellyfinLibrary;

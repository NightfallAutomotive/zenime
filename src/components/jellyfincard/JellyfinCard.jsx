import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faFolder, faPlay } from "@fortawesome/free-solid-svg-icons";
import { imageUrl, progressPercent } from "@/src/utils/jellyfin.utils";

const subtitleFor = (item) => {
  if (item.Type === "Episode") {
    const code =
      item.ParentIndexNumber != null && item.IndexNumber != null
        ? `S${item.ParentIndexNumber}:E${item.IndexNumber} · `
        : "";
    return `${item.SeriesName || ""}${item.SeriesName ? " · " : ""}${code}`.replace(/ · $/, "");
  }
  if (item.Type === "Series") return item.ProductionYear ? `${item.ProductionYear} · Series` : "Series";
  if (item.Type === "Folder" || item.Type === "CollectionFolder" || item.Type === "BoxSet") {
    return item.ChildCount ? `${item.ChildCount} items` : "Folder";
  }
  return item.ProductionYear || "";
};

export const linkFor = (item) =>
  item.Type === "CollectionFolder" || item.Type === "Folder" || item.Type === "UserView"
    ? `/jellyfin/library/${item.Id}`
    : `/jellyfin/item/${item.Id}`;

export function JellyfinCard({ jf, item, wide = false }) {
  const img = imageUrl(jf, item, { type: wide && item.ImageTags?.Thumb ? "Thumb" : "Primary", height: wide ? 270 : 420 });
  const progress = progressPercent(item);
  const isFolder = ["Folder", "CollectionFolder", "UserView", "BoxSet"].includes(item.Type);

  return (
    <Link to={linkFor(item)} className="flex flex-col gap-y-2 group" title={item.Name}>
      <div
        className={`relative w-full ${wide ? "aspect-video" : "aspect-[2/3]"} rounded-lg bg-[#0c1a12] overflow-hidden border border-white/5 group-hover:border-[#00ff66]/60 transition-all flex items-center justify-center`}
      >
        {img ? (
          <img
            src={img}
            alt={item.Name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:blur-[3px] transition-all duration-300"
          />
        ) : (
          <FontAwesomeIcon icon={isFolder ? faFolder : faPlay} className="text-4xl text-[#00ff66]/50" />
        )}
        {!isFolder && (
          <FontAwesomeIcon
            icon={faPlay}
            className="absolute text-[34px] text-white opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
        {item.UserData?.Played && (
          <span className="absolute right-2 top-2 w-6 h-6 rounded-full bg-[#00ff66] text-black flex items-center justify-center text-[12px]">
            <FontAwesomeIcon icon={faCheck} />
          </span>
        )}
        {item.UserData?.UnplayedItemCount > 0 && (
          <span className="absolute right-2 top-2 min-w-6 h-6 px-[6px] rounded-full bg-[#00ff66] text-black flex items-center justify-center text-[12px] font-bold">
            {item.UserData.UnplayedItemCount}
          </span>
        )}
        {progress > 0 && (
          <div className="absolute left-0 right-0 bottom-0 h-[4px] bg-black/60">
            <div className="h-full bg-[#00ff66]" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div>
        <p className="font-semibold text-[15px] leading-5 line-clamp-1 group-hover:text-[#00ff66]">{item.Name}</p>
        <p className="text-[12px] text-white/50 line-clamp-1">{subtitleFor(item)}</p>
      </div>
    </Link>
  );
}

export function JellyfinGrid({ jf, items, wide = false }) {
  return (
    <div
      className={
        wide
          ? "grid grid-cols-5 gap-x-4 gap-y-6 max-[1400px]:grid-cols-4 max-[1000px]:grid-cols-3 max-[700px]:grid-cols-2"
          : "grid grid-cols-7 gap-x-4 gap-y-6 max-[1500px]:grid-cols-6 max-[1200px]:grid-cols-5 max-[900px]:grid-cols-4 max-[650px]:grid-cols-3 max-[420px]:grid-cols-2"
      }
    >
      {items.map((item) => (
        <JellyfinCard key={item.Id} jf={jf} item={item} wide={wide} />
      ))}
    </div>
  );
}

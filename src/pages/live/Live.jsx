import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ChannelGrid from "@/src/components/channelcard/ChannelGrid";
import { toM3U } from "@/src/utils/m3u";
import {
  getAllChannels,
  getCategories,
  getCategoryChannels,
  getCountries,
  getCountryChannels,
  homeCountry,
} from "@/src/utils/iptv.utils";

const selectClass =
  "bg-[#0c1a12] text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#00ff66]";

function Live() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  // Defaults to the home region (UK). "All countries" is an explicit
  // ?country= (empty), so it sticks when the category changes.
  const country = params.has("country") ? params.get("country") : homeCountry();

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [channels, setChannels] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getCountries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setChannels(null);
    setError(null);
    // Category playlists are small; for category + country, filter the
    // country playlist by category instead of downloading the full index.
    const load = country
      ? getCountryChannels(country)
      : category
        ? getCategoryChannels(category)
        : getAllChannels();
    load
      .then((list) => active && setChannels(list))
      .catch((err) => active && setError(err));
    return () => {
      active = false;
    };
  }, [category, country]);

  const visible = useMemo(() => {
    if (!channels) return null;
    const q = filter.trim().toLowerCase();
    const categoryName = categories.find((c) => c.id === category)?.name;
    return channels.filter(
      (c) =>
        (!country || !category || c.categories.includes(categoryName)) &&
        (!q || c.name.toLowerCase().includes(q))
    );
  }, [channels, filter, category, country, categories]);

  const update = (key, value) => {
    const next = new URLSearchParams({ country, category, [key]: value });
    if (!next.get("category")) next.delete("category");
    setParams(next, { replace: true });
  };

  const from = country ? `country:${country}` : category ? `category:${category}` : "index";
  const playlistUrl = `${window.location.origin}/playlist.m3u?${new URLSearchParams(
    Object.entries({ country: country.toLowerCase(), category }).filter(([, v]) => v)
  )}`.replace(/\?$/, "");

  const copyPlaylistUrl = async () => {
    try {
      await navigator.clipboard.writeText(playlistUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy this URL", playlistUrl);
    }
  };

  const downloadPlaylist = () => {
    const blob = new Blob([toM3U(visible)], { type: "audio/x-mpegurl" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nightfall-${[country, category].filter(Boolean).join("-") || "all"}.m3u`.toLowerCase();
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const title = [
    categories.find((c) => c.id === category)?.name,
    countries.find((c) => c.code === country)?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="w-full px-4 pt-[100px] max-[600px]:pt-[120px]">
      <h1 className="text-3xl font-extrabold">Live TV</h1>
      <p className="text-white/60 mt-1 text-[14px]">
        Free-to-air streams from the public{" "}
        <a
          href="https://github.com/iptv-org/iptv"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#00ff66]"
        >
          iptv-org
        </a>{" "}
        index. Channels that are geo-blocked outside the UK are hidden.
      </p>
      <div className="flex flex-wrap gap-3 mt-6 items-center">
        <select
          className={selectClass}
          value={country}
          onChange={(e) => update("country", e.target.value)}
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter channels..."
          className={`${selectClass} w-[260px] max-[600px]:w-full`}
        />
        <button
          onClick={() => setPlaylistOpen((o) => !o)}
          className="bg-white/10 hover:bg-white/20 border border-[#00ff66]/40 px-4 py-2 rounded-lg text-[14px] font-semibold"
        >
          Playlist (Kodi / Jellyfin)
        </button>
      </div>
      {playlistOpen && (
        <div className="mt-4 bg-[#0c1a12]/90 border border-white/10 rounded-xl p-4 flex flex-col gap-y-3 max-w-[900px]">
          <p className="text-[14px] text-white/70">
            Add exactly these channels to Kodi (PVR IPTV Simple Client) or
            Jellyfin (Live TV → M3U Tuner). The link stays up to date while
            the site is running. The download is a one-off snapshot
            {filter.trim() ? " that includes your text filter" : ""}.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              readOnly
              value={playlistUrl}
              onFocus={(e) => e.target.select()}
              className={`${selectClass} flex-1 min-w-[260px] font-mono text-[13px]`}
            />
            <button
              onClick={copyPlaylistUrl}
              className="bg-[#00ff66] text-black font-semibold px-4 py-2 rounded-lg"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              onClick={downloadPlaylist}
              disabled={!visible?.length}
              className="bg-white/10 hover:bg-white/20 font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Download .m3u
            </button>
          </div>
          <p className="text-[12px] text-white/40">
            More setup help is on the{" "}
            <Link to="/connect" className="underline hover:text-[#00ff66]">Connect</Link> page.
          </p>
        </div>
      )}
      {error ? (
        <p className="mt-10 text-white/60">Couldn&apos;t load channels: {error.message}</p>
      ) : (
        <ChannelGrid
          label={title || "All channels"}
          channels={visible}
          pageSize={60}
          from={from}
          className="mt-10"
        />
      )}
    </div>
  );
}

export default Live;

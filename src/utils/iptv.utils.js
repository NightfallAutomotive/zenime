// Live channels come from the public iptv-org index
// (https://github.com/iptv-org/iptv), which only lists publicly available
// free-to-air streams. Playlists are fetched on demand and cached in memory.
import { REGION, iptvCountryCode } from "@/src/config/region";
import { ANIME_PATTERN, isAllowedChannel, parseM3U } from "./m3u";

export { parseM3U };

const PLAYLIST_BASE = "https://iptv-org.github.io/iptv";
const API_BASE = "https://iptv-org.github.io/api";

const cache = new Map();

function cached(key, loader) {
  if (!cache.has(key)) {
    cache.set(
      key,
      loader().catch((err) => {
        cache.delete(key);
        throw err;
      })
    );
  }
  return cache.get(key);
}

async function fetchOk(url, as) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
  return as === "json" ? res.json() : res.text();
}

// path is relative to the playlist root, e.g. "index", "categories/news", "countries/us"
export const getPlaylist = (path) =>
  cached(`m3u:${path}`, () =>
    fetchOk(`${PLAYLIST_BASE}/${path}.m3u`)
      .then(parseM3U)
      .then((list) => list.filter(isAllowedChannel))
  );

export const getAllChannels = () => getPlaylist("index");
export const getCategoryChannels = (id) => getPlaylist(`categories/${id}`);
export const getCountryChannels = (code) =>
  getPlaylist(`countries/${iptvCountryCode(code)}`);

export const getAnimeChannels = () =>
  cached("anime", async () =>
    (await getAllChannels())
      .filter((c) => ANIME_PATTERN.test(c.name))
      .sort((a, b) => a.geoBlocked - b.geoBlocked)
  );

export const getCategories = () =>
  cached("api:categories", () =>
    fetchOk(`${API_BASE}/categories.json`, "json").then((list) =>
      list
        .filter((c) => c.id !== "xxx")
        .sort((a, b) => a.name.localeCompare(b.name))
    )
  );

export const getCountries = () =>
  cached("api:countries", () =>
    fetchOk(`${API_BASE}/countries.json`, "json").then((list) =>
      list.sort((a, b) => a.name.localeCompare(b.name))
    )
  );

export const homeCountry = () => REGION;

export function searchChannels(channels, keyword, limit = Infinity) {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];
  const results = [];
  for (const c of channels) {
    if (c.name.toLowerCase().includes(q)) {
      results.push(c);
      if (results.length >= limit) break;
    }
  }
  return results;
}

// Query string used by /watch so a channel link is self-contained and shareable
export function watchLink(channel, from) {
  const params = new URLSearchParams({ url: channel.url, name: channel.name });
  if (channel.logo) params.set("logo", channel.logo);
  if (channel.referrer) params.set("ref", channel.referrer);
  if (channel.userAgent) params.set("ua", channel.userAgent);
  if (channel.categories.length) params.set("cat", channel.categories.join(";"));
  if (channel.geoBlocked) params.set("geo", "1");
  if (from) params.set("from", from);
  return `/watch?${params}`;
}

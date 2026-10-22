// Plain M3U helpers shared by the browser app and the dev server's
// /playlist.m3u endpoint (vite.config.js), so only relative imports here.
import { REGION, iptvCountryCode } from "../config/region.js";
import { isBlocked } from "../config/blocklist.js";

export const ANIME_PATTERN =
  /anime|animax|crunchyroll|hidive|retrocrush|naruto|one piece|yu-gi-oh|pok[eé]mon|gundam|dragon ball|sailor moon|digimon|beyblade|inuyasha|bleach|otaku/i;

const attr = (line, name) =>
  line.match(new RegExp(`${name}="([^"]*)"`))?.[1] || "";

export function parseM3U(text) {
  const channels = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("#EXTINF")) {
      const attrEnd = line.lastIndexOf('",');
      const title = (
        attrEnd >= 0 ? line.slice(attrEnd + 2) : line.split(",").pop()
      ).trim();
      const groups = attr(line, "group-title");
      current = {
        tvgId: attr(line, "tvg-id"),
        logo: attr(line, "tvg-logo"),
        categories: groups ? groups.split(";").filter(Boolean) : [],
        referrer: attr(line, "http-referrer"),
        userAgent: attr(line, "http-user-agent"),
        title,
      };
    } else if (current && line.startsWith("#EXTVLCOPT:http-referrer=")) {
      current.referrer = line.split("=").slice(1).join("=");
    } else if (current && line.startsWith("#EXTVLCOPT:http-user-agent=")) {
      current.userAgent = line.split("=").slice(1).join("=");
    } else if (current && line && !line.startsWith("#")) {
      const { title, ...rest } = current;
      const quality = title.match(/\((\d{3,4}[pi])\)/)?.[1] || "";
      const name = title
        .replace(/\s*\(\d{3,4}[pi]\)/, "")
        .replace(/\s*\[[^\]]*\]/g, "")
        .trim();
      channels.push({
        ...rest,
        name,
        quality,
        geoBlocked: /\[Geo-blocked\]/i.test(title),
        notAlways: /\[Not 24\/7\]/i.test(title),
        url: line,
        key: `${rest.tvgId || name}|${line}`,
      });
      current = null;
    }
  }
  return channels.filter(
    (c) => !c.categories.some((cat) => cat.toLowerCase() === "xxx")
  );
}

// Channel ids look like "ITV1.uk@SD"; the suffix is the home country
const channelCountry = (c) => c.tvgId.match(/\.([a-z]{2})(@|$)/i)?.[1]?.toLowerCase();

// Geo-blocked streams only play in their home country, so drop the ones
// that won't work from REGION. Unblocked streams play anywhere.
export const playableInRegion = (c) =>
  !c.geoBlocked || channelCountry(c) === iptvCountryCode(REGION);

// Everything the site hides: geo-blocked outside REGION, or on the blocklist
export const isAllowedChannel = (c) => playableInRegion(c) && !isBlocked(c.name);

const esc = (value) => String(value).replace(/"/g, "'");

// Serialise channels back to M3U for Kodi (IPTV Simple Client), Jellyfin
// Live TV, VLC, etc. Referrer / user-agent go in #EXTVLCOPT lines, which
// those players understand.
export function toM3U(channels) {
  const lines = ["#EXTM3U"];
  for (const c of channels) {
    const attrs = [
      c.tvgId && `tvg-id="${esc(c.tvgId)}"`,
      `tvg-name="${esc(c.name)}"`,
      c.logo && `tvg-logo="${esc(c.logo)}"`,
      `group-title="${esc(c.categories.join(";") || "Undefined")}"`,
    ].filter(Boolean);
    lines.push(`#EXTINF:-1 ${attrs.join(" ")},${c.name}`);
    if (c.referrer) lines.push(`#EXTVLCOPT:http-referrer=${c.referrer}`);
    if (c.userAgent) lines.push(`#EXTVLCOPT:http-user-agent=${c.userAgent}`);
    lines.push(c.url);
  }
  return lines.join("\n") + "\n";
}

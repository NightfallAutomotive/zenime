// Where the site is watched from. Services and geo-blocked live channels
// that aren't available here are hidden. ISO 3166 code ("GB" = United Kingdom).
export const REGION = "GB";

// iptv-org uses "uk" rather than "gb" in channel ids and playlist names
export const iptvCountryCode = (code) =>
  code.toLowerCase() === "gb" ? "uk" : code.toLowerCase();

// Image hosts that refuse to serve REGION. Imgur has blocked the UK since 2025
// and returns a "Content not viewable in your region" placeholder instead of
// an error, so logos from it have to be skipped up front.
const BLOCKED_IMAGE_HOSTS = { GB: /(^|\.)imgur\.com$/i };

export function imageBlockedInRegion(url) {
  const pattern = BLOCKED_IMAGE_HOSTS[REGION];
  if (!pattern || !url) return false;
  try {
    return pattern.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

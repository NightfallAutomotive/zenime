import { REGION } from "@/src/config/region";
import { isBlocked } from "@/src/config/blocklist";

// Free, legal streaming services. Everything here is either ad-supported,
// publicly funded, or free with a library card. Links open the official site.
//
// tags: catchup | movies | tv | live | anime | kids | documentary | classic | news | sports
// regions: ISO country codes, or "Global"

export const SERVICE_TAGS = [
  { id: "catchup", label: "Catch-up TV" },
  { id: "movies", label: "Movies" },
  { id: "tv", label: "TV Shows" },
  { id: "live", label: "Live TV" },
  { id: "anime", label: "Anime" },
  { id: "kids", label: "Kids" },
  { id: "documentary", label: "Documentary" },
  { id: "classic", label: "Classic" },
  { id: "news", label: "News" },
  { id: "sports", label: "Sports" },
];

const services = [
  // Free ad-supported (FAST / AVOD)
  {
    id: "tubi",
    name: "Tubi",
    url: "https://tubitv.com",
    description:
      "Huge free library of movies and TV, with a dedicated anime section. No account needed.",
    regions: ["US", "CA", "GB", "AU", "NZ", "MX"],
    tags: ["movies", "tv", "anime", "kids", "live"],
    color: "#7408ff",
    featured: true,
  },
  {
    id: "pluto",
    name: "Pluto TV",
    url: "https://pluto.tv",
    description:
      "Hundreds of free live channels plus on-demand, including several 24/7 anime channels.",
    regions: ["US", "GB", "CA", "DE", "FR", "ES", "IT", "BR", "MX"],
    tags: ["live", "movies", "tv", "anime", "kids", "news"],
    color: "#fff200",
    featured: true,
  },
  {
    id: "retrocrush",
    name: "RetroCrush",
    url: "https://www.retrocrush.tv",
    description:
      "Free, ad-supported streaming of classic and cult anime, both subbed and dubbed.",
    regions: ["US", "CA", "GB", "AU", "NZ", "IE"],
    tags: ["anime", "classic"],
    color: "#e4002b",
    featured: true,
  },
  {
    id: "roku",
    name: "The Roku Channel",
    url: "https://therokuchannel.roku.com",
    description:
      "Free movies, TV and live channels in the browser. You don't need a Roku device.",
    regions: ["US", "CA", "GB", "MX"],
    tags: ["movies", "tv", "live", "kids"],
    color: "#6c3c97",
    featured: true,
  },
  {
    id: "plex",
    name: "Plex",
    url: "https://watch.plex.tv",
    description:
      "Thousands of free on-demand movies and shows plus 600+ live channels.",
    regions: ["Global"],
    tags: ["movies", "tv", "live", "anime"],
    color: "#e5a00d",
    featured: true,
  },
  {
    id: "primefree",
    name: "Prime Video – Free with Ads",
    url: "https://www.amazon.com/freevee",
    description:
      "The former Freevee catalogue. Needs a free Amazon account, but no Prime subscription.",
    regions: ["US"],
    tags: ["movies", "tv"],
    color: "#00a8e1",
  },
  {
    id: "youtube-free",
    name: "YouTube Movies (Free with ads)",
    url: "https://www.youtube.com/feed/storefront",
    description: "Full-length films free with ads on YouTube.",
    regions: ["US"],
    tags: ["movies"],
    color: "#ff0000",
  },
  {
    id: "xumo",
    name: "Xumo Play",
    url: "https://play.xumo.com",
    description: "Free live channels and on-demand movies in the browser.",
    regions: ["US"],
    tags: ["live", "movies", "tv", "news"],
    color: "#7a2fff",
  },
  {
    id: "sling-freestream",
    name: "Sling Freestream",
    url: "https://www.sling.com/freestream",
    description: "Sling's free tier: hundreds of live channels and on-demand titles.",
    regions: ["US"],
    tags: ["live", "movies", "tv", "news"],
    color: "#0c79c0",
  },
  {
    id: "samsung-tv-plus",
    name: "Samsung TV Plus",
    url: "https://www.samsungtvplus.com",
    description: "Free live channels on Samsung TVs and phones, and on the web.",
    regions: ["US", "GB", "CA", "DE", "FR", "IN", "KR"],
    tags: ["live", "news", "movies"],
    color: "#1428a0",
  },
  {
    id: "vix",
    name: "ViX",
    url: "https://vix.com",
    description: "Free Spanish-language movies, novelas, sports and live channels.",
    regions: ["US", "MX"],
    tags: ["movies", "tv", "live", "news"],
    color: "#ff5a00",
  },
  {
    id: "filmzie",
    name: "Filmzie",
    url: "https://filmzie.com",
    description: "Free indie films and documentaries, available worldwide.",
    regions: ["Global"],
    tags: ["movies", "documentary"],
    color: "#ff3d00",
  },
  {
    id: "shout",
    name: "Shout! TV",
    url: "https://watch.shout-tv.com",
    description: "Free cult classics, retro TV and some anime from Shout! Factory.",
    regions: ["US"],
    tags: ["movies", "tv", "classic", "anime"],
    color: "#f7c600",
  },
  {
    id: "fawesome",
    name: "Fawesome",
    url: "https://fawesome.tv",
    description: "Free ad-supported movies and TV across many genres.",
    regions: ["US", "CA", "GB", "AU", "IN"],
    tags: ["movies", "tv", "kids"],
    color: "#ff4f8b",
  },
  {
    id: "archive",
    name: "Internet Archive – Feature Films",
    url: "https://archive.org/details/feature_films",
    description: "Public-domain and openly licensed films, free forever and with no ads.",
    regions: ["Global"],
    tags: ["movies", "classic", "documentary"],
    color: "#428bca",
  },

  // Library services (free with a library card)
  {
    id: "kanopy",
    name: "Kanopy",
    url: "https://www.kanopy.com",
    description:
      "Free with a participating library card. Criterion films, documentaries and kids' titles.",
    regions: ["US", "CA", "AU", "NZ", "GB"],
    tags: ["movies", "documentary", "kids"],
    color: "#d43a2f",
    note: "Library card required",
  },
  {
    id: "hoopla",
    name: "Hoopla",
    url: "https://www.hoopladigital.com",
    description:
      "Free with a library card. Movies, TV and a solid anime catalogue.",
    regions: ["US", "CA"],
    tags: ["movies", "tv", "anime", "kids"],
    color: "#2196f3",
    note: "Library card required",
  },

  // Public & free-to-air broadcasters
  {
    id: "pbs",
    name: "PBS Video",
    url: "https://www.pbs.org/video/",
    description: "Free documentaries, dramas and news from US public television.",
    regions: ["US"],
    tags: ["tv", "documentary", "news", "kids"],
    color: "#2638c4",
  },
  {
    id: "itvx",
    name: "ITVX",
    url: "https://www.itv.com",
    description: "Free ad-supported ITV shows, films and live channels.",
    regions: ["GB"],
    tags: ["catchup", "tv", "live", "movies"],
    color: "#00e5ac",
  },
  {
    id: "channel4",
    name: "Channel 4",
    url: "https://www.channel4.com",
    description: "Free Channel 4 box sets, films and live TV.",
    regions: ["GB"],
    tags: ["catchup", "tv", "live", "movies", "documentary"],
    color: "#a8ff00",
  },
  {
    id: "channel5",
    name: "5",
    url: "https://www.channel5.com",
    description: "Free on-demand and live Channel 5 programmes.",
    regions: ["GB"],
    tags: ["catchup", "tv", "live", "documentary"],
    color: "#ff0071",
  },
  {
    id: "u",
    name: "U (UKTV)",
    url: "https://u.co.uk",
    description: "Free UKTV comedy, drama and factual, including Dave and Gold.",
    regions: ["GB"],
    tags: ["catchup", "tv", "classic"],
    color: "#00c4ff",
  },
  {
    id: "rte",
    name: "RTÉ Player",
    url: "https://www.rte.ie/player",
    description: "Ireland's public broadcaster, live and on demand.",
    regions: ["IE"],
    tags: ["tv", "live", "news"],
    color: "#00a19a",
  },
  {
    id: "cbcgem",
    name: "CBC Gem",
    url: "https://gem.cbc.ca",
    description: "Free tier with CBC shows, films and live local news.",
    regions: ["CA"],
    tags: ["tv", "live", "news", "documentary"],
    color: "#ec1c24",
  },
  {
    id: "abciview",
    name: "ABC iview",
    url: "https://iview.abc.net.au",
    description: "Australia's ABC, free live and on demand.",
    regions: ["AU"],
    tags: ["tv", "live", "kids", "news"],
    color: "#00b4e5",
  },
  {
    id: "sbs",
    name: "SBS On Demand",
    url: "https://www.sbs.com.au/ondemand",
    description: "World movies, drama and a rotating anime selection.",
    regions: ["AU"],
    tags: ["tv", "movies", "live", "anime"],
    color: "#f8b800",
  },
  {
    id: "9now",
    name: "9Now",
    url: "https://www.9now.com.au",
    description: "Free Nine Network shows and live channels.",
    regions: ["AU"],
    tags: ["tv", "live"],
    color: "#0079ff",
  },
  {
    id: "7plus",
    name: "7plus",
    url: "https://7plus.com.au",
    description: "Free Seven Network shows, live TV and sport.",
    regions: ["AU"],
    tags: ["tv", "live"],
    color: "#ff2b2b",
  },
  {
    id: "10",
    name: "10",
    url: "https://10.com.au",
    description: "Free Network 10 shows and live streams.",
    regions: ["AU"],
    tags: ["tv", "live"],
    color: "#2b2b2b",
  },
  {
    id: "tvnz",
    name: "TVNZ+",
    url: "https://www.tvnz.co.nz",
    description: "New Zealand's free streaming service, live and on demand.",
    regions: ["NZ"],
    tags: ["tv", "live", "news"],
    color: "#4c2c92",
  },
  {
    id: "arte",
    name: "ARTE",
    url: "https://www.arte.tv",
    description:
      "Free European culture channel. Documentaries and films in six languages.",
    regions: ["DE", "FR", "ES", "IT", "PL"],
    tags: ["documentary", "movies", "tv"],
    color: "#fa481c",
  },
  {
    id: "ard",
    name: "ARD Mediathek",
    url: "https://www.ardmediathek.de",
    description: "German public broadcaster ARD, live and on demand.",
    regions: ["DE"],
    tags: ["tv", "live", "documentary", "news"],
    color: "#003480",
  },
  {
    id: "zdf",
    name: "ZDF",
    url: "https://www.zdf.de",
    description: "German public broadcaster ZDF, live and on demand.",
    regions: ["DE"],
    tags: ["tv", "live", "documentary", "news"],
    color: "#fa7d19",
  },
  {
    id: "francetv",
    name: "france.tv",
    url: "https://www.france.tv",
    description: "France Télévisions channels, live and on demand.",
    regions: ["FR"],
    tags: ["tv", "live", "news", "kids"],
    color: "#2a3fff",
  },

  // More UK catch-up & free on-demand
  {
    id: "stv",
    name: "STV Player",
    url: "https://player.stv.tv",
    description:
      "STV's catch-up and box sets, plus exclusive dramas. Free across the whole UK.",
    regions: ["GB"],
    tags: ["catchup", "tv", "live", "news"],
    color: "#1f9cf0",
  },
  {
    id: "s4c",
    name: "S4C Clic",
    url: "https://www.s4c.cymru/clic",
    description:
      "Welsh-language catch-up and box sets with English subtitles, plus live S4C.",
    regions: ["GB"],
    tags: ["catchup", "tv", "live", "kids"],
    color: "#e5007d",
  },
  {
    id: "tptv-encore",
    name: "Talking Pictures TV Encore",
    url: "https://tptvencore.co.uk",
    description:
      "On-demand classic British films and vintage TV from Talking Pictures TV.",
    regions: ["GB"],
    tags: ["catchup", "movies", "tv", "classic"],
    color: "#c8a24a",
    note: "Free sign-up",
  },
  {
    id: "rakuten",
    name: "Rakuten TV (Free)",
    url: "https://www.rakuten.tv/uk",
    description:
      "A free-with-ads section of movies and series, alongside the paid rentals.",
    regions: ["GB", "DE", "FR", "ES", "IT"],
    tags: ["movies", "tv"],
    color: "#bf0000",
  },
  {
    id: "wedotv",
    name: "wedotv",
    url: "https://www.wedotv.com",
    description: "Free ad-supported movies, series and kids' shows on demand.",
    regions: ["GB", "DE", "FR", "IT", "ES"],
    tags: ["movies", "tv", "kids"],
    color: "#ff2d55",
  },
  {
    id: "bfi-free",
    name: "BFI Player – Free",
    url: "https://player.bfi.org.uk/free",
    description:
      "Thousands of free films from the BFI National Archive, including Britain on Film.",
    regions: ["GB"],
    tags: ["movies", "classic", "documentary"],
    color: "#e4e4e4",
  },
  {
    id: "british-pathe",
    name: "British Pathé",
    url: "https://www.britishpathe.com",
    description:
      "Over 85,000 historic newsreels and archive films from 1896 onwards, free to watch.",
    regions: ["Global"],
    tags: ["documentary", "classic", "news"],
    color: "#b5121b",
  },
  {
    id: "redbull-tv",
    name: "Red Bull TV",
    url: "https://www.redbull.com/gb-en/tv",
    description:
      "Free extreme sports, music and adventure films, plus live events.",
    regions: ["Global"],
    tags: ["sports", "documentary", "live"],
    color: "#db0a40",
  },
  {
    id: "nasa-plus",
    name: "NASA+",
    url: "https://plus.nasa.gov",
    description:
      "NASA's free, ad-free streaming of space documentaries, series and live launches.",
    regions: ["Global"],
    tags: ["documentary", "live", "kids"],
    color: "#0b3d91",
  },
  {
    id: "viki",
    name: "Rakuten Viki",
    url: "https://www.viki.com",
    description:
      "Korean, Chinese and Japanese dramas and films, free with ads and fan-made subtitles.",
    regions: ["Global"],
    tags: ["tv", "movies"],
    color: "#1cb1e8",
  },
  {
    id: "iqiyi",
    name: "iQIYI",
    url: "https://www.iq.com",
    description:
      "Asian dramas, variety shows and anime. Most of the catalogue is free with ads.",
    regions: ["Global"],
    tags: ["tv", "anime", "movies"],
    color: "#00cc36",
  },

  // Anime-specific
  {
    id: "bilibili",
    name: "Bilibili (bilibili.tv)",
    url: "https://www.bilibili.tv",
    description:
      "Officially licensed anime, free with ads, in Southeast Asia and some other regions.",
    regions: ["TH", "ID", "MY", "PH", "VN", "SG"],
    tags: ["anime"],
    color: "#00a1d6",
  },
];

// Only show what's actually watchable from REGION
const availableHere = (s) =>
  (s.regions.includes(REGION) || s.regions.includes("Global")) &&
  !isBlocked(s.name);

const available = services.filter(availableHere);

export default available;

export const featuredServices = available.filter((s) => s.featured);
export const animeServices = available.filter((s) => s.tags.includes("anime"));
export const catchupServices = available.filter((s) => s.tags.includes("catchup"));

export function searchServices(keyword) {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];
  return available.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q))
  );
}

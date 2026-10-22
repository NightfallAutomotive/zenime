// On-demand content that can legally play right on the site:
// official YouTube channels that upload full-length films, episodes and
// documentaries. They play through YouTube's own embedded player using the
// channel's long-form uploads playlist (UULF + channel id without "UC").
export const YOUTUBE_CHANNELS = [
  {
    id: "UC8IHAQMuiJdY6ALuhG7iU8Q",
    name: "FilmRise Movies",
    description: "Full-length feature films from the FilmRise catalogue, uploaded by the distributor.",
    tags: ["movies"],
    color: "#e50914",
  },
  {
    id: "UCejtUitnpnf8Be-v5NuDSLw",
    name: "GUNDAM CHANNEL",
    description: "Bandai Namco's official channel, with full Gundam anime series free to watch.",
    tags: ["anime"],
    color: "#1e50a2",
  },
  {
    id: "UCPZkYpT5XIUou8sV8zk-3jQ",
    name: "RetroCrush",
    description: "Classic anime episodes and films from RetroCrush.",
    tags: ["anime"],
    color: "#e4002b",
  },
  {
    id: "UC88lvyJe7aHZmcvzvubDFRg",
    name: "Timeline",
    description: "Full-length world history documentaries.",
    tags: ["documentary"],
    color: "#b08d57",
  },
  {
    id: "UCijcd0GR0fkxCAZwkiuWqtQ",
    name: "Free Documentary",
    description: "Full nature, science and history documentaries.",
    tags: ["documentary"],
    color: "#2e7d32",
  },
  {
    id: "UCW39zufHfsuGgpLviKh297Q",
    name: "DW Documentary",
    description: "Deutsche Welle's full-length documentaries in English.",
    tags: ["documentary"],
    color: "#05b2fc",
  },
  {
    id: "UCLA_DiR1FfKNvjuUpBHmylQ",
    name: "NASA",
    description: "Missions, launches and space science from NASA (public domain).",
    tags: ["documentary"],
    color: "#0b3d91",
  },
];

export const youtubeById = (id) => YOUTUBE_CHANNELS.find((c) => c.id === id);
export const longFormPlaylist = (channelId) => `UULF${channelId.slice(2)}`;

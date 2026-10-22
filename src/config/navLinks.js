import {
  faDragon,
  faFilm,
  faHouse,
  faLayerGroup,
  faPlug,
  faServer,
  faTv,
} from "@fortawesome/free-solid-svg-icons";

// Shared by the navbar, sidebar and splash screen
const navLinks = [
  { label: "Home", path: "/home", icon: faHouse },
  { label: "Live TV", path: "/live", icon: faTv },
  { label: "On Demand", path: "/ondemand", icon: faFilm },
  { label: "Anime", path: "/anime", icon: faDragon },
  { label: "Services", path: "/services", icon: faLayerGroup },
  { label: "My Media", path: "/jellyfin", icon: faServer },
  { label: "Connect", path: "/connect", icon: faPlug },
];

export const browseLinks = [
  { label: "Movie Channels", path: "/live?category=movies" },
  { label: "TV Series", path: "/live?category=series" },
  { label: "News", path: "/live?category=news" },
  { label: "Comedy", path: "/live?category=comedy" },
  { label: "Classic TV", path: "/live?category=classic" },
  { label: "Kids", path: "/live?category=kids" },
  { label: "Documentary", path: "/live?category=documentary" },
  { label: "Sports", path: "/live?category=sports" },
  { label: "Music", path: "/live?category=music" },
];

export default navLinks;

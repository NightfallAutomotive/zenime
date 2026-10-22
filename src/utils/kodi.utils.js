// Kodi JSON-RPC (Settings → Services → Control → "Allow remote control via
// HTTP"). Calls go through the dev server's /kodi-rpc relay because Kodi's
// web server doesn't send CORS headers.
const RELAY = "/kodi-rpc";

export function normaliseKodiUrl(input) {
  let url = input.trim().replace(/\/+$/, "").replace(/\/jsonrpc$/i, "");
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  // Kodi's web server defaults to port 8080
  if (!/:\d+$/.test(url.replace(/^https?:\/\//i, ""))) url += ":8080";
  return url;
}

let nextId = 1;

export async function kodiCall(kodi, method, params) {
  const headers = { "content-type": "application/json", "x-kodi-url": kodi.url };
  if (kodi.user) headers["x-kodi-auth"] = btoa(`${kodi.user}:${kodi.pass || ""}`);
  let res;
  try {
    res = await fetch(RELAY, {
      method: "POST",
      headers,
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: nextId++ }),
    });
  } catch {
    throw new Error("Couldn't reach the local server.");
  }
  if (res.status === 404) {
    throw new Error("Kodi control needs the local server (npm run dev or npm run preview).");
  }
  if (res.status === 401) throw new Error("Kodi rejected the username or password.");
  const data = await res.json().catch(() => ({}));
  if (data.error) throw new Error(data.error.message || "Kodi returned an error.");
  if (!res.ok) throw new Error(`Kodi returned ${res.status}.`);
  return data.result;
}

export const kodiPing = (kodi) => kodiCall(kodi, "JSONRPC.Ping");

export const kodiPlay = async (kodi, file) => {
  await kodiCall(kodi, "Player.Open", { item: { file } });
};

async function activePlayer(kodi) {
  const players = await kodiCall(kodi, "Player.GetActivePlayers");
  if (!players?.length) throw new Error("Nothing is playing on Kodi.");
  return players[0].playerid;
}

export const kodiPlayPause = async (kodi) =>
  kodiCall(kodi, "Player.PlayPause", { playerid: await activePlayer(kodi) });

export const kodiStop = async (kodi) =>
  kodiCall(kodi, "Player.Stop", { playerid: await activePlayer(kodi) });

export const kodiVolume = (kodi, direction) =>
  kodiCall(kodi, "Application.SetVolume", { volume: direction });

export const kodiInput = (kodi, action) => kodiCall(kodi, `Input.${action}`);

// Kodi accepts extra HTTP headers appended to a URL as "url|Header=value&..."
export function kodiFileForChannel(channel) {
  const headers = [];
  if (channel.referrer) headers.push(`Referer=${encodeURIComponent(channel.referrer)}`);
  if (channel.userAgent) headers.push(`User-Agent=${encodeURIComponent(channel.userAgent)}`);
  return headers.length ? `${channel.url}|${headers.join("&")}` : channel.url;
}

// Needs the YouTube add-on installed in Kodi
export const kodiFileForYouTubePlaylist = (playlistId) =>
  `plugin://plugin.video.youtube/play/?playlist_id=${playlistId}&order=default`;

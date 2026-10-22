// Minimal Jellyfin API client. Jellyfin allows cross-origin requests by
// default, so the browser talks to the server directly.
import website_name from "@/src/config/website";

const CLIENT_VERSION = "1.0.0";
const TICKS_PER_SECOND = 10_000_000;

function deviceId() {
  const key = "nightfall.deviceId";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "nightfall-browser";
  }
}

const authHeader = (token) =>
  `MediaBrowser Client="${website_name}", Device="Browser", DeviceId="${deviceId()}", Version="${CLIENT_VERSION}"` +
  (token ? `, Token="${token}"` : "");

export function normaliseServerUrl(input) {
  let url = input.trim().replace(/\/+$/, "").replace(/\/web(\/.*)?$/i, "");
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  return url;
}

// Newer Jellyfin versions return camelCase on some endpoints; normalise to
// the PascalCase the rest of this file (and older servers) use.
const pascal = (value) =>
  Array.isArray(value)
    ? value.map(pascal)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k[0].toUpperCase() + k.slice(1), pascal(v)])
        )
      : value;

async function request(server, path, { token, method = "GET", body, raw } = {}) {
  let res;
  try {
    res = await fetch(`${server}${path}`, {
      method,
      headers: {
        Authorization: authHeader(token),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Couldn't reach the Jellyfin server. Check the address, and that it's reachable from this device."
    );
  }
  if (res.status === 401) throw Object.assign(new Error("Jellyfin session expired. Sign in again."), { status: 401 });
  if (!res.ok) throw Object.assign(new Error(`Jellyfin returned ${res.status}`), { status: res.status });
  if (raw || res.status === 204) return res;
  const text = await res.text();
  return text ? pascal(JSON.parse(text)) : null;
}

// Jellyfin 10.9 moved user-scoped endpoints (/Users/{id}/Items -> /Items?userId=).
// Try the current route first and fall back for older servers.
async function withFallback(primary, legacy) {
  try {
    return await primary();
  } catch (err) {
    if (err.status === 404 || err.status === 405) return legacy();
    throw err;
  }
}

export async function signIn(serverInput, username, password) {
  const server = normaliseServerUrl(serverInput);
  const info = await request(server, "/System/Info/Public");
  const auth = await request(server, "/Users/AuthenticateByName", {
    method: "POST",
    body: { Username: username, Pw: password },
  }).catch((err) => {
    if (err.status === 401) throw new Error("Wrong username or password.");
    throw err;
  });
  return {
    server,
    serverName: info?.ServerName || "Jellyfin",
    token: auth.AccessToken,
    userId: auth.User.Id,
    userName: auth.User.Name,
  };
}

export const signOut = (jf) =>
  request(jf.server, "/Sessions/Logout", { token: jf.token, method: "POST", raw: true }).catch(() => {});

const qs = (params) =>
  new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();

const ITEM_FIELDS = "PrimaryImageAspectRatio,Overview,ProductionYear,ChildCount,RecursiveItemCount";

export const getViews = (jf) =>
  withFallback(
    () => request(jf.server, `/UserViews?${qs({ userId: jf.userId })}`, { token: jf.token }),
    () => request(jf.server, `/Users/${jf.userId}/Views`, { token: jf.token })
  ).then((r) => r.Items || []);

export const getResume = (jf) => {
  const params = qs({ userId: jf.userId, MediaTypes: "Video", Limit: 12, Fields: ITEM_FIELDS });
  return withFallback(
    () => request(jf.server, `/UserItems/Resume?${params}`, { token: jf.token }),
    () => request(jf.server, `/Users/${jf.userId}/Items/Resume?${params}`, { token: jf.token })
  ).then((r) => r.Items || []);
};

export const getLatest = (jf, parentId) => {
  const params = qs({ userId: jf.userId, ParentId: parentId, Limit: 16, Fields: ITEM_FIELDS });
  return withFallback(
    () => request(jf.server, `/Items/Latest?${params}`, { token: jf.token }),
    () => request(jf.server, `/Users/${jf.userId}/Items/Latest?${params}`, { token: jf.token })
  );
};

// Video libraries only; music/books/photos aren't playable here
export const VIDEO_COLLECTIONS = new Set(["movies", "tvshows", "homevideos", "mixed", "boxsets", "musicvideos", undefined, null, ""]);

const TYPES_FOR_COLLECTION = { movies: "Movie", tvshows: "Series", boxsets: "BoxSet", musicvideos: "MusicVideo" };

export function getItems(jf, { parentId, collectionType, startIndex = 0, limit = 48, searchTerm, sortBy = "SortName", sortOrder = "Ascending" }) {
  const includeTypes = TYPES_FOR_COLLECTION[collectionType];
  const params = qs({
    userId: jf.userId,
    ParentId: parentId,
    IncludeItemTypes: searchTerm ? "Movie,Series,Episode" : includeTypes,
    Recursive: Boolean(includeTypes || searchTerm),
    SearchTerm: searchTerm,
    SortBy: sortBy,
    SortOrder: sortOrder,
    StartIndex: startIndex,
    Limit: limit,
    Fields: ITEM_FIELDS,
    ImageTypeLimit: 1,
  });
  return withFallback(
    () => request(jf.server, `/Items?${params}`, { token: jf.token }),
    () => request(jf.server, `/Users/${jf.userId}/Items?${params}`, { token: jf.token })
  );
}

export const getItem = (jf, id) =>
  withFallback(
    () => request(jf.server, `/Items/${id}?${qs({ userId: jf.userId, Fields: "MediaSources,Overview,Genres,People" })}`, { token: jf.token }),
    () => request(jf.server, `/Users/${jf.userId}/Items/${id}`, { token: jf.token })
  );

export const getSeasons = (jf, seriesId) =>
  request(jf.server, `/Shows/${seriesId}/Seasons?${qs({ userId: jf.userId })}`, { token: jf.token }).then((r) => r.Items || []);

export const getEpisodes = (jf, seriesId, seasonId) =>
  request(
    jf.server,
    `/Shows/${seriesId}/Episodes?${qs({ userId: jf.userId, seasonId, Fields: "Overview,PrimaryImageAspectRatio" })}`,
    { token: jf.token }
  ).then((r) => r.Items || []);

export function imageUrl(jf, item, { type = "Primary", height = 360 } = {}) {
  // Episodes without art fall back to the series poster
  const tag = item.ImageTags?.[type];
  if (tag) return `${jf.server}/Items/${item.Id}/Images/${type}?fillHeight=${height}&quality=90&tag=${tag}`;
  if (item.SeriesId && item.SeriesPrimaryImageTag) {
    return `${jf.server}/Items/${item.SeriesId}/Images/Primary?fillHeight=${height}&quality=90&tag=${item.SeriesPrimaryImageTag}`;
  }
  if (item.ParentThumbItemId && item.ParentThumbImageTag) {
    return `${jf.server}/Items/${item.ParentThumbItemId}/Images/Thumb?fillHeight=${height}&quality=90&tag=${item.ParentThumbImageTag}`;
  }
  return "";
}

export const backdropUrl = (jf, item) =>
  item.BackdropImageTags?.length
    ? `${jf.server}/Items/${item.Id}/Images/Backdrop?fillWidth=1600&quality=80&tag=${item.BackdropImageTags[0]}`
    : item.ParentBackdropItemId && item.ParentBackdropImageTags?.length
      ? `${jf.server}/Items/${item.ParentBackdropItemId}/Images/Backdrop?fillWidth=1600&quality=80&tag=${item.ParentBackdropImageTags[0]}`
      : "";

export const isPlayable = (item) => ["Movie", "Episode", "Video", "MusicVideo"].includes(item.Type);

export const runtime = (ticks) => {
  if (!ticks) return "";
  const minutes = Math.round(ticks / TICKS_PER_SECOND / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
};

export const progressPercent = (item) => item.UserData?.PlayedPercentage || 0;
export const resumeSeconds = (item) => (item.UserData?.PlaybackPositionTicks || 0) / TICKS_PER_SECOND;

// Jellyfin 12 only accepts "ApiKey" on media URLs; servers before 10.9 only
// know "api_key". Each ignores the one it doesn't recognise, so send both.
const keyParams = (jf) => ({ ApiKey: jf.token, api_key: jf.token });

// HLS stream. Jellyfin remuxes when the source is already H.264/AAC and
// transcodes otherwise; picking a subtitle track burns it into the video so
// every subtitle format (ASS, PGS, ...) works in the browser.
export function streamUrl(jf, item, { playSessionId, audioIndex, subtitleIndex }) {
  const source = item.MediaSources?.[0];
  return `${jf.server}/Videos/${item.Id}/master.m3u8?${qs({
    ...keyParams(jf),
    MediaSourceId: source?.Id || item.Id,
    DeviceId: deviceId(),
    PlaySessionId: playSessionId,
    VideoCodec: "h264",
    AudioCodec: "aac,mp3",
    TranscodingMaxAudioChannels: 2,
    SegmentContainer: "ts",
    MinSegments: 1,
    BreakOnNonKeyFrames: true,
    AllowVideoStreamCopy: true,
    AllowAudioStreamCopy: true,
    VideoBitrate: 20_000_000,
    AudioBitrate: 320_000,
    AudioStreamIndex: audioIndex,
    SubtitleStreamIndex: subtitleIndex,
    SubtitleMethod: subtitleIndex !== undefined && subtitleIndex !== null ? "Encode" : undefined,
  })}`;
}

// Original file, for players like Kodi that handle any format
export const directStreamUrl = (jf, item) =>
  `${jf.server}/Videos/${item.Id}/stream?${qs({ static: true, ...keyParams(jf), MediaSourceId: item.MediaSources?.[0]?.Id })}`;

export const mediaStreams = (item, type) =>
  (item.MediaSources?.[0]?.MediaStreams || []).filter((s) => s.Type === type);

// Playback reporting keeps "Continue watching" and watched status in sync
export function reportPlayback(jf, event, { item, playSessionId, seconds, paused }) {
  const path = { start: "/Sessions/Playing", progress: "/Sessions/Playing/Progress", stop: "/Sessions/Playing/Stopped" }[event];
  return request(jf.server, path, {
    token: jf.token,
    method: "POST",
    raw: true,
    body: {
      ItemId: item.Id,
      MediaSourceId: item.MediaSources?.[0]?.Id || item.Id,
      PlaySessionId: playSessionId,
      PositionTicks: Math.floor((seconds || 0) * TICKS_PER_SECOND),
      IsPaused: Boolean(paused),
      CanSeek: true,
      PlayMethod: "Transcode",
    },
  }).catch(() => {});
}

export const stopEncoding = (jf, playSessionId) =>
  request(jf.server, `/Videos/ActiveEncodings?${qs({ deviceId: deviceId(), playSessionId })}`, {
    token: jf.token,
    method: "DELETE",
    raw: true,
  }).catch(() => {});

/* global Buffer, __dirname */
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { ANIME_PATTERN, isAllowedChannel, parseM3U, toM3U } from "./src/utils/m3u.js"
import { iptvCountryCode } from "./src/config/region.js"

const PROXY_PATH = "/hls-proxy"
const DEFAULT_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"

// Local HLS proxy for the dev/preview server. Many free live streams send
// restrictive CORS headers (e.g. Pluto TV only allows pluto.tv), so the
// browser can't play them directly. This fetches the stream server-side and
// rewrites playlist URIs so every segment also goes through the proxy.
// Query format matches the external m3u8proxy: ?url=<encoded>&headers=<json>
function hlsProxy() {
  const proxied = (url, headers) =>
    `${PROXY_PATH}?url=${encodeURIComponent(url)}` +
    (headers ? `&headers=${encodeURIComponent(headers)}` : "")

  const rewritePlaylist = (text, base, headers) =>
    text
      .split(/\r?\n/)
      .map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return line
        if (trimmed.startsWith("#")) {
          return line.replace(
            /URI="([^"]+)"/g,
            (_, uri) => `URI="${proxied(new URL(uri, base).href, headers)}"`
          )
        }
        return proxied(new URL(trimmed, base).href, headers)
      })
      .join("\n")

  const handler = async (req, res, next) => {
    if (!req.url.startsWith(PROXY_PATH)) return next()
    const params = new URL(req.url, "http://localhost").searchParams
    const target = params.get("url")
    if (!target || !/^https?:\/\//i.test(target)) {
      res.statusCode = 400
      return res.end("Missing or invalid url")
    }
    const rawHeaders = params.get("headers")
    let extra = {}
    try {
      extra = rawHeaders ? JSON.parse(rawHeaders) : {}
    } catch {
      extra = {}
    }
    const headers = { "user-agent": extra["user-agent"] || DEFAULT_UA }
    if (extra.referer) headers.referer = extra.referer
    if (req.headers.range) headers.range = req.headers.range

    try {
      const upstream = await fetch(target, { headers, redirect: "follow" })
      const type = upstream.headers.get("content-type") || ""
      res.setHeader("access-control-allow-origin", "*")
      res.statusCode = upstream.status

      const looksLikePlaylist =
        /mpegurl/i.test(type) || /\.m3u8?($|\?)/i.test(new URL(upstream.url).pathname)
      if (looksLikePlaylist) {
        const text = await upstream.text()
        if (text.trimStart().startsWith("#EXTM3U")) {
          res.setHeader("content-type", "application/vnd.apple.mpegurl")
          return res.end(rewritePlaylist(text, upstream.url, rawHeaders))
        }
        if (type) res.setHeader("content-type", type)
        return res.end(text)
      }

      if (type) res.setHeader("content-type", type)
      res.end(Buffer.from(await upstream.arrayBuffer()))
    } catch (err) {
      res.statusCode = 502
      res.end(`Proxy error: ${err.message}`)
    }
  }

  return {
    name: "hls-proxy",
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// GET /playlist.m3u?country=gb&category=movies&anime=1
// A live, always-current M3U of the site's channels (UK-playable, blocklist
// applied) that Kodi's IPTV Simple Client or Jellyfin Live TV can subscribe to.
function playlistEndpoint() {
  const cache = new Map()
  const HOUR = 60 * 60 * 1000

  const load = async (path) => {
    const hit = cache.get(path)
    if (hit && Date.now() - hit.at < HOUR) return hit.channels
    const res = await fetch(`https://iptv-org.github.io/iptv/${path}.m3u`)
    if (!res.ok) throw new Error(`iptv-org returned ${res.status} for ${path}`)
    const channels = parseM3U(await res.text()).filter(isAllowedChannel)
    cache.set(path, { at: Date.now(), channels })
    return channels
  }

  const handler = async (req, res, next) => {
    if (!req.url.startsWith("/playlist.m3u")) return next()
    const params = new URL(req.url, "http://localhost").searchParams
    const country = (params.get("country") || "").replace(/[^a-z]/gi, "")
    const category = (params.get("category") || "").replace(/[^a-z-]/gi, "").toLowerCase()
    const anime = params.get("anime") === "1"
    try {
      let channels
      if (anime) {
        channels = (await load("index")).filter((c) => ANIME_PATTERN.test(c.name))
      } else if (country) {
        channels = await load(`countries/${iptvCountryCode(country)}`)
        if (category) {
          channels = channels.filter((c) =>
            c.categories.some((cat) => cat.toLowerCase() === category)
          )
        }
      } else {
        channels = await load(category ? `categories/${category}` : "index")
      }
      res.setHeader("content-type", "audio/x-mpegurl; charset=utf-8")
      res.setHeader("access-control-allow-origin", "*")
      res.end(toM3U(channels))
    } catch (err) {
      res.statusCode = 502
      res.end(`Playlist error: ${err.message}`)
    }
  }

  return {
    name: "playlist-endpoint",
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// POST /kodi-rpc  (headers: x-kodi-url, optional x-kodi-auth = base64 user:pass)
// Kodi's web server sends no CORS headers, so the browser can't call its
// JSON-RPC API directly. This forwards JSON-RPC requests to <x-kodi-url>/jsonrpc.
function kodiRelay() {
  const handler = async (req, res, next) => {
    if (!req.url.startsWith("/kodi-rpc")) return next()
    if (req.method !== "POST") {
      res.statusCode = 405
      return res.end()
    }
    const base = String(req.headers["x-kodi-url"] || "").replace(/\/+$/, "")
    if (!/^https?:\/\/[^/]+$/i.test(base)) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: { message: "Invalid Kodi address" } }))
    }
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const headers = { "content-type": "application/json" }
    if (req.headers["x-kodi-auth"]) headers.authorization = `Basic ${req.headers["x-kodi-auth"]}`
    try {
      const upstream = await fetch(`${base}/jsonrpc`, {
        method: "POST",
        headers,
        body: Buffer.concat(chunks),
        signal: AbortSignal.timeout(8000),
      })
      res.statusCode = upstream.status
      res.setHeader("content-type", "application/json")
      res.end(await upstream.text())
    } catch (err) {
      res.statusCode = 502
      res.setHeader("content-type", "application/json")
      res.end(JSON.stringify({ error: { message: `Can't reach Kodi: ${err.message}` } }))
    }
  }

  return {
    name: "kodi-relay",
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  plugins: [react(), hlsProxy(), playlistEndpoint(), kodiRelay()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})

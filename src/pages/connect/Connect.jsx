import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useConnections } from "@/src/context/ConnectionsContext";
import { signIn, signOut } from "@/src/utils/jellyfin.utils";
import { kodiCall, kodiPing, normaliseKodiUrl } from "@/src/utils/kodi.utils";
import { KodiRemote } from "@/src/components/kodi/KodiControls";

const input =
  "w-full bg-[#050b07] text-white px-3 py-2 rounded-lg border border-white/15 focus:outline-none focus:border-[#00ff66] placeholder:text-white/30";
const primary =
  "bg-[#00ff66] text-black font-semibold px-5 py-2 rounded-3xl hover:bg-white transition-colors disabled:opacity-60";
const secondary = "bg-white/10 hover:bg-white/20 font-semibold px-5 py-2 rounded-3xl";
const card = "bg-[#0c1a12]/90 border border-white/10 rounded-xl p-6 flex flex-col gap-y-4";

function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-y-1 text-[14px]">
      <span className="text-white/70">{label}</span>
      <input className={input} {...props} />
    </label>
  );
}

function JellyfinCard() {
  const { jellyfin, setJellyfin } = useConnections();
  const [form, setForm] = useState({ server: "", username: "", password: "" });
  const [state, setState] = useState({ busy: false, error: "" });

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: "" });
    try {
      setJellyfin(await signIn(form.server, form.username, form.password));
      setForm({ server: "", username: "", password: "" });
      setState({ busy: false, error: "" });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  return (
    <section className={card}>
      <div>
        <h2 className="text-2xl font-bold text-[#00ff66]">Jellyfin</h2>
        <p className="text-white/60 text-[14px]">
          Browse and play your own Jellyfin library here, with resume and
          watched status synced back to your server.
        </p>
      </div>
      {jellyfin ? (
        <>
          <p>
            Signed in to <b>{jellyfin.serverName}</b> as <b>{jellyfin.userName}</b>
            <br />
            <span className="text-white/50 text-[13px]">{jellyfin.server}</span>
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/jellyfin" className={primary}>
              Open My Media
            </Link>
            <button
              className={secondary}
              onClick={() => {
                signOut(jellyfin);
                setJellyfin(null);
              }}
            >
              Sign out
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-y-3">
          <Field
            label="Server address"
            placeholder="http://192.168.1.20:8096"
            value={form.server}
            onChange={(e) => setForm({ ...form, server: e.target.value })}
            required
          />
          <Field
            label="Username"
            value={form.username}
            autoComplete="username"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <Field
            label="Password"
            type="password"
            value={form.password}
            autoComplete="current-password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {state.error && <p className="text-[#ff6b6b] text-[14px]">{state.error}</p>}
          <button type="submit" disabled={state.busy} className={`${primary} w-fit`}>
            {state.busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      )}
    </section>
  );
}

function KodiCard() {
  const { kodi, setKodi } = useConnections();
  const [form, setForm] = useState({ url: "", user: "kodi", pass: "" });
  const [state, setState] = useState({ busy: false, error: "", ok: "" });

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: "", ok: "" });
    const candidate = { url: normaliseKodiUrl(form.url), user: form.user.trim(), pass: form.pass };
    try {
      await kodiPing(candidate);
      const props = await kodiCall(candidate, "Application.GetProperties", { properties: ["name", "version"] }).catch(() => null);
      const name = props?.name ? `${props.name} ${props.version?.major ?? ""}`.trim() : "Kodi";
      setKodi({ ...candidate, name });
      setState({ busy: false, error: "", ok: "" });
    } catch (err) {
      setState({ busy: false, error: err.message, ok: "" });
    }
  };

  const test = async () => {
    setState({ busy: true, error: "", ok: "" });
    try {
      await kodiPing(kodi);
      setState({ busy: false, error: "", ok: "Connected" });
    } catch (err) {
      setState({ busy: false, error: err.message, ok: "" });
    }
  };

  return (
    <section className={card}>
      <div>
        <h2 className="text-2xl font-bold text-[#00ff66]">Kodi</h2>
        <p className="text-white/60 text-[14px]">
          Send live channels, YouTube channels and Jellyfin titles to your Kodi
          box, and use this page as a remote. In Kodi, turn on{" "}
          <i>Settings → Services → Control → Allow remote control via HTTP</i>{" "}
          and set a username and password.
        </p>
      </div>
      {kodi ? (
        <>
          <p>
            Connected to <b>{kodi.name}</b>{" "}
            <span className="text-white/50 text-[13px]">({kodi.url})</span>
          </p>
          <div className="flex gap-3 flex-wrap items-center">
            <button className={secondary} onClick={test} disabled={state.busy}>
              {state.busy ? "Testing..." : "Test connection"}
            </button>
            <button className={secondary} onClick={() => setKodi(null)}>
              Forget
            </button>
            {state.ok && <span className="text-[#00ff66] text-[14px]">{state.ok}</span>}
          </div>
          {state.error && <p className="text-[#ff6b6b] text-[14px]">{state.error}</p>}
          <div className="border-t border-white/10 pt-4">
            <p className="font-semibold mb-3">Remote</p>
            <KodiRemote kodi={kodi} />
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-y-3">
          <Field
            label="Kodi address (port 8080 by default)"
            placeholder="192.168.1.30:8080"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            <Field label="Username" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} />
            <Field
              label="Password"
              type="password"
              value={form.pass}
              onChange={(e) => setForm({ ...form, pass: e.target.value })}
            />
          </div>
          {state.error && <p className="text-[#ff6b6b] text-[14px]">{state.error}</p>}
          <button type="submit" disabled={state.busy} className={`${primary} w-fit`}>
            {state.busy ? "Connecting..." : "Connect"}
          </button>
        </form>
      )}
    </section>
  );
}

function CopyRow({ label, url }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy this URL", url);
    }
  };
  return (
    <div className="flex flex-col gap-y-1">
      <span className="text-[14px] text-white/70">{label}</span>
      <div className="flex">
        <input readOnly value={url} className={`${input} rounded-r-none text-[13px] font-mono`} onFocus={(e) => e.target.select()} />
        <button onClick={copy} className="px-4 bg-[#00ff66] text-black rounded-r-lg" title="Copy">
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
        </button>
      </div>
    </div>
  );
}

function PlaylistCard() {
  const origin = window.location.origin;
  const isLocalOnly = /\/\/(localhost|127\.0\.0\.1)(:|$)/.test(origin);
  return (
    <section className={`${card} col-span-full`}>
      <div>
        <h2 className="text-2xl font-bold text-[#00ff66]">Live TV playlists (M3U)</h2>
        <p className="text-white/60 text-[14px]">
          Add the site&apos;s live channels to Kodi or Jellyfin. These links
          always serve the current channel list, filtered for the UK with the
          blocklist applied.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
        <CopyRow label="UK channels" url={`${origin}/playlist.m3u?country=gb`} />
        <CopyRow label="Anime channels" url={`${origin}/playlist.m3u?anime=1`} />
        <CopyRow label="Movie channels (all countries)" url={`${origin}/playlist.m3u?category=movies`} />
        <CopyRow label="Everything (~11,000 channels)" url={`${origin}/playlist.m3u`} />
      </div>
      <p className="text-white/50 text-[13px]">
        Any Live TV page can also be turned into a playlist with the
        &ldquo;Playlist&rdquo; button next to its filters.
      </p>
      <div className="grid grid-cols-2 gap-6 text-[14px] text-white/75 max-[900px]:grid-cols-1">
        <div>
          <p className="font-semibold text-white mb-1">Kodi</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Install <i>Add-ons → Install from repository → PVR clients → PVR IPTV Simple Client</i>.</li>
            <li>Configure it: <i>Location: Remote path</i>, then paste a URL above as the M3U playlist URL.</li>
            <li>Restart Kodi. The channels appear under <i>TV</i>.</li>
          </ol>
        </div>
        <div>
          <p className="font-semibold text-white mb-1">Jellyfin</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Open <i>Dashboard → Live TV → Tuner Devices → +</i>.</li>
            <li>Choose <i>M3U Tuner</i> and paste a URL above as the file or URL.</li>
            <li>Save. The channels appear in Jellyfin&apos;s Live TV section.</li>
          </ol>
        </div>
      </div>
      {isLocalOnly && (
        <p className="text-[13px] bg-[#FF5700]/15 border border-[#FF5700]/40 rounded-lg px-3 py-2">
          You&apos;re on <b>localhost</b>, which other devices can&apos;t reach. To use
          these on a Kodi box or Jellyfin server, start the site with{" "}
          <code className="font-mono">npm run host</code> and swap{" "}
          <code className="font-mono">localhost</code> for this computer&apos;s
          network address (e.g. 192.168.1.x). The playlist links only work while the
          site is running.
        </p>
      )}
    </section>
  );
}

function Connect() {
  return (
    <div className="w-full px-4 pt-[100px] max-[600px]:pt-[120px]">
      <h1 className="text-3xl font-extrabold">Connect</h1>
      <p className="text-white/60 mt-1 text-[14px] max-w-[760px]">
        Link your own media server and Kodi box. Connection details are saved
        in this browser only.
      </p>
      <div className="grid grid-cols-2 gap-6 mt-8 max-[1000px]:grid-cols-1">
        <JellyfinCard />
        <KodiCard />
        <PlaylistCard />
      </div>
    </div>
  );
}

export default Connect;

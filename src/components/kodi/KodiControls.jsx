import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faCircleDot,
  faHouse,
  faPlay,
  faRotateLeft,
  faStop,
  faVolumeHigh,
  faVolumeLow,
  faTv,
} from "@fortawesome/free-solid-svg-icons";
import { useConnections } from "@/src/context/ConnectionsContext";
import {
  kodiInput,
  kodiPlay,
  kodiPlayPause,
  kodiStop,
  kodiVolume,
} from "@/src/utils/kodi.utils";

// "Play on Kodi" button. Renders nothing until a Kodi box is connected.
export function PlayOnKodi({ file, label = "Play on Kodi", className = "" }) {
  const { kodi } = useConnections();
  const [state, setState] = useState({ status: "idle", message: "" });
  if (!kodi) return null;

  const send = async () => {
    setState({ status: "sending", message: "" });
    try {
      await kodiPlay(kodi, file);
      setState({ status: "done", message: `Playing on ${kodi.name || "Kodi"}` });
    } catch (err) {
      setState({ status: "error", message: err.message });
    }
  };

  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      <button
        onClick={send}
        disabled={state.status === "sending"}
        className="flex items-center gap-x-2 bg-white/10 hover:bg-white/20 border border-[#00ff66]/40 text-white font-semibold px-4 py-2 rounded-3xl disabled:opacity-60"
      >
        <FontAwesomeIcon icon={faTv} className="text-[#00ff66]" />
        {state.status === "sending" ? "Sending..." : label}
      </button>
      {state.message && (
        <span className={`text-[13px] ${state.status === "error" ? "text-[#ff6b6b]" : "text-[#00ff66]"}`}>
          {state.message}
          {state.status === "error" && (
            <>
              {" "}
              <Link to="/connect" className="underline">
                Check connection
              </Link>
            </>
          )}
        </span>
      )}
    </div>
  );
}

const btn =
  "w-12 h-12 rounded-full bg-white/10 hover:bg-[#00ff66] hover:text-black flex items-center justify-center transition-colors";

// Basic remote: navigation, playback and volume
export function KodiRemote({ kodi }) {
  const [message, setMessage] = useState("");
  const run = (fn) => async () => {
    setMessage("");
    try {
      await fn();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-y-3">
      <div className="grid grid-cols-3 gap-2">
        <span />
        <button className={btn} title="Up" onClick={run(() => kodiInput(kodi, "Up"))}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
        <span />
        <button className={btn} title="Left" onClick={run(() => kodiInput(kodi, "Left"))}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button className={`${btn} !bg-[#00ff66]/20`} title="Select" onClick={run(() => kodiInput(kodi, "Select"))}>
          <FontAwesomeIcon icon={faCircleDot} />
        </button>
        <button className={btn} title="Right" onClick={run(() => kodiInput(kodi, "Right"))}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
        <button className={btn} title="Back" onClick={run(() => kodiInput(kodi, "Back"))}>
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
        <button className={btn} title="Down" onClick={run(() => kodiInput(kodi, "Down"))}>
          <FontAwesomeIcon icon={faArrowDown} />
        </button>
        <button className={btn} title="Home" onClick={run(() => kodiInput(kodi, "Home"))}>
          <FontAwesomeIcon icon={faHouse} />
        </button>
      </div>
      <div className="flex gap-2">
        <button className={btn} title="Play / pause" onClick={run(() => kodiPlayPause(kodi))}>
          <FontAwesomeIcon icon={faPlay} />
        </button>
        <button className={btn} title="Stop" onClick={run(() => kodiStop(kodi))}>
          <FontAwesomeIcon icon={faStop} />
        </button>
        <button className={btn} title="Volume down" onClick={run(() => kodiVolume(kodi, "decrement"))}>
          <FontAwesomeIcon icon={faVolumeLow} />
        </button>
        <button className={btn} title="Volume up" onClick={run(() => kodiVolume(kodi, "increment"))}>
          <FontAwesomeIcon icon={faVolumeHigh} />
        </button>
      </div>
      {message && <p className="text-[13px] text-[#ff6b6b] text-center">{message}</p>}
    </div>
  );
}

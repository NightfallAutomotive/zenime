import { createContext, useCallback, useContext, useState } from "react";

// Saved Jellyfin / Kodi connection details. Stored in this browser only
// (localStorage), never sent anywhere except to the servers themselves.
const KEYS = { jellyfin: "nightfall.jellyfin", kodi: "nightfall.kodi" };

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {
    // Storage unavailable (private mode etc.): keep it in memory only
  }
};

const ConnectionsContext = createContext(null);

export function ConnectionsProvider({ children }) {
  const [jellyfin, setJellyfinState] = useState(() => read(KEYS.jellyfin));
  const [kodi, setKodiState] = useState(() => read(KEYS.kodi));

  const setJellyfin = useCallback((value) => {
    write(KEYS.jellyfin, value);
    setJellyfinState(value);
  }, []);

  const setKodi = useCallback((value) => {
    write(KEYS.kodi, value);
    setKodiState(value);
  }, []);

  return (
    <ConnectionsContext.Provider value={{ jellyfin, setJellyfin, kodi, setKodi }}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export const useConnections = () => useContext(ConnectionsContext);

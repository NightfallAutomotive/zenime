import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Error from "./components/error/Error";
import "./App.css";
import Search from "./pages/search/Search";
import Watch from "./pages/watch/Watch";
import Live from "./pages/live/Live";
import Anime from "./pages/anime/Anime";
import Services from "./pages/services/Services";
import OnDemand from "./pages/ondemand/OnDemand";
import YouTubeChannel from "./pages/ondemand/YouTubeChannel";
import Connect from "./pages/connect/Connect";
import JellyfinHome from "./pages/jellyfin/JellyfinHome";
import JellyfinLibrary from "./pages/jellyfin/JellyfinLibrary";
import JellyfinItem from "./pages/jellyfin/JellyfinItem";
import { ConnectionsProvider } from "./context/ConnectionsContext";
import SplashScreen from "./components/splashscreen/SplashScreen";
import MatrixRain from "./components/matrix/MatrixRain";

function App() {
  const location = useLocation();

  // Scroll to top on page change (query changes like filters keep position)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check if the current route is for the splash screen
  const isSplashScreen = location.pathname === "/";

  return (
    <ConnectionsProvider>
      <MatrixRain />
      <div className="app-container relative z-[1]">
        <main className="content">
          {!isSplashScreen && <Navbar />}
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/live" element={<Live />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/services" element={<Services />} />
            <Route path="/ondemand" element={<OnDemand />} />
            <Route path="/ondemand/youtube/:id" element={<YouTubeChannel />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/jellyfin" element={<JellyfinHome />} />
            <Route path="/jellyfin/library/:id" element={<JellyfinLibrary />} />
            <Route path="/jellyfin/item/:id" element={<JellyfinItem />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/404-not-found-page" element={<Error error="404" />} />
            <Route path="/error-page" element={<Error />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<Error error="404" />} />
          </Routes>
          {!isSplashScreen && <Footer />}
        </main>
      </div>
    </ConnectionsProvider>
  );
}

export default App;

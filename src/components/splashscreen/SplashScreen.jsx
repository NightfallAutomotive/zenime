import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import logoTitle from "@/src/config/logoTitle";
import Logo from "../logo/Logo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowRight,
  faMagnifyingGlass,
  faTv,
} from "@fortawesome/free-solid-svg-icons";
import navLinks from "@/src/config/navLinks";
import { featuredServices } from "@/src/data/services";

const NAV_LINKS = navLinks.map((l) => ({ to: l.path, label: l.label }));

function SplashScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchSubmit = useCallback(() => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;
    const queryParam = encodeURIComponent(trimmedSearch);
    navigate(`/search?keyword=${queryParam}`);
  }, [search, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  return (
    <div className="w-full">
      <div className="w-[1300px] mx-auto pt-12 relative overflow-hidden max-[1350px]:w-full max-[1350px]:px-8 max-[1200px]:pt-8 max-[1200px]:min-h-fit max-[780px]:px-4 max-[520px]:px-0 max-[520px]:pt-6">
        <nav className="relative w-full">
          <div className="w-fit flex gap-x-12 mx-auto font-semibold max-[780px]:hidden">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-[#00ff66]">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="max-[780px]:block hidden max-[520px]:px-4 max-[520px]:text-sm">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 focus:outline-none flex items-center gap-x-2 transition-colors duration-200 group"
            >
              <svg
                className="w-6 h-6 text-white transition-colors duration-200 max-[520px]:w-5 max-[520px]:h-5 group-hover:text-[#00ff66] group-focus:text-[#00ff66] group-active:text-[#00ff66]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="text-white font-semibold transition-colors duration-200 group-hover:text-[#00ff66] group-focus:text-[#00ff66] group-active:text-[#00ff66]">
                Menu
              </span>
            </button>
          </div>

          {isModalOpen && (
            <div className="max-[780px]:block w-full hidden absolute z-50 top-10">
              <div className="bg-[#101010fa] w-full p-6 rounded-2xl flex flex-col gap-y-6 items-center">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="self-end text-black text-xl absolute top-0 right-0 bg-[#00ff66] px-3 py-1 rounded-tr-xl rounded-bl-xl font-bold"
                >
                  &times;
                </button>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsModalOpen(false)}
                    className="hover:text-[#00ff66] text-white text-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="splashscreen min-h-[480px] min-[1200px]:min-h-[520px] bg-[#0c1a12]/85 border border-[#00ff66]/15 backdrop-blur-[2px] rounded-[40px] flex relative mt-7 max-[780px]:w-full items-stretch max-[780px]:rounded-[30px] max-[520px]:rounded-none max-[520px]:min-h-fit max-[520px]:pb-4 max-[520px]:mt-4">
          <div className="h-auto flex flex-col w-[700px] relative z-40 px-20 py-20 left-0 max-[1200px]:py-12 max-[780px]:px-12 max-[520px]:py-4 max-[520px]:px-8">
            <Logo className="text-[45px] max-[520px]:text-[34px] max-[520px]:text-center" />
            <div className="w-full flex gap-x-3 mt-6">
              <input
                type="text"
                placeholder="Search channels & services..."
                className="w-full py-3 px-6 rounded-xl bg-[#050b07] border border-[#00ff66]/40 text-[18px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#00ff66]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="bg-[#00ff66] text-white py-3 px-4 rounded-xl font-extrabold group"
                onClick={handleSearchSubmit}
              >
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-lg text-black group-hover:text-white max-[600px]:mt-[7px]"
                />
              </button>
            </div>
            <p className="mt-6 text-white/70 text-[16px] max-[520px]:text-[14px]">
              Thousands of free live TV channels, free anime, and the best
              free streaming services. All legal, no sign-up.
            </p>
            <div className="mt-4 text-[15px] leading-[1.6] max-[520px]:text-[13px] max-[520px]:leading-[1.4]">
              <span className="splashitem font-[600]">Popular free services: </span>
              {featuredServices.map((item, index) => (
                <span key={item.id} className="splashitem font-[400]">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.name}
                  </a>
                  {index < featuredServices.length - 1 && <span>, </span>}
                </span>
              ))}
            </div>
            <div className="mt-8 flex max-[780px]:left-10">
              <Link to="/home" className="max-[520px]:w-full">
                <div className="bg-[#00ff66] text-black py-4 px-10 rounded-xl font-bold text-[20px] max-[520px]:text-center max-[520px]:font-medium max-[520px]:text-[17px]">
                  Start watching
                  <FontAwesomeIcon
                    icon={faCircleArrowRight}
                    className="ml-6 text-black"
                  />
                </div>
              </Link>
            </div>
          </div>
          <div className="h-full w-[600px] absolute right-0 max-[780px]:hidden rounded-r-[40px] overflow-hidden bg-gradient-to-br from-[#0d3320]/80 to-transparent flex items-center justify-center">
            <div className="absolute w-[380px] h-[380px] rounded-full bg-[#00ff66]/15 blur-3xl" />
            <FontAwesomeIcon icon={faTv} className="relative text-[180px] text-[#00ff66]/80" />
          </div>
        </div>
      </div>
      <div className="mt-10 text-[14px] text-center pb-4">
        © {logoTitle}
      </div>
    </div>
  );
}

export default SplashScreen;

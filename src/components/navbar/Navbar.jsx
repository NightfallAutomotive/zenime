import { useState, useEffect } from "react";
import Logo from "../logo/Logo";
import navLinks from "@/src/config/navLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { SearchProvider } from "@/src/context/SearchContext";
import WebSearch from "../searchbar/WebSearch";
import MobileSearch from "../searchbar/MobileSearch";

function Navbar() {
  const location = useLocation();
  const [isNotHomePage, setIsNotHomePage] = useState(
    location.pathname !== "/" && location.pathname !== "/home"
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleHamburgerClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };
  useEffect(() => {
    setIsNotHomePage(
      location.pathname !== "/" && location.pathname !== "/home"
    );
  }, [location.pathname]);

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 w-full h-16 z-[1000000] flex p-4 py-8 items-center justify-between transition-all duration-300 ease-in-out ${
          isNotHomePage ? "bg-[#050b07]" : "bg-opacity-0"
        } ${
          isScrolled ? "bg-[#07130c] bg-opacity-90 backdrop-blur-md" : ""
        } max-[600px]:h-fit max-[600px]:flex-col max-[1200px]:bg-opacity-100 max-[600px]:py-2`}
      >
        <div className="flex gap-x-6 items-center w-fit max-lg:w-full max-lg:justify-between">
          <div className="flex gap-x-6 items-center w-fit">
            <FontAwesomeIcon
              icon={faBars}
              className="text-2xl text-white mt-1 cursor-pointer"
              onClick={handleHamburgerClick}
            />
            <Logo to="/" className="text-3xl max-[575px]:text-2xl" />
          </div>
          <WebSearch />
        </div>
        <div className="flex gap-x-7 items-center max-lg:hidden">
          {navLinks.slice(1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col gap-y-1 items-center cursor-pointer hover:text-[#00ff66] ${
                location.pathname === item.path ? "text-[#00ff66]" : ""
              }`}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="text-[#00ff66] text-xl font-bold"
              />
              <p className="text-[15px]">{item.label}</p>
            </Link>
          ))}
        </div>
        <MobileSearch />
      </nav>
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
    </SearchProvider>
  );
}

export default Navbar;

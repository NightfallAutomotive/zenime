import { FaChevronLeft } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import navLinks, { browseLinks } from "@/src/config/navLinks";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  cleanupScrollbar,
  toggleScrollbar,
} from "@/src/helper/toggleScrollbar";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    toggleScrollbar(isOpen);
    return () => {
      cleanupScrollbar();
    };
  }, [isOpen]);

  useEffect(() => {
    onClose();
  }, [location]);

  return (
    <>
      {isOpen && (
        <div
          className={`fixed top-0 left-0 bottom-0 right-0 w-screen h-screen transform transition-all duration-400 ease-in-out ${
            isOpen ? "backdrop-blur-lg" : "backdrop-blur-none"
          }`}
          onClick={onClose}
          style={{ zIndex: 1000000, background: "rgba(5, 11, 7, .8)" }}
        />
      )}

      <div
        className={`fixed h-full top-0 left-0 z-50 flex transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ zIndex: 1000200 }}
      >
        <div
          className="bg-white/10 w-[260px] py-8 h-full flex flex-col items-start max-[575px]:w-56 overflow-y-auto sidebar"
          style={{
            zIndex: 300,
            borderRight: "1px solid rgba(0, 0, 0, .1)",
          }}
        >
          <div className="px-4 w-full">
            <button
              onClick={onClose}
              className="w-full text-white flex items-baseline h-fit gap-x-1 z-[100] px-3 py-2 bg-[#1a3d28] rounded-3xl"
            >
              <FaChevronLeft className="text-sm font-bold" />
              <p>Close menu</p>
            </button>
          </div>
          <div className="flex gap-x-7 w-full py-3 justify-center px-auto mt-8 bg-black/10 max-[575px]:gap-x-4 lg:hidden">
            {navLinks.slice(1).map((item) => (
              <Link
                to={item.path}
                key={item.path}
                className="flex flex-col gap-y-1 items-center"
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-[#00ff66] text-xl font-bold max-[575px]:text-[15px]"
                />
                <p className="text-[15px] max-[575px]:text-[13px]">
                  {item.label}
                </p>
              </Link>
            ))}
          </div>
          <ul className="text-white mt-8 w-full">
            {[...navLinks, ...browseLinks].map((item, index) => (
              <li
                key={index}
                className="py-4 w-full font-semibold"
                style={{ borderBottom: "1px solid rgba(255, 255, 255, .08)" }}
              >
                <Link
                  to={item.path}
                  className="px-4 hover:text-[#00ff66] hover:cursor-pointer w-fit line-clamp-1"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

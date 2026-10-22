import { Link } from "react-router-dom";

// "Nightfall" with a glowing green "TV"
function Logo({ to = "/home", className = "" }) {
  return (
    <Link
      to={to}
      className={`font-logo font-bold tracking-tight whitespace-nowrap cursor-pointer ${className}`}
    >
      Nightfall
      <span className="text-[#00ff66] ml-2 [text-shadow:0_0_12px_rgba(0,255,102,.7)]">
        TV
      </span>
    </Link>
  );
}

export default Logo;

import Logo from "../logo/Logo";
import website_name from "@/src/config/website.js";
import { browseLinks } from "@/src/config/navLinks";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="flex flex-col w-full mt-[100px] px-4 max-[500px]:px-0">
      <div
        style={{ borderBottom: "1px solid rgba(255, 255, 255, .075)" }}
        className="w-full text-left py-4 max-[500px]:hidden"
      >
        <Logo className="text-4xl" />
      </div>
      <div className="flex py-5 flex-col w-full space-y-4 max-md:items-center max-[500px]:bg-[#10241a]">
        <div className="flex w-fit items-center space-x-6 max-[500px]:hidden">
          <p className="text-2xl font-bold max-md:text-lg">BROWSE</p>
          <p
            style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.6)" }}
            className="text-md font-semibold pl-6"
          >
            Jump straight to a live TV category
          </p>
        </div>
        <div className="flex gap-x-[7px] flex-wrap justify-start gap-y-2 max-[500px]:hidden">
          {browseLinks.map((item) => (
            <Link
              to={item.path}
              key={item.path}
              className="text-[15px] bg-[#10241a] px-3 rounded-md font-bold hover:text-black hover:bg-[#00ff66] transition-all ease-out"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col w-full text-left space-y-2 pt-4 max-md:items-center max-[470px]:px-[5px]">
          <p className="text-[#8fa897] text-[16px] max-md:text-center max-md:text-[12px]">
            {website_name} does not host any content. Live channels are publicly
            available free-to-air streams indexed by the open-source{" "}
            <a
              href="https://github.com/iptv-org/iptv"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#00ff66]"
            >
              iptv-org
            </a>{" "}
            project, and service links go to the official providers. All
            trademarks belong to their owners.
          </p>
          <p className="text-[#8fa897] max-md:text-[14px]">© {website_name}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

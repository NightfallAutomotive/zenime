import { FaExternalLinkAlt } from "react-icons/fa";

const regionLabel = (code) => {
  if (code === "Global" || code === "Asia") return code;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code);
  } catch {
    return code;
  }
};

const flag = (code) =>
  /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)))
    : "🌐";

// Black or white text, whichever reads better on the brand colour
const textOn = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#000" : "#fff";
};

function ServiceCard({ service }) {
  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-y-3 bg-[#0c1a12] rounded-xl p-4 border border-white/5 hover:border-[#00ff66]/60 transition-all"
    >
      <div className="flex items-center gap-x-3">
        <div
          className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center text-xl font-extrabold"
          style={{ background: service.color, color: textOn(service.color) }}
        >
          {service.name[0]}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[16px] leading-5 line-clamp-1 group-hover:text-[#00ff66]">
            {service.name}
          </p>
          <p
            className="text-[12px] text-white/50 line-clamp-1"
            title={service.regions.map(regionLabel).join(", ")}
          >
            {service.regions.slice(0, 6).map(flag).join(" ")}
            {service.regions.length > 6 && ` +${service.regions.length - 6}`}
            {service.regions.length === 1 && ` ${regionLabel(service.regions[0])}`}
          </p>
        </div>
        <FaExternalLinkAlt className="ml-auto text-white/40 text-sm shrink-0 group-hover:text-[#00ff66]" />
      </div>
      <p className="text-[14px] text-white/75 leading-5">{service.description}</p>
      <div className="flex flex-wrap gap-1 mt-auto">
        {service.note && (
          <span className="text-[11px] font-bold px-2 py-[1px] rounded-[3px] bg-[#FF5700] text-white">
            {service.note}
          </span>
        )}
        {service.tags.map((tag) => (
          <span
            key={tag}
            className={`text-[11px] font-semibold px-2 py-[1px] rounded-[3px] capitalize ${
              tag === "anime" ? "bg-[#00ff66] text-black" : "bg-white/10 text-white/80"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

export function ServiceGrid({ services, className = "" }) {
  return (
    <div
      className={`grid grid-cols-4 gap-4 max-[1300px]:grid-cols-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 ${className}`}
    >
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

export default ServiceCard;

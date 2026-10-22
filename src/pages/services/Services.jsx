import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ServiceGrid } from "@/src/components/servicecard/ServiceCard";
import services, { SERVICE_TAGS } from "@/src/data/services";

function Services() {
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag") || "";

  const filtered = useMemo(
    () =>
      services.filter((s) => !tag || s.tags.includes(tag)),
    [tag]
  );

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <div className="w-full px-4 pt-[100px] max-[600px]:pt-[120px]">
      <h1 className="text-3xl font-extrabold">Free Streaming Services</h1>
      <p className="text-white/60 mt-1 text-[14px] max-w-[760px]">
        Every service here is legal, free, and available in the UK, whether
        ad-supported, publicly funded, or free with a library card. Links open
        the official sites.
      </p>
      <div className="flex flex-wrap gap-2 mt-6">
        {[{ id: "", label: "All" }, ...SERVICE_TAGS].map((t) => (
          <button
            key={t.id}
            onClick={() => set("tag", t.id)}
            className={`px-4 py-1 rounded-3xl text-[14px] font-semibold transition-colors ${
              tag === t.id
                ? "bg-[#00ff66] text-black"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-white/40 text-[13px] mt-6">
        {filtered.length} service{filtered.length === 1 ? "" : "s"}
      </p>
      <ServiceGrid services={filtered} className="mt-3" />
    </div>
  );
}

export default Services;

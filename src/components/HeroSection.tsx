import { ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section
      className="relative w-full min-h-[85vh] flex items-center justify-start overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-[8%] w-full max-w-[1400px]">
        <div className="max-w-[650px]">
          <h1 className="font-display text-6xl md:text-8xl font-extrabold tracking-tight text-foreground opacity-0 animate-fade-up drop-shadow-lg">
            PHENEX
          </h1>
          <p className="text-lg md:text-xl text-secondary-foreground mt-4 mb-8 font-light opacity-0 animate-fade-up-delay drop-shadow-md">
            Streetwear meets modern minimalism.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-foreground hover:text-background transition-all duration-400 shadow-lg opacity-0 animate-fade-up-delay-2"
          >
            Shop Collection
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mx-8">
            PHENIX — 2026 COLLECTION | ELEVATE YOUR STYLE — PHENIX — 2024 COLLECTION | ELEVATE YOUR STYLE — PHENIX — 2026 COLLECTION | ELEVATE YOUR STYLE —
          </span>
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mx-8">
            PHENIX — 2026 COLLECTION | ELEVATE YOUR STYLE — PHENIX — 2024 COLLECTION | ELEVATE YOUR STYLE — PHENIX — 2026 COLLECTION | ELEVATE YOUR STYLE —
          </span>
        </div>
      </div>
    </section>
  );
};

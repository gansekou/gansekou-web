"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Banner {
  id: number;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  cta?: {
    text: string;
    href: string;
  };
}

// Données d'exemple - À personnaliser
const banners: Banner[] = [
  {
    id: 1,
    src: "/banners/promo-bac.jpg",
    alt: "Préparez votre BAC 2026 avec Gansekou",
    title: "Objectif BAC 2026",
    subtitle: "Plus de 5000 exercices et corrigés pour réussir",
    cta: { text: "Commencer gratuitement", href: "/inscription" },
  },
  {
    id: 2,
    src: "/banners/ia-assistant.jpg",
    alt: "Assistant IA éducatif",
    title: "Votre prof particulier IA",
    subtitle: "Des explications personnalisées 24h/24 et 7j/7",
    cta: { text: "Essayer l'IA", href: "/assistant" },
  },
  {
    id: 3,
    src: "/banners/concours.jpg",
    alt: "Préparation aux concours",
    title: "Concours & Examens",
    subtitle: "Entraînez-vous avec nos quiz chronométrés",
    cta: { text: "Voir les quiz", href: "/quiz" },
  },
];

export function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  // Navigation
  const goTo = useCallback(
    (newIndex: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setIndex(((newIndex % banners.length) + banners.length) % banners.length);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-play avec pause au survol
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, next]);

  // Touch events pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : previous();
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Fond décoratif */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Conteneur principal */}
        <div
          className="relative w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5 group/banner"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Ratio adaptatif : plus large sur desktop */}
          <div className="relative aspect-[16/7] sm:aspect-[16/6] lg:aspect-[16/5] w-full">
            {/* Images avec fondu */}
            {banners.map((banner, i) => (
              <div
                key={banner.id}
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-in-out",
                  i === index
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                )}
              >
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  className="object-cover"
                  quality={90}
                />

                {/* Overlay gradient pour lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                {/* Contenu textuel */}
                <div className="absolute inset-0 flex items-center p-6 sm:p-10 lg:p-16">
                  <div className="max-w-xl space-y-3 sm:space-y-4 lg:space-y-6">
                    {/* Badge animé */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 backdrop-blur-sm animate-in slide-in-from-left duration-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Nouveau</span>
                    </div>

                    {/* Titre */}
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight tracking-tight animate-in slide-in-from-bottom-4 duration-700 delay-100">
                      {banner.title}
                    </h2>

                    {/* Sous-titre */}
                    <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-md animate-in slide-in-from-bottom-4 duration-700 delay-200">
                      {banner.subtitle}
                    </p>

                    {/* CTA Button */}
                    {banner.cta && (
                      <div className="pt-2 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                        <a
                          href={banner.cta.href}
                          className="group/cta inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-slate-900 shadow-lg shadow-amber-400/25 transition-all hover:bg-amber-300 hover:shadow-amber-400/40 hover:scale-105 active:scale-95"
                        >
                          {banner.cta.text}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Boutons de navigation - Apparaissent au survol sur desktop */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={previous}
                  className={cn(
                    "absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10",
                    "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center",
                    "rounded-full bg-white/20 backdrop-blur-md border border-white/30",
                    "text-white shadow-lg transition-all duration-300",
                    "hover:bg-white/40 hover:scale-110 hover:border-white/50",
                    "opacity-0 group-hover/banner:opacity-100 sm:opacity-100",
                    "focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  )}
                  aria-label="Bannière précédente"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                <button
                  onClick={next}
                  className={cn(
                    "absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10",
                    "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center",
                    "rounded-full bg-white/20 backdrop-blur-md border border-white/30",
                    "text-white shadow-lg transition-all duration-300",
                    "hover:bg-white/40 hover:scale-110 hover:border-white/50",
                    "opacity-0 group-hover/banner:opacity-100 sm:opacity-100",
                    "focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  )}
                  aria-label="Bannière suivante"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            {/* Indicateurs de progression */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 sm:gap-3">
                {banners.map((_, dot) => (
                  <button
                    key={dot}
                    onClick={() => goTo(dot)}
                    className={cn(
                      "relative h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out",
                      dot === index
                        ? "w-8 sm:w-10 bg-amber-400 shadow-lg shadow-amber-400/50"
                        : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/80"
                    )}
                    aria-label={`Aller à la bannière ${dot + 1}`}
                  >
                    {/* Barre de progression pour l'auto-play */}
                    {dot === index && isAutoPlaying && (
                      <span className="absolute inset-0 bg-white/30 rounded-full animate-[progress_6s_linear] origin-left" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Compteur de slides */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
              <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs sm:text-sm font-medium text-white border border-white/30">
                {index + 1} / {banners.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Animation CSS pour la barre de progression */}
      <style jsx>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}

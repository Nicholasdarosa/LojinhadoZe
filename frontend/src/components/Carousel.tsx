// src/components/Carousel.tsx
"use client";

import * as React from "react";
import Image from "next/image";

type Slide = {
  img: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export default function Carousel({
  slides,
  interval = 5000,
}: {
  slides: Slide[];
  interval?: number;
}) {
  const [i, setI] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = React.useCallback(
    () => setI((p) => (p + 1) % slides.length),
    [slides.length]
  );
  const prev = React.useCallback(
    () => setI((p) => (p - 1 + slides.length) % slides.length),
    [slides.length]
  );

  React.useEffect(() => {
    if (slides.length <= 1) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(next, interval);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [i, next, slides.length, interval]);

  if (!slides?.length) return null;
  const s = slides[i];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative w-full h-[240px] sm:h-[300px] md:h-[360px] lg:h-auto lg:aspect-[1920/450]">
        <Image
          src={s.img}
          alt={s.title ?? ""}
          fill
          className="object-cover"
          priority={i === 0}
        />
      </div>

      {(s.title || s.subtitle || s.ctaLabel) && (
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-6xl px-4">
            {/* Cartela opcional de texto */}
            <div className="bg-white/80 rounded-lg p-4 w-fit">
              {s.title && (
                <h2 className="text-xl md:text-3xl font-bold">{s.title}</h2>
              )}
              {s.subtitle && (
                <p className="text-sm md:text-base text-gray-700">
                  {s.subtitle}
                </p>
              )}
              {s.ctaLabel && s.ctaUrl && (
                <a
                  href={s.ctaUrl}
                  className="inline-block mt-2 border rounded-md px-3 py-1 text-sm hover:bg-gray-100"
                >
                  {s.ctaLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1"
            aria-label="Próximo"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex gap-2 justify-center">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  idx === i
                    ? "bg-black"
                    : "bg-white/70 border border-black/30"
                } inline-block cursor-pointer`}
                onClick={() => setI(idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

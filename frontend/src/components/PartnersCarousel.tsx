// src/components/PartnersCarousel.tsx
"use client";

import Image from "next/image";

type Marca = {
  id: number | string;
  nome: string;
  logoUrl: string;
  site?: string;
};

export default function PartnersCarousel({
  items,
  title,
  subtitle,
  speed = 30, // segundos para um ciclo
}: {
  items: Marca[];
  title?: string;
  subtitle?: string;
  /** duração (s) do loop completo */
  speed?: number;
}) {
  if (!items?.length) return null;

  // duplicamos a lista para um loop perfeito
  const loop = [...items, ...items];

  return (
    <section className="w-full py-8 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {(title || subtitle) && (
          <div className="mb-4 flex flex-wrap items-baseline gap-3">
            {title ? <h2 className="text-2xl font-bold">{title}</h2> : null}
            {subtitle ? <p className="text-sm text-neutral-500">{subtitle}</p> : null}
          </div>
        )}

        <div className="marquee group">
          <div className="track" style={{ ["--dur" as any]: `${speed}s` }}>
            {loop.map((m, idx) => (
              <a
                key={`${m.id}-${idx}`}
                href={m.site || "#"}
                target={m.site ? "_blank" : "_self"}
                rel="noreferrer"
                className="shrink-0 mx-6 flex items-center justify-center h-16 sm:h-20"
                title={m.nome}
              >
                <Image
                  src={m.logoUrl}
                  alt={m.nome}
                  width={220}
                  height={80}
                  className="h-10 sm:h-12 w-auto object-contain grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition"
                />
              </a>
            ))}
          </div>

          {/* pausa no hover */}
          <style jsx>{`
            .marquee {
              overflow: hidden;
              position: relative;
            }
            .track {
              display: flex;
              align-items: center;
              white-space: nowrap;
              animation: scroll var(--dur, 30s) linear infinite;
            }
            .marquee:hover .track {
              animation-play-state: paused;
            }
            @keyframes scroll {
              from { transform: translateX(0); }
              to   { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
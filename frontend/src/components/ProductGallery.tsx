// src/components/ProductGallery.tsx
"use client";

import { useState } from "react";

/**
 * Galeria vertical simples:
 * - thumbs à esquerda
 * - seleciona imagem (borda #ffd101)
 * - atualiza imagem grande "espelho" via CSS (container central usa a 1ª como fallback)
 *
 * Dica: Mantemos um <img> grande no centro da página; aqui só controlamos a seleção
 * para dar o feedback visual nas thumbs.
 */
export default function ProductGallery({ images }: { images: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images?.length) {
    // place­holder com 3 slots “vazios”
    return (
      <div className="flex md:flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-[90px] h-[90px] rounded-xl border bg-white grid place-items-center text-xs text-neutral-400"
          >
            Sem img
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex md:flex-col gap-3">
      {images.map((src, i) => (
        <button
          key={i}
          onClick={() => setActiveIdx(i)}
          aria-label={`Imagem ${i + 1}`}
          className={[
            "w-[90px] h-[90px] rounded-xl bg-white border overflow-hidden",
            "transition-shadow",
            i === activeIdx
              ? "shadow-[0_0_0_2px_rgba(255,209,1,1)]"
              : "hover:shadow-[0_0_0_2px_rgba(255,209,1,0.5)]",
          ].join(" ")}
        >
          <img
            src={src}
            alt=""
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
}

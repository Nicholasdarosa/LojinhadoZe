"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

type Props = {
  slug: string;
  initiallyFavorited?: boolean;
};

export default function FavoriteButton({
  slug,
  initiallyFavorited = false,
}: Props) {
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    if (!slug || pending) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });

        if (!res.ok) {
          console.error("Erro ao atualizar favoritos:", await res.text());
          return;
        }

        setFavorited((v) => !v);
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
      aria-pressed={favorited}
      aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        className="h-4 w-4"
        fill={favorited ? "#ff6a00" : "transparent"}
        stroke={favorited ? "#ff6a00" : "currentColor"}
      />
    </button>
  );
}

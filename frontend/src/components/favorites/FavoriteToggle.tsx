// src/components/favorites/FavoriteToggle.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

type Props = {
  productId: number | string;
  slug: string;
  /** opcional: já começar marcado */
  initialActive?: boolean;
};

export default function FavoriteToggle({
  productId,
  slug,
  initialActive = false,
}: Props) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (loading) return;
    setLoading(true);

    try {
      if (!active) {
        // adicionar
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (res.status === 401) {
          router.push(
            `/login?redirect=${encodeURIComponent(`/produto/${slug}`)}`,
          );
          return;
        }

        if (!res.ok) {
          console.error(
            "Erro ao adicionar favorito:",
            await res.text(),
          );
          return;
        }

        setActive(true);
      } else {
        // remover
        const res = await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!res.ok) {
          console.error(
            "Erro ao remover favorito:",
            await res.text(),
          );
          return;
        }

        setActive(false);
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="relative grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm hover:bg-white transition"
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        className={`h-4 w-4 ${
          active ? "fill-red-500 text-red-500" : "text-neutral-700"
        }`}
      />
    </button>
  );
}

"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

type Props = {
  slug: string;
  initialActive?: boolean;
};

export default function FavoriteButton({ slug, initialActive = false }: Props) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        const data = await res.json();
        const slugs: string[] = data?.slugs ?? [];
        setActive(slugs.includes(slug));
      }
    } catch (e) {
      console.error("Erro ao alternar favorito", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={active}
      title={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className="relative grid h-10 w-10 place-items-center rounded-full border border-black/30 bg-transparent hover:bg-black/5 transition disabled:opacity-60"
    >
      <Heart
        className={`h-5 w-5 ${
          active ? "fill-red-500 text-red-500" : ""
        }`}
      />
    </button>
  );
}

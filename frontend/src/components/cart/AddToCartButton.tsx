// src/components/cart/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";

type Props = {
  productId: number | string;
  slug: string;
  quantity?: number;
  variantId?: number | string;
  label?: string;
  className?: string;
};

export default function AddToCartButton({
  productId,
  slug,
  quantity = 1,
  variantId,
  label = "Adicionar",
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    // Impede que o clique dispare a navegação do <Link> do card
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          slug,
          quantity,
          variantId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("Erro ao adicionar ao carrinho:", data);
        alert(
          data?.message ||
            "Não foi possível adicionar o produto ao carrinho.",
        );
        return;
      }

      // Sucesso: só adiciona, sem redirecionar.
      // Se depois quiser um toast, é aqui que você pluga.
      // console.log("Produto adicionado ao carrinho");
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      alert("Não foi possível adicionar o produto ao carrinho.");
    } finally {
      setLoading(false);
    }
  }

  const baseClasses =
    "inline-flex w-full items-center justify-center gap-2 rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className ? `${baseClasses} ${className}` : baseClasses}
    >
      <ShoppingCart className="h-4 w-4" />
      {loading ? "Adicionando..." : label}
    </button>
  );
}

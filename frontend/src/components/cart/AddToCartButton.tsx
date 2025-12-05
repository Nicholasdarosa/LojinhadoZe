// src/components/cart/AddToCartButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productId: number | string;
  slug: string;
  quantity?: number;
  /** true = vai para /carrinho, false = só adiciona e fica na página */
  redirectToCart?: boolean;
  label?: string;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

export default function AddToCartButton({
  productId,
  slug,
  quantity = 1,
  redirectToCart = true,
  label,
  variant = "primary",
  fullWidth = true,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const text =
    label ?? (redirectToCart ? "Comprar" : "Adicionar ao carrinho");

  const baseClasses =
    "inline-flex items-center justify-center rounded-md py-3 text-sm font-semibold transition";
  const variantClasses =
    variant === "primary"
      ? "bg-[#ff6a00] text-white hover:brightness-95 active:scale-[0.99]"
      : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50";
  const widthClasses = fullWidth ? "w-full" : "";

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          slug, // 👈 AGORA ESTAMOS ENVIANDO O SLUG TAMBÉM
        }),
      });

      if (res.status === 401) {
        router.push(
          `/login?redirect=${encodeURIComponent(`/produto/${slug}`)}`,
        );
        return;
      }

      if (!res.ok) {
        console.error(
          "Erro ao adicionar ao carrinho:",
          await res.text(),
        );
        alert("Não foi possível adicionar o produto ao carrinho.");
        return;
      }

      if (redirectToCart) {
        router.push("/carrinho");
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`${baseClasses} ${variantClasses} ${widthClasses} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {loading ? "Processando..." : text}
    </button>
  );
}

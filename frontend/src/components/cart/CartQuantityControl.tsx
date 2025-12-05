// src/components/cart/CartQuantityControl.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productId: number | string;
  quantity: number;
};

export default function CartQuantityControl({
  productId,
  quantity,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateQuantity = async (nextQty: number) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: nextQty,
        }),
      });

      if (!res.ok) {
        console.error("Falha ao atualizar quantidade");
      }

      router.refresh();
    } catch (err) {
      console.error("Erro ao atualizar quantidade", err);
    } finally {
      setLoading(false);
    }
  };

  const onMinus = () => updateQuantity(quantity - 1);
  const onPlus = () => updateQuantity(quantity + 1);

  return (
    <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white overflow-hidden text-sm">
      <button
        type="button"
        onClick={onMinus}
        disabled={loading}
        className="px-3 py-2 border-r border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
      >
        −
      </button>
      <span className="px-4 py-2 min-w-[2.5rem] text-center">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onPlus}
        disabled={loading}
        className="px-3 py-2 border-l border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
      >
        +
      </button>
    </div>
  );
}

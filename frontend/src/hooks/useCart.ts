// src/hooks/useCart.ts
"use client";

import { useEffect, useState } from "react";
import type { Cart } from "@/types/cart";

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCart() {
    setLoading(true);
    const res = await fetch("/api/cart", { cache: "no-store" });
    const data = (await res.json()) as Cart;
    setCart(data);
    setLoading(false);
  }

  async function addItem(payload: {
    productId: number;
    variantId?: number;
    name: string;
    slug: string;
    imageUrl: string;
    unitPrice: number;
    quantity?: number;
  }) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as Cart;
    setCart(data);
  }

  async function updateItemQuantity(itemId: string, quantity: number) {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    const data = (await res.json()) as Cart;
    setCart(data);
  }

  async function removeItem(itemId: string) {
    const url = `/api/cart?itemId=${encodeURIComponent(itemId)}`;
    const res = await fetch(url, { method: "DELETE" });
    const data = (await res.json()) as Cart;
    setCart(data);
  }

  useEffect(() => {
    loadCart();
  }, []);

  return {
    cart,
    loading,
    addItem,
    updateItemQuantity,
    removeItem,
    reload: loadCart,
  };
}

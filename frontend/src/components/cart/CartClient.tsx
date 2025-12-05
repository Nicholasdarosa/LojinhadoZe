// src/components/cart/CartClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  subtotal: number;
};

type Props = {
  initialCart: CartState;
};

export default function CartClient({ initialCart }: Props) {
  const [cart, setCart] = useState<CartState>(initialCart);
  const hasItems = cart.items.length > 0;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  async function updateQty(productId: number, newQty: number) {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: newQty }),
    });

    if (!res.ok) {
      console.error("Erro ao atualizar quantidade:", await res.text());
      return;
    }

    const data = (await res.json()) as CartState;
    setCart(data);
  }

  async function removeItem(productId: number) {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (!res.ok) {
      console.error("Erro ao remover item:", await res.text());
      return;
    }

    const data = (await res.json()) as CartState;
    setCart(data);
  }

  if (!hasItems) {
    return (
      <div className="border border-neutral-200 rounded-md p-6 text-center">
        <p className="text-neutral-600 mb-3">
          Seu carrinho está vazio no momento.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] items-start">
      {/* Lista de itens */}
      <section className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 border border-neutral-200 rounded-md p-4"
          >
            <div className="h-24 w-24 flex-shrink-0 border border-neutral-200 rounded-md bg-white grid place-items-center overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-24 w-auto object-contain"
                />
              ) : (
                <span className="text-xs text-neutral-400">
                  Sem imagem
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/produto/${item.slug}`}
                    className="font-semibold text-sm hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-neutral-500 mt-1">
                    Preço unitário: {fmt(item.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-xs text-neutral-500 hover:text-red-600"
                >
                  Remover
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Quantidade */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    Quantidade
                  </span>
                  <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white overflow-hidden text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        updateQty(
                          item.productId,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                      className="px-3 py-1 border-r border-neutral-300 hover:bg-neutral-50"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQty(
                          item.productId,
                          Math.min(99, item.quantity + 1),
                        )
                      }
                      className="px-3 py-1 border-l border-neutral-300 hover:bg-neutral-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right text-sm font-semibold">
                  {fmt(item.price * item.quantity)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Resumo */}
      <aside className="border border-neutral-200 rounded-md p-5 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Resumo da compra</h2>

        <div className="flex items-center justify-between mb-2 text-sm">
          <span>Subtotal</span>
          <span className="font-semibold">{fmt(cart.subtotal)}</span>
        </div>

        {/* Aqui futuramente entra frete, cupom, etc. */}

        <button
          type="button"
          className="mt-4 w-full inline-flex items-center justify-center rounded-md bg-[#ff6a00] py-3 text-sm font-semibold text-white hover:brightness-95 active:scale-[0.99] transition"
        >
          Finalizar compra
        </button>

        <p className="text-[11px] text-neutral-500 mt-2">
          Na próxima etapa você escolhe o endereço de entrega e forma de
          pagamento.
        </p>
      </aside>
    </div>
  );
}

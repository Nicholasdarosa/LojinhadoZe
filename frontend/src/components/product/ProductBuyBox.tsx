// src/components/product/ProductBuyBox.tsx
"use client";

import { useState } from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import FreteCalculator from "@/components/product/FreteCalculator";

type Props = {
  product: {
    id: number | string;
    slug: string;
    nome: string;
    preco: number;
  };
};

export default function ProductBuyBox({ product }: Props) {
  const [qty, setQty] = useState(1);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function inc() {
    setQty((q) => Math.min(99, q + 1));
  }

  function dec() {
    setQty((q) => Math.max(1, q - 1));
  }

  return (
    <aside>
      <div className="border border-neutral-200 rounded-md p-5 md:p-6 flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Preço
          </p>
          <div className="text-3xl md:text-4xl font-extrabold text-neutral-900">
            {fmt(product.preco)}
          </div>
        </div>

        {/* Quantidade controlada */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-600">Quantidade</span>
          <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white overflow-hidden text-sm">
            <button
              type="button"
              onClick={dec}
              className="px-4 py-2 border-r border-neutral-300 hover:bg-neutral-50"
            >
              −
            </button>
            <span className="px-4 py-2 min-w-[2.5rem] text-center">
              {qty}
            </span>
            <button
              type="button"
              onClick={inc}
              className="px-4 py-2 border-l border-neutral-300 hover:bg-neutral-50"
            >
              +
            </button>
          </div>
        </div>

        {/* CTA principais */}
        <div className="flex flex-col gap-2">
          {/* Comprar → adiciona e vai pro carrinho */}
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            quantity={qty}
            redirectToCart
            label="Comprar"
            variant="primary"
            fullWidth
          />
          {/* Adicionar ao carrinho → fica na página */}
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            quantity={qty}
            redirectToCart={false}
            label="Adicionar ao carrinho"
            variant="secondary"
            fullWidth
          />

          <p className="text-xs text-neutral-500">
            Disponível:{" "}
            <span className="font-semibold text-neutral-700">
              Em estoque
            </span>
          </p>
        </div>

        {/* Frete */}
        <div className="pt-3 border-t border-neutral-200 mt-2">
          <p className="font-semibold text-sm mb-2 text-neutral-800">
            Calcule o frete
          </p>
          <FreteCalculator produtoId={product.id} />
        </div>
      </div>
    </aside>
  );
}

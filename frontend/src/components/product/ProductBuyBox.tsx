// src/components/product/ProductBuyBox.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";

type ProductBuyBoxProps = {
  product: {
    id: number | string;
    slug: string;
    nome: string;
    preco: number; // em reais
  };
};

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(1);
  const [processingBuy, setProcessingBuy] = useState(false);

  const unitPriceCents = Math.round(product.preco * 100);
  const totalPriceCents = unitPriceCents * quantity;

  async function handleBuyClick() {
    if (processingBuy) return;
    setProcessingBuy(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          slug: product.slug,
          quantity,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("Erro ao adicionar ao carrinho (comprar):", data);
        alert(
          data?.message ||
            "Não foi possível adicionar o produto ao carrinho.",
        );
        return;
      }

      // Sucesso → agora sim redireciona para o carrinho
      router.push("/carrinho");
    } catch (err) {
      console.error("Erro ao comprar:", err);
      alert("Não foi possível finalizar a compra. Tente novamente.");
    } finally {
      setProcessingBuy(false);
    }
  }

  return (
    <aside className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4">
        <p className="text-sm text-neutral-500">PREÇO</p>
        <p className="text-2xl font-bold text-neutral-900">
          {formatMoney(product.preco)}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {quantity > 1
            ? `${quantity} unidade(s) — ${formatMoney(
                totalPriceCents / 100,
              )} no total`
            : "R$ por unidade"}
        </p>
      </div>

      {/* Quantidade */}
      <div className="mb-4">
        <p className="mb-1 text-xs font-medium text-neutral-700">Quantidade</p>
        <div className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-50 px-1 py-1 text-sm">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-neutral-700 hover:bg-neutral-200"
            onClick={() =>
              setQuantity((q) => (q > 1 ? q - 1 : q))
            }
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-neutral-700 hover:bg-neutral-200"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Botões: COMPRAR + ADICIONAR AO CARRINHO */}
      <div className="space-y-3">
        {/* Comprar → adiciona + redireciona */}
        <button
          type="button"
          onClick={handleBuyClick}
          disabled={processingBuy}
          className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {processingBuy ? "Processando..." : "Comprar"}
        </button>

        {/* Adicionar ao carrinho → só adiciona, NÃO redireciona */}
        <AddToCartButton
          productId={product.id}
          slug={product.slug}
          quantity={quantity}
          label="Adicionar ao carrinho"
          className="bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-100"
        />
      </div>

      {/* Disponibilidade / etc. pode ficar aqui se já existia */}
    </aside>
  );
}

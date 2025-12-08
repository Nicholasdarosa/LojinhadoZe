"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

type ProductBuyBoxProps = {
  product: {
    id: number;
    slug: string;
    nome: string;
    preco: number; // em reais
    precoEmCentavos: number; // em centavos
    imagemPrincipal?: string;
  };
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unitPriceCents =
    Number.isFinite(product.precoEmCentavos) && product.precoEmCentavos > 0
      ? product.precoEmCentavos
      : Math.round(product.preco * 100);

  async function handleAddToCart() {
    try {
      setLoadingAdd(true);
      setError(null);
      setFeedback(null);

      await addItem({
        productId: product.id,
        name: product.nome,
        slug: product.slug,
        imageUrl: product.imagemPrincipal || "",
        unitPrice: unitPriceCents,
        quantity,
      });

      setFeedback("Produto adicionado ao carrinho");
    } catch (err) {
      console.error(err);
      setError("Não foi possível adicionar ao carrinho. Tente novamente.");
    } finally {
      setLoadingAdd(false);
    }
  }

  async function handleBuyNow() {
    try {
      setLoadingBuy(true);
      setError(null);
      setFeedback(null);

      await addItem({
        productId: product.id,
        name: product.nome,
        slug: product.slug,
        imageUrl: product.imagemPrincipal || "",
        unitPrice: unitPriceCents,
        quantity,
      });

      // por enquanto manda pro carrinho; depois você pode trocar para /checkout
      router.push("/carrinho");
    } catch (err) {
      console.error(err);
      setError("Não foi possível iniciar a compra. Tente novamente.");
    } finally {
      setLoadingBuy(false);
    }
  }

  function handleDecrease() {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }

  function handleIncrease() {
    setQuantity((prev) => prev + 1);
  }

  return (
    <aside className="w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:p-5">
      {/* Preço */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          Preço
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-neutral-900 md:text-3xl">
            {formatMoney(unitPriceCents)}
          </span>
          {/* se quiser pôr preço antigo/desconto, entra aqui */}
        </div>
        {/* exemplo de parcelamento simples */}
        <p className="mt-1 text-xs text-neutral-500">
          em até 3x de{" "}
          {formatMoney(Math.round(unitPriceCents / 3))}
          {" "}sem juros
        </p>
      </div>

      {/* Quantidade */}
      <div className="mb-4">
        <p className="mb-1 text-xs font-semibold text-neutral-600">
          Quantidade
        </p>
        <div className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-50 px-1 py-1 text-sm">
          <button
            type="button"
            onClick={handleDecrease}
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-neutral-700 hover:bg-neutral-200"
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-neutral-700 hover:bg-neutral-200"
          >
            +
          </button>
        </div>
      </div>

      {/* Botões */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={loadingAdd || loadingBuy}
          className="inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loadingBuy ? "Processando..." : "Comprar agora"}
        </button>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loadingAdd || loadingBuy}
          className="inline-flex w-full items-center justify-center rounded-full border border-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loadingAdd ? "Adicionando..." : "Adicionar ao carrinho"}
        </button>
      </div>

      {/* Feedback / erro */}
      {feedback && (
        <p className="mt-3 text-xs font-medium text-emerald-600">
          {feedback}
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs font-medium text-red-500">
          {error}
        </p>
      )}

      {/* Info extra se quiser reforçar frete / entrega */}
      <div className="mt-4 space-y-1 border-t border-neutral-200 pt-3 text-xs text-neutral-600">
        <p>✔ Entrega rápida para Curitiba e região</p>
        <p>✔ Compra 100% segura</p>
      </div>
    </aside>
  );
}

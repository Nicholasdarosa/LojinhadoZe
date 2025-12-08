"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

type ShippingOption = {
  id: string;
  carrier: string;
  serviceName: string;
  priceCents: number;
  deadlineDays: number;
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CarrinhoClient() {
  const { cart, loading, updateItemQuantity, removeItem } = useCart();

  const [cep, setCep] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    null,
  );

  async function handleCalcFrete() {
    const cleanCep = cep.replace(/\D/g, "");
    if (!cleanCep || cleanCep.length < 8) {
      setShippingError("Informe um CEP válido (8 dígitos).");
      return;
    }

    try {
      setShippingLoading(true);
      setShippingError(null);
      setShippingOptions([]);
      setSelectedShippingId(null);

      const res = await fetch("/api/cart/shipping-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: cleanCep }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || "Erro ao calcular frete");
      }

      const data = (await res.json()) as {
        cep: string;
        options: ShippingOption[];
      };

      setShippingOptions(data.options || []);
      if (data.options?.length) {
        setSelectedShippingId(data.options[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setShippingError(
        err?.message || "Não foi possível calcular o frete. Tente novamente.",
      );
    } finally {
      setShippingLoading(false);
    }
  }

  const selectedShipping = shippingOptions.find(
    (opt) => opt.id === selectedShippingId,
  );

  const cartSubtotal = cart?.subtotal ?? 0;
  const shippingTotal = selectedShipping?.priceCents ?? 0;
  const grandTotal = cartSubtotal + shippingTotal;

  if (loading || !cart) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="mb-4 text-2xl font-semibold">Carrinho</h1>
        <p>Carregando carrinho...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="mb-4 text-2xl font-semibold">Carrinho</h1>
        <p className="mb-4">Seu carrinho está vazio.</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-full bg-yellow-500 px-5 py-2 text-sm font-semibold text-black transition hover:brightness-95"
        >
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:max-w-7xl lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold md:text-3xl">Carrinho</h1>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* Lista de itens */}
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 md:h-24 md:w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/produto/${item.slug}`}
                    className="text-sm font-medium text-neutral-900 hover:underline md:text-base"
                  >
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="text-xs text-neutral-500">
                      {item.variantName}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-50 px-1 py-1 text-sm">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-neutral-700 hover:bg-neutral-200"
                      onClick={() =>
                        updateItemQuantity(item.id, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="min-w-[2.5rem] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-neutral-700 hover:bg-neutral-200"
                      onClick={() =>
                        updateItemQuantity(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="text-xs font-medium text-red-500 hover:underline"
                    onClick={() => removeItem(item.id)}
                  >
                    Remover
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900 md:text-base">
                  {formatMoney(item.unitPrice * item.quantity)}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatMoney(item.unitPrice)} cada
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo + Frete */}
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">
            Resumo
          </h2>

          {/* CEP / frete */}
          <div className="mb-4 space-y-2">
            <p className="text-xs font-medium text-neutral-700">
              Calcular frete
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={cep}
                onChange={(e) =>
                  setCep(e.target.value.replace(/[^0-9-]/g, ""))
                }
                placeholder="Digite seu CEP"
                className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none transition focus:border-yellow-500"
              />
              <button
                type="button"
                onClick={handleCalcFrete}
                disabled={shippingLoading}
                className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {shippingLoading ? "Calculando..." : "Calcular"}
              </button>
            </div>
            {shippingError && (
              <p className="text-xs text-red-500">{shippingError}</p>
            )}

            {shippingOptions.length > 0 && (
              <div className="mt-2 space-y-2 rounded-lg bg-neutral-50 p-3">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={selectedShippingId === opt.id}
                        onChange={() => setSelectedShippingId(opt.id)}
                        className="h-3 w-3"
                      />
                      <span className="font-medium text-neutral-800">
                        {opt.carrier} - {opt.serviceName}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">
                        {formatMoney(opt.priceCents)}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {opt.deadlineDays} dia
                        {opt.deadlineDays > 1 ? "s" : ""} úteis
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Resumo de valores */}
          <div className="mb-2 flex justify-between text-sm text-neutral-700">
            <span>Subtotal</span>
            <span>{formatMoney(cartSubtotal)}</span>
          </div>

          <div className="mb-2 flex justify-between text-sm text-neutral-700">
            <span>Frete</span>
            <span>
              {shippingOptions.length
                ? selectedShipping
                  ? formatMoney(shippingTotal)
                  : "Selecione uma opção"
                : "A calcular"}
            </span>
          </div>

          <div className="mt-3 border-t border-neutral-200 pt-3 text-sm font-semibold text-neutral-900">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatMoney(grandTotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-4 block w-full rounded-full bg-yellow-500 py-3 text-center text-sm font-semibold text-black transition hover:brightness-95"
          >
            Prosseguir para o checkout
          </Link>

          <p className="mt-2 text-[11px] text-neutral-500">
            Você poderá revisar endereço, frete e pagamento na próxima etapa.
          </p>
        </aside>
      </div>
    </div>
  );
}

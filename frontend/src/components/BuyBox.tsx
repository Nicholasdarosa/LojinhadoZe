// src/components/BuyBox.tsx
"use client";

import { useState } from "react";

/**
 * Box de compra (preço, qty stepper, CTA, calculo de frete)
 * - Botão e realces na paleta da loja (#ffd101).
 */
export default function BuyBox({
  preco,
  fmt,
}: {
  preco: number;
  fmt: (v: number) => string;
}) {
  const [qty, setQty] = useState(1);
  const [cep, setCep] = useState("");

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => q + 1);

  return (
    <div className="rounded-2xl border bg-white p-4 md:p-5">
      <div className="mb-4">
        <div className="text-3xl font-extrabold">{fmt(preco)}</div>
        <button className="mt-2 text-sm text-neutral-600 hover:underline inline-flex items-center gap-2">
          <span aria-hidden>💳</span> mais formas de pagamento
        </button>
      </div>

      {/* Stepper + CTA */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-xl border">
          <button
            onClick={dec}
            className="px-3 py-2 text-xl leading-none hover:bg-neutral-50"
            aria-label="Diminuir"
          >
            –
          </button>
          <div className="w-12 text-center font-semibold">{qty}</div>
          <button
            onClick={inc}
            className="px-3 py-2 text-xl leading-none hover:bg-neutral-50"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>

        <button
          className="flex-1 rounded-xl bg-[#ffd101] px-5 py-3 font-semibold text-black hover:brightness-95 active:scale-[0.99] transition"
          onClick={() => alert(`Adicionar ${qty} item(ns) ao carrinho`)}
        >
          Comprar
        </button>
      </div>

      {/* Disponibilidade */}
      <p className="mt-2 text-xs text-neutral-500">Disponível: Disponível</p>

      {/* Frete */}
      <div className="mt-6">
        <div className="font-semibold mb-2">Calcule o frete</div>
        <div className="flex gap-2">
          <input
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="CEP"
            className="flex-1 rounded-xl border px-3 py-2"
            inputMode="numeric"
            maxLength={9}
          />
          <button
            className="rounded-xl border px-4 py-2 hover:bg-neutral-50"
            onClick={() => alert(`Calcular frete para ${cep}`)}
          >
            Calcular
          </button>
        </div>
      </div>
    </div>
  );
}

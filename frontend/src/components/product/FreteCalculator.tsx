"use client";

import { useState } from "react";

type Props = {
  produtoId: string | number;
};

export default function FreteCalculator({ produtoId }: Props) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    valor: number;
    prazoDias: number;
    servico: string;
  } | null>(null);

  async function handleCalcular() {
    setErro(null);
    setResultado(null);

    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setErro("Informe um CEP válido (8 dígitos).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: clean, produtoId }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErro(json?.error || "Não foi possível calcular o frete.");
        return;
      }

      setResultado({
        valor: json.valor,
        prazoDias: json.prazoDias,
        servico: json.servico,
      });
    } catch (e) {
      console.error(e);
      setErro("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          maxLength={9}
        />
        <button
          type="button"
          onClick={handleCalcular}
          disabled={loading}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        >
          {loading ? "Calculando..." : "Calcular"}
        </button>
      </div>

      {erro && <p className="text-xs text-red-500">{erro}</p>}

      {resultado && (
        <p className="text-xs text-neutral-700">
          Frete:{" "}
          <strong>
            {resultado.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </strong>{" "}
          · prazo estimado {resultado.prazoDias} dia(s) · {resultado.servico}
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ClienteData = {
  id?: number | string;
  attributes?: any;
};

export default function AccountProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregandoInicial, setCarregandoInicial] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/account/profile", {
          cache: "no-store",
        });
        if (!res.ok) {
          setCarregandoInicial(false);
          return;
        }
        const json = await res.json();
        const data: ClienteData | null = json?.data ?? null;
        const attr = data?.attributes ?? data;

        if (attr) {
          setNomeCompleto(attr.nomeCompleto || "");
          setCpf(attr.cpf || "");
          setTelefone(attr.telefone || "");
          setDataNascimento(attr.dataNascimento || "");
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setCarregandoInicial(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto,
          cpf,
          telefone,
          dataNascimento: dataNascimento || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErro(json?.error || "Não foi possível salvar seus dados.");
        return;
      }

      // Sucesso: manda para redirect (ex: produto, carrinho, etc.)
      router.push(redirect);
      router.refresh();
    } catch (e) {
      console.error(e);
      setErro("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (carregandoInicial) {
    return (
      <p className="text-sm text-neutral-500">
        Carregando seus dados...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-800">
          Nome completo
        </label>
        <input
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-800">
            CPF
          </label>
          <input
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
            placeholder="somente números"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-800">
            Telefone
          </label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
            placeholder="(41) 99999-9999"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-800">
          Data de nascimento
        </label>
        <input
          type="date"
          value={dataNascimento || ""}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
        />
      </div>

      {erro && <p className="text-xs text-red-500">{erro}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-[#ff6a00] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60 transition"
      >
        {loading ? "Salvando..." : "Salvar e continuar"}
      </button>
    </form>
  );
}

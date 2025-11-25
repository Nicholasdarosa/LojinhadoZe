"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErro(json?.error || "Não foi possível fazer login.");
        return;
      }

      // sucesso: redireciona
      router.push(redirect);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErro("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-800">
          E-mail
        </label>
        <input
          type="email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
          placeholder="seu-email@exemplo.com"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-800">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
          placeholder="••••••••"
          required
        />
      </div>

      {erro && <p className="text-xs text-red-500">{erro}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

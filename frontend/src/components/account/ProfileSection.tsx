// src/components/account/ProfileSection.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";

type ProfileData = {
  id: number | null;
  nomeCompleto: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string | null;
};

type ProfileApiResponse = {
  data?: ProfileData;
  error?: string;
};

export default function ProfileSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState<string | "">("");

  // Carrega os dados ao abrir a tela
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await fetch("/api/account/profile", {
          method: "GET",
          cache: "no-store",
        });

        const json = (await res.json().catch(() => ({}))) as ProfileApiResponse;

        if (!res.ok) {
          throw new Error(json.error || "Não foi possível carregar seus dados.");
        }

        const data = json.data;
        if (data) {
          setNomeCompleto(data.nomeCompleto ?? "");
          setEmail(data.email ?? "");
          setCpf(data.cpf ?? "");
          setTelefone(data.telefone ?? "");
          setDataNascimento(data.dataNascimento ?? "");
        }
      } catch (err: any) {
        console.error("Erro ao carregar profile:", err);
        setErrorMsg(err.message || "Não foi possível carregar seus dados.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      setSaving(true);

      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // nomeCompleto NÃO vai ser alterado aqui; vem do cadastro
          cpf,
          telefone,
          dataNascimento: dataNascimento || null,
        }),
      });

      const data = (await res.json().catch(() => null)) as ProfileApiResponse;

      if (!res.ok) {
        throw new Error(data?.error || "Não foi possível salvar seus dados.");
      }

      // Se a API devolveu o perfil atualizado, reflita no estado
      if (data?.data) {
        setCpf(data.data.cpf ?? "");
        setTelefone(data.data.telefone ?? "");
        setDataNascimento(data.data.dataNascimento ?? "");
        // Nome/email vêm do Strapi; se vierem atualizados, sincroniza também
        setNomeCompleto(data.data.nomeCompleto ?? nomeCompleto);
        setEmail(data.data.email ?? email);
      }

      setSuccessMsg("Dados salvos com sucesso.");
    } catch (err: any) {
      console.error("Erro ao salvar profile:", err);
      setErrorMsg(err.message || "Não foi possível salvar seus dados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Dados pessoais</h2>

      {loading ? (
        <p>Carregando seus dados...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="nome" className="font-medium">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              value={nomeCompleto}
              disabled
              className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="cpf" className="font-medium">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="telefone" className="font-medium">
                Telefone
              </label>
              <input
                id="telefone"
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Se quiser usar data de nascimento depois, já deixo preparado */}
          {/* 
          <div className="flex flex-col gap-2">
            <label htmlFor="nascimento" className="font-medium">
              Data de nascimento
            </label>
            <input
              id="nascimento"
              type="date"
              value={dataNascimento || ""}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          */}

          {errorMsg && (
            <p className="text-sm text-red-600 mt-2">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-sm text-green-600 mt-2">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 px-6 py-3 bg-black text-white font-semibold rounded disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar dados"}
          </button>
        </form>
      )}
    </section>
  );
}

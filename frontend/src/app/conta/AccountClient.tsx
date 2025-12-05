// src/app/conta/AccountClient.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";

type Address = {
  id?: number | string;
  apelido?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  principal?: boolean;
};

type Account = {
  nome?: string;
  email?: string;
  cpf?: string;
  telefone?: string;
  enderecos?: Address[];
};

type Props = {
  initialAccount: Account | null;
};

export default function AccountClient({ initialAccount }: Props) {
  const [nome, setNome] = useState(initialAccount?.nome ?? "");
  const [email] = useState(initialAccount?.email ?? "");
  const [cpf, setCpf] = useState(initialAccount?.cpf ?? "");
  const [telefone, setTelefone] = useState(initialAccount?.telefone ?? "");
  const [enderecos, setEnderecos] = useState<Address[]>(
    initialAccount?.enderecos ?? [],
  );

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState<Address>({
    apelido: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    principal: enderecos.length === 0,
  });

  const hasPrincipal = useMemo(
    () => enderecos.some((e) => e.principal),
    [enderecos],
  );

  function handleAddAddress() {
    if (!newAddress.cep || !newAddress.logradouro || !newAddress.numero) {
      setError("Preencha pelo menos CEP, logradouro e número.");
      return;
    }

    const addr: Address = {
      ...newAddress,
      principal: hasPrincipal ? newAddress.principal : true,
    };

    setEnderecos((prev) => [...prev, addr]);
    setNewAddress({
      apelido: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      principal: false,
    });
    setShowAddressForm(false);
    setError(null);
  }

  function handleRemoveAddress(index: number) {
    setEnderecos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSetPrincipal(index: number) {
    setEnderecos((prev) =>
      prev.map((addr, i) => ({
        ...addr,
        principal: i === index,
      })),
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cpf,
          telefone,
          enderecos,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Não foi possível salvar seus dados.");
      }

      setMessage("Dados salvos com sucesso.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao salvar dados.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start"
    >
      {/* Dados pessoais */}
      <section className="border border-neutral-200 rounded-md p-5 md:p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">Dados pessoais</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
              value={email}
              readOnly
            />
            <p className="mt-1 text-xs text-neutral-500">
              O e-mail é o mesmo usado para login.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="Só números"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="DDD + número"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-black py-3 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar dados"}
          </button>

          {message && (
            <p className="mt-2 text-xs text-green-600">{message}</p>
          )}
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>
      </section>

      {/* Endereços */}
      <section className="border border-neutral-200 rounded-md p-5 md:p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Endereços de entrega</h2>
          <button
            type="button"
            onClick={() => {
              setShowAddressForm((v) => !v);
              setError(null);
            }}
            className="text-sm font-medium text-[#ff6a00] hover:underline"
          >
            + Adicionar endereço
          </button>
        </div>

        {enderecos.length === 0 && !showAddressForm && (
          <p className="text-sm text-neutral-500">
            Você ainda não cadastrou nenhum endereço de entrega.
          </p>
        )}

        {/* Lista de endereços já cadastrados */}
        {enderecos.length > 0 && (
          <ul className="space-y-3 mb-4">
            {enderecos.map((addr, index) => (
              <li
                key={index}
                className="border border-neutral-200 rounded-md px-3 py-2 text-sm flex justify-between gap-3"
              >
                <div>
                  <div className="font-medium">
                    {addr.apelido || "Endereço"}{" "}
                    {addr.principal && (
                      <span className="ml-1 text-[11px] uppercase tracking-wide text-green-700">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="text-neutral-700">
                    {addr.logradouro}, {addr.numero}
                    {addr.complemento ? ` - ${addr.complemento}` : ""}
                  </div>
                  <div className="text-neutral-500 text-xs">
                    {addr.bairro} - {addr.cidade}/{addr.estado} • CEP{" "}
                    {addr.cep}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {!addr.principal && (
                    <button
                      type="button"
                      onClick={() => handleSetPrincipal(index)}
                      className="text-[11px] uppercase tracking-wide text-[#ff6a00] hover:underline"
                    >
                      Definir como principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(index)}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Formulário de novo endereço */}
        {showAddressForm && (
          <div className="mt-2 border-t border-neutral-200 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Apelido (Casa, Trabalho...)
              </label>
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={newAddress.apelido ?? ""}
                onChange={(e) =>
                  setNewAddress((prev) => ({ ...prev, apelido: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">CEP</label>
                <input
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={newAddress.cep}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, cep: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Número
                </label>
                <input
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={newAddress.numero}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, numero: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Logradouro
              </label>
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={newAddress.logradouro}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    logradouro: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Complemento
              </label>
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={newAddress.complemento ?? ""}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    complemento: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Bairro</label>
                <input
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={newAddress.bairro}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      bairro: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Cidade</label>
                <input
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={newAddress.cidade}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      cidade: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">UF</label>
                <input
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  value={newAddress.estado}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      estado: e.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={2}
                />
              </div>
            </div>

            {!hasPrincipal && (
              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={newAddress.principal ?? false}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      principal: e.target.checked,
                    }))
                  }
                />
                Definir como endereço principal
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="px-3 py-2 text-xs rounded-md border border-neutral-300 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddAddress}
                className="px-4 py-2 text-xs rounded-md bg-[#ff6a00] text-white font-semibold hover:brightness-95"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </section>
    </form>
  );
}

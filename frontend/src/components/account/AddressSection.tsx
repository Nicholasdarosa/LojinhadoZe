"use client";

import { useState } from "react";

export type Address = {
  id?: number | string;
  apelido?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  principal?: boolean;
};

type Props = {
  initialAddresses: Address[];
};

export default function AddressSection({ initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses ?? []);
  const [editing, setEditing] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function startNew() {
    setEditing({
      apelido: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      principal: addresses.length === 0,
    });
  }

  function editAddress(a: Address) {
    setEditing({ ...a });
  }

  function handleChange<K extends keyof Address>(key: K, value: Address[K]) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const list = editing.id
        ? addresses.map((a) => (a.id === editing.id ? editing : a))
        : [...addresses, { ...editing, id: editing.id ?? Date.now() }];

      // se marcar principal, desmarca nas outras
      if (editing.principal) {
        list.forEach((a) => {
          if (a.id !== editing.id) a.principal = false;
        });
      }

      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: list }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erro ao salvar endereço.");
      }

      setAddresses(list);
      setEditing(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Endereços de entrega</h2>
        <button
          type="button"
          onClick={startNew}
          className="text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          + Adicionar endereço
        </button>
      </div>

      {addresses.length === 0 && !editing && (
        <p className="text-sm text-neutral-500">
          Você ainda não cadastrou nenhum endereço de entrega.
        </p>
      )}

      {/* Lista de endereços existentes */}
      {addresses.length > 0 && (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li
              key={String(a.id)}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm flex justify-between gap-4"
            >
              <div>
                <p className="font-medium">
                  {a.apelido || "Endereço"}{" "}
                  {a.principal && (
                    <span className="ml-1 rounded-full bg-green-100 px-2 py-[1px] text-[10px] font-semibold text-green-800">
                      Principal
                    </span>
                  )}
                </p>
                <p className="text-neutral-600">
                  {a.logradouro}, {a.numero}{" "}
                  {a.complemento && `- ${a.complemento}`}
                </p>
                <p className="text-neutral-600">
                  {a.bairro} - {a.cidade}/{a.estado} • CEP {a.cep}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-orange-600 hover:text-orange-700 whitespace-nowrap"
                onClick={() => editAddress(a)}
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Form de edição/criação */}
      {editing && (
        <form
          onSubmit={handleSave}
          className="mt-2 space-y-3 rounded-md border border-neutral-200 p-4 bg-neutral-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Apelido
              </label>
              <input
                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                value={editing.apelido ?? ""}
                onChange={(e) => handleChange("apelido", e.target.value)}
                placeholder="Casa, Trabalho..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">CEP</label>
              <input
                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                value={editing.cep ?? ""}
                onChange={(e) => handleChange("cep", e.target.value)}
                placeholder="00000-000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Logradouro
              </label>
              <input
                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                value={editing.logradouro ?? ""}
                onChange={(e) => handleChange("logradouro", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Número
              </label>
              <input
                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                value={editing.numero ?? ""}
                onChange={(e) => handleChange("numero", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Complemento
              </label>
              <input
                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                value={editing.complemento ?? ""}
                onChange={(e) =>
                  handleChange("complemento", e.target.value)
                }
                placeholder="Apartamento, bloco..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Bairro
              </label>
              <input
                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                value={editing.bairro ?? ""}
                onChange={(e) => handleChange("bairro", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Cidade
              </label>
              <input
                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                value={editing.cidade ?? ""}
                onChange={(e) => handleChange("cidade", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Estado (UF)
              </label>
              <input
                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                value={editing.estado ?? ""}
                onChange={(e) => handleChange("estado", e.target.value)}
                maxLength={2}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!!editing.principal}
              onChange={(e) => handleChange("principal", e.target.checked)}
            />
            Definir como endereço principal
          </label>

          {errorMsg && (
            <p className="text-xs text-red-600">{errorMsg}</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              className="rounded border border-neutral-300 px-3 py-1 text-sm"
              onClick={() => setEditing(null)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded bg-black px-4 py-1 text-sm font-semibold text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar endereço"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

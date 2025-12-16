// src/app/checkout/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number; // unitário em REAIS (já normalizado)
  total: number; // total da linha em REAIS (já normalizado)
  imageUrl?: string;
};

type CartState = {
  items: CartItem[];
  subtotal: number; // em REAIS
};

type Address = {
  id: number | string;
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

type ShippingOption = {
  id: string;
  name: string;
  price: number; // em REAIS
  prazoDias: number;
};

/* ---------- helpers ---------- */

function formatCurrency(value: number): string {
  const v = Number.isFinite(value) ? value : 0;
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Converte um número vindo da API em REAIS.
 * Aqui estou assumindo que o backend manda os valores do carrinho em CENTAVOS.
 * Ex: 500 => R$ 5,00
 */
function normalizeMoneyFromApi(raw: any): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  // assumindo tudo em centavos
  return n / 100;
}

/**
 * Normaliza a resposta do /api/cart para um formato fixo.
 * ASSUME que o backend envia price/total/subtotal em CENTAVOS.
 */
function mapRawCart(raw: any): CartState {
  const rawItems: any[] = raw?.items ?? raw?.cart?.items ?? [];

  const items: CartItem[] = rawItems.map((it, idx) => {
    const quantity = Number(it.quantity ?? 1) || 1;

    // valores BRUTOS vindos da API (centavos)
    const rawPrice =
      Number(
        it.price ??
          it.unitPrice ??
          it.unit_price ??
          it.preco ??
          it.valorUnitario ??
          0,
      ) || 0;

    const rawTotal =
      Number(
        it.total ??
          it.lineTotal ??
          it.subtotal ??
          it.valorTotal ??
          rawPrice * quantity,
      ) || 0;

    const price = normalizeMoneyFromApi(rawPrice); // reais
    const total = normalizeMoneyFromApi(rawTotal); // reais

    return {
      id: String(
        it.id ??
          it.itemId ??
          it.productId ??
          it.slug ??
          `item-${idx}`,
      ),
      name: String(it.name ?? it.nome ?? "Produto"),
      quantity,
      price,
      total,
      imageUrl:
        it.imageUrl ??
        it.image ??
        it.coverImage ??
        it.thumb ??
        undefined,
    };
  });

  const rawSubtotal =
    typeof raw.subtotal === "number"
      ? raw.subtotal
      : typeof raw.cart?.subtotal === "number"
      ? raw.cart.subtotal
      : undefined;

  const subtotal =
    typeof rawSubtotal === "number"
      ? normalizeMoneyFromApi(rawSubtotal)
      : items.reduce((acc, it) => acc + (it.total || 0), 0);

  return { items, subtotal };
}

/* ---------- página ---------- */

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartState | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | null
  >(null);

  const [shippingOptions, setShippingOptions] = useState<
    ShippingOption[] | null
  >(null);
  const [selectedShippingId, setSelectedShippingId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [error, setError] = useState("");

  // Carrega carrinho + endereços
  useEffect(() => {
    async function loadCart() {
      const res = await fetch("/api/cart", {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error || "Não foi possível carregar o carrinho.",
        );
      }
      setCart(mapRawCart(data));
    }

    async function loadAddresses() {
      const res = await fetch("/api/account/address", {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(
            "Você precisa estar logado para continuar o checkout.",
          );
        }
        throw new Error(
          data?.error || "Não foi possível carregar seus endereços.",
        );
      }

      const listRaw: any[] = data?.data ?? [];
      const list: Address[] = listRaw.map((a) => ({
        id: a.id ?? a.documentId,
        apelido: a.apelido,
        cep: a.cep,
        logradouro: a.logradouro,
        numero: a.numero,
        complemento: a.complemento,
        bairro: a.bairro,
        cidade: a.cidade,
        estado: a.estado,
        principal: !!a.principal,
      }));

      setAddresses(list);

      const principal =
        list.find((x) => x.principal) ?? list[0] ?? null;

      setSelectedAddressId(
        principal ? String(principal.id) : null,
      );
    }

    (async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadCart(), loadAddresses()]);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar o checkout.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedAddress = useMemo(
    () =>
      addresses.find(
        (a) => String(a.id) === String(selectedAddressId),
      ) ?? null,
    [addresses, selectedAddressId],
  );

  const selectedCep = selectedAddress?.cep
    ?.replace(/[^\d]/g, "")
    .slice(0, 8);

  // Calcula frete sempre que o CEP do endereço selecionado mudar
  useEffect(() => {
    if (!selectedCep) {
      setShippingOptions(null);
      setSelectedShippingId(null);
      return;
    }

    (async () => {
      try {
        setShippingLoading(true);
        setError("");

        const res = await fetch("/api/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cep: selectedCep }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            data?.error || "Não foi possível calcular o frete.",
          );
        }

        const raw = data?.data;
        const arr = Array.isArray(raw) ? raw : [raw];

        const opts: ShippingOption[] = arr.map(
          (opt: any, idx: number) => ({
            id: String(
              opt.id ?? opt.code ?? opt.servico ?? `opt-${idx}`,
            ),
            name: String(
              opt.name ??
                opt.serviceName ??
                opt.descricao ??
                "Normal",
            ),
            // aqui assumo que o frete já vem em REAIS
            price:
              Number(
                opt.price ?? opt.valor ?? opt.valorFrete ?? 0,
              ) || 0,
            prazoDias:
              Number(
                opt.prazoDias ??
                  opt.prazo ??
                  opt.prazoEntrega ??
                  5,
              ) || 5,
          }),
        );

        setShippingOptions(opts);
        if (opts.length > 0) {
          setSelectedShippingId(opts[0].id);
        } else {
          setSelectedShippingId(null);
        }
      } catch (err: any) {
        setShippingOptions(null);
        setSelectedShippingId(null);
        setError(
          err.message ||
            "Erro ao calcular frete para o endereço selecionado.",
        );
      } finally {
        setShippingLoading(false);
      }
    })();
  }, [selectedCep]);

  const selectedShipping = useMemo(
    () =>
      shippingOptions?.find(
        (o) => o.id === selectedShippingId,
      ) ?? null,
    [shippingOptions, selectedShippingId],
  );

  const subtotal = cart?.subtotal ?? 0; // REAIS
  const frete = selectedShipping?.price ?? 0; // REAIS
  const total = subtotal + frete; // REAIS

  const canGoToPayment =
    !!cart &&
    cart.items.length > 0 &&
    !!selectedAddress &&
    !!selectedShipping;

  function handleGoToPayment() {
    if (!canGoToPayment) return;
    router.push("/checkout/pagamento");
  }

  return (
    // só o conteúdo; header/footer vêm do layout global
    <div className="bg-neutral-100">
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-10 min-h-[60vh]">
        {/* WIZARD DE PASSOS */}
        <nav className="mb-8">
          <ol className="flex gap-6 text-xs font-medium">
            {/* 1 - Carrinho (concluído) */}
            <li className="flex items-center gap-2 text-neutral-600">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-400 bg-white text-[11px]">
                1
              </span>
              <span>Carrinho</span>
            </li>

            {/* 2 - Entrega (atual) */}
            <li className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-black shadow-sm"
                style={{
                  background:
                    "linear-gradient(90deg,#fea700,#ffa801)",
                }}
              >
                2
              </span>
              <span className="text-sm font-semibold text-neutral-900">
                Entrega
              </span>
            </li>

            {/* 3 - Pagamento */}
            <li className="flex items-center gap-2 opacity-60">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-white text-[11px]">
                3
              </span>
              <span>Pagamento</span>
            </li>

            {/* 4 - Confirmação */}
            <li className="flex items-center gap-2 opacity-60">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-white text-[11px]">
                4
              </span>
              <span>Confirmação</span>
            </li>
          </ol>
        </nav>

        <section className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900">
            Endereço e entrega
          </h1>
        </section>

        {loading && <p>Carregando checkout…</p>}

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        {!loading && !cart && !error && (
          <p className="text-sm text-neutral-600">
            Não foi possível carregar o carrinho.
          </p>
        )}

        {!loading && cart && cart.items.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-600">
              Seu carrinho está vazio.
            </p>
            <Link
              href="/"
              className="inline-block rounded-full px-6 py-2 text-sm font-semibold text-black"
              style={{
                background:
                  "linear-gradient(90deg,#fea700,#ffa801)",
              }}
            >
              Voltar para a loja
            </Link>
          </div>
        )}

        {!loading && cart && cart.items.length > 0 && (
          <div className="grid gap-8 md:grid-cols-[2fr,1.1fr]">
            {/* COLUNA ESQUERDA */}
            <section className="space-y-6">
              {/* Endereço de entrega */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">
                  Endereço de entrega
                </h2>

                {addresses.length === 0 && (
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">
                    <p className="mb-2 text-neutral-700">
                      Você ainda não cadastrou um endereço de
                      entrega.
                    </p>
                    <Link
                      href="/conta"
                      className="font-medium text-orange-600"
                    >
                      Cadastrar endereço na minha conta
                    </Link>
                  </div>
                )}

                {addresses.length > 0 && selectedAddress && (
                  <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {selectedAddress.apelido || "Endereço"}
                        </p>
                        <p className="text-neutral-700">
                          {selectedAddress.logradouro},{" "}
                          {selectedAddress.numero}
                          {selectedAddress.complemento
                            ? ` - ${selectedAddress.complemento}`
                            : ""}
                        </p>
                        <p className="text-neutral-700">
                          {selectedAddress.bairro} -{" "}
                          {selectedAddress.cidade}/
                          {selectedAddress.estado} • CEP{" "}
                          {selectedAddress.cep}
                        </p>
                      </div>

                      <Link
                        href="/conta"
                        className="whitespace-nowrap text-xs font-semibold text-orange-600"
                      >
                        editar ou escolher outro
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Como receber o pedido (frete) */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">
                  Como quer receber seu pedido?
                </h2>

                {shippingLoading && (
                  <p className="text-sm text-neutral-600">
                    Calculando frete para o CEP{" "}
                    {selectedAddress?.cep}…
                  </p>
                )}

                {!shippingLoading &&
                  selectedAddress &&
                  !shippingOptions &&
                  !error && (
                    <p className="text-sm text-neutral-600">
                      Nenhuma opção de frete disponível para este
                      CEP.
                    </p>
                  )}

                {!shippingLoading &&
                  shippingOptions &&
                  shippingOptions.length > 0 && (
                    <div className="space-y-3">
                      {shippingOptions.map((opt) => {
                        const checked =
                          opt.id === selectedShippingId;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setSelectedShippingId(opt.id)
                            }
                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm bg-white shadow-sm transition ${
                              checked
                                ? "border-black"
                                : "border-neutral-200 hover:border-neutral-400"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`h-4 w-4 rounded-full border ${
                                  checked
                                    ? "border-black bg-black"
                                    : "border-neutral-400 bg-white"
                                }`}
                              ></span>
                              <div>
                                <p className="font-medium text-neutral-900">
                                  {opt.name}
                                </p>
                                <p className="text-xs text-neutral-600">
                                  {opt.prazoDias} dia
                                  {opt.prazoDias > 1 && "s"} úteis
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold text-neutral-900">
                              {formatCurrency(opt.price)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                {/* Resumo rápido dos itens */}
                <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">
                  <p className="mb-2 font-semibold text-neutral-900">
                    Itens do pedido
                  </p>
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="mb-1 flex justify-between text-xs"
                    >
                      <span>
                        {item.name} • qtd: {item.quantity}
                      </span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* COLUNA DIREITA: RESUMO */}
            <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 text-sm shadow-md">
              <h2 className="mb-4 font-semibold text-neutral-900">
                Resumo do pedido
              </h2>

              <div className="mb-1 flex justify-between text-neutral-700">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="mb-1 flex justify-between text-neutral-700">
                <span>Frete</span>
                <span>
                  {selectedShipping
                    ? formatCurrency(selectedShipping.price)
                    : "A calcular"}
                </span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-base font-semibold text-neutral-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-full py-3 text-sm font-semibold text-black shadow-md disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(90deg,#fea700,#ffa801)",
                }}
                disabled={!canGoToPayment}
                onClick={handleGoToPayment}
              >
                Ir para pagamento
              </button>

              <p className="mt-3 text-center text-[11px] text-neutral-500">
                Você poderá revisar endereço, frete e pagamento na
                próxima etapa.
              </p>

              <Link
                href="/carrinho"
                className="mt-4 block text-center text-xs text-neutral-700 underline"
              >
                Voltar para o carrinho
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

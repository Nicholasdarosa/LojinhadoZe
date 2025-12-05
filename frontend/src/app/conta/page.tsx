// src/app/conta/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddressSection, {
  Address,
} from "@/components/account/AddressSection";

async function loadAccount() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const res = await fetch(`${base}/api/account`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function AccountPage() {
  const cookieStore = await cookies(); // Next 15: precisa de await
  const jwt = cookieStore.get("lojinha_token")?.value;

  // Se não estiver logado, manda pra /login
  if (!jwt) {
    redirect("/login?redirect=/conta");
  }

  const account = await loadAccount();

  // Tenta pegar dados tanto no formato "flat" quanto no formato aninhado (user/cliente)
  const nome =
    account?.name ??
    account?.nome ??
    account?.cliente?.nome ??
    account?.user?.username ??
    "";

  const email =
    account?.email ??
    account?.user?.email ??
    account?.cliente?.email ??
    "";

  const cpf =
    account?.cpf ?? account?.cliente?.cpf ?? account?.documento ?? "";

  const phone =
    account?.phone ??
    account?.telefone ??
    account?.cliente?.telefone ??
    "";

  const enderecos: Address[] =
    account?.enderecos ??
    account?.cliente?.enderecos ??
    [];

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6">
          Minha conta
        </h1>

        {/* Bloco: dados básicos + endereços */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
          {/* Dados pessoais */}
          <div className="border border-neutral-200 rounded-md p-5 md:p-6">
            <h2 className="text-lg font-semibold mb-4">Dados pessoais</h2>

            {/*
              Ainda é um form "burro" (server-render) com defaultValue.
              No próximo passo a gente troca por um componente client-side
              que manda PUT /api/account com nome/cpf/telefone.
            */}
            <form className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  defaultValue={nome}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  defaultValue={email}
                  disabled
                  className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">CPF</label>
                  <input
                    defaultValue={cpf}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Telefone
                  </label>
                  <input
                    defaultValue={phone}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* TODO: componente client-side para enviar PUT /api/account */}
              <button
                type="button"
                className="mt-2 inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Salvar dados
              </button>
            </form>
          </div>

          {/* Endereços de entrega – agora com o componente que abre o form de novo endereço */}
          <div className="border border-neutral-200 rounded-md p-5 md:p-6">
            <AddressSection initialAddresses={enderecos} />
          </div>
        </section>

        {/* depois encaixamos histórico de pedidos, etc. */}
      </div>

      <Footer />
    </main>
  );
}

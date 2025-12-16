// src/app/conta/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddressSection, {
  Address,
} from "@/components/account/AddressSection";
import ProfileSection from "@/components/account/ProfileSection";

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

  // Endereços vêm do /api/account (mantém compatibilidade com o que já existe)
  const enderecos: Address[] =
    account?.enderecos ?? account?.cliente?.enderecos ?? [];

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6">
          Minha conta
        </h1>

        {/* Bloco: dados básicos + endereços */}
        <section className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
          {/* Dados pessoais – agora controlado pelo componente client-side */}
          <div className="border border-neutral-200 rounded-md p-5 md:p-6">
            <ProfileSection />
          </div>

          {/* Endereços de entrega – usando o componente com edição/salvamento */}
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

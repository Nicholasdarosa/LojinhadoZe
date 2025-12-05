// src/app/minha-conta/cadastro/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountProfileForm from "@/components/account/AccountProfileForm";

export const dynamic = "force-dynamic";

export default async function AccountSignupPage() {
  return (
    <main>
      <Header />

      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 py-10 md:py-14">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 mb-2">
          Complete seu cadastro
        </h1>
        <p className="text-sm text-neutral-600 mb-8 max-w-xl">
          Só mais alguns dados para finalizar seu cadastro e facilitar as próximas
          compras.
        </p>

        <AccountProfileForm />
      </div>

      <Footer />
    </main>
  );
}

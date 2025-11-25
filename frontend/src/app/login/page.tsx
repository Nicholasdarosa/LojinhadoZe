// src/app/login/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <main>
      <Header />

      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 items-start">
          {/* Login */}
          <section>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 mb-2">
              Entrar na sua conta
            </h1>
            <p className="text-sm text-neutral-600 mb-6">
              Use o e-mail e senha cadastrados para continuar a sua compra.
            </p>

            <LoginForm />

            <p className="mt-4 text-xs text-neutral-500">
              Esqueceu a senha? Em breve vamos adicionar recuperação. Por
              enquanto, fale com o suporte da Lojinha do Zé.
            </p>
          </section>

          {/* Cadastro */}
          <section className="border-t md:border-t-0 md:border-l border-neutral-200 pt-8 md:pt-0 md:pl-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Criar uma conta
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              Cadastre-se para salvar seus endereços, acompanhar pedidos e
              finalizar suas compras com mais rapidez.
            </p>

            <RegisterForm />

            <p className="mt-4 text-xs text-neutral-500">
              Ao criar uma conta, você concorda com os{" "}
              <Link href="#" className="underline">
                termos de uso
              </Link>{" "}
              da Lojinha do Zé.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}

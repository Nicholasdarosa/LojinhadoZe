// src/app/checkout/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <>
      {/* Header padrão da Lojinha do Zé */}
      <Header />

      {/* Conteúdo client-side do checkout (estado, fetch, etc.) */}
      <CheckoutClient />

      {/* Footer padrão da Lojinha do Zé */}
      <Footer />
    </>
  );
}

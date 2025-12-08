// src/app/carrinho/page.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarrinhoClient from "./CarrinhoClient";

export default function CarrinhoPage() {
  return (
    <main>
      <Header />
      <CarrinhoClient />
      <Footer />
    </main>
  );
}

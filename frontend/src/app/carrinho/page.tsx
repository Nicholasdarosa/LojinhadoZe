// src/app/carrinho/page.tsx
export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartClient from "@/components/cart/CartClient";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function loadCart() {
  const res = await fetch(`${SITE_BASE}/api/cart`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { items: [], subtotal: 0 };
  }

  return res.json();
}

export default async function CartPage() {
  const cart = await loadCart();

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-6xl lg:max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6">
          Meu carrinho
        </h1>

        <CartClient initialCart={cart} />
      </div>

      <Footer />
    </main>
  );
}

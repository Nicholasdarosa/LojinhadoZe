// src/components/BenefitsBar.tsx
import { Truck, CreditCard, Wallet, HeadphonesIcon, ShieldCheck } from "lucide-react";

const items = [
  { icon: Truck, title: "Frete Grátis", desc: "Sul/Sudeste acima de R$299" },
  { icon: Wallet, title: "Desconto no Pix", desc: "5% de desconto" },
  { icon: CreditCard, title: "Até 10x sem juros", desc: "no cartão" },
  { icon: HeadphonesIcon, title: "Atendimento", desc: "Seg–Sex 09h–18h" },
  { icon: ShieldCheck, title: "Compra Segura", desc: "Ambiente protegido" },
];

export default function BenefitsBar() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.title}
              className="flex items-center gap-3 rounded-xl border p-4 hover:shadow-sm transition"
            >
              <div className="h-10 w-10 rounded-full bg-[#fea700] text-black grid place-items-center">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold leading-5">{it.title}</p>
                <p className="text-sm text-gray-600">{it.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

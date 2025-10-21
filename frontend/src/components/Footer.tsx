// src/components/Footer.tsx
import { strapiGet } from "@/lib/strapi";
import { Mail, Phone, MessageCircle, Facebook, Instagram } from "lucide-react";

type LinkItem = { label: string; url: string };
type Rodape = {
  texto?: string;
  coluna1Titulo?: string;
  coluna2Titulo?: string;
  coluna3Titulo?: string;
  coluna1Links?: LinkItem[] | any;
  coluna2Links?: LinkItem[] | any;
  coluna3Links?: LinkItem[] | any;
  redes?: { rede: string; url: string }[] | any;
};

async function getRodape(): Promise<Rodape | null> {
  try {
    const data = await strapiGet<any>("/rodape", { cache: "no-store" });
    const a = data?.data?.attributes ?? data?.data ?? data ?? null;
    if (!a) return null;

    const norm = (v: any): LinkItem[] | undefined => {
      if (!v) return undefined;
      if (Array.isArray(v)) return v;
      if (typeof v === "string") {
        try {
          const p = JSON.parse(v);
          return Array.isArray(p) ? p : undefined;
        } catch {
          return undefined;
        }
      }
      return undefined;
    };

    return {
      texto: a.texto,
      coluna1Titulo: a.coluna1Titulo,
      coluna2Titulo: a.coluna2Titulo,
      coluna3Titulo: a.coluna3Titulo,
      coluna1Links: norm(a.coluna1Links),
      coluna2Links: norm(a.coluna2Links),
      coluna3Links: norm(a.coluna3Links),
      redes: Array.isArray(a.redes) ? a.redes : undefined,
    };
  } catch {
    return null;
  }
}

export default async function Footer() {
  const r = await getRodape();

  return (
    <footer className="mt-10 bg-[#1a1a1a] text-white">
      {/* Newsletter (sem onSubmit em Server Components) */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h3 className="text-xl font-semibold mb-3">
            Cadastre-se e receba novidades e promoções
          </h3>
          <form
            action="#"
            method="post"
            noValidate
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              name="email"
              placeholder="Digite seu email"
              className="w-full rounded-md px-4 py-3 text-black"
              required
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-white px-6 py-3 text-black font-semibold hover:bg-neutral-100"
            >
              Enviar
            </button>
          </form>
          <p className="mt-2 text-xs text-white/70">
            Ao clicar em “Enviar” você aceita os termos de uso da loja.
          </p>
        </div>
      </section>

      {/* 3 colunas principais + redes */}
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Coluna 1 */}
        <div>
          <h4 className="font-semibold mb-3">
            {r?.coluna1Titulo ?? "Informações"}
          </h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            {(r?.coluna1Links ?? [
              { label: "Sobre a Loja", url: "#" },
              { label: "Entrega e Frete", url: "#" },
              { label: "Trocas e Devoluções", url: "#" },
              { label: "Prazo de entrega", url: "#" },
            ]).map((l: LinkItem, i: number) => (
              <li key={i}>
                <a href={l.url} className="hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 2 */}
        <div>
          <h4 className="font-semibold mb-3">
            {r?.coluna2Titulo ?? "Central de ajuda"}
          </h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            {(r?.coluna2Links ?? [
              { label: "Como comprar?", url: "#" },
              { label: "Como pagar?", url: "#" },
              { label: "Como funciona o frete?", url: "#" },
            ]).map((l: LinkItem, i: number) => (
              <li key={i}>
                <a href={l.url} className="hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 3 */}
        <div>
          <h4 className="font-semibold mb-3">
            {r?.coluna3Titulo ?? "Fale conosco"}
          </h4>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              (41) 3229-4516
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              (41) 99200-5717
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              contato@sualoja.com.br
            </li>
            <li className="mt-3 flex items-center gap-3">
              <a
                href="#"
                className="grid h-8 w-8 place-items-center rounded-full bg-white text-black hover:bg-neutral-200"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="grid h-8 w-8 place-items-center rounded-full bg-white text-black hover:bg-neutral-200"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Pagamentos / selos / copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-white/80">
            {r?.texto ?? "© Sua Loja — todos os direitos reservados."}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
            <span className="rounded bg-white/10 px-2 py-1">Visa</span>
            <span className="rounded bg-white/10 px-2 py-1">Mastercard</span>
            <span className="rounded bg-white/10 px-2 py-1">Elo</span>
            <span className="rounded bg-white/10 px-2 py-1">Amex</span>
            <span className="rounded bg-white/10 px-2 py-1">Pix</span>
            <span className="rounded bg-white/10 px-2 py-1">Boleto</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

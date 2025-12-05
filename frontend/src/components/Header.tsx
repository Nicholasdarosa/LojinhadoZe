// src/components/Header.tsx
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingCart } from "lucide-react";
import { strapiGet } from "@/lib/strapi";
import MenuRow from "./MenuRow";
import { cookies } from "next/headers";
import UserMenu from "./UserMenu";

const ASSETS = process.env.NEXT_PUBLIC_ASSETS_BASE!;

type Props = {
  /** cor vinda da Single Type Home (ex.: #ffd101ff) */
  bgColor?: string;
};

type LojinhaUser = {
  id: number;
  email: string;
  username: string;
};

/** Single Type: config-do-site (logo = media única ou múltipla) */
async function getConfig() {
  const data = await strapiGet<any>("/config-do-site", {
    cache: "no-store",
    searchParams: { populate: "logo" },
  }).catch(() => null);

  return data?.data?.attributes ?? data?.data ?? null;
}

async function getCurrentUserFromCookies(): Promise<LojinhaUser | null> {
  const store = await cookies();
  const raw = store.get("lojinha_user")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LojinhaUser;
  } catch {
    return null;
  }
}

export default async function Header({ bgColor = "#ffd101ff" }: Props) {
  const config = await getConfig();
  const currentUser = await getCurrentUserFromCookies();

  // Resolve logo (compatível v4/v5 e absoluta/relativa)
  let logoUrl: string | null = null;
  if (config?.logo) {
    const first = Array.isArray(config.logo)
      ? config.logo[0]
      : config.logo?.data?.[0];
    const raw = first?.url ?? first?.attributes?.url ?? null;
    if (raw) logoUrl = raw.startsWith("http") ? raw : `${ASSETS}${raw}`;
  }

  const firstName =
    currentUser?.username?.split(" ")[0] ?? currentUser?.username ?? "";

  return (
    <header className="sticky top-0 z-50">
      {/* Faixa superior */}
      <div className="w-full text-black" style={{ backgroundColor: bgColor }}>
        <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-12 gap-4 items-center">
          {/* Logo */}
          <div className="col-span-12 sm:col-span-3 flex items-center min-h-[72px]">
            <Link href="/" className="inline-flex items-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={320}
                  height={90}
                  className="h-16 sm:h-20 w-auto object-contain"
                  priority
                />
              ) : (
                <span className="font-extrabold text-2xl">Sua Loja</span>
              )}
            </Link>
          </div>

          {/* Busca */}
          <div className="col-span-12 sm:col-span-6">
            <form action="/buscar" className="relative">
              <input
                name="q"
                placeholder="Pesquise o seu produto"
                className="w-full rounded-full bg-white text-black placeholder:text-gray-500 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-black/20"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full"
                title="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Ações */}
          <div className="col-span-12 sm:col-span-3 flex items-center justify-end gap-5">
            {/* Bloco de usuário */}
            {!currentUser ? (
              // DESLOGADO → link simples para /login
              <Link
                href="/login"
                className="group inline-flex items-center gap-2"
                title="Entrar ou cadastrar"
              >
                <span className="relative grid h-10 w-10 place-items-center rounded-full border border-black/30 bg-transparent group-hover:bg-black/5 transition">
                  {/* ícone de avatar será renderizado na página de login */}
                  <span className="h-5 w-5 rounded-full border border-black/60" />
                </span>
                <span className="hidden sm:block text-sm leading-tight">
                  Olá,{" "}
                  <span className="font-semibold">Entre ou Cadastre-se</span>
                </span>
              </Link>
            ) : (
              <UserMenu firstName={firstName} />
            )}

            {/* Favoritos */}
            <Link href="/favoritos" className="relative" title="Favoritos">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-black/30 bg-transparent hover:bg-black/5 transition">
                <Heart className="h-5 w-5" />
              </span>
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                0
              </span>
            </Link>

            {/* Carrinho */}
            <Link href="/carrinho" className="relative" title="Carrinho">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-black/30 bg-transparent hover:bg-black/5 transition">
                <ShoppingCart className="h-5 w-5" />
              </span>
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Barra de menus */}
      <MenuRow bgColor={bgColor} />
    </header>
  );
}

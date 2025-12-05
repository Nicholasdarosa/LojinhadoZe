"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, ChevronDown } from "lucide-react";

type Props = {
  firstName: string;
};

export default function UserMenu({ firstName }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // fecha ao clicar fora
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2"
        title="Minha conta"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="relative grid h-10 w-10 place-items-center rounded-full border border-black/30 bg-transparent hover:bg-black/5 transition">
          <User className="h-5 w-5" />
        </span>
        <span className="hidden sm:flex items-center text-sm leading-tight">
          Olá,&nbsp;
          <span className="font-semibold">{firstName}</span>
          <ChevronDown className="ml-1 h-4 w-4" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border border-neutral-200 bg-white shadow-lg text-sm z-50">
          <Link
            href="/conta"
            className="block px-3 py-2 hover:bg-neutral-50"
            onClick={() => setOpen(false)}
          >
            Minha conta
          </Link>
          <Link
            href="/pedidos"
            className="block px-3 py-2 hover:bg-neutral-50"
            onClick={() => setOpen(false)}
          >
            Meus pedidos
          </Link>
          <div className="border-t border-neutral-200 my-1" />
          <Link
            href="/logout"
            className="block px-3 py-2 text-red-600 hover:bg-red-50"
            onClick={() => setOpen(false)}
          >
            Sair
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, ChevronDown } from "lucide-react";

type Props = {
  firstName: string;
};

export default function UserDropdown({ firstName }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2"
        title="Minha conta"
      >
        <span className="relative grid h-10 w-10 place-items-center rounded-full border border-black/30 bg-transparent hover:bg-black/5 transition">
          <User className="h-5 w-5" />
        </span>
        <span className="hidden sm:flex items-center text-sm leading-tight max-w-[160px] truncate">
          Olá,&nbsp;
          <span className="font-semibold truncate">{firstName}</span>
          <ChevronDown className="ml-1 h-4 w-4" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[180px] rounded-md border border-neutral-200 bg-white text-sm text-neutral-800 shadow-lg z-50">
          <Link
            href="/conta"
            className="block px-3 py-2 hover:bg-neutral-50"
          >
            Minha conta
          </Link>
          <Link
            href="/pedidos"
            className="block px-3 py-2 hover:bg-neutral-50"
          >
            Meus pedidos
          </Link>
          <div className="border-top border-neutral-200 my-1" />
          <Link
            href="/logout"
            className="block px-3 py-2 text-red-600 hover:bg-red-50"
          >
            Sair
          </Link>
        </div>
      )}
    </div>
  );
}

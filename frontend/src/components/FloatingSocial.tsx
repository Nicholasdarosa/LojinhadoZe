// src/components/FloatingSocial.tsx
"use client";

import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

type Props = {
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
};

export default function FloatingSocial({ whatsappUrl, instagramUrl }: Props) {
  // se nenhum link veio do CMS, não renderiza
  if (!whatsappUrl && !instagramUrl) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3">
      {instagramUrl ? (
        <Link
          href={instagramUrl}
          target="_blank"
          className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-lg hover:shadow-xl ring-1 ring-black/10 hover:bg-black/5 transition"
          aria-label="Instagram"
        >
          <Instagram className="h-6 w-6" />
        </Link>
      ) : null}

      {whatsappUrl ? (
        <Link
          href={whatsappUrl}
          target="_blank"
          className="grid h-12 w-12 place-items-center rounded-full bg-green-500 text-white shadow-lg hover:shadow-xl hover:bg-green-600 transition"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </Link>
      ) : null}
    </div>
  );
}

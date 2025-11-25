"use client";

import NewsletterBar from "@/components/NewsletterBar";

/**
 * Wrapper sem props para isolar handlers do lado do cliente.
 */
export default function NewsletterBarClient() {
  return <NewsletterBar />;
}

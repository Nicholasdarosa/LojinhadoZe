// src/lib/strapi.ts
import "server-only"; // garante que este módulo só é importado no servidor

const API = process.env.NEXT_PUBLIC_API_URL!;
const TOKEN = process.env.STRAPI_API_TOKEN;
const USE_TOKEN = process.env.USE_STRAPI_TOKEN !== "false";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  searchParams?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, searchParams?: FetchOptions["searchParams"]) {
  const url = new URL(path.startsWith("http") ? path : `${API}${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

export async function strapiGet<T = unknown>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const { headers, searchParams, cache = "no-store", ...rest } = opts;

  const finalHeaders: Record<string, string> = {
    ...(headers || {}),
  };

  if (USE_TOKEN && TOKEN) {
    finalHeaders.Authorization = `Bearer ${TOKEN}`;
  }

  const url = buildUrl(path, searchParams);

  const res = await fetch(url, {
    cache,
    headers: finalHeaders,
    ...rest,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strapi GET ${url} -> ${res.status} ${res.statusText} ${text}`);
  }

  return (await res.json()) as T;
}

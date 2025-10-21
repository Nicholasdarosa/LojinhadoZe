// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Strapi local
      { protocol: "http", hostname: "localhost", port: "1337" },

      // Produção (ajuste para o seu domínio)
      { protocol: "https", hostname: "cms.seudominio.com" }, // Strapi
      { protocol: "https", hostname: "cdn.seudominio.com" }, // R2/Images
    ],
  },
};

export default nextConfig;

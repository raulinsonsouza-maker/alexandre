import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "64mb",
    },
  },
  images: {
    localPatterns: [
      { pathname: "/brand/**" },
      { pathname: "/media/**" },
      { pathname: "/uploads/**" },
    ],
  },
  async redirects() {
    return [
      // Áreas principais (legado)
      { source: "/campus", destination: "/academia", permanent: true },
      { source: "/campus/:path*", destination: "/academia/:path*", permanent: true },
      { source: "/admin", destination: "/administracao", permanent: true },
      { source: "/admin/:path*", destination: "/administracao/:path*", permanent: true },

      // Conta
      { source: "/login", destination: "/conta/entrar", permanent: true },
      { source: "/cadastro", destination: "/conta/cadastro", permanent: true },
      { source: "/recuperar-senha", destination: "/conta/recuperar-senha", permanent: true },

      // Catálogo
      { source: "/modulo/:slug", destination: "/modulos/:slug", permanent: true },

      // Legal
      { source: "/termos", destination: "/legal/termos", permanent: true },
      { source: "/privacidade", destination: "/legal/privacidade", permanent: true },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.APP_ENV || "development",
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || "0.1.0",
  },
};

export default nextConfig;

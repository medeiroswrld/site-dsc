import type { NextConfig } from "next";

/**
 * Vehicle photos are served from Supabase Storage, and next/image refuses any
 * host it was not told about. The hostname is derived from the same env var
 * the app uses, so connecting a project is still a one-file change.
 */
const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
})();


/**
 * Security headers.
 *
 * The audit found only HSTS in place, which Vercel adds on its own. The gap
 * that mattered was framing: with no X-Frame-Options, /admin could be loaded
 * inside an attacker's page and a logged-in operator tricked into clicking
 * through it. Everything below is a header the browser enforces for free.
 *
 * A full Content-Security-Policy is deliberately not here. Next injects inline
 * scripts, the location section embeds a Google Maps iframe and photos come
 * from Supabase — a strict policy needs per-request nonces and would break
 * those in ways that only show up in production. `frame-ancestors` is the one
 * CSP directive that is safe to set on its own, and it is the one that closes
 * the clickjacking hole.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Stops the browser second-guessing a declared type — the trick behind
  // serving something as an image and having it execute as a script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A stray lockfile in the home directory makes Next guess the wrong project
  // root, which changes what gets bundled for deployment. Pin it.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ["image/avif", "image/webp"],

    /**
     * 30 dias no cache do otimizador.
     *
     * O Supabase serve as fotos com `max-age=3600`, e o next/image respeitava
     * isso: de hora em hora o cache expirava e o primeiro visitante pagava a
     * reotimização inteira — buscar o original, transcodificar, devolver. No
     * PageSpeed isso apareceu como `X-Vercel-Cache: MISS` e um intervalo de
     * quatro segundos entre a primeira pintura e o maior elemento.
     *
     * É seguro guardar por muito tempo porque o nome do arquivo carrega o
     * instante do upload: trocar a foto pelo painel gera outro caminho, e a
     * URL antiga simplesmente deixa de ser pedida. Cache longo aqui nunca
     * serve conteúdo velho.
     */
    minimumCacheTTL: 2592000,
    /**
     * next/image re-encodes every photo it serves, and its default quality of
     * 75 lands on top of the compression the browser already applied at
     * upload. Two lossy passes over what started as a camera JPEG is what
     * makes vehicle shots look washed out. 90 costs a few KB and keeps the
     * detail buyers zoom into — paint finish, wheels, interior stitching.
     */
    qualities: [75, 90],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  // sharp é usado direto na rota da imagem de compartilhamento; mantê-lo
  // fora do bundle evita que o empacotador tente resolver o binário nativo.
  serverExternalPackages: ["sharp"],

  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The panel must never reach a search index, whatever a page forgets
        // to declare in its own metadata.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

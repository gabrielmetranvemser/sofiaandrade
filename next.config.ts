import type { NextConfig } from 'next'

// Derivado do ambiente, e não fixo, para preview e produção
// funcionarem sem editar este arquivo.
const hostSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Par obrigatório da recusa de SVG no upload: SVG é documento
    // executável, e otimizá-lo não o torna seguro.
    dangerouslyAllowSVG: false,
    // ⚠️ NUNCA usar pathname: '/**'. Isso deixaria qualquer pessoa usar
    //    o nosso otimizador contra qualquer objeto de qualquer balde,
    //    inclusive privados no futuro.
    remotePatterns: hostSupabase
      ? [
          {
            protocol: 'https' as const,
            hostname: hostSupabase,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },

  experimental: {
    // Fecha a variante em que um proxy ou CDN forja X-Forwarded-Host
    // para invocar Server Action de outra origem. Vazio em dev.
    serverActions: {
      allowedOrigins: process.env.NEXT_PUBLIC_SITE_URL
        ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).host]
        : [],
      // O padrão é 1 MB, e todo upload falharia com erro obscuro.
      // O cliente já reduz antes de enviar; isto é a folga.
      bodySizeLimit: '12mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
        ],
      },
    ]
  },
}

export default nextConfig

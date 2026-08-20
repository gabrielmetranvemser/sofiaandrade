import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Par obrigatório da recusa de SVG no upload: SVG é documento
    // executável, e otimizá-lo não o torna seguro.
    dangerouslyAllowSVG: false,
  },

  experimental: {
    // Fecha a variante em que um proxy ou CDN forja X-Forwarded-Host
    // para invocar Server Action de outra origem. Vazio em dev.
    serverActions: {
      allowedOrigins: process.env.NEXT_PUBLIC_SITE_URL
        ? [new URL(process.env.NEXT_PUBLIC_SITE_URL).host]
        : [],
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

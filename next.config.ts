import type { NextConfig } from 'next'

// Derivado do ambiente, e não fixo, para preview e produção
// funcionarem sem editar este arquivo.
const hostSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

/**
 * CONTENT-SECURITY-POLICY.
 *
 * ⚠️ O DESENHO INTEIRO SAI DE UMA RESTRIÇÃO: NÃO PODE TRAVAR O GTM.
 *
 *    Um CSP de manual tranca `script-src` numa lista de domínios. Aqui
 *    isso seria uma armadilha: o Tag Manager existe justamente para o
 *    gestor de tráfego pendurar ferramenta nova — Google Ads hoje,
 *    TikTok mês que vem — SEM tocar no site. Com lista fechada, cada
 *    tag nova apareceria como "não funciona" no meio de uma campanha
 *    no ar, e o diagnóstico é dos piores: o erro fica no console do
 *    navegador de quem visita, não no de quem publicou.
 *
 *    Então `script-src` aceita qualquer origem https. O que ele barra
 *    é script por `http:`, `data:` e `blob:` — os três vetores que uma
 *    injeção usa e que nenhuma ferramenta legítima de medição precisa.
 *
 * ⚠️ O VALOR REAL DESTA POLÍTICA ESTÁ NAS OUTRAS QUATRO LINHAS, e não
 *    em `script-src`. Elas não custam nada ao GTM e fecham ataques que
 *    os cabeçalhos anteriores não alcançavam:
 *
 *    · `base-uri` — sem ela, uma única tag <base> injetada reescreve
 *      TODO caminho relativo da página. Os links dos grupos passariam
 *      a apontar para o servidor de outra pessoa sem que uma linha do
 *      HTML visível mudasse.
 *    · `form-action` — impede que um formulário injetado poste em
 *      domínio de terceiro.
 *    · `object-src 'none'` — mata <object>/<embed>, que não têm uso
 *      nenhum neste site e são caminho clássico de execução.
 *    · `frame-ancestors` — clickjacking. Fica em 'self' e não 'none'
 *      porque a prévia ao vivo do painel mostra o site num quadro.
 *
 * `unsafe-inline` é inevitável: o próprio Next injeta script inline
 * para hidratar, e o GTM inline é o formato que a ferramenta entrega.
 * Registro em vez de fingir que a política é mais forte do que é.
 */
const CSP = [
  "default-src 'self'",
  // https: e não lista fechada — ver o bloco acima.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline' https:",
  // data: e blob: para a moldura gerada no próprio aparelho; https:
  // cobre o Storage do Supabase, a miniatura do YouTube e os pixels.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https:",
  // blob: é o vídeo do R2 e a imagem que o filtro monta antes de baixar.
  "media-src 'self' blob: https:",
  // Player do YouTube e do Vimeo, e o quadro sem-JS do GTM.
  "frame-src https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ')

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
    // ⚠️ SÓ O NOSSO STORAGE. A miniatura de vídeo NÃO entra aqui: ela é
    //    servida por <img> comum. Domínio de provedor no otimizador
    //    amarraria o conteúdo do painel à configuração de build — cada
    //    provedor novo viraria um deploy — e, pior, quando o domínio
    //    não bate o Next LANÇA em vez de degradar: a página inteira da
    //    campanha vira tela de erro por causa de uma miniatura.
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
          // Mantido junto do `frame-ancestors` do CSP: navegador velho
          // não entende o segundo, e clickjacking não espera atualização.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ]
  },
}

export default nextConfig

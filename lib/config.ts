/**
 * Configuração de ambiente. Ponto único de leitura de env.
 * Nada no projeto lê process.env fora daqui (exceto admin.ts, que é server-only).
 */

const url = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

export const config = {
  siteUrl: url,

  /** Supabase está conectado? Enquanto false, o projeto roda com dados locais. */
  supabaseAtivo: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),

  legal: {
    cnpj: process.env.NEXT_PUBLIC_CNPJ_CAMPANHA || '00.000.000/0001-00',
    responsavel: process.env.NEXT_PUBLIC_RESPONSAVEL_CAMPANHA || 'A confirmar',
    endereco: process.env.NEXT_PUBLIC_ENDERECO_COMITE || 'A confirmar',
    partido: process.env.NEXT_PUBLIC_PARTIDO || 'PL — Partido Liberal',
  },

  /** Instante em que os CTAs saem do ar. ISO-8601 em UTC. */
  silencioEleitoralEm: process.env.NEXT_PUBLIC_SILENCIO_ELEITORAL_EM || '',

  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
} as const

/**
 * Silêncio eleitoral.
 *
 * Chamada em Server Component: decide na renderização e o resultado
 * atravessa o cache da Vercel corretamente porque as páginas que usam
 * CTA são revalidadas de hora em hora.
 */
export function emSilencioEleitoral(agora: Date = new Date()): boolean {
  if (!config.silencioEleitoralEm) return false
  const limite = new Date(config.silencioEleitoralEm)
  if (Number.isNaN(limite.getTime())) return false
  return agora.getTime() >= limite.getTime()
}

/** Faltam quantos milissegundos para o silêncio? Negativo se já passou. */
export function msAteSilencio(agora: Date = new Date()): number {
  if (!config.silencioEleitoralEm) return Number.POSITIVE_INFINITY
  return new Date(config.silencioEleitoralEm).getTime() - agora.getTime()
}

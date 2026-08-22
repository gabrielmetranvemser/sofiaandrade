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

  // ⚠️ Os dados legais NÃO moram mais aqui. Foram para o painel, em
  //    Rodapé ▸ Identificação eleitoral. Ver content/copy.ts.

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

/**
 * O site pode ser indexado pelo Google?
 *
 * ⚠️ MORA AQUI PORQUE TEM DOIS DONOS. A regra nasceu dentro do
 *    `robots.ts`, onde ninguém a vê: o arquivo é gerado, não é uma
 *    tela. Só que a tela de Buscas do painel precisa responder à mesma
 *    pergunta — é o primeiro diagnóstico de "cadastrei no Search
 *    Console e ele não indexa". Duas cópias da regra divergiriam na
 *    primeira vez que alguém trocasse o domínio, e a divergência
 *    apareceria como um painel dizendo "no ar" sobre um site que o
 *    robots.txt manda ignorar.
 *
 * O critério é o endereço: em `localhost` e nos domínios de preview da
 * Vercel o site é uma cópia de trabalho. Indexar a cópia é pior do que
 * não indexar nada — ela concorre com a oficial na busca pelo nome da
 * candidata.
 */
export function siteIndexavel(url: string = config.siteUrl): boolean {
  return !url.includes('localhost') && !url.includes('vercel.app')
}

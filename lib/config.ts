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

  /**
   * O dia da eleição, para a contagem regressiva da página de entrada.
   *
   * ⚠️ TEM PADRÃO NO CÓDIGO, e não é descuido: 4 de outubro de 2026 é a
   *    data desta eleição, e este site é de uma campanha só. Deixar o
   *    valor só na variável de ambiente faria a contagem sumir da página
   *    até alguém lembrar de preenchê-la na Vercel — e ninguém lembra.
   *    O fuso é o de Rondônia (UTC−4), que não tem horário de verão.
   */
  eleicaoEm: process.env.NEXT_PUBLIC_ELEICAO_EM || '2026-10-04T00:00:00-04:00',

  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',

  /**
   * Medição desligada NESTE PROCESSO: nada vai para `eventos`, nada soma
   * no contador dos grupos, nada sai para a Meta e o pixel não carrega.
   *
   * ⚠️ EXISTE PORQUE O `.env.local` APONTA PARA PRODUÇÃO. Abrir o site
   *    local para conferir uma mudança gravava visita de verdade no
   *    painel e mandava PageView e Lead para a campanha — já aconteceu,
   *    com 27 eventos de teste. Com `MEDICAO_DESLIGADA=1` o servidor
   *    local lê grupos e conteúdo normalmente e não escreve nada.
   *
   *    Nunca ligar na Vercel: o site continuaria no ar, sem medir.
   */
  medicaoDesligada: process.env.MEDICAO_DESLIGADA === '1',

  /**
   * Quem chega pelo anúncio de uma cidade (`/?cidade=`) vê a página de
   * entrada (`/grupos`) em vez da home. Ver `proxy.ts`.
   *
   * Ligada por padrão. `PAGINA_DE_ENTRADA=0` na Vercel, e um novo
   * deploy, devolvem esse tráfego para a home sem mexer em código nem
   * em anúncio — é a regra de parada do plano de 17/09.
   */
  paginaDeEntrada: process.env.PAGINA_DE_ENTRADA !== '0',

  /**
   * GTM e pixel da Meta só no primeiro toque, rolagem ou tecla — ou 5 s
   * depois do `load`. Ver components/trafego/Trafego.tsx.
   *
   * `TERCEIROS_NA_HORA=1` na Vercel volta ao carregamento imediato, se o
   * GA4 ou o Clarity precisarem contar quem sai sem tocar em nada.
   */
  terceirosAdiados: process.env.TERCEIROS_NA_HORA !== '1',
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

/**
 * Faltam quantos DIAS para a eleição, contados em Rondônia?
 *
 * ⚠️ DIA DE CALENDÁRIO, e não 24 horas de diferença. Quem abre a página
 *    às 23h de sexta e vê "faltam 3 dias" precisa ver "faltam 3 dias"
 *    também à 1h do sábado — a resposta certa muda à meia-noite de lá, e
 *    não a cada 24 horas corridas a partir de agora.
 *
 * Rondônia é UTC−4 o ano inteiro (não há horário de verão desde 2019),
 * então o deslocamento é fixo. `null` quando a data não é válida.
 */
export function diasAteAEleicao(agora: Date = new Date()): number | null {
  const alvo = new Date(config.eleicaoEm)
  if (Number.isNaN(alvo.getTime())) return null
  const DIA_MS = 86_400_000
  const FUSO_MS = 4 * 60 * 60 * 1000
  const diaLocal = (d: Date) => Math.floor((d.getTime() - FUSO_MS) / DIA_MS)
  return diaLocal(alvo) - diaLocal(agora)
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

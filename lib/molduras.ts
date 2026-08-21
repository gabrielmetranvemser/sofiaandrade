/**
 * Catálogo de molduras.
 *
 * O `arquivo` de cada uma é a arte PROVISÓRIA em /public/molduras. A
 * arte final não entra aqui: entra pelo painel, em Imagens, nos slots
 * moldura.story e moldura.perfil, e passa a valer sem deploy — é o que
 * resolverMolduras() faz. O SVG local fica como rede de segurança para
 * o dia em que o Storage não responder.
 *
 * ⚠️ EXIGÊNCIA LEGAL: toda moldura precisa carregar o CNPJ da campanha.
 *    A imagem gerada circula como propaganda eleitoral.
 *
 * ⚠️ DESIGN: a moldura precisa ler como "EU APOIO", não como "post
 *    oficial da campanha". É a única mitigação real para o risco de
 *    alguém colar a marca numa foto ofensiva.
 */

export type FormatoMoldura = 'story' | 'perfil'

export interface Moldura {
  id: string
  nome: string
  formato: FormatoMoldura
  largura: number
  altura: number
  arquivo: string
  /** Área onde o rosto deve caber. Fração do quadro. Guia de zona segura. */
  zonaSegura: { x: number; y: number; largura: number; altura: number }
  padrao?: boolean
  /** A arte veio do painel, e não do SVG provisório em /public. */
  daCampanha?: boolean
}

export const MOLDURAS: Moldura[] = [
  {
    id: 'story-apoio',
    nome: 'Eu apoio · Story',
    formato: 'story',
    largura: 1080,
    altura: 1920,
    arquivo: '/molduras/story-apoio.svg',
    // Termina onde o véu começa (y 0,56): rosto dentro do degradê
    // sai escurecido e com o logotipo por cima.
    zonaSegura: { x: 0.1, y: 0.1, largura: 0.8, altura: 0.44 },
    padrao: true,
  },
  {
    id: 'perfil-apoio',
    nome: 'Eu apoio · Perfil',
    formato: 'perfil',
    largura: 1080,
    altura: 1080,
    arquivo: '/molduras/perfil-apoio.svg',
    // Acima do véu (y 0,46) e dentro do círculo do WhatsApp.
    zonaSegura: { x: 0.14, y: 0.07, largura: 0.72, altura: 0.38 },
    padrao: true,
  },
]

export const MOLDURA_PADRAO = MOLDURAS.find((m) => m.padrao) ?? MOLDURAS[0]

/** O slot de imagem que substitui a arte provisória de cada formato. */
export const SLOT_DA_MOLDURA: Record<FormatoMoldura, string> = {
  story: 'moldura.story',
  perfil: 'moldura.perfil',
}

/**
 * OS APOIADORES DE EXEMPLO que giram dentro das duas molduras.
 *
 * ⚠️ O PAR É A UNIDADE, e o filtro abaixo é o que garante isso: um
 *    apoiador só entra na roda com as DUAS fotos. As duas molduras
 *    trocam ao mesmo tempo e mostram sempre a mesma pessoa — é isso
 *    que faz o exemplo se ler como "a sua foto vai ficar assim nos
 *    dois formatos", e não como duas pessoas quaisquer lado a lado.
 *
 *    Descartar o par incompleto em silêncio é deliberado: permite
 *    subir um apoiador por vez, sem a seção passar por um estado em
 *    que um lado tem foto e o outro tem silhueta.
 */
export interface ApoiadorExemplo {
  id: string
  story: ImagemDeSlot
  perfil: ImagemDeSlot
}

/** O bastante do que `lerSlots` devolve para desenhar a foto. */
interface ImagemDeSlot {
  url: string
  largura: number
  altura: number
  blur?: string | null
  alt?: string
}

/** Quantos pares o painel oferece. Mudar aqui pede mudar em slots.ts. */
export const MAXIMO_DE_EXEMPLOS = 6

export function resolverExemplos(
  slots: Record<string, ImagemDeSlot>,
): ApoiadorExemplo[] {
  const saida: ApoiadorExemplo[] = []
  for (let i = 1; i <= MAXIMO_DE_EXEMPLOS; i++) {
    const story = slots[`filtro.exemplo.${i}.story`]
    const perfil = slots[`filtro.exemplo.${i}.perfil`]
    if (story && perfil) saida.push({ id: `exemplo-${i}`, story, perfil })
  }
  return saida
}

/**
 * Troca a arte provisória pela que a campanha subiu, quando houver.
 *
 * Roda no servidor e o resultado desce como prop: o gerador é Client
 * Component e não pode ler o Storage. Também é o que permite ao
 * painel trocar a moldura no meio da campanha sem deploy.
 */
export function resolverMolduras(
  slots: Record<string, { url: string }>,
): Moldura[] {
  return MOLDURAS.map((m) => {
    const enviada = slots[SLOT_DA_MOLDURA[m.formato]]
    return enviada ? { ...m, arquivo: enviada.url, daCampanha: true } : m
  })
}

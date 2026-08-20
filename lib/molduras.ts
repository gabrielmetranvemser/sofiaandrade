/**
 * Catálogo de molduras.
 *
 * Os arquivos em /public/molduras são PLACEHOLDERS gerados em SVG.
 * Quando as artes chegarem do design, trocar `arquivo` pelo PNG final
 * (com transparência) mantendo EXATAMENTE as mesmas dimensões.
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
}

export const MOLDURAS: Moldura[] = [
  {
    id: 'story-apoio',
    nome: 'Eu apoio · Story',
    formato: 'story',
    largura: 1080,
    altura: 1920,
    arquivo: '/molduras/story-apoio.svg',
    zonaSegura: { x: 0.1, y: 0.14, largura: 0.8, altura: 0.5 },
    padrao: true,
  },
  {
    id: 'perfil-apoio',
    nome: 'Eu apoio · Perfil',
    formato: 'perfil',
    largura: 1080,
    altura: 1080,
    arquivo: '/molduras/perfil-apoio.svg',
    zonaSegura: { x: 0.12, y: 0.08, largura: 0.76, altura: 0.62 },
    padrao: true,
  },
]

export const MOLDURA_PADRAO = MOLDURAS.find((m) => m.padrao) ?? MOLDURAS[0]

export function moldurasDoFormato(formato: FormatoMoldura): Moldura[] {
  return MOLDURAS.filter((m) => m.formato === formato)
}

export function molduraPorId(id: string): Moldura | undefined {
  return MOLDURAS.find((m) => m.id === id)
}

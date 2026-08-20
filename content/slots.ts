/**
 * OS ESPAÇOS DE IMAGEM DA PÁGINA.
 *
 * Um slot é um lugar que aceita imagem, com chave estável. Vive em
 * código, não no banco: um slot só existe se algum componente o
 * renderiza. Adicionar slot é mudança de layout; trocar a imagem do
 * slot é ação do admin.
 *
 * Os requisitos declarados aqui são exatamente o que o painel imprime
 * na tela — "instruções de tamanho e formato" não é texto solto, é
 * este objeto.
 */

export interface Slot {
  chave: string
  rotulo: string
  onde: string
  /** Proporção esperada. `null` = livre (recorte sem fundo). */
  proporcao: string | null
  larguraMin: number
  alturaMin: number
  /** Exige canal alpha — foto recortada, logo, moldura. */
  alpha?: boolean
  /** Dimensão EXATA, não mínima. Só molduras. */
  exata?: boolean
  balde?: 'midia' | 'molduras'
  nota?: string
  /** Arquivo em /public usado enquanto o slot não tem imagem. */
  padrao?: string
}

export const SLOTS: Slot[] = [
  {
    chave: 'hero.retrato',
    rotulo: 'Foto da candidata',
    onde: 'Primeira dobra',
    proporcao: null,
    larguraMin: 1200,
    alturaMin: 1500,
    alpha: true,
    nota: 'PNG recortado, sem fundo. É a única imagem em que o recorte importa: ela fica sobre o azul.',
  },
  {
    chave: 'origem.retrato',
    rotulo: 'Retrato',
    onde: 'Quem é Sofia',
    proporcao: '4/5',
    larguraMin: 1000,
    alturaMin: 1250,
    nota: 'Vertical. Sofia em ambiente de trabalho ou de rua.',
  },
  {
    chave: 'origem.detalhe.1',
    rotulo: 'Detalhe 1',
    onde: 'Quem é Sofia',
    proporcao: '1/1',
    larguraMin: 800,
    alturaMin: 800,
  },
  {
    chave: 'origem.detalhe.2',
    rotulo: 'Detalhe 2',
    onde: 'Quem é Sofia',
    proporcao: '1/1',
    larguraMin: 800,
    alturaMin: 800,
  },
  {
    chave: 'provas.entrega.1',
    rotulo: 'Foto da entrega 1',
    onde: 'O que já foi feito',
    proporcao: '3/2',
    larguraMin: 1200,
    alturaMin: 800,
  },
  {
    chave: 'provas.entrega.2',
    rotulo: 'Foto da entrega 2',
    onde: 'O que já foi feito',
    proporcao: '3/2',
    larguraMin: 1200,
    alturaMin: 800,
  },
  {
    chave: 'provas.entrega.3',
    rotulo: 'Foto da entrega 3',
    onde: 'O que já foi feito',
    proporcao: '3/2',
    larguraMin: 1200,
    alturaMin: 800,
  },
  {
    chave: 'moldura.story',
    rotulo: 'Moldura de story',
    onde: 'Gerador de filtro',
    proporcao: '9/16',
    larguraMin: 1080,
    alturaMin: 1920,
    alpha: true,
    exata: true,
    balde: 'molduras',
    nota: 'PNG 1080×1920 com transparência no miolo. ⚠️ Exigência legal: o CNPJ da campanha precisa estar legível na arte.',
    padrao: '/molduras/story-apoio.svg',
  },
  {
    chave: 'moldura.perfil',
    rotulo: 'Moldura de perfil',
    onde: 'Gerador de filtro',
    proporcao: '1/1',
    larguraMin: 1080,
    alturaMin: 1080,
    alpha: true,
    exata: true,
    balde: 'molduras',
    nota: 'PNG 1080×1080 com transparência no miolo. ⚠️ CNPJ obrigatório na arte.',
    padrao: '/molduras/perfil-apoio.svg',
  },
]

export const SLOTS_POR_CHAVE: Record<string, Slot> = Object.fromEntries(
  SLOTS.map((s) => [s.chave, s]),
)

/** Agrupados por seção da página, para a galeria do painel. */
export const SLOTS_POR_ONDE = SLOTS.reduce<Record<string, Slot[]>>((acc, s) => {
  ;(acc[s.onde] ??= []).push(s)
  return acc
}, {})

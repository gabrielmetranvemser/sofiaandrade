import { ESQUEMA, type Campo, type SecaoEsquema } from './esquema'
import { SLOTS_POR_SECAO, type Slot } from './slots'

/**
 * O MAPA DO PAINEL.
 *
 * ⚠️ POR QUE ESTE ARQUIVO EXISTE.
 *
 *    O painel era organizado por TIPO: uma aba de Textos, outra de
 *    Imagens, e vídeo em lugar nenhum. Para mexer em "Quem é Sofia"
 *    era preciso abrir Textos → Quem é Sofia, salvar, voltar, abrir
 *    Imagens, rolar até achar o grupo certo. Duas telas, dois modelos
 *    mentais, para uma coisa só.
 *
 *    Ninguém chega no painel pensando "quero editar uma imagem".
 *    Chega pensando "quero mexer no bloco da rua". A unidade de
 *    trabalho é a SEÇÃO, e é ela que este arquivo torna de primeira
 *    classe: cada seção da página passa a saber quais textos, quais
 *    espaços de imagem e quais vídeos pertencem a ela.
 *
 *    As três fontes já existiam e continuam sendo a verdade sobre si
 *    mesmas — `content/esquema.ts` para texto, `content/slots.ts` para
 *    imagem, e o próprio esquema para vídeo. Este arquivo não duplica
 *    nada: ele só as costura e acrescenta o que faltava, que é a ORDEM
 *    DA PÁGINA e o endereço de cada seção no site.
 */

/**
 * A ordem em que as seções aparecem na página.
 *
 * ⚠️ A PÁGINA DE ENTRADA VEM PRIMEIRO, e ela nem é da home. É a primeira
 *    coisa que quem toca num anúncio vê — desde 17/09 é a página que mais
 *    recebe gente paga —, e quem abre o painel para mexer "na página do
 *    anúncio" não deve precisar rolar a lista da home inteira até achá-la.
 */
const ORDEM_DA_PAGINA = [
  'entrada',
  'hero',
  'faixa',
  'origem',
  'album',
  'rua',
  'problema',
  'valores',
  'cena',
  'provas',
  'social',
  'trilha',
  'futuro',
  'grupos',
  'filtro',
  'compartilhar',
  'ctaFinal',
  'rodape',
  'exibir',
] as const

/**
 * A âncora de cada seção no site.
 *
 * É o que faz o botão "ver no site" abrir a página JÁ na altura certa,
 * em vez de no topo. Onde é `null`, a seção não tem id próprio — a
 * primeira dobra é o topo, e a cena da bandeira não é endereçável.
 */
const ANCORA: Record<string, string | null> = {
  // Porto Velho porque o grupo de lá está sempre aberto: com cidade de
  // grupo fechado, a prévia mostraria a busca, e não a página de entrada.
  entrada: '/grupos?cidade=porto-velho',
  hero: '/',
  faixa: '/',
  origem: '/#origem',
  album: '/#album',
  rua: '/#rua',
  problema: '/#problema',
  valores: '/#valores',
  cena: null,
  provas: '/#provas',
  social: '/#prova-social',
  trilha: '/#trilha',
  futuro: '/#futuro',
  grupos: '/#grupos',
  filtro: '/#filtro',
  compartilhar: '/#compartilhar',
  ctaFinal: '/#votar',
  rodape: '/',
}

/**
 * Uma frase dizendo O QUE É cada seção, para quem abre o painel sem
 * ter a página aberta do lado. O rótulo diz o nome; isto diz a função.
 */
const RESUMO: Record<string, string> = {
  entrada:
    'A página que abre para quem toca no anúncio de uma cidade: tarja com as fotos, contagem regressiva, título com a cidade, o botão do WhatsApp e a dobra azul da trajetória.',
  hero: 'A primeira tela: título, botões e a foto com o número.',
  faixa: 'A tarja amarela que corre logo abaixo da primeira tela.',
  origem: 'A história de origem, com retrato, fotos de detalhe e vídeo.',
  album: 'Oito fotos do acervo de família, com legenda.',
  rua: 'As fotos e o vídeo de 2020, quando ela foi para a rua.',
  problema: 'Os quatro problemas que a campanha aponta.',
  valores: 'As bandeiras dela, uma a uma.',
  cena: 'A animação de rolagem entre as bandeiras e as provas.',
  provas: 'Prestação de contas do mandato: leis, registro público e vídeo.',
  social: 'Comentários de terceiros, os ataques e os processos vencidos.',
  trilha: 'A fita de vídeos que corre de lado, acima dos compromissos.',
  futuro: 'Os compromissos de mandato, em fita.',
  grupos: 'Os textos da busca de grupos de WhatsApp.',
  filtro: 'Os textos do gerador de foto de perfil e as molduras.',
  compartilhar: 'O bloco de compartilhar a página.',
  ctaFinal: 'A última chamada, antes do rodapé.',
  rodape: 'Assinatura, links e a identificação eleitoral obrigatória.',
  exibir: 'Liga e desliga seções inteiras da página.',
  ctas: 'Os botões que se repetem em vários pontos do site.',
  navegacao: 'Os itens do menu do topo.',
  privacidade: 'A página de política de privacidade.',
  cookies: 'O aviso de cookies da primeira visita e as categorias de "Personalizar".',
  candidata: 'Nome, número, partido e redes. Usado em toda a página.',
  aparencia: 'Cores da primeira dobra e textura de fundo.',
  meta: 'Título da aba e o cartão que aparece ao compartilhar o link.',
  paginas: 'Título e cartão das páginas internas.',
}

/**
 * AS SEÇÕES QUE SÃO BLOCOS VISÍVEIS DA PÁGINA.
 *
 * O que fica de fora — `exibir`, `ctas`, `navegacao`, `meta`, `paginas`
 * — são ajustes que aparecem espalhados pelo site ou em lugar nenhum.
 * Abrir uma prévia da página para eles mostraria um lugar que não
 * corresponde ao que se está editando, o que é pior que não mostrar.
 */
const VISUAIS = new Set([
  'entrada', 'hero', 'faixa', 'origem', 'album', 'rua', 'problema', 'valores', 'cena',
  'provas', 'social', 'trilha', 'futuro', 'grupos', 'filtro', 'compartilhar',
  'ctaFinal', 'rodape',
])

export interface SecaoDoPainel {
  chave: string
  esquema: SecaoEsquema
  rotulo: string
  grupo: SecaoEsquema['grupo']
  resumo: string
  /** Endereço no site, ou null quando a seção não é endereçável. */
  ancora: string | null
  /** Uma seção da página, ou um painel de ajuste sem lugar visível. */
  visual: boolean
  espacos: Slot[]
  /** Quantos campos de vídeo esta seção tem, contando os de dentro de listas. */
  temVideo: boolean
  /** Só os campos de texto — o que sobra depois de tirar os de vídeo. */
  camposDeTexto: [string, Campo][]
  /** Os campos de vídeo de primeiro nível e as listas de vídeo. */
  camposDeVideo: [string, Campo][]
}

/**
 * Um campo pertence ao painel de Vídeos quando é um vídeo, ou quando é
 * uma LISTA cujos itens são vídeos (a trilha, os comentários).
 *
 * ⚠️ `social.processos` NÃO entra aqui de propósito, mesmo tendo vídeos
 *    dentro. Ele é uma lista de PROCESSOS — título, relato, resultado —
 *    e os vídeos são um detalhe de cada cartão. Arrancá-los dali para
 *    outra aba separaria o vídeo do texto que ele ilustra. Quem quer
 *    ver todos os vídeos num lugar só usa a tela de Vídeos, que
 *    alcança inclusive esses.
 */
function ehCampoDeVideo(campo: Campo): boolean {
  if (campo.tipo === 'video') return true
  // Um vídeo com opções é um GRUPO — url, enquadramento e os ajustes de
  // player, juntos. Sem esta linha os quatro vídeos soltos cairiam na
  // aba de textos.
  if (campo.tipo === 'grupo') return Object.values(campo.campos).some((c) => c.tipo === 'video')
  if (campo.tipo === 'lista') return Object.values(campo.item).some((c) => c.tipo === 'video')
  return false
}

/** Existe vídeo em qualquer profundidade desta seção? */
export function secaoTemVideo(campos: Record<string, Campo>): boolean {
  return Object.values(campos).some((campo) => {
    if (campo.tipo === 'video') return true
    if (campo.tipo === 'lista') return secaoTemVideo(campo.item)
    if (campo.tipo === 'grupo') return secaoTemVideo(campo.campos)
    return false
  })
}

function montar(chave: string): SecaoDoPainel {
  const esquema = ESQUEMA[chave]
  const entradas = Object.entries(esquema.campos)
  return {
    chave,
    esquema,
    rotulo: esquema.rotulo,
    grupo: esquema.grupo,
    resumo: RESUMO[chave] ?? '',
    ancora: ANCORA[chave] ?? null,
    visual: VISUAIS.has(chave),
    espacos: SLOTS_POR_SECAO[chave] ?? [],
    temVideo: secaoTemVideo(esquema.campos),
    camposDeTexto: entradas.filter(([, c]) => !ehCampoDeVideo(c)),
    camposDeVideo: entradas.filter(([, c]) => ehCampoDeVideo(c)),
  }
}

/**
 * Todas as seções, na ordem em que a pessoa as encontra: primeiro as da
 * página, de cima para baixo; depois os textos gerais e a identidade.
 *
 * ⚠️ O `filter` no fim não é defensivo à toa: uma seção nova no esquema
 *    que ninguém lembrou de pôr em ORDEM_DA_PAGINA apareceria no fim da
 *    lista em vez de sumir do painel. Perder o acesso a uma seção é
 *    pior que mostrá-la fora de ordem.
 */
export const SECOES_DO_PAINEL: SecaoDoPainel[] = (() => {
  const naOrdem = ORDEM_DA_PAGINA.filter((c) => ESQUEMA[c])
  const restantes = Object.keys(ESQUEMA).filter((c) => !naOrdem.includes(c as never))
  return [...naOrdem, ...restantes].map(montar)
})()

export const SECOES_POR_CHAVE: Record<string, SecaoDoPainel> = Object.fromEntries(
  SECOES_DO_PAINEL.map((s) => [s.chave, s]),
)

/** Agrupadas para o menu, preservando a ordem da página dentro de cada grupo. */
export const SECOES_POR_GRUPO = SECOES_DO_PAINEL.reduce<Record<string, SecaoDoPainel[]>>(
  (acc, s) => {
    ;(acc[s.grupo] ??= []).push(s)
    return acc
  },
  {},
)

/**
 * AS DUAS ÁREAS DO PAINEL.
 *
 * `Seções` é a página, de cima para baixo — trabalho de conteúdo.
 * `Identidade` é tudo que vale para o site inteiro: quem é a
 * candidata, a marca, a aparência, o que aparece na busca e ao
 * compartilhar, os botões que se repetem, o menu, e o rodapé com a
 * identificação eleitoral.
 *
 * A divisão é por FREQUÊNCIA de uso, não por tipo de dado: conteúdo se
 * mexe toda semana, identidade se define uma vez e quase não se toca.
 * Misturar os dois fazia a lista de seções abrir com quatro itens que
 * ninguém procurava.
 */
export const SECOES_DA_PAGINA = SECOES_DO_PAINEL.filter((s) => s.grupo === 'Página')
export const SECOES_DE_IDENTIDADE = SECOES_DO_PAINEL.filter((s) => s.grupo !== 'Página')

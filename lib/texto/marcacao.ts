/**
 * A MARCAÇÃO DE TEXTO DO SITE.
 *
 * Três marcas — destaque, negrito e itálico — e elas COMBINAM: um
 * trecho pode ter as três ao mesmo tempo.
 *
 * ⚠️ A PRIMEIRA VERSÃO NÃO DEIXAVA COMBINAR, e estava errada. Achei que
 *    proibir aninhamento simplificaria o interpretador e não custaria
 *    nada — mas "esta palavra em negrito E destacada" é o pedido mais
 *    natural que existe num título de campanha. A restrição não protegia
 *    de nada: protegia o interpretador de ter um analisador de verdade.
 *
 * ⚠️ POR QUE NÃO HTML, e por que não vai virar HTML.
 *
 *    O caminho fácil seria guardar HTML e usar `dangerouslySetInnerHTML`.
 *    Isso transformaria uma sessão de admin comprometida em execução de
 *    script na página pública da campanha — e página de campanha é alvo.
 *    Aqui o texto NUNCA vira HTML: o interpretador devolve trechos com
 *    um conjunto de marcas, e quem desenha escolhe as etiquetas.
 *
 *    O outro motivo é de produto. Um editor de HTML oferece vinte
 *    formatações e a página sabe desenhar três; as outras dezessete
 *    somem em silêncio no salvamento. Marca que a página não sabe
 *    desenhar não deve nem existir no editor.
 *
 * ⚠️ POR QUE MARCAÇÃO NA STRING, e não um documento estruturado.
 *    Validação, diff contra o padrão, histórico de versões e "voltar ao
 *    original" trabalham todos com strings. Trocar por um documento em
 *    árvore obrigaria a reescrever os quatro, para ganhar nada.
 *
 * A escolha dos delimitadores não é estética: `[[…]]`, `**…**` e
 * `__…__` não aparecem em texto de campanha escrito à mão. Asterisco
 * simples e sublinhado simples apareceriam, e por isso ficaram de fora.
 */

export type Marca = 'destaque' | 'negrito' | 'italico'

export interface Trecho {
  texto: string
  /** As marcas que valem neste trecho. Vazio = texto normal. */
  marcas: Marca[]
}

/**
 * A ORDEM CANÔNICA em que as marcas se aninham ao serem escritas.
 *
 * Fixa de propósito: sem ela, `**[[a]]**` e `[[**a**]]` seriam duas
 * strings diferentes para o mesmo resultado, e o diff contra o padrão
 * acusaria mudança onde nada mudou.
 */
const ORDEM: Marca[] = ['destaque', 'negrito', 'italico']

export const DELIMITADOR: Record<Marca, { abre: string; fecha: string }> = {
  destaque: { abre: '[[', fecha: ']]' },
  negrito: { abre: '**', fecha: '**' },
  italico: { abre: '__', fecha: '__' },
}

/**
 * Analisador com pilha.
 *
 * `[[` e `]]` são distintos, então abrem e fecham sem ambiguidade.
 * `**` e `__` são simétricos: valem como fechamento quando a marca já
 * está aberta, e como abertura quando não está. É a mesma regra do
 * Markdown, e é a que corresponde ao que a pessoa faz no editor.
 */
export function interpretar(texto: string): Trecho[] {
  const saida: Trecho[] = []
  const abertas: Marca[] = []
  let buffer = ''
  let i = 0

  const despejar = () => {
    if (!buffer) return
    saida.push({ texto: buffer, marcas: ordenar(abertas) })
    buffer = ''
  }

  while (i < texto.length) {
    const par = texto.slice(i, i + 2)
    let mexeu = false

    if (par === ']]' && abertas.includes('destaque')) {
      despejar()
      abertas.splice(abertas.indexOf('destaque'), 1)
      mexeu = true
    } else if (par === '[[' && !abertas.includes('destaque')) {
      despejar()
      abertas.push('destaque')
      mexeu = true
    } else {
      for (const marca of ['negrito', 'italico'] as const) {
        if (par !== DELIMITADOR[marca].abre) continue
        despejar()
        const emAberto = abertas.indexOf(marca)
        if (emAberto >= 0) abertas.splice(emAberto, 1)
        else abertas.push(marca)
        mexeu = true
        break
      }
    }

    if (mexeu) {
      i += 2
      continue
    }

    buffer += texto[i]
    i += 1
  }

  despejar()
  return saida
}

function ordenar(marcas: Marca[]): Marca[] {
  return ORDEM.filter((m) => marcas.includes(m))
}

/** Tira toda a marcação. Para <title>, alt, aria-label e cartão de link. */
export function semMarcacao(texto: string): string {
  return interpretar(texto)
    .map((t) => t.texto)
    .join('')
}

/** Quantos caracteres a pessoa VÊ — a contagem que o limite do campo usa. */
export function tamanhoVisivel(texto: string): number {
  return semMarcacao(texto).length
}

/**
 * Trechos → string, abrindo e fechando só o que muda entre um e outro.
 *
 * Escrever a marcação por trecho produziria `**a****b**` para dois
 * trechos vizinhos em negrito — que o analisador leria como negrito,
 * fim de negrito, negrito de novo. Correto por acaso, ilegível de
 * propósito, e diferente da string original.
 */
export function serializar(trechos: Trecho[]): string {
  let saida = ''
  let abertas: Marca[] = []

  for (const trecho of trechos) {
    if (!trecho.texto) continue
    const querer = ordenar(trecho.marcas)

    // Fecha em ordem inversa tudo que não continua valendo.
    for (let i = abertas.length - 1; i >= 0; i--) {
      if (!querer.includes(abertas[i])) {
        // Fechar uma marca do meio da pilha exige fechar as de dentro
        // antes; reabri-las depois é o que o laço seguinte faz.
        for (let j = abertas.length - 1; j >= i; j--) saida += DELIMITADOR[abertas[j]].fecha
        abertas = abertas.slice(0, i)
      }
    }

    for (const marca of querer) {
      if (!abertas.includes(marca)) {
        saida += DELIMITADOR[marca].abre
        abertas.push(marca)
      }
    }

    saida += trecho.texto
  }

  for (let i = abertas.length - 1; i >= 0; i--) saida += DELIMITADOR[abertas[i]].fecha
  return saida
}

/**
 * Sobrou delimitador aberto e não fechado?
 *
 * Isso deixaria os símbolos VISÍVEIS na página — o defeito que ninguém
 * enxerga no painel e todo mundo enxerga no site.
 */
export function marcacaoQuebrada(texto: string): Marca | null {
  const abertas: Marca[] = []
  let i = 0

  while (i < texto.length) {
    const par = texto.slice(i, i + 2)
    if (par === ']]' && abertas.includes('destaque')) {
      abertas.splice(abertas.indexOf('destaque'), 1)
      i += 2
      continue
    }
    if (par === '[[' && !abertas.includes('destaque')) {
      abertas.push('destaque')
      i += 2
      continue
    }
    let mexeu = false
    for (const marca of ['negrito', 'italico'] as const) {
      if (par !== DELIMITADOR[marca].abre) continue
      const em = abertas.indexOf(marca)
      if (em >= 0) abertas.splice(em, 1)
      else abertas.push(marca)
      mexeu = true
      break
    }
    i += mexeu ? 2 : 1
  }

  if (abertas.length > 0) return abertas[abertas.length - 1]
  // `]]` sem `[[` antes não entra na pilha e passaria despercebido.
  if (semMarcacao(texto).includes(']]')) return 'destaque'
  return null
}

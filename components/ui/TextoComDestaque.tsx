import type { ReactNode } from 'react'

/**
 * Renderiza texto com trechos em destaque, marcados com [[colchetes duplos]].
 *
 * O PROBLEMA QUE ISTO RESOLVE
 * Oito títulos do site estavam reescritos em JSX para poder aplicar
 * <span> de cor — e as chaves correspondentes em content/copy.ts
 * ficavam mortas, ignoradas. Com o painel entrando, editar o título
 * pelo admin não mudaria nada na tela.
 *
 * POR QUE MARCAÇÃO NA STRING, E NÃO DOIS CAMPOS
 * "titulo" + "tituloDestaque" assume que o destaque está sempre no fim.
 * Falha em "Coloque o [[2233]] na sua foto.", onde ele está no meio.
 * Um array de segmentos seria correto, mas o formulário fica horrível.
 * A marcação resolve os dois: um campo, um input, destaque em qualquer
 * posição, quantos forem precisos.
 *
 * [[…]] porque nunca aparece na copy real — * colidiria com pontuação.
 *
 * ⚠️ NUNCA usar dangerouslySetInnerHTML aqui. Este texto vem do banco,
 *    e uma sessão de admin comprometida não pode virar script na página
 *    pública. O split devolve nós de React, não HTML.
 */

type Tom = 'amarelo' | 'azul' | 'grifo' | 'verde' | 'branco'

const CLASSES: Record<Tom, string> = {
  amarelo: 'text-amarelo',
  azul: 'text-azul',
  verde: 'text-verde-escuro',
  branco: 'text-white',
  grifo: 'grifo',
}

const MARCACAO = /\[\[(.+?)\]\]/g

export function TextoComDestaque({
  texto,
  tom = 'azul',
}: {
  texto: string
  /** Cor do trecho destacado. Sobre fundo escuro use 'amarelo'. */
  tom?: Tom
}): ReactNode {
  if (!texto.includes('[[')) return texto

  const partes: ReactNode[] = []
  let ultimo = 0
  let n = 0

  for (const achado of texto.matchAll(MARCACAO)) {
    const inicio = achado.index ?? 0
    if (inicio > ultimo) partes.push(texto.slice(ultimo, inicio))
    partes.push(
      <span key={`d${n++}`} className={CLASSES[tom]}>
        {achado[1]}
      </span>,
    )
    ultimo = inicio + achado[0].length
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))

  return partes
}

/** Tira a marcação. Para <title>, alt, aria-label e OG. */
export function semDestaque(texto: string): string {
  return texto.replace(MARCACAO, '$1')
}

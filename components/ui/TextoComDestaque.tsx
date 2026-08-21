import type { ReactNode } from 'react'
import { interpretar, semMarcacao, type Marca } from '@/lib/texto/marcacao'

/**
 * O RENDERIZADOR DE TEXTO DO SITE.
 *
 * Toda string que a campanha pode editar passa por aqui. As três marcas
 * — destaque, negrito e itálico — combinam entre si.
 *
 * ⚠️ TODO TEXTO EDITÁVEL, e não só os títulos. Na primeira versão só os
 *    títulos passavam pelo interpretador, e o resultado foi um defeito
 *    reportado no mesmo dia: negrito aplicado num parágrafo aparecia
 *    como `**negrito**` na página, com os asteriscos e tudo. O painel
 *    oferecia uma formatação que metade da página não sabia desenhar.
 *
 *    A regra agora é simples: se o campo é editável, o texto passa por
 *    este componente. Sem marca nenhuma ele devolve a string intacta,
 *    então usar não custa nada.
 *
 * ⚠️ NUNCA usar dangerouslySetInnerHTML aqui. Este texto vem do banco,
 *    e uma sessão de admin comprometida não pode virar script na página
 *    pública da campanha. O interpretador devolve nós de React — o que
 *    não for uma das três marcas é texto literal.
 */

type Tom = 'amarelo' | 'azul' | 'grifo' | 'verde' | 'branco' | 'capa'

const CLASSES: Record<Tom, string> = {
  amarelo: 'text-amarelo',
  azul: 'text-azul',
  verde: 'text-verde-escuro',
  branco: 'text-white',
  grifo: 'grifo',
  // A primeira dobra tem seis esquemas de cor, e o realce muda com
  // eles. `realce-capa` lê a variável que o esquema define — assim o
  // componente não precisa saber quantos esquemas existem.
  capa: 'realce-capa',
}

export function TextoComDestaque({
  texto,
  tom = 'azul',
}: {
  texto: string
  /** Cor do trecho destacado. Sobre fundo escuro use 'amarelo'. */
  tom?: Tom
}): ReactNode {
  const trechos = interpretar(texto)
  // Nada marcado: devolve a string, sem embrulhar em nó nenhum.
  if (trechos.length === 1 && trechos[0].marcas.length === 0) return trechos[0].texto
  if (trechos.length === 0) return texto

  return trechos.map((t, i) => <span key={i}>{vestir(t.texto, t.marcas, tom)}</span>)
}

/**
 * Embrulha o texto nas etiquetas das marcas, de fora para dentro.
 *
 * <strong> e <em>, e não <b>/<i>: a diferença é semântica e chega ao
 * leitor de tela, que muda a ênfase da voz.
 */
function vestir(texto: string, marcas: Marca[], tom: Tom): ReactNode {
  let no: ReactNode = texto
  // De dentro para fora, para o destaque (que carrega a cor) terminar
  // por último e valer sobre o conjunto.
  for (const marca of [...marcas].reverse()) {
    if (marca === 'italico') no = <em>{no}</em>
    else if (marca === 'negrito') no = <strong>{no}</strong>
    else no = <span className={CLASSES[tom]}>{no}</span>
  }
  return no
}

/** Tira a marcação. Para <title>, alt, aria-label e OG. */
export const semDestaque = semMarcacao

/**
 * Atalho para texto de corpo — parágrafo, descrição, legenda.
 *
 * É o mesmo renderizador com um nome que diz onde usar. Existe para
 * não haver desculpa: interpolar `{item.texto}` cru é o que produzia
 * asterisco visível na página.
 */
export function Texto({ children, tom }: { children: string; tom?: Tom }): ReactNode {
  return <TextoComDestaque texto={children} tom={tom} />
}

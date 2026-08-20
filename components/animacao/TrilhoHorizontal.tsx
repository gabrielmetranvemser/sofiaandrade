'use client'

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  /** Vai no aria-label da região rolável. Diga o que está no trilho. */
  rotulo: string
  children: ReactNode
  /** Onde o trilho deixa de rolar e vira grade. 'nunca' = sempre trilho. */
  quebra?: 'nunca' | 'md' | 'lg'
  /** <ol> quando a ordem dos itens significa alguma coisa. */
  ordenada?: boolean
  /**
   * Fundo em que o trilho está — mesma convenção do resto do site:
   * 'claro' é fundo claro, então os controles são escuros.
   */
  tom?: 'claro' | 'escuro'
  /** Classes da pista: gap e, depois da quebra, as colunas da grade. */
  className?: string
}

/**
 * Trilho horizontal com scroll-snap nativo.
 *
 * A rolagem é 100% CSS — toque, trackpad, roda e teclado funcionam
 * mesmo que este componente não hidrate. O JavaScript daqui só acende
 * os pontinhos e habilita as setas; nada essencial depende dele.
 *
 * Acessibilidade, duas decisões:
 *  · o elemento que ROLA recebe tabindex e nome. Bloco que rola e não
 *    recebe foco é armadilha de teclado: dá para ver o conteúdo e não
 *    dá para chegar nele.
 *  · o role="region" vai no invólucro, não no <ul>. Pôr no <ul>
 *    apagaria o papel de lista, e o leitor de tela deixaria de
 *    anunciar "lista com 5 itens" — que é justamente a informação que
 *    falta quando o resto da fila está fora da tela.
 */
export function TrilhoHorizontal({
  rotulo,
  children,
  quebra = 'nunca',
  ordenada = false,
  tom = 'claro',
  className = '',
}: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const [ativo, setAtivo] = useState(0)
  // Para onde a última seta pediu. Não dá para derivar de `ativo`: dois
  // cliques seguidos acontecem antes de a rolagem suave terminar e antes
  // de o React repintar, então os dois leriam o mesmo índice e o trilho
  // andaria um card só. Só volta a acompanhar `ativo` quando a rolagem
  // pousa exatamente num ponto de snap — o que também cobre o arrasto.
  const destino = useRef(0)
  const [pode, setPode] = useState({ antes: false, depois: false })

  const total = Children.count(children)
  const Lista = ordenada ? 'ol' : 'ul'

  const medir = useCallback(() => {
    const el = scroller.current
    if (!el) return

    const x = el.scrollLeft
    const limite = el.scrollWidth - el.clientWidth

    // Tolerância de 2px: zoom de navegador e telas fracionárias deixam
    // scrollLeft com resto, e a seta ficaria acesa no fim do trilho.
    setPode({ antes: x > 2, depois: x < limite - 2 })

    // Item ativo pela distância, não por divisão: os cards podem ter
    // larguras diferentes, e o primeiro e o último costumam ter.
    let melhor = 0
    let menor = Infinity
    posicoes(el).forEach((pos, i) => {
      const d = Math.abs(pos - x)
      if (d < menor) {
        menor = d
        melhor = i
      }
    })
    // Nas pontas, manda o limite e não a distância. Os últimos cartões
    // nunca chegam a encostar na borda esquerda — não há trilho
    // sobrando para isso — e sem esta correção os dois últimos
    // pontinhos jamais acendiam, por mais que a pessoa arrastasse.
    if (x >= limite - 2 && limite > 0) melhor = total - 1
    else if (x <= 2) melhor = 0

    setAtivo(melhor)
    if (menor < 2 || x <= 2 || x >= limite - 2) destino.current = melhor
  }, [total])

  useEffect(() => {
    const el = scroller.current
    if (!el) return

    medir()
    el.addEventListener('scroll', medir, { passive: true })

    // Observar o tamanho cobre dois casos que o resize da janela não
    // cobre: a quebra para grade e um card que cresce ao carregar foto.
    const ro = new ResizeObserver(medir)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', medir)
      ro.disconnect()
    }
  }, [medir, total])

  const irPara = (i: number) => {
    const el = scroller.current
    if (!el) return
    const pos = posicoes(el)[i]
    if (pos === undefined) return
    destino.current = i
    el.scrollTo({ left: pos })
  }

  const andar = (dir: -1 | 1) =>
    irPara(Math.min(total - 1, Math.max(0, destino.current + dir)))

  return (
    <div data-trilho={quebra} className="relative">
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label={rotulo}
        // A sangria leva o trilho até a borda da tela no celular, que é
        // o que dá a leitura de "tem mais coisa aí". O scroll-padding
        // devolve o alinhamento no snap.
        className="trilho -mx-5 scroll-px-5 px-5 pb-2 md:-mx-2 md:scroll-px-2 md:px-2"
      >
        <Lista className={`trilho-pista ${className}`}>{children}</Lista>
      </div>

      <div
        // Tudo à esquerda de propósito: o botão flutuante do WhatsApp
        // mora fixo no canto inferior direito, e setas encostadas na
        // borda direita ficam debaixo dele sempre que a fileira de
        // controles calha de parar no rodapé da tela.
        className={`trilho-controles mt-7 flex items-center gap-6 ${
          tom === 'escuro' ? 'text-white' : 'text-azul-escuro'
        }`}
      >
        {/* Pontinhos: posição no trilho e atalho. Em tela de toque são o
            único indicador de que existe mais coisa à direita. */}
        <div className="flex items-center gap-1">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ir para o item ${i + 1} de ${total}`}
              aria-current={i === ativo}
              className="group inline-flex size-11 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full bg-current transition-all duration-300 ${
                  i === ativo ? 'w-7 opacity-100' : 'w-1.5 opacity-30 group-hover:opacity-60'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Setas só onde existe ponteiro: no toque ocupam espaço e
            ninguém usa — arrasta-se o dedo. */}
        <div className="hidden items-center gap-2 [@media(pointer:fine)]:flex">
          <Seta direcao="anterior" ativo={pode.antes} aoClicar={() => andar(-1)} />
          <Seta direcao="proximo" ativo={pode.depois} aoClicar={() => andar(1)} />
        </div>
      </div>
    </div>
  )
}

/**
 * Deslocamento de cada item dentro da pista — que é exatamente o
 * scrollLeft que alinha aquele item.
 *
 * Medido contra a pista, não contra o scroller: a sangria negativa e o
 * padding do scroller entram no offsetLeft e desalinhariam tudo em
 * 20px. Item e pista dividem o mesmo offsetParent, então a subtração
 * cancela o que houver antes deles.
 */
function posicoes(scroller: HTMLElement): number[] {
  const pista = scroller.firstElementChild as HTMLElement | null
  if (!pista) return []
  const base = pista.offsetLeft
  return (Array.from(pista.children) as HTMLElement[]).map((el) => el.offsetLeft - base)
}

function Seta({
  direcao,
  ativo,
  aoClicar,
}: {
  direcao: 'anterior' | 'proximo'
  ativo: boolean
  aoClicar: () => void
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={!ativo}
      aria-label={direcao === 'anterior' ? 'Item anterior' : 'Próximo item'}
      className="toque inline-flex size-12 items-center justify-center rounded-full border border-current/25 transition-colors duration-300 hover:border-current/60 hover:bg-current/10 disabled:pointer-events-none disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {direcao === 'anterior' ? <path d="M19 12H5M11 18l-6-6 6-6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
      </svg>
    </button>
  )
}

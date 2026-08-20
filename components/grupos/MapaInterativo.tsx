'use client'

import { useRef, useState, type ReactNode } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { evento, caminhoDoGrupo, useSessao } from '@/lib/eventos'

interface Cidade {
  slug: string
  nome: string
  status: string
  disponivel: boolean
}

interface Rotulo extends Cidade {
  x: number
  y: number
}

/**
 * A camada de interação do mapa.
 *
 * Não conhece um único contorno: recebe o SVG pronto do servidor e
 * trabalha por DELEGAÇÃO, lendo os data-* do bloco em que a pessoa
 * tocou. É o que permite os 32 kB de coordenadas descerem como HTML em
 * vez de virarem JavaScript — ver o comentário de MapaRondonia.tsx.
 *
 * O rótulo é posicionado a partir do retângulo do PRÓPRIO bloco, e não
 * da posição do ponteiro: ancorado no bloco ele fica parado enquanto o
 * dedo ou o mouse se mexem por dentro, que é o que faz parecer parte do
 * mapa em vez de um balão perseguindo o cursor.
 *
 * SOBRE TECLADO, dito na cara: o mapa é ponteiro e toque. Deixar os 52
 * blocos focáveis colocaria 52 paradas de tabulação no meio da página,
 * e marcá-los como botões dentro de um <svg role="img"> seria mentira —
 * role="img" já esconde os filhos da tecnologia assistiva. O caminho
 * equivalente existe e fica do lado: a busca e o "ver todos", que abrem
 * a folha com os 52 como links de verdade. Mesma função, rota
 * diferente — que é o acordo aceitável aqui.
 *
 * Um toque escolhe; NÃO entra no grupo direto. Alvo pequeno em mapa se
 * erra com facilidade, e mandar alguém para o WhatsApp da cidade errada
 * é pior que pedir uma confirmação.
 */
export function MapaInterativo({ children }: { children: ReactNode }) {
  const { grupos: copy } = useConteudo()
  const sessao = useSessao()
  const area = useRef<HTMLDivElement>(null)
  const [escolhida, setEscolhida] = useState<Cidade | null>(null)
  const [rotulo, setRotulo] = useState<Rotulo | null>(null)

  function blocoDoEvento(e: React.PointerEvent | React.MouseEvent): SVGGElement | null {
    return (e.target as Element).closest('g[data-slug]') as SVGGElement | null
  }

  function lerCidade(bloco: SVGGElement): Cidade {
    return {
      slug: bloco.dataset.slug ?? '',
      nome: bloco.dataset.nome ?? '',
      status: bloco.dataset.status ?? 'em_breve',
      disponivel: bloco.dataset.disponivel === '1',
    }
  }

  function aoEntrar(e: React.PointerEvent<HTMLDivElement>) {
    const bloco = blocoDoEvento(e)
    const caixa = area.current
    if (!bloco || !caixa) return

    const b = bloco.getBoundingClientRect()
    const c = caixa.getBoundingClientRect()
    setRotulo({
      ...lerCidade(bloco),
      x: b.left - c.left + b.width / 2,
      y: b.top - c.top - 8,
    })
  }

  function aoTocar(e: React.MouseEvent<HTMLDivElement>) {
    const bloco = blocoDoEvento(e)
    if (!bloco) return

    const cidade = lerCidade(bloco)

    // Marca a escolhida na mão. É manipulação direta de nós que este
    // componente não renderizou — de propósito: o SVG veio do servidor
    // e re-renderizá-lo pelo React devolveria os 32 kB de coordenadas
    // para o JavaScript, que é justamente o que a separação evita.
    area.current
      ?.querySelectorAll('.escolhida')
      .forEach((el) => el.classList.remove('escolhida'))
    bloco.classList.add('escolhida')

    setEscolhida(cidade)

    if (!cidade.disponivel) {
      evento('entrou_grupo_indisponivel', { municipio_slug: cidade.slug, origem: 'mapa' })
    }
  }

  const selo = (status: string) =>
    status === 'aberto'
      ? { texto: copy.mapaLegendaAberto, classe: 'bg-verde text-white' }
      : status === 'cheio'
        ? { texto: copy.cheio, classe: 'bg-azul-escuro text-white' }
        : { texto: copy.emBreve, classe: 'bg-areia text-grafite ring-1 ring-linha' }

  return (
    <div>
      <div
        ref={area}
        onClick={aoTocar}
        onPointerMove={aoEntrar}
        onPointerLeave={() => setRotulo(null)}
        className="mapa-area-toque relative rounded-2xl border border-linha bg-white p-4 md:p-6"
        data-escolhida={escolhida?.slug}
      >
        {children}

        {rotulo ? (
          <span
            className="mapa-rotulo rounded-xl bg-azul-escuro px-3.5 py-2 text-center text-sm font-semibold text-white shadow-alta"
            style={{ left: rotulo.x, top: rotulo.y }}
            aria-hidden
          >
            {rotulo.nome}
            <span className="mt-0.5 block text-xs font-medium text-white/70">
              {selo(rotulo.status).texto}
            </span>
          </span>
        ) : null}
      </div>

      {/* Legenda. Curta: são três estados e um deles é "nada ainda". */}
      <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-grafite">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-[3px] bg-verde" aria-hidden />
          {copy.mapaLegendaAberto}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-[3px] bg-azul-escuro" aria-hidden />
          {copy.cheio}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-[3px] bg-[#dfe4e9]" aria-hidden />
          {copy.emBreve}
        </li>
      </ul>

      {/* A cidade escolhida. aria-live porque quem usa leitor de tela
          não vê o mapa mudar de cor — precisa ouvir o que foi escolhido. */}
      <div aria-live="polite" className="mt-4">
        {escolhida ? (
          <div className="cartao anima-etapa flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="min-w-0">
              <strong className="block truncate font-[family-name:var(--font-titulo)] text-xl font-bold tracking-[-0.02em]">
                {escolhida.nome}
              </strong>
              <span
                className={`mt-1.5 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${selo(escolhida.status).classe}`}
              >
                {selo(escolhida.status).texto}
              </span>
            </p>

            {escolhida.disponivel ? (
              <a
                href={caminhoDoGrupo(escolhida.slug, 'mapa', sessao)}
                className="toque inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-verde px-6 py-3 font-semibold text-white shadow-media transition-all hover:brightness-110"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Z" />
                </svg>
                {copy.sugestaoSim}
              </a>
            ) : (
              <span className="text-base text-grafite">{copy.avisoEmBreve}</span>
            )}
          </div>
        ) : (
          <p className="text-base text-grafite">{copy.mapaDica}</p>
        )}
      </div>
    </div>
  )
}

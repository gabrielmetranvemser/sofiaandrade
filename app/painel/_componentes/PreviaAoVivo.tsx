'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A PRÉVIA — O SITE DE VERDADE, DENTRO DO PAINEL.
 *
 * ⚠️ A PRIMEIRA VERSÃO ERA UMA MAQUETE e foi reprovada com razão. Ela
 *    desenhava um retângulo com a tipografia e as cores da seção e
 *    chamava aquilo de prévia. Só que "quase igual" é a pior coisa que
 *    uma prévia pode ser: quem olha acredita, e o que decide olhando
 *    para uma aproximação decide errado. Quebra de título, altura de
 *    bloco, foto que corta no lugar errado — nada disso aparecia.
 *
 *    Agora é a página real, servida pelo servidor real, dentro de um
 *    <iframe>. O que se vê aqui É o que está no ar.
 *
 * ⚠️ CELULAR OU COMPUTADOR, e isto não é enfeite: a maior parte de quem
 *    visita a página de uma campanha chega pelo telefone, e é lá que os
 *    problemas aparecem — o título que quebra em quatro linhas, o botão
 *    que sai da tela. A largura é a de verdade (375px), reduzida por
 *    transformação para caber na coluna: o layout dentro do quadro
 *    acontece em 375px reais, não numa janela estreita fingindo ser um
 *    telefone.
 *
 * ⚠️ ATUALIZA AO SALVAR, e não a cada tecla — e a razão é honesta:
 *    as seções do site são Server Components. Renderizá-las com o
 *    rascunho exigiria mandar o rascunho ao servidor a cada tecla e
 *    esperar a volta. Como salvar já republica o site na hora
 *    (`updateTag`), o ciclo real é: escreve, salva, vê. O quadro se
 *    recarrega sozinho no instante em que o salvamento termina.
 */

type Aparelho = 'celular' | 'computador'

const MEDIDAS: Record<Aparelho, { largura: number; altura: number; rotulo: string }> = {
  celular: { largura: 375, altura: 812, rotulo: 'Celular' },
  computador: { largura: 1280, altura: 800, rotulo: 'Computador' },
}

export function PreviaAoVivo({
  ancora,
  /** Muda a cada salvamento bem-sucedido: é o gatilho de recarga. */
  versao,
}: {
  ancora: string | null
  versao: number
}) {
  const [aparelho, setAparelho] = useState<Aparelho>('celular')
  const [carregando, setCarregando] = useState(true)
  const [manual, setManual] = useState(0)
  const caixa = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(1)

  const medida = MEDIDAS[aparelho]

  // A escala é medida do elemento, não calculada de um palpite: a
  // coluna muda de largura conforme a janela, e um número fixo deixaria
  // o quadro sobrando ou faltando em metade das telas.
  useEffect(() => {
    const el = caixa.current
    if (!el) return
    const medir = () => setEscala(Math.min(1, el.clientWidth / medida.largura))
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [medida.largura])

  useEffect(() => setCarregando(true), [versao, manual, aparelho])

  // `?previa=1` desliga o registro de métricas lá dentro: sem isso,
  // cada recarga do painel contaria como uma visita de verdade e
  // envenenaria o funil da campanha.
  const separador = (ancora ?? '/').includes('?') ? '&' : '?'
  const endereco = `${ancora ?? '/'}${separador}previa=1`.replace('#', `${separador}anc=`)
  const destino = ancora?.includes('#')
    ? `${ancora.split('#')[0]}?previa=1#${ancora.split('#')[1]}`
    : `${ancora ?? '/'}?previa=1`

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <h2 className="mr-auto text-xs font-semibold tracking-[0.1em] text-grafite uppercase">
          Prévia
        </h2>

        <div className="inline-flex rounded-full bg-areia p-0.5" role="group" aria-label="Tamanho de tela">
          {(Object.keys(MEDIDAS) as Aparelho[]).map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={aparelho === a}
              onClick={() => setAparelho(a)}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
                aparelho === a ? 'bg-white text-tinta shadow-suave' : 'text-grafite'
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                {a === 'celular' ? (
                  <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h10V4H7Zm4 14h2v1h-2v-1Z" />
                ) : (
                  <path d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm1 2v9h16V6H4Z" />
                )}
              </svg>
              {MEDIDAS[a].rotulo}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setManual((n) => n + 1)}
          title="Atualizar a prévia"
          aria-label="Atualizar a prévia"
          className="inline-flex size-8 items-center justify-center rounded-full text-grafite transition-colors hover:bg-areia hover:text-tinta"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z" />
          </svg>
        </button>
      </div>

      <div
        ref={caixa}
        className="relative overflow-hidden rounded-2xl border border-linha bg-white"
        style={{ height: medida.altura * escala }}
      >
        {carregando ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-xs text-grafite">
            carregando…
          </div>
        ) : null}

        <iframe
          key={`${aparelho}-${versao}-${manual}`}
          src={destino}
          title="Prévia da página"
          onLoad={() => setCarregando(false)}
          // O quadro é montado no tamanho REAL do aparelho e depois
          // reduzido. Encolher a largura em vez de escalar faria o site
          // usar o layout de tablet dentro de um desenho de telefone.
          style={{
            width: medida.largura,
            height: medida.altura,
            transform: `scale(${escala})`,
            transformOrigin: 'top left',
          }}
          className="border-0"
          // Sem `allow-same-origin` o painel não conseguiria nem ler
          // quando o quadro terminou de carregar; com ele, o conteúdo
          // continua sendo a nossa própria página.
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>

      <p className="mt-2 text-xs leading-relaxed text-grafite">
        É a página de verdade. Atualiza sozinha quando você salva.
      </p>
    </div>
  )
}

'use client'

import { useRef } from 'react'

/**
 * O campo dos títulos que têm uma palavra em outra cor.
 *
 * O PROBLEMA QUE ISTO RESOLVE
 * O destaque é guardado como [[colchetes duplos]] dentro do texto, e o
 * painel simplesmente mandava a pessoa digitar isso. Quem escreve a
 * copy da campanha não tem por que saber o que é um colchete duplo —
 * a instrução era jargão de programador escapando para a tela.
 *
 * Aqui a marcação some da cabeça de quem edita: seleciona a palavra,
 * toca em Destacar. O formato guardado continua exatamente o mesmo, e
 * quem já souber digitar [[assim]] continua podendo.
 *
 * A PRÉVIA é a outra metade. Sem ela, o campo pede um ato de fé: você
 * marca e só descobre o resultado publicando. Com ela, a palavra
 * aparece grifada ali, do lado, antes de salvar.
 */
export function CampoDestaque({
  id,
  valor,
  onMudar,
  invalido,
  descreve,
  className,
  multilinha = false,
  linhas = 1,
  rotuloAcessivel,
}: {
  id?: string
  valor: string
  onMudar: (v: string) => void
  invalido?: boolean
  descreve?: string
  className: string
  /** O título da primeira dobra é uma lista de linhas, e cada uma é textarea. */
  multilinha?: boolean
  linhas?: number
  rotuloAcessivel?: string
}) {
  const campo = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  function alternarDestaque() {
    const el = campo.current
    if (!el) return

    const inicio = el.selectionStart ?? 0
    const fim = el.selectionEnd ?? 0
    if (inicio === fim) {
      el.focus()
      return
    }

    const antes = valor.slice(0, inicio)
    const selecao = valor.slice(inicio, fim)
    const depois = valor.slice(fim)

    // Já destacado? Tira. Duas formas de estar: os colchetes dentro da
    // seleção, ou a seleção exatamente entre eles.
    if (selecao.startsWith('[[') && selecao.endsWith(']]')) {
      const limpo = selecao.slice(2, -2)
      onMudar(antes + limpo + depois)
      recolocar(el, inicio, inicio + limpo.length)
      return
    }
    if (antes.endsWith('[[') && depois.startsWith(']]')) {
      const novo = antes.slice(0, -2) + selecao + depois.slice(2)
      onMudar(novo)
      recolocar(el, inicio - 2, inicio - 2 + selecao.length)
      return
    }

    // Destaque não aninha: qualquer marcação dentro da seleção sai
    // antes de a nova entrar, senão vira [[a [[b]] c]] e o interpretador
    // fecha no colchete errado.
    const limpa = selecao.replace(/\[\[|\]\]/g, '')
    onMudar(`${antes}[[${limpa}]]${depois}`)
    recolocar(el, inicio + 2, inicio + 2 + limpa.length)
  }

  const props = {
    id,
    value: valor,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onMudar(e.target.value),
    className,
    'aria-invalid': Boolean(invalido),
    'aria-describedby': descreve,
    'aria-label': rotuloAcessivel,
  }

  const temMarcacao = valor.includes('[[')

  return (
    <div>
      {multilinha ? (
        <textarea ref={campo as React.RefObject<HTMLTextAreaElement>} rows={linhas} {...props} />
      ) : (
        <input type="text" ref={campo as React.RefObject<HTMLInputElement>} {...props} />
      )}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={alternarDestaque}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-linha bg-white px-3 text-sm font-medium transition-colors hover:border-azul/40 hover:text-azul"
        >
          <span
            className="inline-block size-3.5 rounded-[3px] bg-amarelo ring-1 ring-black/10"
            aria-hidden
          />
          Destacar seleção
        </button>
        <span className="text-xs text-grafite">
          Selecione a palavra no campo e toque aqui. Na página ela sai em outra cor.
        </span>
      </div>

      {temMarcacao ? (
        <p className="mt-2 rounded-lg bg-areia px-3 py-2 text-sm">
          <span className="mr-2 text-xs font-medium tracking-[0.08em] text-grafite uppercase">
            Fica assim
          </span>
          <Previa texto={valor} />
        </p>
      ) : null}
    </div>
  )
}

/** Só para o painel: mostra o trecho marcado com o grifo amarelo. */
function Previa({ texto }: { texto: string }) {
  const partes: React.ReactNode[] = []
  const marcacao = /\[\[(.+?)\]\]/g
  let ultimo = 0
  let n = 0

  for (const achado of texto.matchAll(marcacao)) {
    const i = achado.index ?? 0
    if (i > ultimo) partes.push(texto.slice(ultimo, i))
    partes.push(
      <mark key={n++} className="rounded bg-amarelo px-0.5 text-azul-escuro">
        {achado[1]}
      </mark>,
    )
    ultimo = i + achado[0].length
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo))

  return <span className="font-medium">{partes}</span>
}

/** Devolve o cursor para onde a pessoa estava, depois do React repintar. */
function recolocar(el: HTMLInputElement | HTMLTextAreaElement, inicio: number, fim: number) {
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(inicio, fim)
  })
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { interpretar, serializar, type Marca, type Trecho } from '@/lib/texto/marcacao'

/**
 * O EDITOR DE TEXTO COM BOTÕES — sem símbolo nenhum na tela.
 *
 * ⚠️ O PEDIDO: "é interessante evitar [[ ]] assim, é melhor um botão".
 *    E antes disso o campo já mostrava os colchetes crus: quem escreve
 *    a copy de uma campanha não tem por que saber o que é colchete
 *    duplo. Era jargão de programador escapando para a tela de quem
 *    escreve.
 *
 *    Agora é o que se espera de um editor: seleciona a palavra, aperta
 *    o botão, a palavra fica destacada ALI. O `[[…]]` continua sendo o
 *    formato guardado — só deixou de ser problema de quem edita.
 *
 * ⚠️ POR QUE `contentEditable` E NÃO O TIPTAP.
 *
 *    O Tiptap resolveria, e custaria ~150 kB e um modelo de documento
 *    novo. O que ele traz de valioso — tabelas, listas, âncoras,
 *    colaboração — não existe aqui: são TRÊS marcas que nunca aninham,
 *    num campo de no máximo 400 caracteres.
 *
 *    Mais importante: um editor genérico oferece vinte formatações e a
 *    página sabe desenhar três. As outras dezessete sumiriam em
 *    silêncio ao salvar, e quem editou só descobriria olhando o site.
 *    Barra de ferramentas que promete o que a página não cumpre é pior
 *    que barra nenhuma.
 *
 * ⚠️ O HTML AQUI DENTRO É NORMALIZADO A CADA TECLA. `contentEditable`
 *    aceita qualquer coisa: colar do Word traz <span style>, fontes,
 *    tabelas. Depois de cada mudança este componente varre a árvore e
 *    só deixa passar texto, <mark>, <strong> e <em> — tudo o mais
 *    vira texto puro. Nada além dessas três marcas chega ao banco.
 */

const NOS_PERMITIDOS: Record<string, Marca> = {
  MARK: 'destaque',
  STRONG: 'negrito',
  B: 'negrito',
  EM: 'italico',
  I: 'italico',
}

const TAG: Record<Marca, string> = {
  destaque: 'mark',
  negrito: 'strong',
  italico: 'em',
}

/** Marcação → HTML controlado. Nunca recebe HTML de fora. */
function paraHtml(valor: string): string {
  return interpretar(valor)
    .map((t) => {
      let corpo = escapar(t.texto)
      // De dentro para fora, para o HTML sair na mesma ordem canônica
      // em que a marcação foi escrita.
      for (const marca of [...t.marcas].reverse()) {
        corpo = `<${TAG[marca]}>${corpo}</${TAG[marca]}>`
      }
      return corpo
    })
    .join('')
}

function escapar(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * HTML do campo → marcação.
 *
 * Percorre os nós de verdade em vez de usar expressão regular sobre o
 * innerHTML: o navegador aninha como quer — `<strong><em>x</em></strong>`
 * hoje, `<em><strong>x</strong></em>` amanhã — e o que importa é o
 * CONJUNTO de marcas que cobre cada trecho, não a ordem em que o
 * navegador as empilhou. `serializar` devolve a ordem canônica.
 */
function paraMarcacao(raiz: HTMLElement): string {
  const trechos: Trecho[] = []

  const andar = (no: Node, herdadas: Marca[]) => {
    for (const filho of Array.from(no.childNodes)) {
      if (filho.nodeType === Node.TEXT_NODE) {
        const t = filho.textContent ?? ''
        if (t) trechos.push({ texto: t, marcas: herdadas })
        continue
      }
      if (filho.nodeType !== Node.ELEMENT_NODE) continue
      const el = filho as HTMLElement

      // <br> e <div> aparecem quando alguém aperta Enter. Neste editor
      // não existe parágrafo: o campo é uma linha de copy.
      if (el.tagName === 'BR') {
        trechos.push({ texto: ' ', marcas: herdadas })
        continue
      }

      const marca = NOS_PERMITIDOS[el.tagName]
      andar(el, marca && !herdadas.includes(marca) ? [...herdadas, marca] : herdadas)
    }
  }

  andar(raiz, [])
  return serializar(trechos).replace(/\s+/g, ' ')
}

/** Todas as marcas que cobrem a seleção — podem ser as três de uma vez. */
function marcasDaSelecao(raiz: HTMLElement): Marca[] {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return []
  let no: Node | null = sel.getRangeAt(0).commonAncestorContainer
  const achadas: Marca[] = []
  while (no && no !== raiz) {
    if (no.nodeType === Node.ELEMENT_NODE) {
      const marca = NOS_PERMITIDOS[(no as HTMLElement).tagName]
      if (marca && !achadas.includes(marca)) achadas.push(marca)
    }
    no = no.parentNode
  }
  return achadas
}

/** O <mark> que cobre a seleção, se houver. */
function marcaDestaqueDaSelecao(raiz: HTMLElement): HTMLElement | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  let no: Node | null = sel.getRangeAt(0).commonAncestorContainer
  while (no && no !== raiz) {
    if (no.nodeType === Node.ELEMENT_NODE && (no as HTMLElement).tagName === 'MARK') {
      return no as HTMLElement
    }
    no = no.parentNode
  }
  return null
}

export function EditorTexto({
  id,
  valor,
  onMudar,
  invalido,
  descreve,
  className,
  rotuloAcessivel,
  /** Marcas oferecidas. O destaque só existe onde a página o desenha. */
  marcas = ['negrito', 'italico'],
  placeholder,
  minAltura = '2.8rem',
}: {
  id?: string
  valor: string
  onMudar: (v: string) => void
  invalido?: boolean
  descreve?: string
  className: string
  rotuloAcessivel?: string
  marcas?: Marca[]
  placeholder?: string
  /** Altura mínima do campo. Um parágrafo não deve nascer com uma linha. */
  minAltura?: string
}) {
  const campo = useRef<HTMLDivElement>(null)
  const [ativas, setAtivas] = useState<Marca[]>([])
  const [focado, setFocado] = useState(false)

  // ⚠️ SÓ REESCREVE O HTML QUANDO O VALOR VEIO DE FORA. Reescrever a
  //    cada tecla destruiria a posição do cursor: o React repintaria o
  //    nó e o navegador jogaria o cursor para o início. Comparar com o
  //    que já está lá é o que mantém a digitação estável.
  useEffect(() => {
    const el = campo.current
    if (!el) return
    if (paraMarcacao(el) !== valor) el.innerHTML = paraHtml(valor)
  }, [valor])

  function aoEditar() {
    const el = campo.current
    if (!el) return
    limpar(el)
    onMudar(paraMarcacao(el))
    setAtivas(marcasDaSelecao(el))
  }

  /** Tira do campo tudo que não seja texto ou uma das três marcas. */
  function limpar(raiz: HTMLElement) {
    for (const el of Array.from(raiz.querySelectorAll('*'))) {
      const tag = el.tagName
      if (tag === 'BR') continue
      if (NOS_PERMITIDOS[tag]) {
        // Um <strong style="color:red"> continua sendo negrito, mas o
        // estilo colado junto não entra.
        for (const attr of Array.from(el.attributes)) el.removeAttribute(attr.name)
        continue
      }
      // Elemento desconhecido: some, e o texto dele fica.
      el.replaceWith(...Array.from(el.childNodes))
    }
  }

  /**
   * Liga ou desliga UMA marca sobre a seleção, sem tocar nas outras.
   *
   * ⚠️ AS TRÊS COMBINAM. A primeira versão trocava uma marca pela
   *    outra — aplicar negrito num trecho destacado tirava o destaque.
   *    Estava errado: "esta palavra em negrito E destacada" é o pedido
   *    mais natural que existe num título de campanha.
   */
  function alternar(marca: Marca) {
    const el = campo.current
    if (!el) return
    el.focus()

    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return

    if (marca === 'negrito' || marca === 'italico') {
      // `execCommand` é obsoleto na especificação e continua sendo o
      // único caminho que funciona em todos os navegadores para aplicar
      // marca sobre uma seleção mantendo o cursor. Ele já alterna
      // sozinho e já aninha com o que estiver ali.
      document.execCommand(marca === 'negrito' ? 'bold' : 'italic')
      aoEditar()
      return
    }

    // Destaque não tem comando nativo. `hiliteColor` produziria um span
    // com estilo, que a limpeza removeria — então o <mark> é montado e
    // desmontado à mão.
    const existente = marcaDestaqueDaSelecao(el)
    if (existente) {
      existente.replaceWith(...Array.from(existente.childNodes))
    } else {
      const intervalo = sel.getRangeAt(0)
      const nova = document.createElement('mark')
      nova.appendChild(intervalo.extractContents())
      intervalo.insertNode(nova)
      sel.removeAllRanges()
      const novo = document.createRange()
      novo.selectNodeContents(nova)
      sel.addRange(novo)
    }

    aoEditar()
  }

  const vazio = valor.length === 0

  return (
    <div>
      <div
        className={`flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 px-1.5 py-1.5 transition-colors ${
          focado ? 'border-azul/40 bg-white' : 'border-linha bg-areia'
        }`}
      >
        {marcas.map((m) => (
          <Botao
            key={m}
            marca={m}
            ativa={ativas.includes(m)}
            // `onMouseDown` com preventDefault: `onClick` viria depois
            // do blur, e o blur já teria descartado a seleção — o botão
            // não teria mais o que formatar.
            onAplicar={() => alternar(m)}
          />
        ))}
        <span className="ml-auto pr-1 text-[0.6875rem] text-grafite">
          Selecione o trecho e escolha
        </span>
      </div>

      <div className="relative">
        <div
          id={id}
          ref={campo}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="false"
          aria-label={rotuloAcessivel}
          aria-invalid={Boolean(invalido)}
          aria-describedby={descreve}
          onInput={aoEditar}
          onBlur={() => {
            setFocado(false)
            setAtivas([])
          }}
          onFocus={() => setFocado(true)}
          onKeyUp={() => setAtivas(marcasDaSelecao(campo.current!))}
          onMouseUp={() => setAtivas(marcasDaSelecao(campo.current!))}
          // Enter não cria linha: este campo é uma frase, e a quebra de
          // linha do título é decisão de tipografia, feita em outro lugar.
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault()
          }}
          // Colar entra como TEXTO PURO, sempre. É a defesa mais barata
          // contra o HTML do Word e do Google Docs.
          onPaste={(e) => {
            e.preventDefault()
            const t = e.clipboardData.getData('text/plain').replace(/\s+/g, ' ')
            document.execCommand('insertText', false, t)
          }}
          style={{ minHeight: minAltura }}
          className={`${className} rounded-t-none [&_mark]:rounded [&_mark]:bg-amarelo [&_mark]:px-0.5 [&_mark]:text-azul-escuro`}
        />
        {vazio && placeholder ? (
          <span className="pointer-events-none absolute inset-0 px-3 py-2.5 text-sm text-grafite/60">
            {placeholder}
          </span>
        ) : null}
      </div>
    </div>
  )
}

const DESENHO: Record<Marca, { rotulo: string; conteudo: React.ReactNode }> = {
  negrito: { rotulo: 'Negrito', conteudo: <span className="font-bold">N</span> },
  italico: { rotulo: 'Itálico', conteudo: <span className="font-serif italic">I</span> },
  destaque: {
    rotulo: 'Destaque',
    conteudo: <span className="size-3.5 rounded-[3px] bg-amarelo ring-1 ring-black/15" />,
  },
}

function Botao({
  marca,
  ativa,
  onAplicar,
}: {
  marca: Marca
  ativa: boolean
  onAplicar: () => void
}) {
  const { rotulo, conteudo } = DESENHO[marca]
  return (
    <button
      type="button"
      title={rotulo}
      aria-label={rotulo}
      aria-pressed={ativa}
      onMouseDown={(e) => {
        e.preventDefault()
        onAplicar()
      }}
      className={`inline-flex size-8 items-center justify-center rounded-lg text-sm transition-colors ${
        ativa ? 'bg-azul text-white' : 'text-grafite hover:bg-white hover:text-tinta'
      }`}
    >
      {conteudo}
    </button>
  )
}

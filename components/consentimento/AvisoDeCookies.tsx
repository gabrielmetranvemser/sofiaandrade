'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import type { Conteudo } from '@/lib/conteudo/tipos'
import { aoPedirEscolhas, salvarEscolha, useConsentimento } from '@/lib/consentimento-cliente'

type Textos = Conteudo['cookies']

/**
 * O AVISO DE COOKIES.
 *
 * ⚠️ ELE TRANCA DE VERDADE, não é faixa decorativa. Sem autorização de
 *    desempenho o Google Tag Manager não carrega (e com ele GA4 e
 *    Clarity); sem autorização de publicidade o pixel da Meta não
 *    carrega e o servidor não envia nada pela Conversions API. Ver
 *    `lib/consentimento.ts`.
 *
 * ⚠️ COMPACTO DE PROPÓSITO. O modelo que a campanha mandou (site do
 *    Flávio Bolsonaro) ocupa quase um terço da tela do celular. Aqui ele
 *    é um cartão baixo no pé da tela, que não cobre o botão do grupo
 *    em nenhuma das duas páginas de entrada: o botão fica na metade de
 *    cima, e o cartão tem uns 170 px. "Personalizar" abre as categorias
 *    só para quem pede.
 *
 * ⚠️ DOIS BOTÕES NA LINHA, E "PERSONALIZAR" COMO LINK. Medido num
 *    telefone de 360 px: "Aceitar todos", "Rejeitar opcionais" e
 *    "Personalizar" lado a lado não cabem, e os botões quebravam em duas
 *    linhas cada. Aceitar e rejeitar ficam com o mesmo tamanho e o mesmo
 *    peso de toque — rejeitar não pode dar mais trabalho que aceitar.
 *
 * ⚠️ O BOTÃO DE ACEITAR É AMARELO, e não verde como no modelo. Verde
 *    com texto branco em letra pequena não passa no contraste (3,4:1), e
 *    este é o botão que mais gente vai ler. Amarelo com azul-escuro dá
 *    6,4:1 e é a cor de ação do site.
 *
 * ⚠️ NÃO APARECE NO PAINEL NEM NA PRÉVIA DELE: cobriria a barra de
 *    salvar e a seção que se está editando, e a escolha feita ali
 *    valeria para o site inteiro.
 */
export function AvisoDeCookies({
  textos,
  politicaHref = '/politica-de-privacidade',
}: {
  textos: Textos
  politicaHref?: string
}) {
  const consentimento = useConsentimento()
  const [pedido, setPedido] = useState(false)
  const [personalizando, setPersonalizando] = useState(false)
  const [desempenho, setDesempenho] = useState(false)
  const [publicidade, setPublicidade] = useState(false)
  const [previa, setPrevia] = useState(false)
  const cartao = useRef<HTMLDivElement>(null)
  const tituloEscolhas = useRef<HTMLParagraphElement>(null)
  // Quem pediu as escolhas (o "Gerenciar cookies" do rodapé): o foco
  // volta para ele ao fechar, e não para o topo da página.
  const quemPediu = useRef<HTMLElement | null>(null)
  const id = useId()
  const noPainel = usePathname()?.startsWith('/painel') ?? false

  // "Gerenciar cookies", no rodapé ou na política, abre as escolhas já
  // com o que a pessoa tinha marcado.
  useEffect(
    () =>
      aoPedirEscolhas(() => {
        quemPediu.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        setPedido(true)
        setPersonalizando(true)
      }),
    [],
  )

  useEffect(() => {
    setPrevia(new URLSearchParams(window.location.search).has('previa'))
  }, [])

  // As escolhas trocam o conteúdo do cartão inteiro, e o botão que tinha
  // o foco some junto. Sem isto, quem usa teclado ou leitor de tela
  // voltaria ao começo da página. No aviso automático da primeira visita
  // o foco NÃO é puxado: seria interromper quem já estava lendo.
  useEffect(() => {
    if (personalizando) tituloEscolhas.current?.focus()
  }, [personalizando])

  useEffect(() => {
    if (!consentimento) return
    setDesempenho(consentimento.desempenho)
    setPublicidade(consentimento.publicidade)
  }, [consentimento])

  // Sem escolha ainda (`null`), o aviso aparece. Enquanto não se sabe
  // (`undefined`, no servidor e na hidratação), não.
  const aberto = !previa && !noPainel && (consentimento === null || pedido)

  // ⚠️ A ALTURA DO CARTÃO VAI PARA UMA VARIÁVEL CSS, e é por causa do
  //    botão flutuante do grupo: os dois moram no pé da tela, e sem
  //    isto o cartão cobriria o botão. O flutuante lê `--aviso-cookies`
  //    e sobe o que for preciso — ver BotaoFlutuante.
  useEffect(() => {
    const raiz = document.documentElement
    const el = cartao.current
    if (!aberto || !el) {
      raiz.style.removeProperty('--aviso-cookies')
      return
    }
    const medir = () => raiz.style.setProperty('--aviso-cookies', `${el.offsetHeight + 12}px`)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => {
      observador.disconnect()
      raiz.style.removeProperty('--aviso-cookies')
    }
  }, [aberto, personalizando])

  if (!aberto) return null

  const fechar = () => {
    setPedido(false)
    setPersonalizando(false)
    // Fechar sem salvar descarta o que foi mexido: reabrir mostra a
    // escolha que vale, e não a que ficou pela metade.
    setDesempenho(consentimento?.desempenho ?? false)
    setPublicidade(consentimento?.publicidade ?? false)
    quemPediu.current?.focus()
    quemPediu.current = null
  }
  const escolher = (d: boolean, p: boolean) => {
    salvarEscolha({ desempenho: d, publicidade: p })
    fechar()
  }

  const idTitulo = `${id}-titulo`

  return (
    <div
      ref={cartao}
      role="dialog"
      aria-modal="false"
      aria-labelledby={idTitulo}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && pedido) fechar()
      }}
      // A área segura do iPhone, como no BotaoFlutuante: sem ela os botões
      // ficam sobre a barra de gesto e o toque vira "voltar para o início".
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      className="anima-aviso fixed inset-x-3 z-[60] mx-auto max-h-[calc(100dvh-1.5rem)] max-w-5xl overflow-y-auto rounded-2xl bg-tinta/95 px-4 py-3.5 text-white shadow-alta ring-1 ring-amarelo/70 backdrop-blur-md sm:inset-x-4 sm:p-5"
    >
      {personalizando ? (
        <div>
          <div className="flex items-start justify-between gap-3">
            <p
              id={idTitulo}
              ref={tituloEscolhas}
              tabIndex={-1}
              className="text-base font-bold text-amarelo outline-none"
            >
              {textos.escolhasTitulo}
            </p>
            {/* Aberto por "Gerenciar cookies", o X fecha: a escolha antiga
                continua valendo. Aberto pelo aviso da primeira visita, ele
                só volta ao cartão — sair sem escolher não é uma escolha. */}
            <button
              type="button"
              onClick={pedido ? fechar : () => setPersonalizando(false)}
              aria-label={pedido ? 'Fechar' : 'Voltar'}
              className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-[0.8125rem] leading-snug text-white/80">{textos.escolhasTexto}</p>

          <ul className="mt-3 divide-y divide-white/10 rounded-xl bg-white/5 ring-1 ring-white/10">
            <Categoria titulo={textos.necessarios.titulo} texto={textos.necessarios.texto}>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85">
                {textos.sempreAtivos}
              </span>
            </Categoria>
            <Categoria titulo={textos.desempenho.titulo} texto={textos.desempenho.texto}>
              <Interruptor ligado={desempenho} aoMudar={setDesempenho} rotulo={textos.desempenho.titulo} />
            </Categoria>
            <Categoria titulo={textos.publicidade.titulo} texto={textos.publicidade.texto}>
              <Interruptor ligado={publicidade} aoMudar={setPublicidade} rotulo={textos.publicidade.titulo} />
            </Categoria>
          </ul>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => escolher(desempenho, publicidade)}
              className="toque min-h-11 flex-auto rounded-full bg-amarelo px-4 text-[0.9375rem] font-bold whitespace-nowrap text-azul-escuro sm:flex-none sm:px-6"
            >
              {textos.salvar}
            </button>
            <button
              type="button"
              onClick={() => escolher(true, true)}
              className="toque min-h-11 flex-auto rounded-full px-4 text-[0.9375rem] font-semibold whitespace-nowrap text-white ring-1 ring-white/40 hover:ring-white/80 sm:flex-none sm:px-6"
            >
              {textos.aceitar}
            </button>
          </div>
        </div>
      ) : (
        <div className="lg:flex lg:items-center lg:gap-6">
          <div className="min-w-0 flex-1">
            <p id={idTitulo} className="text-[0.9375rem] leading-snug font-bold text-amarelo">
              {textos.titulo}
            </p>
            <p className="mt-0.5 text-[0.8125rem] leading-snug text-white/80">{textos.texto}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.8125rem] font-semibold text-white">
              {/* `prefetch={false}`: o cartão aparece em toda primeira visita, e
                  pré-buscar a política gastaria banda de quem nem vai abri-la. */}
              <Link
                href={politicaHref}
                prefetch={false}
                className="inline-flex min-h-6 items-center underline underline-offset-2 hover:text-amarelo"
              >
                {textos.politica}
              </Link>
              <span aria-hidden className="text-white/60">
                ·
              </span>
              <button
                type="button"
                onClick={() => setPersonalizando(true)}
                className="inline-flex min-h-6 items-center underline underline-offset-2 hover:text-amarelo"
              >
                {textos.personalizar}
              </button>
            </p>
          </div>

          {/* `flex-wrap`: com um rótulo mais comprido vindo do painel, o
              segundo botão desce inteiro para a linha de baixo em vez de
              quebrar o texto no meio. */}
          <div className="mt-2.5 flex flex-wrap gap-2 lg:mt-0 lg:shrink-0 lg:flex-nowrap">
            <button
              type="button"
              onClick={() => escolher(true, true)}
              className="toque min-h-11 flex-auto rounded-full bg-amarelo px-4 text-[0.9375rem] font-bold whitespace-nowrap text-azul-escuro sm:flex-none sm:px-6"
            >
              {textos.aceitar}
            </button>
            <button
              type="button"
              onClick={() => escolher(false, false)}
              className="toque min-h-11 flex-auto rounded-full px-4 text-[0.9375rem] font-semibold whitespace-nowrap text-white ring-1 ring-white/40 hover:ring-white/80 sm:flex-none sm:px-6"
            >
              {textos.rejeitar}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Categoria({
  titulo,
  texto,
  children,
}: {
  titulo: string
  texto: string
  children: React.ReactNode
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{titulo}</span>
        <span className="block text-xs leading-snug text-white/75">{texto}</span>
      </span>
      {children}
    </li>
  )
}

function Interruptor({
  ligado,
  aoMudar,
  rotulo,
}: {
  ligado: boolean
  aoMudar: (v: boolean) => void
  rotulo: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={() => aoMudar(!ligado)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        ligado ? 'bg-amarelo' : 'bg-white/25'
      }`}
    >
      <span
        aria-hidden
        className={`inline-block size-5 rounded-full shadow transition-transform ${
          ligado ? 'translate-x-6 bg-azul-escuro' : 'translate-x-1 bg-white'
        }`}
      />
    </button>
  )
}

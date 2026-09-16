'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { buscarMunicipios, municipioMaisProximo, normalizar } from '@/lib/geo'
import { evento, caminhoDoGrupo, useSessao } from '@/lib/eventos'
import { achatarDestinos } from '@/lib/destinos'
import type { Destino, MunicipioComGrupo, OrigemClique, StatusGrupo } from '@/lib/tipos'

/**
 * Quantas sugestões aparecem de uma vez. Com o campo no topo, cinco é o
 * que cabe acima do teclado num celular de 812px — a sexta nasceria
 * atrás dele.
 */
const MAX_SUGESTOES = 5

/**
 * Onde o campo para quando ganha foco no celular: logo abaixo do
 * cabeçalho fixo. É o mesmo `scroll-padding-top` de globals.css.
 */
const TOPO_LIVRE = 96

interface Sugestao {
  destino: Destino
  /** Município que ancora um distrito. Ver `achatarDestinos`. */
  dentroDe?: string
  nome: string
}

interface Escolha {
  destino: Destino
  /** Por onde a cidade foi escolhida. Vai no /g/ e responde "qual caminho trabalha". */
  origem: OrigemClique
}

const toqueNaTela = () => window.matchMedia('(pointer: coarse)').matches

/**
 * ACHE O GRUPO DA SUA CIDADE.
 *
 * Dois jeitos de dizer onde mora — a localização do aparelho ou o nome
 * digitado — e, com a cidade escolhida, um botão só. Nada mais.
 *
 * ⚠️ POR QUE NÃO HÁ MAIS MODAL, MAPA NEM LISTA.
 *
 *    A versão anterior somava card de palpite por IP, mapa em relevo,
 *    lista de grupos abertos e uma folha de busca que subia do rodapé.
 *    A folha era o defeito no celular: sem altura fixa e presa ao pé da
 *    tela, ela encolhia a cada letra digitada. Com "vilh", o campo
 *    descia de y≈185 para y≈637 numa tela de 812 — exatamente para
 *    trás do teclado. A pessoa digitava e a busca sumia.
 *
 *    Aqui o campo mora na própria página e as sugestões nascem logo
 *    abaixo dele, no fluxo do documento. Não sobra camada nenhuma para
 *    o teclado cobrir.
 *
 * ⚠️ A CIDADE DO ANÚNCIO JÁ CHEGA ESCOLHIDA, e sem pergunta: quem
 *    clicou no anúncio de Vilhena já respondeu. O palpite por IP saiu
 *    junto com o resto — em rede móvel ele costuma apontar a capital, e
 *    um painel dizendo "Sua cidade: Porto Velho" para quem mora em
 *    Ji-Paraná é pior que painel nenhum.
 */
export function BuscadorDeGrupo({
  municipios,
  alvo = null,
  className = '',
}: {
  municipios: MunicipioComGrupo[]
  /** A cidade que veio no link do anúncio. Ver `lib/campanha/alvo.ts`. */
  alvo?: Destino | null
  className?: string
}) {
  const { grupos: copy, ctas } = useConteudo()
  const sessao = useSessao()
  const id = useId()
  const idCampo = `${id}-campo`
  const idLista = `${id}-lista`

  const campo = useRef<HTMLInputElement>(null)
  const painel = useRef<HTMLDivElement>(null)
  const timerBusca = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerFechar = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Invalida uma localização ainda a caminho quando a pessoa escolhe antes. */
  const pedidoGeo = useRef(0)
  /** Só a escolha feita agora rola até o painel; a do anúncio já nasce nele. */
  const levarAoPainel = useRef(false)

  const [escolha, setEscolha] = useState<Escolha | null>(
    alvo ? { destino: alvo, origem: 'anuncio' } : null,
  )
  const [termo, setTermo] = useState('')
  const [aberta, setAberta] = useState(false)
  const [ativa, setAtiva] = useState(-1)
  const [geo, setGeo] = useState<'ocioso' | 'carregando' | 'falhou'>('ocioso')

  // Distrito entra na busca igual a município: quem digita "Iata" acha
  // Iata, e não Guajará-Mirim, que é o município que o esconderia.
  const linhas = useMemo<Sugestao[]>(
    () => achatarDestinos(municipios).map((l) => ({ ...l, nome: l.destino.nome })),
    [municipios],
  )
  // E a sede puxa os seus distritos: quem é do Iata e digita "Guajará"
  // precisa ver que o Iata tem grupo próprio, e aberto, logo abaixo de
  // uma Guajará-Mirim que ainda está "em breve".
  const sugestoes = useMemo(() => {
    const achadas = buscarMunicipios(linhas, termo, MAX_SUGESTOES)
    return achadas
      .flatMap((s) => [
        s,
        ...linhas.filter((l) => l.dentroDe === s.nome && !achadas.includes(l)),
      ])
      .slice(0, MAX_SUGESTOES)
  }, [linhas, termo])
  const listaAberta = aberta && sugestoes.length > 0
  const semResultado = aberta && normalizar(termo).length >= 2 && sugestoes.length === 0

  useEffect(
    () => () => {
      if (timerBusca.current) clearTimeout(timerBusca.current)
      if (timerFechar.current) clearTimeout(timerFechar.current)
    },
    [],
  )

  // O painel nasce ACIMA do campo. No celular, quando o teclado fecha,
  // ele costuma ficar fora da tela — e é nele que está o botão.
  useEffect(() => {
    if (!levarAoPainel.current) return
    levarAoPainel.current = false
    const el = painel.current
    if (!el) return
    const { top, bottom } = el.getBoundingClientRect()
    if (top >= TOPO_LIVRE && bottom <= window.innerHeight) return
    window.scrollTo({ top: window.scrollY + top - TOPO_LIVRE })
  }, [escolha])

  function rotuloDoStatus(status: StatusGrupo) {
    if (status === 'aberto') return copy.aberto
    if (status === 'cheio') return copy.cheio
    return copy.emBreve
  }

  function escolher(destino: Destino, origem: OrigemClique) {
    pedidoGeo.current += 1
    levarAoPainel.current = true
    setEscolha({ destino, origem })
    setAberta(false)
    setAtiva(-1)
    setGeo('ocioso')
  }

  function escolherSugestao(s: Sugestao) {
    // A busca que terminou em escolha conta, mesmo quando o toque veio
    // antes da pausa que dispararia o evento.
    if (timerBusca.current) {
      clearTimeout(timerBusca.current)
      timerBusca.current = null
      evento('buscou_cidade')
    }
    if (!s.destino.disponivel) {
      evento('entrou_grupo_indisponivel', {
        municipio_slug: s.destino.municipioSlug ?? s.destino.slug,
        origem: 'busca',
      })
    }

    setTermo(s.destino.nome)
    escolher(s.destino, 'busca')

    // No celular, fecha o teclado: o que importa agora é o botão do
    // painel. No computador o foco fica onde está, para quem usa teclado.
    if (toqueNaTela()) campo.current?.blur()
  }

  function usarLocalizacao() {
    if (!('geolocation' in navigator)) {
      setGeo('falhou')
      return
    }
    const pedido = ++pedidoGeo.current
    setGeo('carregando')
    evento('usou_localizacao')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pedido !== pedidoGeo.current) return
        // O cálculo acontece aqui, no aparelho. A coordenada não sai
        // daqui e é descartada assim que a cidade é escolhida.
        const achado = municipioMaisProximo(municipios, pos.coords.latitude, pos.coords.longitude)
        if (!achado) {
          setGeo('falhou')
          return
        }
        setTermo('')
        escolher(achado.municipio, 'geo')
      },
      () => {
        if (pedido === pedidoGeo.current) setGeo('falhou')
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    )
  }

  function trocarCidade() {
    pedidoGeo.current += 1
    setEscolha(null)
    setTermo('')
    setGeo('ocioso')
    campo.current?.focus()
  }

  function aoDigitar(valor: string) {
    setTermo(valor)
    setAberta(true)
    setAtiva(-1)

    // Uma pessoa digitando "Ji-Paraná" não deve gerar oito eventos.
    if (timerBusca.current) clearTimeout(timerBusca.current)
    timerBusca.current = null
    if (normalizar(valor).length >= 3) {
      timerBusca.current = setTimeout(() => {
        timerBusca.current = null
        evento('buscou_cidade')
      }, 900)
    }
  }

  function aoFocar() {
    if (timerFechar.current) clearTimeout(timerFechar.current)
    // O nome já escolhido continua no campo, mas não é busca: reabrir a
    // lista com ele seria perguntar de novo o que acabou de ser respondido.
    if (termo !== escolha?.destino.nome) setAberta(true)

    if (!toqueNaTela()) return
    // ⚠️ O TECLADO COBRE A METADE DE BAIXO DA TELA, e as sugestões
    //    nascem embaixo do campo. Levar o campo para o topo, logo abaixo
    //    do cabeçalho, é o que deixa a lista à vista enquanto se digita.
    //    A espera é a do teclado terminar de subir: antes disso o
    //    navegador ainda está fazendo a rolagem dele.
    setTimeout(() => {
      const el = campo.current
      if (!el || document.activeElement !== el) return
      const { top } = el.getBoundingClientRect()
      if (Math.abs(top - TOPO_LIVRE) > 8) window.scrollTo({ top: window.scrollY + top - TOPO_LIVRE })
    }, 300)
  }

  function aoSair() {
    // Com folga: no toque, o campo pode perder o foco antes de o clique
    // chegar na sugestão, e fechar na hora apagaria a sugestão tocada.
    timerFechar.current = setTimeout(() => {
      setAberta(false)
      setAtiva(-1)
    }, 150)
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (sugestoes.length === 0) return
      e.preventDefault()
      setAberta(true)
      const ultima = sugestoes.length - 1
      setAtiva((i) =>
        e.key === 'ArrowDown' ? (i >= ultima ? 0 : i + 1) : i <= 0 ? ultima : i - 1,
      )
    } else if (e.key === 'Enter') {
      // Enter sem seta escolhe a primeira: "vilhena" + Enter resolve.
      const s = listaAberta ? (sugestoes[ativa] ?? sugestoes[0]) : undefined
      if (!s) return
      e.preventDefault()
      escolherSugestao(s)
    } else if (e.key === 'Escape' && aberta) {
      e.preventDefault()
      setAberta(false)
      setAtiva(-1)
    }
  }

  return (
    <div className={`rounded-xl border border-linha bg-white p-5 shadow-media sm:p-8 ${className}`}>
      {/* aria-live porque o painel aparece longe de onde a pessoa tocou:
          quem usa leitor de tela precisa ouvir qual cidade ficou. */}
      <div aria-live="polite">
        {escolha ? (
          <div ref={painel} className="anima-etapa mb-7 rounded-lg bg-azul-suave p-5 sm:p-6">
            <p className="etiqueta text-azul-escuro">{copy.cidadeTitulo}</p>
            <p className="mt-1.5 font-[family-name:var(--font-titulo)] text-[1.875rem] leading-[1.08] font-bold tracking-[-0.03em] text-balance text-tinta">
              {escolha.destino.nome}
            </p>

            {escolha.destino.disponivel ? (
              // <a> e não <Link>: /g/ é Route Handler, e a pré-busca do
              // <Link> contaria um clique no grupo sem ninguém ter tocado.
              <a
                href={caminhoDoGrupo(escolha.destino.slug, escolha.origem, sessao)}
                className="toque mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-azul-escuro px-6 py-3 text-left text-lg leading-snug font-semibold text-white shadow-media transition-colors hover:bg-azul-noite"
              >
                {/* O logo inteiro, com o telefone: é a última tela antes
                    do WhatsApp, e o símbolo diz para onde o toque leva. */}
                <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span>
                  {ctas.grupoDe} {escolha.destino.nome}
                </span>
              </a>
            ) : (
              // Sem grupo aberto, a cidade continua aparecendo, com o
              // porquê. Sumir com ela faria a pessoa achar que o site errou.
              <div className="mt-4">
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-semibold text-azul-escuro ring-1 ring-azul/20">
                  {rotuloDoStatus(escolha.destino.status)}
                </span>
                <p className="mt-2.5 text-base text-grafite">
                  {escolha.destino.status === 'cheio' ? copy.avisoCheio : copy.avisoEmBreve}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={trocarCidade}
              className="mt-3 inline-flex min-h-12 items-center text-base font-semibold text-grafite underline decoration-1 underline-offset-[6px] transition-colors hover:text-azul-escuro"
            >
              {copy.trocarCidade}
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={usarLocalizacao}
        disabled={geo === 'carregando'}
        className="toque flex min-h-14 w-full items-center justify-center gap-3 rounded-full border-2 border-azul-escuro bg-white px-5 text-lg font-semibold text-azul-escuro transition-colors hover:bg-azul-suave disabled:cursor-wait disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.25" fill="currentColor" stroke="none" />
          <path d="M12 1.75v3M12 19.25v3M1.75 12h3M19.25 12h3" />
        </svg>
        {geo === 'carregando' ? copy.botaoGeoCarregando : copy.botaoGeo}
      </button>

      {geo === 'falhou' ? (
        <p role="status" className="mt-3 text-base text-grafite">
          {copy.geoNegado}
        </p>
      ) : null}

      <label htmlFor={idCampo} className="mt-7 block text-base font-semibold text-grafite">
        {copy.rotuloBusca}
      </label>
      <input
        ref={campo}
        id={idCampo}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck={false}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listaAberta}
        aria-controls={idLista}
        aria-activedescendant={listaAberta && ativa >= 0 ? `${id}-opcao-${ativa}` : undefined}
        value={termo}
        onChange={(e) => aoDigitar(e.target.value)}
        onKeyDown={aoTeclar}
        onFocus={aoFocar}
        onBlur={aoSair}
        placeholder={copy.placeholderBusca}
        // 18px de fonte não é só leitura: abaixo de 16px o iPhone dá
        // zoom na página inteira quando o campo ganha foco.
        className="mt-2.5 min-h-14 w-full rounded-full border-2 border-grafite/20 bg-white px-5 text-lg text-tinta transition-[border-color,box-shadow] placeholder:text-grafite/55 focus:border-azul focus:ring-4 focus:ring-azul/15 focus:outline-hidden"
      />

      {/* A lista existe sempre, escondida quando vazia: o campo aponta
          para ela em aria-controls, e o endereço precisa existir. */}
      <ul
        id={idLista}
        role="listbox"
        aria-label={copy.rotuloBusca}
        hidden={!listaAberta}
        // Segura o foco no campo enquanto o mouse escolhe. Sem isto o
        // campo perde o foco no clique e a lista fecha antes da escolha.
        onMouseDown={(e) => e.preventDefault()}
        className="mt-2 grid gap-0.5 rounded-lg border border-linha bg-white p-1.5 shadow-media"
      >
        {sugestoes.map((s, i) => (
          <li
            key={s.destino.slug}
            id={`${id}-opcao-${i}`}
            role="option"
            aria-selected={i === ativa}
            onClick={() => escolherSugestao(s)}
            // A situação vai para baixo do nome no celular. Ao lado, ela
            // come metade da linha e "Nova Brasilândia d'Oeste" sai
            // cortada — e o nome é justamente o que a pessoa procura.
            className="flex min-h-13 cursor-pointer flex-col justify-center rounded-md px-4 py-1.5 transition-colors hover:bg-areia aria-selected:bg-azul-suave sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="min-w-0 text-lg leading-snug sm:flex-1">
              <span className="font-medium text-tinta">{s.destino.nome}</span>
              {s.dentroDe ? <span className="text-base text-grafite"> · {s.dentroDe}</span> : null}
            </span>
            <span
              className={`shrink-0 text-xs font-semibold tracking-[0.08em] uppercase ${
                s.destino.status === 'aberto' ? 'text-verde-escuro' : 'text-grafite'
              }`}
            >
              {rotuloDoStatus(s.destino.status)}
            </span>
          </li>
        ))}
      </ul>

      {semResultado ? (
        <p role="status" className="mt-3 text-base text-grafite">
          {copy.vazio}
        </p>
      ) : null}
    </div>
  )
}

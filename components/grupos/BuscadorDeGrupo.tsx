'use client'

import { useState, type ReactNode } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { municipiosMaisProximos } from '@/lib/geo'
import { evento } from '@/lib/eventos'
import type { MunicipioComGrupo } from '@/lib/tipos'
import { CardCidadeSugerida } from './CardCidadeSugerida'
import { FolhaDeCidades } from './FolhaDeCidades'
import { LinhaMunicipio } from './LinhaMunicipio'
import { Aviso } from '@/components/ui/Aviso'

interface Props {
  municipios: MunicipioComGrupo[]
  /** Sugestão silenciosa vinda do IP, resolvida no servidor. */
  sugerido?: MunicipioComGrupo | null
  /**
   * O mapa, montado no servidor e entregue pronto.
   *
   * Vem por prop, e não por import, porque este componente é cliente e
   * o mapa é servidor. Importá-lo aqui arrastaria 32 kB de coordenadas
   * para o bundle — passado como filho, desce como HTML.
   */
  mapa?: ReactNode
}

/**
 * Encontrar a sua cidade entre 52.
 *
 * A lista dos 52 saiu da página — eram 2.900px de altura no celular,
 * mais alta que a seção inteira, e ninguém rolava até o fim. Mas a
 * ressalva do plano continua valendo: o público é de 35 a 64 anos e
 * não caça botão escondido. Por isso a lista não virou accordion; ela
 * mudou de lugar, e a cidade certa aparece SEM CLIQUE nos caminhos
 * mais prováveis:
 *
 *   1. o IP, que a Vercel entrega de graça e não pede permissão
 *   2. o GPS, que quando autorizado mostra as SEIS mais próximas
 *   3. o mapa, para quem prefere apontar a digitar
 *   4. os grupos já abertos, quando nada acima resolveu
 *
 * Quem não se encaixar em nenhum continua a um toque da lista inteira,
 * que abre completa, sem accordion.
 *
 * Vale medir: buscou_cidade contra clicou_grupo por origem diz em duas
 * semanas se recolher a lista atrapalhou.
 */
export function BuscadorDeGrupo({ municipios, sugerido = null, mapa = null }: Props) {
  const { grupos: copy } = useConteudo()
  const [folhaAberta, setFolhaAberta] = useState(false)
  const [proximas, setProximas] = useState<{ m: MunicipioComGrupo; km: number }[] | null>(null)
  const [estadoGeo, setEstadoGeo] = useState<'ocioso' | 'carregando' | 'negado' | 'erro'>('ocioso')
  const [sugestaoDispensada, setDispensada] = useState(false)

  function usarLocalizacao() {
    if (!('geolocation' in navigator)) {
      setEstadoGeo('erro')
      return
    }
    setEstadoGeo('carregando')
    evento('usou_localizacao')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // O cálculo acontece aqui, no aparelho. A coordenada não sai
        // daqui e é descartada assim que a lista é montada.
        const achados = municipiosMaisProximos(
          municipios,
          pos.coords.latitude,
          pos.coords.longitude,
          6,
        )
        setProximas(achados.map((a) => ({ m: a.municipio, km: a.km })))
        setEstadoGeo('ocioso')
      },
      () => setEstadoGeo('negado'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    )
  }

  const disponiveis = municipios.filter((m) => m.disponivel)
  const abertos = disponiveis.length
  const primeirosAbertos = disponiveis.slice(0, 6)
  const mostrarSugestao = Boolean(sugerido) && !sugestaoDispensada && !proximas

  return (
    <div className="mt-12">
      {/* ── A cidade do IP, sem clique e sem permissão ── */}
      {mostrarSugestao && sugerido ? (
        <CardCidadeSugerida
          municipio={sugerido}
          origem="geo"
          onNaoEMinha={() => setDispensada(true)}
        />
      ) : null}

      {/* ── A cidade do GPS, quando autorizado ── */}
      {proximas && proximas[0] ? (
        <CardCidadeSugerida
          municipio={proximas[0].m}
          origem="geo"
          distanciaKm={proximas[0].km}
          onNaoEMinha={() => setProximas(null)}
        />
      ) : null}

      {/* Duas colunas no desktop: o mapa de um lado, o que é controle
          do outro. Empilhados somavam quase duas telas; lado a lado
          cabem numa.

          Na ordem do documento os controles vêm PRIMEIRO e o mapa
          depois, porque no celular a grade vira pilha — e quem chega
          querendo o grupo da própria cidade resolve mais rápido
          digitando. No desktop o lg:order devolve o mapa para a
          esquerda, que é onde o olho começa. */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10">
        {/* A coluna de controle.

            Tudo aqui usa a MESMA forma e o MESMO respiro: cartões de
            raio grande, empilhados com a mesma distância, e cada bloco
            aberto por uma etiqueta. A versão anterior misturava
            cápsulas de duas linhas com cápsulas de uma, alinhamento à
            esquerda com centralizado, e nenhum rótulo — três caixas
            brancas soltas que não diziam o que eram. */}
        <div className="lg:order-2">
          <p className="etiqueta text-azul-escuro">{copy.rotuloBusca}</p>

          {/* O campo é um BOTÃO, não um input: abre a folha, onde o
              campo de verdade vive junto com a lista. Digitar e
              procurar viram a mesma superfície, e no celular o teclado
              sobe sem empurrar a página. */}
          <button
            type="button"
            onClick={() => setFolhaAberta(true)}
            className="toque mt-3 flex min-h-16 w-full items-center gap-3 rounded-2xl border border-linha bg-white px-5 text-left text-lg text-grafite/70 shadow-suave transition-colors hover:border-azul/40 hover:text-grafite"
          >
            <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-azul" fill="currentColor" aria-hidden>
              <path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
            </svg>
            <span className="min-w-0 flex-1 truncate">{copy.placeholderBusca}</span>
          </button>

          {/* A localização é caminho secundário, então tem peso de
              link. Como cápsula do mesmo tamanho do campo, competia
              com ele e a coluna virava uma pilha de botões iguais. */}
          <button
            type="button"
            onClick={usarLocalizacao}
            disabled={estadoGeo === 'carregando'}
            className="mt-3 inline-flex min-h-11 items-center gap-2 font-medium text-azul underline decoration-1 underline-offset-[6px] transition-colors hover:text-azul-escuro disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            {estadoGeo === 'carregando' ? copy.botaoGeoCarregando : copy.botaoGeo}
          </button>

          {estadoGeo === 'negado' || estadoGeo === 'erro' ? (
            <Aviso tom="info" className="mt-4">
              {copy.geoNegado}
            </Aviso>
          ) : null}

          {/* Seis mais próximas, e não uma: em Rondônia a distância
              entre sedes é grande e quem mora no interior do município
              pode estar mais perto da sede vizinha. Mostrar só a
              primeira faria a pessoa concluir que o site errou. */}
          {proximas && proximas.length > 1 ? (
            <div className="mt-8">
              <p className="etiqueta text-azul-escuro">{copy.proximasTitulo}</p>
              <ul className="cartao mt-3 grid gap-1 p-2">
                {proximas.slice(1).map(({ m, km }) => (
                  <LinhaMunicipio key={m.slug} municipio={m} origem="geo" distanciaKm={km} />
                ))}
              </ul>
            </div>
          ) : null}

          {/* Sem isto, quem chega sem IP resolvido e não autoriza o GPS
              vê dois controles e nenhuma cidade. Este público não caça
              botão escondido: precisa de algo concreto para tocar, e
              grupos abertos são os únicos em que o toque leva a algum
              lugar. Some quando o GPS responde — ali a lista de perto
              é melhor. */}
          {!proximas && primeirosAbertos.length > 0 ? (
            <div className="mt-8">
              <p className="etiqueta text-azul-escuro">{copy.abertosTitulo}</p>
              <ul className="cartao mt-3 grid gap-1 p-2">
                {primeirosAbertos.map((m) => (
                  <LinhaMunicipio key={m.slug} municipio={m} origem="lista" />
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setFolhaAberta(true)}
            className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-azul underline decoration-1 underline-offset-[6px] transition-colors hover:text-azul-escuro"
          >
            {copy.verTodos}
            <span className="text-grafite no-underline">
              · <strong className="font-semibold text-verde">{abertos}</strong> {copy.abertos}
            </span>
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* ── O mapa ──
            A camada de apontar em vez de digitar, e a peça mais
            compartilhável da seção depois do filtro: "olha, minha
            cidade já tem grupo" vira print. */}
        {mapa ? (
          <div className="lg:order-1">
            <h3 className="text-xl">{copy.mapaTitulo}</h3>
            <div className="mt-3">{mapa}</div>
          </div>
        ) : null}
      </div>

      <FolhaDeCidades
        municipios={municipios}
        aberta={folhaAberta}
        onFechar={() => setFolhaAberta(false)}
      />
    </div>
  )
}

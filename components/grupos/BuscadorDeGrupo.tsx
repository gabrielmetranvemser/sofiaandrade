'use client'

import { useState } from 'react'
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
}

/**
 * Encontrar a sua cidade entre 52.
 *
 * A lista dos 52 saiu da página — eram 2.900px de altura no celular,
 * mais alta que a seção inteira, e ninguém rolava até o fim. Mas a
 * ressalva do plano continua valendo: o público é de 35 a 64 anos e
 * não caça botão escondido. Por isso a lista não virou accordion; ela
 * mudou de lugar, e a cidade certa aparece SEM CLIQUE nos dois
 * caminhos mais prováveis:
 *
 *   1. o IP, que a Vercel entrega de graça e não pede permissão
 *   2. o GPS, que quando autorizado mostra as SEIS mais próximas —
 *      porque em Rondônia a sede mais perto muitas vezes não é a
 *      cidade de quem está no interior do município
 *
 * Quem não se encaixar em nenhum dos dois continua a um toque da
 * lista inteira, que abre completa, sem accordion.
 *
 * Vale medir: buscou_cidade contra clicou_grupo por origem diz em duas
 * semanas se recolher a lista atrapalhou.
 */
export function BuscadorDeGrupo({ municipios, sugerido = null }: Props) {
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
      {/* ── 1. A cidade do IP, sem clique e sem permissão ── */}
      {mostrarSugestao && sugerido ? (
        <CardCidadeSugerida
          municipio={sugerido}
          origem="geo"
          onNaoEMinha={() => setDispensada(true)}
        />
      ) : null}

      {/* ── 2. A cidade do GPS, quando autorizado ── */}
      {proximas && proximas[0] ? (
        <CardCidadeSugerida
          municipio={proximas[0].m}
          origem="geo"
          distanciaKm={proximas[0].km}
          onNaoEMinha={() => setProximas(null)}
        />
      ) : null}

      {/* ── 3. Busca e localização ──
          O campo é um BOTÃO, não um input. Ele abre a folha, onde o
          campo de verdade vive junto com a lista — assim digitar e
          procurar na lista são a mesma superfície, e no celular o
          teclado sobe sem empurrar a página inteira. */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setFolhaAberta(true)}
          className="toque group flex min-h-16 flex-1 items-center gap-3 rounded-full border border-linha bg-white pr-5 pl-5 text-left shadow-suave transition-colors hover:border-azul/40"
        >
          <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-azul" fill="currentColor" aria-hidden>
            <path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
          </svg>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-lg font-medium">{copy.rotuloBusca}</span>
            <span className="block truncate text-sm text-grafite">{copy.placeholderBusca}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={usarLocalizacao}
          disabled={estadoGeo === 'carregando'}
          className="toque inline-flex min-h-16 shrink-0 items-center justify-center gap-2 rounded-full border border-linha bg-white px-6 font-medium text-azul shadow-suave transition-colors hover:border-azul/40 hover:bg-azul-suave disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
          </svg>
          {estadoGeo === 'carregando' ? copy.botaoGeoCarregando : copy.botaoGeo}
        </button>
      </div>

      {estadoGeo === 'negado' || estadoGeo === 'erro' ? (
        <Aviso tom="info" className="mt-4">
          {copy.geoNegado}
        </Aviso>
      ) : null}

      {/* ── 4. As seis mais próximas ──
          Seis, e não uma: em Rondônia a distância entre sedes é grande
          e quem mora no interior do município pode estar mais perto da
          sede vizinha. Mostrar só a primeira faria a pessoa concluir
          que o site errou. */}
      {proximas && proximas.length > 1 ? (
        <div className="mt-8">
          <h3 className="text-xl">{copy.proximasTitulo}</h3>
          <ul className="mt-4 grid gap-1 rounded-2xl border border-linha bg-white p-2 sm:grid-cols-2">
            {proximas.slice(1).map(({ m, km }) => (
              <LinhaMunicipio
                key={m.slug}
                municipio={m}
                origem="geo"
                distanciaKm={km}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {/* ── 5. Os grupos que já abriram ──
          Sem isto, quem chega e não tem IP resolvido nem autoriza o
          GPS vê três botões e nenhuma cidade. A ressalva do plano vale
          aqui: este público não caça botão escondido — precisa de algo
          concreto na tela para tocar. Grupos abertos são a resposta
          certa porque são os únicos em que o toque leva a algum lugar.

          Some quando o GPS responde: ali a lista de perto é melhor. */}
      {!proximas && primeirosAbertos.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-xl">{copy.abertosTitulo}</h3>
          <ul className="mt-4 grid gap-1 rounded-2xl border border-linha bg-white p-2 sm:grid-cols-2 lg:grid-cols-3">
            {primeirosAbertos.map((m) => (
              <LinhaMunicipio key={m.slug} municipio={m} origem="lista" />
            ))}
          </ul>
        </div>
      ) : null}

      {/* ── 6. A lista inteira, a um toque ── */}
      <button
        type="button"
        onClick={() => setFolhaAberta(true)}
        className="toque mt-8 flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-linha bg-white px-6 text-left shadow-suave transition-colors hover:border-azul/40"
      >
        <span>
          <span className="block text-lg font-medium">{copy.verTodos}</span>
          <span className="block text-sm text-grafite">
            <strong className="font-semibold text-verde">{abertos}</strong> {copy.abertos} ·{' '}
            {municipios.length} municípios
          </span>
        </span>
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-azul" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <FolhaDeCidades
        municipios={municipios}
        aberta={folhaAberta}
        onFechar={() => setFolhaAberta(false)}
      />
    </div>
  )
}

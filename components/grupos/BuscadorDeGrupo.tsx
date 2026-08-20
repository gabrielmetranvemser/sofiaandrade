'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { buscarMunicipios, municipioMaisProximo } from '@/lib/geo'
import { evento } from '@/lib/eventos'
import type { MunicipioComGrupo, OrigemClique } from '@/lib/tipos'
import { CardCidadeSugerida } from './CardCidadeSugerida'
import { ListaMunicipios } from './ListaMunicipios'
import { LinhaMunicipio } from './LinhaMunicipio'
import { Aviso } from '@/components/ui/Aviso'

interface Props {
  municipios: MunicipioComGrupo[]
  /** Sugestão silenciosa vinda do IP, resolvida no servidor. */
  sugerido?: MunicipioComGrupo | null
}

export function BuscadorDeGrupo({ municipios, sugerido = null }: Props) {
  const { grupos: copy } = useConteudo()
  const [termo, setTermo] = useState('')
  const [porGeo, setPorGeo] = useState<{ m: MunicipioComGrupo; km: number } | null>(null)
  const [estadoGeo, setEstadoGeo] = useState<'ocioso' | 'carregando' | 'negado' | 'erro'>('ocioso')
  const [sugestaoDispensada, setDispensada] = useState(false)
  const timerBusca = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resultados = useMemo(
    () => buscarMunicipios(municipios, termo, 6),
    [municipios, termo],
  )

  // Evento de busca com atraso: uma pessoa digitando "Ji-Paraná"
  // não deve gerar oito eventos.
  useEffect(() => {
    if (termo.trim().length < 3) return
    if (timerBusca.current) clearTimeout(timerBusca.current)
    timerBusca.current = setTimeout(() => evento('buscou_cidade'), 900)
    return () => {
      if (timerBusca.current) clearTimeout(timerBusca.current)
    }
  }, [termo])

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
        // daqui e é descartada assim que o município é escolhido.
        const achado = municipioMaisProximo(municipios, pos.coords.latitude, pos.coords.longitude)
        setPorGeo(achado ? { m: achado.municipio, km: achado.km } : null)
        setEstadoGeo('ocioso')
      },
      () => setEstadoGeo('negado'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    )
  }

  const mostrarSugestao = Boolean(sugerido) && !sugestaoDispensada && !porGeo && !termo

  return (
    <div className="mt-12">
      {/* ── 1. Sugestão silenciosa por IP ── */}
      {mostrarSugestao && sugerido ? (
        <CardCidadeSugerida
          municipio={sugerido}
          origem="geo"
          onNaoEMinha={() => setDispensada(true)}
        />
      ) : null}

      {/* ── Resultado da localização exata ── */}
      {porGeo ? (
        <CardCidadeSugerida
          municipio={porGeo.m}
          origem="geo"
          distanciaKm={porGeo.km}
          onNaoEMinha={() => setPorGeo(null)}
        />
      ) : null}

      {/* ── 3. Busca por nome, sempre visível ── */}
      <div className="mt-6 rounded-2xl border border-linha bg-white p-6 shadow-suave md:p-8">
        <label htmlFor="busca-cidade" className="block font-medium">
          {copy.rotuloBusca}
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-grafite"
              fill="currentColor"
              aria-hidden
            >
              <path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
            </svg>
            <input
              id="busca-cidade"
              type="search"
              inputMode="search"
              autoComplete="off"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder={copy.placeholderBusca}
              aria-describedby="busca-ajuda"
              className="min-h-14 w-full rounded-full border border-linha bg-areia pl-11 pr-4 text-lg transition-colors placeholder:text-grafite/60 focus:border-azul/40 focus:bg-white"
            />
          </div>

          {/* ── 2. Localização exata, secundária ── */}
          <button
            type="button"
            onClick={usarLocalizacao}
            disabled={estadoGeo === 'carregando'}
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full border border-linha bg-white px-6 font-medium text-azul shadow-suave transition-colors hover:border-azul/40 hover:bg-azul-suave disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            {estadoGeo === 'carregando' ? copy.botaoGeoCarregando : copy.botaoGeo}
          </button>
        </div>

        <p id="busca-ajuda" className="mt-3 text-sm text-grafite">
          Pode digitar sem acento. Ex.: “ji parana”, “sao miguel”.
        </p>

        {estadoGeo === 'negado' || estadoGeo === 'erro' ? (
          <Aviso tom="info" className="mt-4">
            {copy.geoNegado}
          </Aviso>
        ) : null}

        {/* Resultados da digitação */}
        {termo.trim().length >= 2 ? (
          <div className="mt-5" role="region" aria-live="polite" aria-label="Resultados da busca">
            {resultados.length > 0 ? (
              <ul className="grid gap-1 rounded-xl border border-linha p-2">
                {resultados.map((m) => (
                  <LinhaMunicipio key={m.slug} municipio={m} origem="busca" />
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-linha px-4 py-6 text-center text-grafite">
                {copy.vazio}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* ── 4. Lista dos 52, aberta, sem accordion ── */}
      <ListaMunicipios municipios={municipios} />
    </div>
  )
}

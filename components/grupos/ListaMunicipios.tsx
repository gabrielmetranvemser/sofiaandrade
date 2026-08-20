'use client'

import { grupos as copy } from '@/content/copy'
import type { MunicipioComGrupo } from '@/lib/tipos'
import { LinhaMunicipio } from './LinhaMunicipio'

/**
 * Os 52, abertos, sem accordion. Público mais velho não caça botão
 * escondido — isso é regra do plano, não preferência de layout.
 */
export function ListaMunicipios({ municipios }: { municipios: MunicipioComGrupo[] }) {
  const abertos = municipios.filter((m) => m.disponivel).length

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl">{copy.listaTitulo}</h3>
        <p className="text-sm text-grafite">
          {abertos} {abertos === 1 ? 'grupo aberto' : 'grupos abertos'} de {municipios.length}
        </p>
      </div>

      <ul className="mt-4 grid gap-1 rounded-2xl border border-linha bg-white p-2 sm:grid-cols-2 lg:grid-cols-3">
        {municipios.map((m) => (
          <LinhaMunicipio key={m.slug} municipio={m} origem="lista" />
        ))}
      </ul>
    </div>
  )
}

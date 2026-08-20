'use client'

import { useConteudo } from '@/lib/conteudo/contexto'
import { MOLDURAS, type FormatoMoldura, type Moldura } from '@/lib/molduras'

/**
 * MOLDURA PRIMEIRO, FOTO DEPOIS — inversão deliberada em relação à
 * referência. A pessoa vê o resultado possível antes de gastar esforço,
 * e sobe a foto já sabendo o que vai sair. Reduz abandono.
 */
export function SeletorDeMoldura({
  selecionada,
  onSelecionar,
}: {
  selecionada: Moldura
  onSelecionar: (m: Moldura) => void
}) {
  const { filtro: copy } = useConteudo()
  return (
    <fieldset>
      <legend className="text-sm font-semibold tracking-[0.06em] text-azul uppercase">
        1 · Escolha a moldura
      </legend>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {MOLDURAS.map((m) => {
          const ativa = m.id === selecionada.id
          const rotulo = copy.formatos[m.formato as FormatoMoldura]
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelecionar(m)}
              aria-pressed={ativa}
              className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                ativa
                  ? 'border-azul bg-azul-suave shadow-media'
                  : 'border-linha bg-white hover:border-azul/30 hover:shadow-suave'
              }`}
            >
              <span
                className="relative block w-full overflow-hidden bg-areia"
                style={{ aspectRatio: `${m.largura}/${m.altura}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.arquivo}
                  alt=""
                  className="absolute inset-0 size-full object-contain"
                  loading="lazy"
                />
              </span>
              <span className="p-4">
                <span className="block font-semibold">{rotulo.rotulo}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-grafite">
                  {rotulo.descricao}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

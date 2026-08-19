import { provas } from '@/content/copy'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { QuadroImagem } from '@/components/ui/QuadroImagem'
import { Aviso } from '@/components/ui/Aviso'

/**
 * ⚠️ Todos os números desta seção são placeholder até a campanha
 *    entregar os dados auditáveis. Ver content/copy.ts e PENDENCIAS.md.
 */
export function Provas() {
  return (
    <Secao id="provas" fundo="marinho" espaco="solto" className="overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 brilho-escuro opacity-70" />

      <div className="relative">
        <CabecalhoSecao
          etiqueta={provas.etiqueta}
          titulo={provas.titulo}
          intro={provas.intro}
          tom="escuro"
        />

        {/* Números */}
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {provas.numeros.map((n, i) => (
            <li
              key={n.texto}
              data-revelar
              style={{ ['--atraso' as string]: `${i * 80}ms` }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur-sm"
            >
              <span className="block font-[family-name:var(--font-titulo)] text-5xl font-bold tracking-[-0.04em] text-white tabular-nums">
                {n.valor}
              </span>
              <span className="mt-1 block text-sm font-medium text-amarelo">{n.unidade}</span>
              <p className="mt-3 text-base leading-relaxed text-white/65">{n.texto}</p>
            </li>
          ))}
        </ul>

        {/* Entregas */}
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {provas.entregas.map((e, i) => (
            <li
              key={i}
              data-revelar
              style={{ ['--atraso' as string]: `${i * 80}ms` }}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]"
            >
              <QuadroImagem
                proporcao="3/2"
                tom="escuro"
                raio="md"
                rotulo="Foto da entrega"
                nota="Obra, evento ou equipamento"
                className="rounded-none border-0 border-b border-white/10"
              />
              <div className="flex flex-1 flex-col p-6">
                <span className="text-sm font-medium text-amarelo">{e.municipio}</span>
                <h3 className="mt-2 text-xl text-white">{e.titulo}</h3>
                <p className="mt-2 flex-1 text-base text-white/65">{e.texto}</p>
                <span className="mt-5 inline-flex self-start rounded-full bg-white/10 px-4 py-1.5 font-[family-name:var(--font-titulo)] text-lg font-bold text-white tabular-nums">
                  {e.valor}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-start gap-3 rounded-lg bg-amarelo/10 px-5 py-4 text-base text-white/80 ring-1 ring-amarelo/25">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-amarelo" fill="currentColor" aria-hidden>
            <path d="M12 2 1 21h22L12 2Zm-1 7h2v6h-2V9Zm0 8h2v2h-2v-2Z" />
          </svg>
          <p>
            <strong className="font-semibold text-white">Seção em preenchimento. </strong>
            {provas.aviso}
          </p>
        </div>
      </div>
    </Secao>
  )
}

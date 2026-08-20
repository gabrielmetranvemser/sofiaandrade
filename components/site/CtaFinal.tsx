import { ctaFinal, ctas } from '@/content/copy'
import { BotaoLink } from '@/components/ui/Botao'
import { CliqueGrupo } from './CliqueGrupo'

export function CtaFinal({ silencio = false }: { silencio?: boolean }) {
  return (
    <section id="votar" className="relative isolate overflow-hidden bg-marinho py-24 text-white md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-escuro" />

      <div className="container-lp text-center">
        <h2 data-revelar className="titulo-cartaz text-white">
          {ctaFinal.titulo.map((linha, i) => (
            <span key={linha} className="block">
              {i === 1 ? (
                <span className="bg-gradient-to-r from-amarelo to-amarelo/70 bg-clip-text text-transparent">
                  {linha}
                </span>
              ) : (
                linha
              )}
            </span>
          ))}
        </h2>

        <p
          data-revelar
          style={{ ['--atraso' as string]: '120ms' }}
          className="mx-auto mt-7 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          {ctaFinal.texto}
        </p>

        {!silencio ? (
          <div
            data-revelar
            style={{ ['--atraso' as string]: '200ms' }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <CliqueGrupo origem="cta_final" className="contents">
              <span className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-white px-8 text-lg font-semibold text-marinho shadow-alta transition-all duration-300 hover:bg-amarelo">
                {ctaFinal.ctaPrimario}
              </span>
            </CliqueGrupo>

            <BotaoLink
              href="/filtro"
              variante="contorno"
              tamanho="lg"
              className="text-white"
            >
              {ctaFinal.ctaSecundario}
            </BotaoLink>
          </div>
        ) : (
          <p className="mx-auto mt-10 max-w-xl rounded-lg bg-white/10 px-5 py-4 ring-1 ring-white/15">
            {ctas.silencio}
          </p>
        )}

        <div
          data-revelar
          style={{ ['--atraso' as string]: '280ms' }}
          className="mx-auto mt-16 inline-flex flex-col items-center"
        >
          <span className="font-[family-name:var(--font-titulo)] text-[clamp(4rem,16vw,10rem)] font-extrabold leading-none tracking-[-0.05em] text-white/10 tabular-nums">
            2233
          </span>
        </div>
      </div>
    </section>
  )
}

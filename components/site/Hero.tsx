import { ctas, hero } from '@/content/copy'
import { Silhueta } from '@/components/ui/Silhueta'
import { BotaoLink } from '@/components/ui/Botao'
import { CliqueGrupo } from './CliqueGrupo'

/**
 * Primeira dobra.
 *
 * A regra que manda aqui: menos de 3 segundos até o botão principal
 * ficar clicável, num celular mediano em 4G. Por isso é Server
 * Component, sem imagem de fundo, sem biblioteca de animação — só CSS.
 */
export function Hero({ silencio = false }: { silencio?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-white pt-28 md:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-suave" />

      <div className="container-lp">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── Texto ── */}
          <div className="pb-12 lg:pb-24">
            <p className="anima-hero inline-flex items-center gap-2.5 rounded-full border border-azul/15 bg-white/70 px-4 py-2 text-[0.8125rem] font-semibold tracking-[0.04em] text-azul backdrop-blur">
              <span className="size-1.5 rounded-full bg-verde" aria-hidden />
              {hero.etiqueta}
            </p>

            <h1 className="mt-7 titulo-cartaz">
              {hero.titulo.map((linha, i) => (
                <span
                  key={linha}
                  className="anima-hero block"
                  style={{ animationDelay: `${100 + i * 80}ms` }}
                >
                  {i === hero.destaque ? <span className="text-azul">{linha}</span> : linha}
                </span>
              ))}
            </h1>

            <p
              className="anima-hero mt-7 max-w-xl text-lg text-grafite md:text-xl"
              style={{ animationDelay: '440ms' }}
            >
              {hero.subtitulo}
            </p>

            {!silencio ? (
              <div
                className="anima-hero mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
                style={{ animationDelay: '520ms' }}
              >
                <CliqueGrupo origem="hero" className="contents">
                  <span className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-azul px-8 text-lg font-semibold text-white shadow-media transition-all duration-300 hover:bg-marinho">
                    {ctas.grupo}
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </CliqueGrupo>

                <BotaoLink href="/filtro" variante="claro" tamanho="lg">
                  {ctas.filtroCurto}
                </BotaoLink>
              </div>
            ) : (
              <p className="anima-hero mt-9 max-w-xl rounded-lg bg-azul-suave px-5 py-4 text-marinho">
                {ctas.silencio}
              </p>
            )}

            <div
              className="anima-hero mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-grafite"
              style={{ animationDelay: '600ms' }}
            >
              <span className="inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="size-4 text-verde" fill="currentColor" aria-hidden>
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                </svg>
                {hero.rodapeHero}
              </span>
            </div>
          </div>

          {/* ── Foto ── */}
          <div className="anima-surge relative" style={{ animationDelay: '260ms' }}>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-azul-suave via-azul-suave/60 to-white ring-1 ring-azul/10 md:rounded-[2.75rem]">
              {/* Se a foto não chegar, o gradiente sozinho já sustenta. */}
              <Silhueta
                variante="meio-corpo"
                tom="claro"
                rotulo="Foto PNG · recorte sem fundo"
                className="h-[24rem] w-full sm:h-[30rem] lg:h-[34rem]"
              />
            </div>

            {/* Cartão flutuante com o número */}
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-linha bg-white/95 px-5 py-3.5 shadow-media backdrop-blur md:left-8">
              <span className="font-[family-name:var(--font-titulo)] text-3xl font-bold tracking-[-0.04em] text-azul tabular-nums">
                2233
              </span>
              <span className="text-xs leading-tight text-grafite">
                {hero.numeroLegenda}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

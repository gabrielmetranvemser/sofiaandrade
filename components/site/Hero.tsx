import { lerConteudo } from '@/lib/conteudo/ler'
import { Silhueta } from '@/components/ui/Silhueta'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'
import { Numero } from '@/components/ui/Marca'
import { BotaoLink } from '@/components/ui/Botao'
import { CliqueGrupo } from './CliqueGrupo'

/**
 * Primeira dobra — azul da campanha, com força.
 *
 * A regra que manda aqui: menos de 3 segundos até o botão principal
 * ficar clicável, num celular mediano em 4G. Por isso é Server
 * Component, sem imagem de fundo, sem biblioteca de animação — o
 * gradiente é CSS puro, num matiz só — do azul claro ao azul-noite.
 */
export async function Hero({ silencio = false }: { silencio?: boolean }) {
  const { ctas, hero } = await lerConteudo()

  return (
    <section className="relative isolate overflow-hidden fundo-azul pt-28 text-white md:pt-32">
      <div className="container-lp">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── Texto ── */}
          <div className="pb-14 lg:pb-24">
            <p className="anima-hero inline-flex items-center gap-2.5 rounded-full bg-white/12 px-4 py-2 text-[0.8125rem] font-semibold tracking-[0.06em] text-white ring-1 ring-white/25">
              <span className="size-1.5 rounded-full bg-amarelo" aria-hidden />
              {hero.etiqueta}
            </p>

            <h1 className="mt-7 titulo-cartaz text-white">
              {hero.titulo.map((linha, i) => (
                <span
                  key={i}
                  className="anima-hero block"
                  style={{ animationDelay: `${100 + i * 80}ms` }}
                >
                  <TextoComDestaque texto={linha} tom="amarelo" />
                </span>
              ))}
            </h1>

            <p
              className="anima-hero mt-7 max-w-xl text-lg text-white/80 md:text-xl"
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
                  <span className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-amarelo px-8 text-lg font-semibold text-azul-escuro shadow-alta transition-all duration-300 hover:brightness-105 sm:whitespace-nowrap">
                    {ctas.grupo}
                    <svg viewBox="0 0 24 24" className="hidden size-5 shrink-0 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </CliqueGrupo>

                <BotaoLink href="/filtro" variante="contorno" tamanho="lg" className="text-white sm:whitespace-nowrap">
                  {ctas.filtroCurto}
                </BotaoLink>
              </div>
            ) : (
              <p className="anima-hero mt-9 max-w-xl rounded-lg bg-white/10 px-5 py-4 ring-1 ring-white/20">
                {ctas.silencio}
              </p>
            )}

            <p
              className="anima-hero mt-10 flex items-center gap-2 text-sm text-white/65"
              style={{ animationDelay: '600ms' }}
            >
              <svg viewBox="0 0 24 24" className="size-4 text-amarelo" fill="currentColor" aria-hidden>
                <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
              </svg>
              {hero.rodapeHero}
            </p>
          </div>

          {/* ── Foto ── */}
          <div className="anima-surge relative" style={{ animationDelay: '260ms' }}>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/18 to-white/4 ring-1 ring-white/20 md:rounded-[2.75rem]">
              {/* Sem foto, o gradiente e a silhueta já sustentam a composição. */}
              <Silhueta
                variante="meio-corpo"
                tom="escuro"
                rotulo="Foto PNG · recorte sem fundo"
                className="h-[23rem] w-full sm:h-[29rem] lg:h-[33rem]"
              />
            </div>

            {/* O 2233 da campanha, na arte oficial */}
            <div className="absolute -bottom-6 left-2 w-40 drop-shadow-[0_10px_24px_rgba(1,32,58,0.45)] sm:w-52 md:left-6">
              <Numero versao="amarelo" prioridade className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* respiro entre o hero e a próxima seção, para o número não colar */}
      <div className="h-10 md:h-14" aria-hidden />
    </section>
  )
}

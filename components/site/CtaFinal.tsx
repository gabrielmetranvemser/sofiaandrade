import { lerConteudo } from '@/lib/conteudo/ler'
import { BotaoLink } from '@/components/ui/Botao'
import { Numero } from '@/components/ui/Marca'
import { CliqueGrupo } from './CliqueGrupo'

export async function CtaFinal({ silencio = false }: { silencio?: boolean }) {
  const { ctaFinal, ctas } = await lerConteudo()

  return (
    <section id="votar" className="relative isolate overflow-hidden fundo-azul-profundo py-24 text-white md:py-32">

      <div className="container-lp text-center">
        <h2 data-revelar className="titulo-cartaz text-white">
          {ctaFinal.titulo.map((linha, i) => (
            <span key={i} className="block">
              {i === 1 ? <span className="text-amarelo">{linha}</span> : linha}
            </span>
          ))}
        </h2>

        <p
          data-revelar
          style={{ ['--atraso' as string]: '120ms' }}
          className="mx-auto mt-7 max-w-2xl text-lg text-white/75 md:text-xl"
        >
          {ctaFinal.texto}
        </p>

        {/* O número na arte oficial, grande. É o que a pessoa precisa levar. */}
        <div
          data-revelar
          style={{ ['--atraso' as string]: '200ms' }}
          className="mx-auto mt-12 w-64 sm:w-80 md:w-[26rem]"
        >
          <Numero versao="amarelo" className="w-full drop-shadow-[0_16px_40px_rgba(0,0,0,0.35)]" />
        </div>

        {!silencio ? (
          <div
            data-revelar
            style={{ ['--atraso' as string]: '280ms' }}
            className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <CliqueGrupo origem="cta_final" className="contents">
              <span className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-amarelo px-8 text-lg font-semibold text-azul-escuro shadow-alta transition-all duration-300 hover:brightness-105">
                {ctaFinal.ctaPrimario}
              </span>
            </CliqueGrupo>

            <BotaoLink href="/filtro" variante="contorno" tamanho="lg" className="text-white">
              {ctaFinal.ctaSecundario}
            </BotaoLink>
          </div>
        ) : (
          <p className="mx-auto mt-10 max-w-xl rounded-lg bg-white/10 px-5 py-4 ring-1 ring-white/20">
            {ctas.silencio}
          </p>
        )}
      </div>
    </section>
  )
}

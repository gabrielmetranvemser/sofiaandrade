import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'
import { BotaoLink } from '@/components/ui/Botao'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'
import { Numero } from '@/components/ui/Marca'
import { destinoGrupo } from '@/lib/conteudo/secoes'
import { CliqueGrupo } from './CliqueGrupo'
import { RotuloDoGrupo } from './RotuloDoGrupo'

export async function CtaFinal({ silencio = false }: { silencio?: boolean }) {
  const [{ ctaFinal, ctas, exibir }, slots] = await Promise.all([lerConteudo(), lerSlots()])
  const paraOsGrupos = destinoGrupo(exibir)

  return (
    <section id="votar" className="relative isolate overflow-hidden fundo-azul-profundo py-24 text-white md:py-32">

      <div className="container-lp text-center">
        {/* O retrato de fechamento.
            Última imagem da página: é o rosto que fica associado ao
            número. Fica em cima do título e não ao lado porque esta
            seção é a única centralizada do site — coluna lateral aqui
            quebraria o eixo bem no momento em que a página pede uma
            decisão.

            A máscara circular resolve um problema prático: o retrato
            pode chegar com qualquer fundo, e círculo sobre azul não
            denuncia recorte mal feito como um retângulo denunciaria. */}
        <div
          data-revelar
          className="mx-auto mb-12 size-36 overflow-hidden rounded-full ring-4 ring-white/15 md:size-44"
        >
          <Imagem
            slot="cta.retrato"
            slots={slots}
            sizes="11rem"
            className="size-full object-cover"
          />
        </div>

        <h2 data-revelar className="titulo-cartaz text-white">
          {ctaFinal.titulo.map((linha, i) => (
            <span key={i} className="block">
              <TextoComDestaque texto={linha} tom="amarelo" />
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
          {/* O parallax vai num invólucro, não no bloco revelado: as
              duas coisas escrevem em transform e a última a falar
              apagaria a outra. */}
          <div className="parallax-suave">
            <Numero className="w-full drop-shadow-[0_16px_40px_rgba(0,0,0,0.35)]" />
          </div>
        </div>

        {!silencio ? (
          <div
            data-revelar
            style={{ ['--atraso' as string]: '280ms' }}
            className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <CliqueGrupo origem="cta_final" href={paraOsGrupos} className="contents">
              <span className="toque inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-amarelo px-8 text-center text-lg font-semibold text-azul-escuro shadow-alta transition-all duration-300 hover:brightness-105">
                <RotuloDoGrupo padrao={ctaFinal.ctaPrimario} />
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

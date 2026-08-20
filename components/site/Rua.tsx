import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'

/**
 * A prova visual da manchete.
 *
 * A página inteira se apoia em "Mandaram fechar. Eu fui pra rua." — e
 * até aqui ninguém viu a rua. Sem esta seção a página AFIRMA e não
 * MOSTRA, que é exatamente o que ela acusa os outros de fazer duas
 * seções abaixo.
 *
 * Fundo azul-profundo, sem cartão e sem borda: as três fotos formam
 * uma faixa única, do jeito que se olha uma sequência de jornal. A
 * primeira é maior porque é a mais forte — grade de três iguais faria
 * o olho tratar as três como igualmente importantes, e elas não são.
 */
export async function Rua() {
  const [{ rua }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  return (
    <section
      id="rua"
      className="relative isolate overflow-hidden fundo-azul-profundo py-20 text-white md:py-28"
    >
      <div className="container-lp">
        <div className="max-w-2xl">
          <p data-revelar className="etiqueta text-white">
            <span className="inline-block h-px w-8 bg-amarelo" aria-hidden />
            {rua.etiqueta}
          </p>
          <h2
            data-revelar
            style={{ ['--atraso' as string]: '70ms' }}
            className="mt-4 titulo-secao text-white"
          >
            <TextoComDestaque texto={rua.titulo} tom="amarelo" />
          </h2>
          <p
            data-revelar
            style={{ ['--atraso' as string]: '140ms' }}
            className="mt-5 text-lg text-white/80 md:text-xl"
          >
            {rua.texto}
          </p>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-2 md:gap-5">
          {rua.fotos.map((foto, i) => (
            <li
              key={foto.id}
              data-revelar
              style={{ ['--atraso' as string]: `${i * 90}ms` }}
              className={i === 0 ? 'md:row-span-2' : ''}
            >
              <figure className="group relative h-full overflow-hidden rounded-2xl bg-white/5">
                <Imagem
                  slot={`rua.${i + 1}`}
                  slots={slots}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />

                {/* A legenda fica DENTRO da foto, sobre um degradê. Fora
                    dela, a faixa vira uma lista de cartões com texto e
                    perde a leitura de sequência fotográfica. */}
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-azul-escuro/85 to-transparent p-5 pt-12">
                  <span className="block font-medium">{foto.legenda}</span>
                  {foto.local ? (
                    <span className="mt-0.5 block text-sm text-white/70">{foto.local}</span>
                  ) : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {rua.credito ? <p className="mt-4 text-xs text-white/50">{rua.credito}</p> : null}
      </div>
    </section>
  )
}

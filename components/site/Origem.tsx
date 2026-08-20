import { origem } from '@/content/copy'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { QuadroImagem } from '@/components/ui/QuadroImagem'

export function Origem() {
  return (
    <Secao id="origem" fundo="branco" espaco="solto">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <CabecalhoSecao etiqueta={origem.etiqueta} titulo={origem.titulo} />

          <div className="mt-8 space-y-5">
            {origem.paragrafos.map((p, i) => (
              <p
                key={i}
                data-revelar
                style={{ ['--atraso' as string]: `${i * 80}ms` }}
                className="max-w-2xl text-lg text-grafite"
              >
                {p}
              </p>
            ))}
          </div>

          <blockquote
            data-revelar
            className="mt-10 rounded-2xl fundo-azul-profundo p-7 text-white md:p-8"
          >
            <svg viewBox="0 0 24 24" className="size-8 text-amarelo" fill="currentColor" aria-hidden>
              <path d="M9.5 5C6.5 6.6 5 9 5 12.2c0 .6.1 1.2.2 1.8h.3c.5-.5 1.2-.8 2.1-.8 1.7 0 3 1.3 3 3.1S9.2 19.5 7.4 19.5C5 19.5 3.2 17.4 3.2 14c0-4.3 2.3-7.6 6.3-9.7L9.5 5Zm10 0C16.5 6.6 15 9 15 12.2c0 .6.1 1.2.2 1.8h.3c.5-.5 1.2-.8 2.1-.8 1.7 0 3 1.3 3 3.1s-1.4 3.2-3.2 3.2c-2.4 0-4.2-2.1-4.2-5.5 0-4.3 2.3-7.6 6.3-9.7l.2.7Z" />
            </svg>
            <p className="mt-4 font-[family-name:var(--font-titulo)] text-xl font-semibold leading-snug tracking-[-0.02em] md:text-2xl">
              {origem.citacao}
            </p>
          </blockquote>
        </div>

        <div data-revelar className="space-y-4">
          <QuadroImagem
            proporcao="4/5"
            tom="azul"
            raio="2xl"
            rotulo="Retrato"
            nota="Foto da candidata em ambiente de trabalho ou de rua"
          />
          <div className="grid grid-cols-2 gap-4">
            <QuadroImagem proporcao="1/1" tom="claro" raio="xl" rotulo="Foto" nota="Detalhe" />
            <QuadroImagem proporcao="1/1" tom="claro" raio="xl" rotulo="Foto" nota="Detalhe" />
          </div>
        </div>
      </div>

      {/* Linha do tempo */}
      <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {origem.linhaDoTempo.map((item, i) => (
          <li
            key={item.ano}
            data-revelar
            style={{ ['--atraso' as string]: `${i * 80}ms` }}
            className="cartao p-6 transition-shadow duration-300 hover:shadow-media"
          >
            <span className="inline-flex items-center rounded-full bg-azul-escuro px-3 py-1 text-sm font-semibold text-white tabular-nums">
              {item.ano}
            </span>
            <h3 className="mt-4 text-lg">{item.titulo}</h3>
            <p className="mt-2 text-base text-grafite">{item.texto}</p>
          </li>
        ))}
      </ol>
    </Secao>
  )
}

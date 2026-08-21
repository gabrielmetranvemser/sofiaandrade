import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'
import { TextoComDestaque, Texto } from '@/components/ui/TextoComDestaque'
import { Video } from '@/components/ui/Video'
import { formatoValido, larguraDoVideo } from '@/lib/video'

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
        {/* ⚠️ O VÍDEO SAIU DE BAIXO DO TEXTO E FOI PARA O LADO DELE.
            Empilhado, ele caía num vão morto: largo demais para ser
            legenda do parágrafo, estreito demais para conversar com a
            faixa de fotos logo abaixo — e a seção passava a ter três
            blocos de largura diferente, um sob o outro, sem nenhuma
            borda em comum. Era esse desalinhamento que se lia como "o
            vídeo ficou estranho com as imagens embaixo", e não o vídeo.

            Ao lado, ele vira o par do texto, e a faixa de fotos volta a
            ser a única coisa que atravessa a seção inteira. É também o
            que resolve o enquadramento em pé aqui: numa coluna de meia
            largura, vertical é o que se espera de um vídeo de celular
            gravado na rua — e não uma exceção a acomodar.

            Sem vídeo, nada de coluna vazia esperando: a grade não
            existe e o texto fica exatamente como sempre esteve. */}
        <div
          className={
            rua.video.url
              ? 'grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14'
              : ''
          }
        >
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
              <Texto tom="amarelo">{rua.texto}</Texto>
            </p>
          </div>

          {/* O vídeo da pandemia vem ANTES das fotos. A seção existe
              para provar que "eu fui pra rua" é literal, e o vídeo é o
              registro em movimento do que as fotos mostram parado.

              A moldura de vidro é o que dá borda ao vídeo sobre um
              fundo que já é escuro. Sem ela o quadro preto do player
              encosta direto no azul, e antes de alguém apertar play o
              vídeo parece um buraco na seção. */}
          {rua.video.url ? (
            <div
              data-revelar
              // A moldura ENCOLHE JUNTO com o vídeo: a largura máxima é
              // a do próprio quadro mais o `p-3` dos dois lados. Sem
              // isso, um vídeo em pé viraria uma tira estreita no meio
              // de um painel largo — a moldura passaria a ser o
              // elemento maior, e o vídeo, o detalhe dentro dela.
              style={{ maxWidth: `calc(${larguraDoVideo(formatoValido(rua.video.formato))} + 1.5rem)` }}
              className="mx-auto w-full rounded-3xl bg-white/5 p-3 ring-1 ring-white/10"
            >
              <Video
                url={rua.video.url}
                formato={formatoValido(rua.video.formato)}
                opcoes={rua.video.opcoes}
                titulo={rua.video.titulo}
              />
            </div>
          ) : null}
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
                  <span className="block font-medium"><Texto tom="amarelo">{foto.legenda}</Texto></span>
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

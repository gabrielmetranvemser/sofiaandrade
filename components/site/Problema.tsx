import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Video } from '@/components/ui/Video'
import { formatoValido, larguraDoVideo } from '@/lib/video'
import { semDestaque, Texto } from '@/components/ui/TextoComDestaque'

/**
 * O teto de altura do vídeo desta seção.
 *
 * Mais folgado que o padrão porque aqui o vídeo atravessa a grade
 * inteira: com o teto normal ele pararia antes da borda dos cartões, e
 * o alinhamento — que é a razão de ele estar dentro de um cartão — se
 * perderia.
 */
const TETO_DO_VIDEO = 'min(70svh, 40rem)'

export async function Problema() {
  const { problema } = await lerConteudo()

  return (
    <Secao id="problema" fundo="areia" espaco="solto">
      <CabecalhoSecao
        etiqueta={problema.etiqueta}
        titulo={problema.titulo}
        intro={problema.intro}
      />

      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {problema.itens.map((item, i) => (
          <li
            key={item.id}
            data-revelar
            style={{ ['--atraso' as string]: `${i * 80}ms` }}
            className="cartao group p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-media md:p-8"
          >
            <span
              className="inline-flex size-11 items-center justify-center rounded-full bg-azul-escuro font-[family-name:var(--font-titulo)] text-base font-bold text-white transition-colors duration-300 group-hover:bg-amarelo group-hover:text-azul-escuro"
              aria-hidden
            >
              {item.numero}
            </span>
            <h3 className="mt-5 text-xl md:text-2xl"><Texto>{item.titulo}</Texto></h3>
            <p className="mt-3 text-base text-grafite"><Texto>{item.texto}</Texto></p>
          </li>
        ))}
      </ul>

      {/* O vídeo fecha a seção, e fecha de propósito: os quatro cartões
          listam o que está errado em texto frio, e é ela quem dá voz a
          isso.

          ⚠️ ELE É O QUINTO CARTÃO, e por isso vem dentro de um. Solto e
          centralizado a 3xl — como estava — o vídeo era um retângulo de
          768px flutuando sob uma grade de 1136px: não encostava em
          nenhuma borda da grade, não repetia nenhuma medida dela, e o
          olho lia isso como um bloco que sobrou de outro desenho.

          Dentro do cartão ele passa a alinhar com as duas colunas de
          cima, o `mt-5` é o mesmo `gap-5` da grade, e a moldura branca é
          a mesma dos outros quatro. Deitado, o vídeo preenche o cartão
          de ponta a ponta; em pé, ele fica centrado sobre o branco em
          vez de esticar a seção por uma tela e meia. */}
      {problema.video.url ? (
        <div
          data-revelar
          // O cartão encolhe junto com o vídeo — deitado ele preenche a
          // largura da grade de ponta a ponta; em pé, vira um cartão
          // estreito e centrado, e não uma faixa branca com uma tira de
          // vídeo perdida no meio.
          style={{
            maxWidth: `calc(${larguraDoVideo(
              formatoValido(problema.video.formato),
              TETO_DO_VIDEO,
            )} + 1.5rem)`,
          }}
          className="cartao mx-auto mt-5 w-full p-3"
        >
          <Video
            url={problema.video.url}
            formato={formatoValido(problema.video.formato)}
            opcoes={problema.video.opcoes}
            titulo={problema.video.titulo}
            alturaMax={TETO_DO_VIDEO}
          />
        </div>
      ) : null}
    </Secao>
  )
}

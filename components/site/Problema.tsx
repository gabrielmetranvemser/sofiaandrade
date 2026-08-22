import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Video } from '@/components/ui/Video'
import { emPe, formatoValido, larguraDoVideo } from '@/lib/video'
import { Texto } from '@/components/ui/TextoComDestaque'

/**
 * O teto de altura do vídeo DEITADO desta seção.
 *
 * Mais folgado que o padrão porque ali o vídeo atravessa a grade
 * inteira: com o teto normal ele pararia antes da borda dos cartões, e
 * o alinhamento — que é a razão de ele estar dentro de um cartão — se
 * perderia.
 *
 * ⚠️ NÃO VALE PARA O EM PÉ. Lá o vídeo não fecha a seção, ele fica AO
 *    LADO dos cartões, e quem manda na altura passa a ser a fila de
 *    cartões (ver abaixo).
 */
const TETO_DEITADO = 'min(70svh, 40rem)'

/**
 * A LARGURA DO CARTÃO DO VÍDEO EM PÉ.
 *
 * ⚠️ QUEM MANDA NA ALTURA DA FAIXA PASSA A SER O VÍDEO, e é essa a
 *    diferença que a campanha pediu. Antes o cartão do vídeo tinha a
 *    largura mínima que o teto de altura permitia (330 px) e ficava
 *    mais baixo que a fila de cartões ao lado — sobravam 88 px de
 *    branco acima e abaixo dele, dentro do próprio cartão.
 *
 *    Com 26rem, o vídeo tem 392 px de largura e 697 de altura: mais
 *    alto que os quatro cartões pedem, então é ELE quem define a
 *    linha e são eles que esticam para acompanhar. Branco nenhum
 *    sobra dos dois lados.
 *
 *    Os cartões encolhem de 588 para 350 px de largura — o texto
 *    ganha uma linha ou duas, que é exatamente o que preenche a
 *    altura nova.
 */
const LARGURA_EM_PE = 'min(26rem, 34vw)'

export async function Problema() {
  const { problema } = await lerConteudo()

  const formato = formatoValido(problema.video.formato)
  const vertical = emPe(formato)
  const teto = vertical ? undefined : TETO_DEITADO

  /**
   * OS QUATRO CARTÕES.
   *
   * Sai do JSX principal porque agora tem dois destinos: sozinho, com
   * o vídeo deitado embaixo; ou dentro de uma faixa, com o vídeo em pé
   * ao lado. Escrever a lista duas vezes seria garantir que uma delas
   * fique para trás na próxima mudança.
   */
  const cartoes = (
    <ul
      className={`grid gap-5 md:grid-cols-2 ${
        // ⚠️ AS DUAS LINHAS PASSAM A DIVIDIR A ALTURA DA FAIXA. É isto
        //    que faz a borda de baixo dos cartões bater EXATAMENTE com a
        //    borda de baixo do vídeo: sem `grid-rows-2`, cada linha teria
        //    a altura do próprio texto e o vídeo sobraria por baixo, que
        //    é a sobra que se lê como desalinhamento.
        vertical ? 'lg:h-full lg:grid-rows-2' : ''
      }`}
    >
      {problema.itens.map((item, i) => (
        <li
          key={item.id}
          data-revelar
          style={{ ['--atraso' as string]: `${i * 80}ms` }}
          className="cartao group h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-media md:p-8"
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
  )

  /**
   * O vídeo, sempre dentro de um cartão — a moldura branca é a mesma
   * dos outros quatro, e é ela que faz o quinto elemento pertencer à
   * mesma família visual em vez de parecer um bloco de outro desenho.
   */
  const video = problema.video.url ? (
    <div
      data-revelar
      style={
        vertical
          ? // Largura escrita: a coluna `auto` da faixa mede o cartão, e
            // cartão que só tem `max-width` não é medido. Ver `Rua`.
            // Vai por variável porque só vale do `lg` para cima — no
            // celular o cartão ocupa a largura toda.
            { ['--largura' as string]: LARGURA_EM_PE }
          : { maxWidth: `calc(${larguraDoVideo(formato, teto)} + 1.5rem)` }
      }
      className={
        vertical
          ? // `items-center` porque o texto dos cartões pode empurrar a
            // fila para além da altura do vídeo. Quando isso acontece a
            // sobra se divide em duas, acima e abaixo, em vez de cair
            // toda embaixo — sobra dividida some da leitura.
            'cartao mx-auto flex w-full items-center p-3 lg:w-[var(--largura)]'
          : 'cartao mx-auto mt-5 w-full p-3'
      }
    >
      <Video
        url={problema.video.url}
        formato={formato}
        opcoes={problema.video.opcoes}
        titulo={problema.video.titulo}
        alturaMax={teto}
        preencher={vertical}
      />
    </div>
  ) : null

  return (
    <Secao id="problema" fundo="areia" espaco="solto">
      <CabecalhoSecao
        etiqueta={problema.etiqueta}
        titulo={problema.titulo}
        intro={problema.intro}
      />

      {/* ── DOIS DESENHOS, UM POR ENQUADRAMENTO ────────────────────
          DEITADO — o vídeo FECHA a seção, como quinto cartão numa
          linha só. Os quatro cartões listam o que está errado em texto
          frio; é ela quem dá voz a isso, e a voz vem por último.

          EM PÉ — fechar a seção não funciona: um vídeo de 306 px de
          largura sob uma grade de 1136 vira um cartão estreito e
          centrado, com 400 px de vazio de cada lado. Não encosta em
          nenhuma borda da grade, não repete nenhuma medida dela, e o
          olho lê isso como um bloco que sobrou de outro desenho — que
          é exatamente a queixa desta tela.

          Então ele deixa de fechar e passa a ACOMPANHAR: vira uma
          coluna alta à direita, do tamanho exato do vídeo, e os quatro
          cartões se reorganizam em 2×2 no espaço que sobra. As quatro
          bordas da faixa passam a ser bordas de alguém — e a forma de
          celular em pé, que é o que o vídeo é, fica evidente por
          contraste com a fila de cartões deitados ao lado. */}
      {vertical && video ? (
        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-[1fr_auto]">
          {cartoes}
          {video}
        </div>
      ) : (
        <>
          <div className="mt-14">{cartoes}</div>
          {video}
        </>
      )}
    </Secao>
  )
}

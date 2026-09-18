import Image from 'next/image'
import type { ImagemDoSlot } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'

/**
 * A FAIXA DO TOPO DA PÁGINA DE ENTRADA — ela, o Flávio e o número.
 *
 * Três painéis inclinados: amarelo com a Sofia, azul com o Flávio,
 * azul-escuro com o 2233 da campanha. É a arte da campanha reduzida a
 * uma tarja — foi o que a campanha pediu, e é o que a página precisa:
 * reconhecimento em meio segundo, sem gastar a primeira tela.
 *
 * ⚠️ A ALTURA É O ORÇAMENTO DA PRIMEIRA TELA, e por isso é `clamp` e não
 *    uma proporção. Num telefone de 360×640 dentro do Instagram sobram
 *    ~530px, e o botão verde precisa caber neles junto com título, frase
 *    e nota. 19vh dá ~120px ali e ~150px num telefone grande, onde sobra
 *    espaço. Proporção fixa faria o contrário: quanto mais estreita a
 *    tela, mais alta a faixa, empurrando o botão para fora justo em quem
 *    tem a tela menor.
 *
 * ⚠️ OS PAINÉIS SÃO INCLINADOS, AS FOTOS NÃO. Inclinar o pai
 *    distorceria os dois rostos. Aqui a inclinação está só nos
 *    retângulos de cor, que são chapados, e as fotos vão por cima, em
 *    pé. As bordas de fora passam da faixa de propósito: o `overflow`
 *    do cartão corta o bico do amarelo e o do azul-escuro, e o que sobra
 *    na borda é um corte reto.
 *
 * ⚠️ AS DUAS FOTOS TÊM A MESMA ALTURA E O MESMO TOPO. Esta é a terceira
 *    tentativa: com alturas diferentes — para "compensar" o
 *    enquadramento de cada recorte — uma cabeça sempre saía maior que a
 *    outra, e a campanha reprovou duas vezes. Os dois recortes têm a
 *    cabeça ocupando quase a mesma fração da foto (~29%), então altura
 *    igual é o que faz as duas cabeças saírem iguais. Cada uma fica
 *    CENTRADA na sua coluna, e não encostada numa borda: é o
 *    alinhamento que o olho lê como "do mesmo tamanho".
 */
export function FaixaDoTopo({
  slots,
  slotDaFoto,
  numero,
  aliado = '/flavio.webp',
  aliadoAlt = 'Flávio Bolsonaro',
}: {
  slots: Record<string, ImagemDoSlot>
  /** O recorte dela, sem fundo (`entrada.foto`, com `hero.retrato` de reserva). */
  slotDaFoto: string
  /** O número da urna, da seção A candidata. */
  numero: string
  aliado?: string
  aliadoAlt?: string
}) {
  /**
   * ⚠️ ANCORADAS PELO TOPO, E LARGURA EM % DA TARJA — as duas coisas por
   *    motivos diferentes, e as duas foram erro antes.
   *
   *    Pelo topo porque a versão anterior grudava a foto embaixo e
   *    passava da altura da tarja: o que sobrava era cortado EM CIMA, e
   *    as duas cabeças apareciam raspadas. Agora sobra por baixo, que é
   *    onde o corte é natural — o braço.
   *
   *    Em % da largura, e não da altura, porque a altura da tarja varia
   *    com a tela (19vh) e a largura do cartão não. Dimensionar pela
   *    altura fazia o número perder espaço num telefone alto: as fotos
   *    cresciam junto com a tarja e o empurravam contra a borda.
   */
  const foto =
    'absolute top-[4%] h-auto max-w-none object-contain drop-shadow-[0_12px_24px_rgba(1,58,103,0.3)]'

  return (
    <div className="relative isolate h-[clamp(7rem,19vh,9.5rem)] overflow-hidden bg-azul-escuro sm:h-44">
      {/* ── Os painéis de cor ──────────────────────────────────
          Em degradê, e não chapados: a luz de cima para baixo dá
          profundidade à tarja sem custar uma imagem de fundo.

          As bordas batem com as colunas abaixo (34,5% e 68,5%), e os
          dois extremos passam da faixa para o `overflow` do cartão
          cortar o bico da inclinação. */}
      <div
        aria-hidden
        className="absolute inset-y-0 -left-10 right-[67%] -z-10 -skew-x-[9deg] bg-[linear-gradient(165deg,#ffe98a_0%,#fbd83f_55%,#f0c419_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-[33%] right-[30%] -z-10 -skew-x-[9deg] bg-[linear-gradient(165deg,#0a80d6_0%,#066db9_55%,#01518f_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-[70%] -right-10 -z-10 -skew-x-[9deg] bg-[linear-gradient(165deg,#01518f_0%,#013a67_100%)]"
      />

      {/* ⚠️ OS FIOS BRANCOS SEPARAM OS DOIS AZUIS. Sem eles, o painel do
          Flávio e o do número viram uma mancha só e a inclinação some —
          é a mesma função da guia branca na arte impressa da campanha. */}
      <div aria-hidden className="absolute inset-y-0 left-[32.7%] -z-10 w-[3px] -skew-x-[9deg] bg-white" />
      <div aria-hidden className="absolute inset-y-0 left-[69.7%] -z-10 w-[3px] -skew-x-[9deg] bg-white" />

      {/* ── Ela, ele e o número ────────────────────────────────
          ⚠️ ELA PASSA UM POUCO POR CIMA DELE, como na capa: sem a
          sobreposição os dois viram dois retratos lado a lado, e o
          conjunto lê como colagem. Ela na frente (`z-20`) porque a
          candidata é ela. Os dois têm a MESMA largura — a campanha
          reprovou duas versões em que um saía maior que o outro. */}
      <Imagem
        slot={slotDaFoto}
        slots={slots}
        vazio="silhueta"
        lcp
        prioridade
        sizes="(max-width: 640px) 40vw, 230px"
        className={`${foto} left-[-2%] z-20 w-[38%]`}
      />

      {/* ⚠️ PRIORIDADE ALTA, IGUAL À DELA — e ela já esteve baixa aqui.
          As duas fotos têm a MESMA largura (38%) e o mesmo topo, então
          são candidatas iguais a LCP, e o LCP é sempre a última a
          pintar. Com esta em `low`, o navegador atrasava justamente a
          que ia definir a métrica: o Lighthouse de 18/09 apontou o
          retrato do aliado como elemento de LCP, nesta página e na de
          entrada, com 3,5 s.

          `fetchPriority` no <img> é ordem de fila, e não `<link
          preload>` — não é o caso dos quatro preloads brigando que
          está descrito em components/ui/Imagem.tsx. Aqui são duas
          imagens, as duas na primeira tela, as duas do mesmo tamanho:
          a fila certa é as duas na frente. */}
      <Image
        src={aliado}
        alt={aliadoAlt}
        width={1755}
        height={2200}
        priority
        fetchPriority="high"
        sizes="(max-width: 640px) 40vw, 230px"
        className={`${foto} left-[31%] z-10 w-[38%]`}
      />

      {/* O número na letra da campanha, e não em fonte: é a arte que a
          peça impressa usa. Amarelo sobre azul-escuro, que é o par de
          cores em que ele foi desenhado, centrado na coluna dele. */}
      <div className="absolute inset-y-0 right-0 flex w-[29%] items-center justify-center px-1.5">
        <Image
          src="/marca/numero-2233-amarelo.png"
          alt={`Número ${numero}`}
          width={700}
          height={188}
          loading="eager"
          fetchPriority="low"
          sizes="160px"
          className="w-full max-w-36"
        />
      </div>
    </div>
  )
}

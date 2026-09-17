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
  // A mesma medida para as duas: 104% da faixa, então o tronco é cortado
  // pela borda de baixo e ninguém fica flutuando.
  const foto =
    'absolute bottom-0 left-1/2 h-[104%] w-auto max-w-none -translate-x-1/2 object-contain object-top drop-shadow-[0_10px_22px_rgba(1,58,103,0.28)]'

  return (
    <div className="relative isolate flex h-[clamp(7rem,19vh,9.5rem)] items-end overflow-hidden bg-azul-escuro sm:h-44">
      {/* ── Os painéis de cor ──────────────────────────────────
          Em degradê, e não chapados: a luz de cima para baixo dá
          profundidade à tarja sem custar uma imagem de fundo.

          As bordas batem com as colunas abaixo (34,5% e 68,5%), e os
          dois extremos passam da faixa para o `overflow` do cartão
          cortar o bico da inclinação. */}
      <div
        aria-hidden
        className="absolute inset-y-0 -left-10 right-[65.5%] -z-10 -skew-x-[9deg] bg-[linear-gradient(165deg,#ffe98a_0%,#fbd83f_55%,#f0c419_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-[34.5%] right-[31.5%] -z-10 -skew-x-[9deg] bg-[linear-gradient(165deg,#0a80d6_0%,#066db9_55%,#01518f_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-[68.5%] -right-10 -z-10 -skew-x-[9deg] bg-[linear-gradient(165deg,#01518f_0%,#013a67_100%)]"
      />

      {/* ⚠️ OS FIOS BRANCOS SEPARAM OS DOIS AZUIS. Sem eles, o painel do
          Flávio e o do número viram uma mancha só e a inclinação some —
          é a mesma função da guia branca na arte impressa da campanha. */}
      <div aria-hidden className="absolute inset-y-0 left-[34.2%] -z-10 w-[3px] -skew-x-[9deg] bg-white" />
      <div aria-hidden className="absolute inset-y-0 left-[68.2%] -z-10 w-[3px] -skew-x-[9deg] bg-white" />

      {/* ── As três colunas ───────────────────────────────────── */}
      <div className="relative h-full w-[35%]">
        {/* ⚠️ ESTA FOTO É A CANDIDATA NA PRIMEIRA TELA, e é a maior imagem
            dela — o LCP desta página. Vai `eager` e com prioridade alta;
            o `sizes` é pequeno porque ela desenha com ~130px de largura,
            então o Next entrega um arquivo de telefone, não o original. */}
        <Imagem
          slot={slotDaFoto}
          slots={slots}
          vazio="silhueta"
          lcp
          sizes="(max-width: 640px) 40vw, 180px"
          className={foto}
        />
      </div>

      <div className="relative h-full w-[33%]">
        {/* Ele carrega junto, mas atrás dela na fila da banda. */}
        <Image
          src={aliado}
          alt={aliadoAlt}
          width={1755}
          height={2200}
          loading="eager"
          fetchPriority="low"
          sizes="(max-width: 640px) 40vw, 180px"
          className={foto}
        />
      </div>

      <div className="relative flex h-full w-[32%] items-center justify-center px-1.5">
        {/* O número na letra da campanha, e não em fonte: é a arte que a
            peça impressa usa. Amarelo sobre azul-escuro, que é o par de
            cores em que ele foi desenhado, e centrado na coluna. */}
        <Image
          src="/marca/numero-2233-amarelo.png"
          alt={`Número ${numero}`}
          width={700}
          height={188}
          loading="eager"
          fetchPriority="low"
          sizes="140px"
          className="w-full max-w-36"
        />
      </div>
    </div>
  )
}

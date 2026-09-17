import Image from 'next/image'
import type { ImagemDoSlot } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'

/**
 * A FAIXA DO TOPO DA PÁGINA DE ENTRADA — ela, o Flávio e o número.
 *
 * Três painéis inclinados: amarelo com a Sofia, azul com o Flávio,
 * branco com o 2233. É a arte da campanha reduzida a uma tarja — foi o
 * que a campanha pediu, e é o que a página precisa: reconhecimento em
 * meio segundo, sem gastar a primeira tela.
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
 *    do cartão corta o bico do amarelo e o do branco, e o que sobra na
 *    borda é um corte reto.
 *
 * ⚠️ ELA MAIOR QUE ELE. Não é detalhe de estilo: a candidata é ela, e a
 *    campanha já reprovou uma composição em que o Flávio aparecia
 *    grande demais ao lado dela (ver o comentário no Hero). Aqui cada um
 *    tem seu painel, e ela entra com mais altura.
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
  return (
    <div className="relative isolate h-[clamp(7rem,19vh,9.5rem)] sm:h-44 overflow-hidden bg-azul-escuro">
      {/* Os três painéis. `-left`/`w` passam da borda para o bico da
          inclinação ser cortado pelo cartão, e não ficar dentro dele. */}
      <div aria-hidden className="absolute inset-y-0 -left-10 -z-10 w-[56%] -skew-x-[9deg] bg-amarelo" />
      <div aria-hidden className="absolute inset-y-0 left-[46%] -z-10 w-[29%] -skew-x-[9deg] bg-azul" />

      {/* ⚠️ OS FIOS BRANCOS SEPARAM OS DOIS AZUIS. Sem eles, o painel do
          Flávio e o do número viram uma mancha só e a inclinação some —
          é a mesma função da guia branca na arte impressa da campanha. */}
      <div aria-hidden className="absolute inset-y-0 left-[45.5%] -z-10 w-[3px] -skew-x-[9deg] bg-white" />
      <div aria-hidden className="absolute inset-y-0 left-[74.5%] -z-10 w-[3px] -skew-x-[9deg] bg-white" />

      {/* ⚠️ ESTA FOTO É A CANDIDATA NA PRIMEIRA TELA, e é a maior imagem
          dela — o LCP desta página. Vai `eager` e com prioridade alta;
          o `sizes` é pequeno porque ela desenha com ~150px de largura,
          então o Next entrega um arquivo de telefone, não o original.

          ⚠️ A ALTURA DELA É MENOR QUE A DELE, e é o contrário do que
             parece: os dois recortes têm enquadramentos diferentes — a
             cabeça dela ocupa mais da própria foto do que a dele. Com a
             mesma altura, ela aparecia com a cabeça um terço maior, e a
             campanha reprovou ("fica esquisito"). Estas duas medidas
             foram ajustadas até as duas cabeças ficarem do mesmo tamanho
             na tela; mexer numa sem a outra desequilibra de novo. */}
      <Imagem
        slot={slotDaFoto}
        slots={slots}
        vazio="silhueta"
        lcp
        sizes="(max-width: 640px) 45vw, 200px"
        className="absolute top-[3%] left-[1%] h-[112%] sm:left-[4%] w-auto max-w-none object-contain object-top drop-shadow-[0_10px_20px_rgba(1,58,103,0.25)]"
      />

      {/* Ele carrega junto, mas atrás dela na fila da banda. */}
      <Image
        src={aliado}
        alt={aliadoAlt}
        width={1755}
        height={2200}
        loading="eager"
        fetchPriority="low"
        sizes="(max-width: 640px) 36vw, 160px"
        className="absolute top-[3%] left-[45%] h-[124%] w-auto max-w-none object-contain object-top drop-shadow-[0_10px_20px_rgba(1,58,103,0.25)]"
      />

      {/* O número na letra da campanha, e não em fonte: é a arte que a
          peça impressa usa. Amarelo sobre azul-escuro, que é o par de
          cores em que ele foi desenhado. */}
      <Image
        src="/marca/numero-2233-amarelo.png"
        alt={`Número ${numero}`}
        width={700}
        height={188}
        loading="eager"
        fetchPriority="low"
        sizes="120px"
        className="absolute right-[3%] bottom-[16%] w-[21%] max-w-32 min-w-16"
      />
    </div>
  )
}

import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'
import { Numero } from '@/components/ui/Marca'
import { BotaoLink } from '@/components/ui/Botao'
import { BrilhoCursor } from '@/components/animacao/BrilhoCursor'
import { destinoGrupo } from '@/lib/conteudo/secoes'
import { CliqueGrupo } from './CliqueGrupo'

/**
 * Primeira dobra — azul da campanha, com força.
 *
 * A regra que manda aqui: menos de 3 segundos até o botão principal
 * ficar clicável, num celular mediano em 4G. Por isso é Server
 * Component, sem imagem de fundo, sem biblioteca de animação — o
 * gradiente é CSS puro, num matiz só — do azul claro ao azul-noite.
 */
export async function Hero({ silencio = false }: { silencio?: boolean }) {
  const [{ ctas, hero, exibir }, slots] = await Promise.all([lerConteudo(), lerSlots()])
  const paraOsGrupos = destinoGrupo(exibir)

  return (
    <section className="brilho-cursor relative isolate overflow-hidden fundo-azul pt-[5.5rem] text-white md:pt-32">
      {/* Só monta listener onde existe ponteiro de verdade. No celular
          este componente devolve sem registrar nada. */}
      <BrilhoCursor />

      <div className="container-lp">
        <div className="grid items-center gap-3 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── Texto ── */}
          <div className="pb-0 lg:pb-24">
            {/* Três barrinhas em vez da pílula com bolinha. A pílula
                era forma de sistema de design, não da campanha: aparecia
                igual em qualquer site. As barras são a bandeira reduzida
                ao mínimo, e alturas diferentes fazem elas lerem como
                marca em vez de três traços iguais.

                A terceira é branca, e não azul: sobre o azul da dobra,
                azul em cima de azul some. O branco é a faixa da própria
                bandeira — a cor está na peça, só não naquela ordem. */}
            <p className="anima-hero flex items-center gap-3">
              <span className="flex items-end gap-[3px]" aria-hidden>
                <span className="block h-3.5 w-[3px] rounded-full bg-verde" />
                <span className="block h-5 w-[3px] rounded-full bg-amarelo" />
                <span className="block h-3.5 w-[3px] rounded-full bg-white" />
              </span>
              <span className="text-[0.8125rem] font-semibold tracking-[0.16em] text-white uppercase">
                {hero.etiqueta}
              </span>
            </p>

            <h1 className="mt-6 titulo-cartaz text-white">
              {hero.titulo.map((linha, i) => (
                <span
                  key={i}
                  className="anima-hero block"
                  style={{ animationDelay: `${100 + i * 80}ms` }}
                >
                  <TextoComDestaque texto={linha} tom="amarelo" />
                </span>
              ))}
            </h1>

            <p
              className="anima-hero mt-4 max-w-xl text-base text-white/80 sm:text-lg md:text-xl"
              style={{ animationDelay: '440ms' }}
            >
              {hero.subtitulo}
            </p>

            {!silencio ? (
              <div
                className="anima-hero mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
                style={{ animationDelay: '520ms' }}
              >
                {/* No celular este botão NÃO fica aqui: ele desce para
                    junto do número, sobre a foto. Ver a faixa lá
                    embaixo. Aqui ele some por completo — `hidden` no
                    próprio link, não só no miolo, senão sobra um alvo
                    de toque invisível no meio da coluna. */}
                <CliqueGrupo origem="hero" href={paraOsGrupos} className="hidden lg:contents">
                  <span className="toque inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-amarelo px-8 text-lg font-semibold text-azul-escuro shadow-alta transition-all duration-300 hover:brightness-105 sm:whitespace-nowrap">
                    {ctas.grupo}
                    <svg viewBox="0 0 24 24" className="hidden size-5 shrink-0 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </CliqueGrupo>

                <BotaoLink href="/filtro" variante="contorno" tamanho="md" className="text-white sm:whitespace-nowrap lg:min-h-14 lg:px-8 lg:text-lg">
                  {ctas.filtroCurto}
                </BotaoLink>
              </div>
            ) : (
              <p className="anima-hero mt-9 max-w-xl rounded-lg bg-white/10 px-5 py-4 ring-1 ring-white/20">
                {ctas.silencio}
              </p>
            )}

            {/* Some no celular: repete o fim do subtítulo ("Hoje sou
                vereadora de Porto Velho") e custa 64px de altura —
                justamente os pixels que faltavam para o número e o
                botão caberem acima da dobra. */}
            <p
              className="anima-hero mt-6 hidden items-center gap-2 text-sm text-white/65 lg:flex"
              style={{ animationDelay: '600ms' }}
            >
              <svg viewBox="0 0 24 24" className="size-4 text-amarelo" fill="currentColor" aria-hidden>
                <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
              </svg>
              {hero.rodapeHero}
            </p>
          </div>

          {/* ── Foto e número ──
              No desktop: o quadro fica ATRÁS e começa mais abaixo; a
              foto ocupa a altura inteira e passa por cima dele. É o que
              dá a sensação de ela estar saindo do quadro em vez de
              estar colada dentro. Enquanto a página desce, o quadro
              encolhe pelo topo e a foto cresce — as duas coisas presas
              à rolagem, sem JavaScript. Ver .hero-quadro e .hero-foto.

              ⚠️ NO CELULAR ISSO NÃO FUNCIONAVA, e o defeito era grave:
              a primeira dobra media 1241px numa tela de 812. O texto e
              os dois botões consumiam a tela inteira, e a foto começava
              em 830 — abaixo do corte. O número, preso ao rodapé da
              foto, caía em 1240. Ou seja: a primeira tela da campanha
              não mostrava nem o rosto nem o 2233. Numa página cujo
              único objetivo é gravar quatro dígitos, era o pior lugar
              possível para economizar espaço.

              A correção não foi encolher a foto até caber — seria uma
              miniatura. No celular a foto fica CENTRALIZADA e inteira,
              um degradê fecha o pé dela, e por cima desse degradê corre
              a faixa que importa: o 2233 à esquerda e o botão do grupo
              à direita. O botão principal deixa de morar na coluna de
              texto e passa a morar aqui — encostado no número, que é
              onde ele converte melhor de qualquer forma.

              A partir de `lg` nada disso existe: a faixa se desfaz, o
              degradê some, o número volta a ser sobreposto no canto e o
              botão do grupo volta para junto do texto. */}
          <div
            className="anima-surge relative"
            style={{ animationDelay: '260ms' }}
          >
            {/* Decorativo: sai no celular, onde não há altura para ele. */}
            <div
              aria-hidden
              className="hero-quadro absolute inset-x-0 top-14 bottom-0 hidden rounded-[2rem] bg-gradient-to-b from-white/18 to-white/4 ring-1 ring-white/20 lg:block lg:top-20 lg:rounded-[2.75rem]"
            />

            <div className="hero-foto relative -mx-6 lg:mx-0">
              {/* Sem foto, o gradiente e a silhueta já sustentam a composição.

                  ⚠️ `object-cover` no celular, `object-contain` no
                  desktop, e a diferença é de PRESENÇA. Com `contain` o
                  recorte inteiro precisa caber na caixa: numa faixa de
                  288px de altura ela sai com 218px de largura numa tela
                  de 335 — sobra azul dos dois lados e ela fica pequena.
                  Com `cover` ela ocupa a largura toda e o corte cai
                  abaixo do busto, que é enquadramento de retrato, não
                  perda. No desktop a caixa é alta e `contain` continua
                  certo: lá o recorte inteiro cabe.

                  A MÁSCARA é o que deixa ela passar por cima do botão
                  sem virar remendo. `object-cover` corta reto, e corte
                  reto atravessando o botão amarelo lê como retângulo
                  colado. Com o degradê em `mask-image` ela não termina:
                  ela se dissolve. Aí dá para pôr a foto num z-index
                  acima da faixa — o ombro dela cobre de leve o topo do
                  botão, o botão continua legível embaixo, e a dobra
                  ganha profundidade em vez de camadas empilhadas. */}
              <Imagem
                slot="hero.retrato"
                slots={slots}
                vazio="silhueta"
                prioridade
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="block h-80 w-full object-cover object-top sm:h-[25rem] lg:h-[35rem] lg:object-contain lg:object-bottom"
              />
            </div>

            {/* O degradê saiu daqui.

                Ele existia para a faixa poder ficar EM CIMA da foto. A
                faixa não fica mais: ela desceu para o fluxo, encostada
                no pé da foto. Sem sobreposição, o degradê deixou de ser
                assento e virou área morta — uma tira escura entre o
                busto dela e o botão, que era exatamente o "espaço
                vazio" que aparecia na tela.

                A tentativa de sobrepor com `mask-image` foi pior: a
                máscara deixa a imagem SEMITRANSPARENTE, então o ombro
                dela por cima do botão não dava profundidade — dava
                borrão, com o amarelo vazando por dentro dela.

                O que ficou: a faixa corre POR CIMA do pé da foto, na
                ordem natural do DOM, sem z-index e sem máscara. Assim
                não existe folga possível entre as duas — a foto passa
                por trás — e a faixa não custa altura na primeira
                dobra. O botão é amarelo chapado sobre roupa
                azul-escura: lê bem. */}

            {/* A faixa: número + botão no celular; só o número no
                desktop, de volta ao canto inferior esquerdo. */}
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 lg:-bottom-6 lg:left-6 lg:block lg:w-52">
              <Numero
                prioridade
                className="w-28 shrink-0 drop-shadow-[0_10px_24px_rgba(1,32,58,0.45)] sm:w-32 lg:w-full"
              />

              {!silencio ? (
                <CliqueGrupo origem="hero" href={paraOsGrupos} className="min-w-0 flex-1 lg:hidden">
                  <span className="toque flex min-h-[3.25rem] items-center justify-center rounded-full bg-amarelo px-5 text-base font-semibold text-azul-escuro shadow-alta transition-all duration-300 hover:brightness-105">
                    {ctas.grupoCurto}
                  </span>
                </CliqueGrupo>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* respiro entre o hero e a próxima seção, para o número não colar */}
      <div className="h-10 md:h-14" aria-hidden />
    </section>
  )
}

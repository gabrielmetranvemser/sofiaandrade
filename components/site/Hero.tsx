import Image from 'next/image'
import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Imagem } from '@/components/ui/Imagem'
import { TextoComDestaque, Texto } from '@/components/ui/TextoComDestaque'
import { MarcaNumero, MarcaNumeroHorizontal } from '@/components/ui/Marca'
import { BotaoLink } from '@/components/ui/Botao'
import { BrilhoCursor } from '@/components/animacao/BrilhoCursor'
import { destinoGrupo } from '@/lib/conteudo/secoes'
import { CliqueGrupo } from './CliqueGrupo'
import { RotuloDoGrupo } from './RotuloDoGrupo'

/**
 * Os esquemas que o CSS conhece. Ver `.capa` em globals.css.
 *
 * ⚠️ ESTA LISTA EXISTE PARA APARAR VALOR ANTIGO, e a lição custou uma
 *    dobra sem fundo nenhum. O esquema "verde e amarelo" já se chamou
 *    `capa`; quando ganhou nome próprio, o valor salvo no banco
 *    continuou sendo `capa` — e `[data-capa='capa']` não casa com regra
 *    alguma. Resultado: nenhum degradê, as fotos de fundo a 100% e o
 *    título branco sobre branco.
 *
 *    O ponto geral: valor gravado sobrevive a renomeação de código. A
 *    validação do painel só conserta o que passa por ela, e ninguém
 *    reabre uma seção só para salvá-la de novo.
 */
const ESQUEMAS = ['azul', 'verde', 'amarelo', 'verde-amarelo', 'azul-verde', 'amarelo-azul']
const ESQUEMA_PADRAO = 'verde-amarelo'
import { FundoVivo } from './FundoVivo'

/**
 * Primeira dobra — a capa oficial da campanha, virada em página.
 *
 * ⚠️ ESTA DOBRA JÁ FOI AZUL, e a mudança não foi de gosto: a campanha
 *    mandou a arte de capa e pediu a página começando por ela. O que
 *    mudou, em ordem de peso:
 *
 *    1. O FUNDO PERDEU O AZUL. Duas tentativas anteriores misturaram
 *       verde com o azul da marca e as duas deram verde-água. A capa
 *       não tem azul nenhum — é verde à esquerda abrindo para amarelo
 *       à direita. Sem azul não existe mistura para dar errado.
 *       Ver .fundo-capa em globals.css.
 *
 *    2. O RETÂNGULO SAIU. Havia um quadro arredondado atrás da foto,
 *       e ela ficava dentro dele. A campanha pediu as figuras soltas,
 *       plantadas direto no fundo — que é como a capa faz.
 *
 *    3. SÃO DUAS FIGURAS AGORA. Ela na frente, Flávio atrás e à
 *       direita. Dois recortes separados, e não uma foto só: assim dá
 *       para trocar um sem refazer o outro, e é o painel que manda no
 *       dela (espaço `hero.retrato`).
 *
 *    4. AS FIGURAS ENCOSTAM NO PÉ DA SEÇÃO. Sem quadro e sem folga
 *       embaixo, elas ficam maiores no mesmo espaço — que era o
 *       objetivo do pedido.
 *
 * A regra que manda aqui continua sendo a mesma de sempre: menos de 3
 * segundos até o botão principal ficar clicável, num celular mediano
 * em 4G. Server Component, gradiente em CSS puro, sem biblioteca de
 * animação.
 */
export async function Hero({ silencio = false }: { silencio?: boolean }) {
  const [{ ctas, hero, exibir, aparencia }, slots] = await Promise.all([
    lerConteudo(),
    lerSlots(),
  ])
  const paraOsGrupos = destinoGrupo(exibir)
  const esquema = ESQUEMAS.includes(aparencia.heroCor) ? aparencia.heroCor : ESQUEMA_PADRAO

  return (
    <section
      // ⚠️ O ESQUEMA É UM ATRIBUTO, e a cor do realce e do botão saem
      //    de variáveis CSS que ele define. Não é indireção à toa: são
      //    seis esquemas, e a alternativa seria seis condicionais em
      //    JavaScript espalhadas por este arquivo — uma para o fundo,
      //    outra para o destaque, outra para cada botão. Com variável,
      //    esquema novo é um bloco no CSS e nada aqui.
      data-capa={esquema}
      className="capa brilho-cursor relative isolate overflow-hidden pt-[5.5rem] text-white md:pt-32"
    >
      {/* Só monta listener onde existe ponteiro de verdade. No celular
          este componente devolve sem registrar nada. */}
      <BrilhoCursor />

      {/* As fotos de rua, atrás de tudo. Ficam AQUI e não na coluna
          das figuras porque precisam atravessar a seção inteira — a
          máscara é que decide onde elas aparecem. */}
      <FundoVivo />

      <div className="container-lp">
        {/* `items-end` e não `items-center`: as figuras precisam
            encostar no pé da seção, e é o alinhamento da grade que
            garante isso — não uma altura fixa, que quebraria a cada
            tamanho de tela. */}
        <div className="grid items-end gap-3 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* ── Texto ── */}
          <div className="pb-0 text-center lg:pb-24 lg:text-left">
            {/* Três barrinhas em vez da pílula com bolinha. A pílula
                era forma de sistema de design, não da campanha: aparecia
                igual em qualquer site. As barras são a bandeira reduzida
                ao mínimo, e alturas diferentes fazem elas lerem como
                marca em vez de três traços iguais.

                ⚠️ A PRIMEIRA ERA VERDE e virou branca. Sobre o azul
                antigo, verde era uma das três cores da bandeira; sobre
                o verde da capa ela simplesmente sumia no fundo. */}
            <p className="anima-hero flex items-center justify-center gap-3 lg:justify-start">
              <span className="flex items-end gap-[3px]" aria-hidden>
                <span className="block h-3.5 w-[3px] rounded-full bg-white/70" />
                <span className="block h-5 w-[3px] rounded-full bg-(--capa-realce)" />
                <span className="block h-3.5 w-[3px] rounded-full bg-white" />
              </span>
              <span className="text-[0.8125rem] font-semibold tracking-[0.16em] text-white uppercase">
                {hero.etiqueta}
              </span>
            </p>

            {/* ⚠️ A SOMBRA NÃO É ENFEITE. No fim do gradiente o verde
                já está claro, e branco puro sobre verde-claro perde o
                contorno da letra. Uma sombra escura de raio curto
                devolve a borda sem escurecer o fundo — é mais barato
                que uma camada de escurecimento por cima da arte. */}
            <h1 className="mt-6 titulo-cartaz text-white [text-shadow:0_2px_18px_rgba(6,48,26,0.35)]">
              {hero.titulo.map((linha, i) => (
                <span
                  key={i}
                  className="anima-hero block"
                  style={{ animationDelay: `${100 + i * 80}ms` }}
                >
                  <TextoComDestaque texto={linha} tom="capa" />
                </span>
              ))}
            </h1>

            <p
              className="anima-hero mx-auto mt-4 max-w-xl text-base text-white/90 [text-shadow:0_1px_10px_rgba(6,48,26,0.3)] sm:text-lg md:text-xl lg:mx-0"
              style={{ animationDelay: '440ms' }}
            >
              <Texto tom="capa">{hero.subtitulo}</Texto>
            </p>

            {!silencio ? (
              <div
                className="anima-hero mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
                style={{ animationDelay: '520ms' }}
              >
                {/* ⚠️ O BOTÃO PRINCIPAL ERA AMARELO E VIROU AZUL.
                    Amarelo sobre azul era o contraste máximo possível
                    com as cores da marca; sobre o gradiente da capa,
                    que termina em amarelo, o botão passou a competir
                    com o próprio fundo. O azul-escuro é a única cor da
                    paleta que não existe em lugar nenhum deste fundo —
                    e é justamente isso que faz o botão saltar.

                    No celular este botão NÃO fica aqui: desce para
                    junto da marca, sobre as figuras. `hidden` no
                    próprio link, e não só no miolo, senão sobra um alvo
                    de toque invisível no meio da coluna. */}
                <CliqueGrupo origem="hero" href={paraOsGrupos} className="hidden lg:contents">
                  <span className="toque inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-(--capa-botao) px-8 text-center text-lg font-semibold text-(--capa-botao-texto) shadow-alta transition-all duration-300 hover:brightness-110">
                    {/* O `whitespace-nowrap` que havia aqui saiu junto
                        com a chegada do rótulo por cidade: "Entrar no
                        grupo de Governador Jorge Teixeira" não cabe numa
                        linha em nenhuma largura de coluna, e forçar a
                        linha única faria o botão furar a grade. Sem ele,
                        o texto genérico continua numa linha só — ele é
                        curto — e o nome longo quebra em duas, centrado. */}
                    <RotuloDoGrupo padrao={ctas.grupo} />
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
              <p className="anima-hero mx-auto mt-9 max-w-xl rounded-lg bg-black/20 px-5 py-4 ring-1 ring-white/25 lg:mx-0">
                {ctas.silencio}
              </p>
            )}

            {/* Some no celular: repete o fim do subtítulo ("Hoje sou
                vereadora de Porto Velho") e custa 64px de altura —
                justamente os pixels que faltavam para a marca e o
                botão caberem acima da dobra. */}
            <p
              className="anima-hero mt-5 hidden items-center gap-2 text-sm text-white/85 lg:flex"
              style={{ animationDelay: '600ms' }}
            >
              <svg viewBox="0 0 24 24" className="size-4 text-(--capa-realce)" fill="currentColor" aria-hidden>
                <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
              </svg>
              {hero.rodapeHero}
            </p>

          </div>

          {/* ── As figuras ──
              Duas camadas, e a ordem no DOM é a ordem em profundidade:
              Flávio primeiro (atrás), ela depois (na frente). Sem
              z-index: o empilhamento natural já basta, e um z-index
              aqui criaria contexto novo para brigar com o cabeçalho
              fixo mais tarde.

              ⚠️ `max-w-none` NOS DOIS é obrigatório. O reset do
              Tailwind põe `max-width: 100%` em toda imagem; como as
              duas são posicionadas em absoluto e dimensionadas pela
              ALTURA, sem isso a largura seria espremida de volta para
              dentro da caixa e as figuras apareceriam achatadas. */}
          <div
            className="anima-surge relative -mt-6 flex items-end justify-center sm:-mt-8 lg:mt-0 lg:justify-end"
            style={{ animationDelay: '260ms' }}
          >
            {/* ⚠️ A MARGEM NEGATIVA SÓ EXISTE NO CELULAR, e é ela que
                dá a profundidade que a dobra não tinha ali. Sem ela, a
                grade de uma coluna empilha texto e depois figuras, cada
                um no seu andar — plano, como um documento. Puxando as
                figuras 1,5rem para cima elas passam um pouco POR CIMA
                do pé do botão "Colocar o 2233", e a dobra ganha duas
                camadas.

                ⚠️ A MEDIDA É PEQUENA DE PROPÓSITO. A primeira
                tentativa usou 3rem com as figuras mais altas e elas
                cobriram o botão inteiro — sobrava a sílaba "car" de
                "Colocar". Sobreposição aqui é tempero: o bastante para
                o olho registrar que uma coisa está na frente da outra,
                e nada além disso.

                O preço é que a área delas cobre parte do botão. Por
                isso as duas imagens são `pointer-events-none`: quem
                toca ali acerta o botão, e não o pixel transparente de
                um recorte. */}
            <div className="relative h-[20rem] w-full sm:h-[27rem] lg:h-[42rem]">
              {/* ⚠️ ISTO ERA POSICIONAMENTO ABSOLUTO COM PORCENTAGENS À
                  MÃO, e centralizar virou um jogo de adivinhação: cada
                  ajuste de altura mudava a largura das figuras, que
                  mudava onde o par ficava, e a correção de um lado
                  jogava para o outro. Foram quatro rodadas de "está um
                  pouco para a esquerda" / "agora para a direita".

                  Com flex e `justify-center`, o navegador mede o grupo
                  e centra sozinho — de graça, em qualquer largura de
                  tela, e sem número mágico nenhum.

                  `items-start` e não `items-end`: as duas começam no
                  MESMO topo, que é o que mantém as cabeças no mesmo
                  nível. Ela é 12% mais alta que a caixa e esses 12%
                  sobram embaixo, na cintura, que a seção já cortava.
                  (O recorte dela tem mais folga acima da cabeça que o
                  dele; sem esses 12% a cabeça dela sai menor.)

                  ⚠️ ELA FICA NA FRENTE DELE. SEMPRE. É a regra que
                  não se negocia nesta dobra — a página é a candidatura
                  dela, e ele é apoio.

                  E aqui mora uma armadilha do flex que já inverteu
                  isso uma vez: `order` NÃO muda só a posição, muda
                  também a ORDEM DE PINTURA. A especificação manda usar
                  a "ordem de documento modificada por order", então o
                  `order-2` dele o punha por cima dela mesmo estando
                  antes no DOM — o contrário do que a intuição de
                  "quem vem depois pinta por cima" prometia.

                  `z-10` nela resolve e é explícito. Item de flex aceita
                  z-index sem precisar de `position`, e um z-index
                  declarado vence qualquer ordem de pintura.

                  No desktop o par não é centrado na coluna: ele fica à
                  direita, com o texto à esquerda. Daí o deslocamento
                  lateral só a partir de `lg`.

                  ⚠️ `shrink-0` NAS DUAS, e não é zelo: item de flex
                  encolhe por padrão quando o grupo não cabe. O grupo
                  aqui é MAIOR que a coluna de propósito — as figuras
                  transbordam para os dois lados —, então sem esta
                  classe o navegador espremia as duas para caber. Ela
                  saía com 193px de largura para 394 de altura, uma
                  proporção que não é a da foto: as duas apareciam
                  esticadas e finas. */}
              <div className="absolute inset-0 flex items-start justify-center lg:translate-x-[24%]">
                {/* ⚠️ `w-max shrink-0` NO INVÓLUCRO, e sem isso nada disto
                    funciona. Como item de flex, ele nasce limitado à
                    largura da coluna (517px) enquanto o conteúdo mede
                    867 — e aí `justify-center` do pai centrava a CAIXA
                    de 517, não as pessoas: o par saía deslocado para a
                    direita e a marca, ancorada no meio da caixa,
                    aparecia atrás dela. Medindo pelo conteúdo, o meio
                    da caixa passa a ser o meio das duas. */}
                <div className="relative flex h-full w-max shrink-0 items-start">
                {/* Flávio, atrás. A margem negativa é a sobreposição
                    entre os dois: quanto maior, mais colados. Já foi
                    grande demais uma vez — "parece que ele encoxa
                    ela" — e voltou para uma medida em que ela está
                    claramente na frente, não encostada.

                    ⚠️ A MEDIDA DIFERE ENTRE CELULAR E DESKTOP, e a
                    razão é aritmética: dois recortes de ~270px não
                    cabem lado a lado numa tela de 375px. Ou eles se
                    sobrepõem muito, ou os dois saem cortados nas
                    bordas. A saída foi encolher um pouco o par no
                    celular (20rem em vez de 22) e usar uma
                    sobreposição menor — assim os dois aparecem
                    inteiros, com folga de poucos pixels de cada lado.

                    ⚠️ EM REM, NUNCA EM PORCENTAGEM. Margem percentual
                    se resolve contra a largura do bloco que a contém —
                    e o bloco aqui é `w-max`, ou seja, a largura DELE
                    depende desta margem. A realimentação é real e já
                    aconteceu: um `-ml-[50%]` inocente estabilizou em
                    −569px e o Flávio desapareceu por completo atrás
                    dela. Medida absoluta não tem como entrar nesse
                    laço. */}
                <Image
                  src="/flavio.webp"
                  alt=""
                  width={1755}
                  height={2200}
                  priority
                  sizes="(max-width: 1024px) 55vw, 26vw"
                  aria-hidden
                  className="hero-fundo pointer-events-none order-2 -ml-36 h-full w-auto max-w-none shrink-0 object-contain object-bottom drop-shadow-[0_18px_40px_rgba(6,48,26,0.35)] sm:-ml-48 lg:-ml-[17rem]"
                />

                {/* Ela. É a única figura que o painel controla — trocar
                    a foto da candidata não pode exigir deploy. */}
                <Imagem
                  slot="hero.retrato"
                  slots={slots}
                  vazio="silhueta"
                  prioridade
                  sizes="(max-width: 1024px) 65vw, 32vw"
                  className="hero-foto pointer-events-none relative z-10 order-1 h-[112%] w-auto max-w-none shrink-0 object-contain object-bottom drop-shadow-[0_18px_40px_rgba(6,48,26,0.3)]"
                />

              {/* ⚠️ A MARCA DEITADA, POR CIMA DAS DUAS.
                  A versão empilhada morava embaixo da coluna de texto e
                  foi reprovada com razão: 700×500 é um bloco quase
                  quadrado, e bloco quadrado no pé de uma coluna lê como
                  cartão colado no fim da página, não como assinatura da
                  peça.

                  Deitada ela é 6:1 — uma faixa. E faixa atravessa: posta
                  sobre as duas figuras, no meio delas, ela amarra os
                  dois recortes num grupo só em vez de ficar do lado
                  deles. É o que a arte impressa da campanha faz.

                  A altura (`bottom-[16%]`) cai no tronco dos dois, e
                  não no rosto. Marca sobre rosto é a única regra que
                  não se negocia aqui.

                  ⚠️ ELA MORA DENTRO DO GRUPO, e não na caixa da
                  coluna. Essa diferença já custou dois desalinhamentos.
                  O par TRANSBORDA a coluna dos dois lados, então
                  `left-1/2` da coluna não é o meio das duas pessoas —
                  ficava 87px à esquerda. A correção anterior foi um
                  número medido no navegador (`left-[68%]`), e ele
                  quebrou no primeiro ajuste de posição do par.

                  Agora a marca é filha do invólucro que contém as duas
                  figuras: `left-1/2` dali é o meio delas por
                  construção, e continua sendo depois de qualquer
                  mudança de tamanho, sobreposição ou deslocamento.

                  A largura é relativa ao grupo pelo mesmo motivo. 46%
                  dá cerca de 390px contra 830px de par — antes eram
                  62%, e a marca virava o assunto da dobra em vez da
                  assinatura dela.

                  ⚠️ `z-20` PORQUE ELA É 10. O z-index que garante que
                  a candidata fica na frente do Flávio também a punha na
                  frente da marca — que sumia atrás do ombro dela sem
                  erro nenhum no console. Numa dobra com três camadas
                  sobrepostas, cada uma precisa dizer em que andar
                  está: fundo (fitas) · figuras (10) · marca (20).

                  Só no desktop: no celular a faixa horizontal ficaria
                  com 300px de largura e o "DEPUTADA FEDERAL" sairia com
                  4px de altura. Lá continua valendo a empilhada, ao
                  lado do botão. */}
                  <div className="pointer-events-none absolute bottom-[15%] left-[53%] z-20 hidden w-[46%] -translate-x-1/2 lg:block">
                    <MarcaNumeroHorizontal
                      prioridade
                      className="w-full drop-shadow-[0_8px_26px_rgba(6,48,26,0.55)]"
                    />
                    {hero.lema ? (
                      <p className="mt-3 text-center text-xs font-semibold tracking-[0.22em] text-white uppercase [text-shadow:0_1px_10px_rgba(6,48,26,0.6)]">
                        {hero.lema}
                      </p>
                  ) : null}
                  </div>
                </div>
              </div>

              {/* A faixa do celular: marca à esquerda, botão à direita,
                  correndo por cima do pé das figuras. No desktop ela
                  não existe — lá a marca é a faixa deitada, no meio
                  das duas.

                  ⚠️ `z-20` pelo mesmo motivo da marca deitada: as
                  figuras estão em 10, e sem declarar andar esta faixa
                  ficava atrás do ombro dela — a marca sumia e o botão
                  do grupo aparecia pela metade. Andares desta dobra:
                  fundo (fitas) · figuras (10) · marca e botão (20). */}
              <div className="absolute inset-x-0 bottom-5 z-20 flex items-end gap-3 lg:hidden">
                <div className="shrink-0">
                  <MarcaNumero
                    prioridade
                    className="w-[5.5rem] drop-shadow-[0_10px_24px_rgba(6,48,26,0.55)] sm:w-28"
                  />
                  {hero.lema ? (
                    <p className="mt-1 text-[0.625rem] font-semibold tracking-[0.14em] text-white uppercase sm:text-[0.6875rem]">
                      {hero.lema}
                    </p>
                  ) : null}
                </div>

                {!silencio ? (
                  <CliqueGrupo origem="hero" href={paraOsGrupos} className="min-w-0 flex-1 pb-1">
                    {/* `whitespace-nowrap`: numa tela de 360px sobram
                        ~180px para este botão depois da marca, e
                        "Entrar no grupo" quebrava em duas linhas — o
                        que empurrava a altura do botão e desalinhava a
                        faixa inteira. Melhor encolher a letra do que
                        deixar o rótulo virar parágrafo. */}
                    <span className="toque flex min-h-[3.25rem] items-center justify-center rounded-full bg-(--capa-botao) px-4 text-[0.9375rem] font-semibold whitespace-nowrap text-(--capa-botao-texto) shadow-alta transition-all duration-300 hover:brightness-110 sm:px-5 sm:text-base">
                      {ctas.grupoCurto}
                    </span>
                  </CliqueGrupo>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { Metadata } from 'next'
import { lerSlots } from '@/lib/midia/ler'
import Link from 'next/link'
import { lerConteudo } from '@/lib/conteudo/ler'
import { listarMunicipiosComStatus, municipioPorSlug } from '@/lib/dados'
import { resolverCidadeAlvo } from '@/lib/campanha/alvo'
import { config, diasAteAEleicao, emSilencioEleitoral } from '@/lib/config'
import { RodapeLegal } from '@/components/site/RodapeLegal'
import { RegistroDePagina } from '@/components/site/RegistroDePagina'
import { BuscadorDeGrupo } from '@/components/grupos/BuscadorDeGrupo'
import { FaixaDoTopo } from '@/components/grupos/FaixaDoTopo'
import {
  AcaoDaEntrada,
  EntradaProvider,
  MarcadoresDaCidade,
  TextoDaCidade,
  TrocarCidade,
} from '@/components/grupos/EntradaDoGrupo'
import { Aviso } from '@/components/ui/Aviso'
import { Imagem } from '@/components/ui/Imagem'
import { Numero, Simbolo } from '@/components/ui/Marca'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'

export const revalidate = 3600

type Parametros = {
  cidade?: string
  situacao?: string
  'nao-encontrado'?: string
  silencio?: string
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Parametros>
}): Promise<Metadata> {
  const [{ paginas }, params] = await Promise.all([lerConteudo(), searchParams])

  // ⚠️ O TÍTULO DA ABA APARECE NO TOPO DO NAVEGADOR DO INSTAGRAM, que é
  //    onde o anúncio abre. "Grupo da Sofia em Cabixi" ali repete a
  //    promessa do anúncio antes mesmo de a página desenhar.
  const cidade = params.cidade && !params.situacao ? municipioPorSlug(params.cidade) : undefined

  return {
    title: cidade ? `Grupo da Sofia em ${cidade.nome}` : paginas.grupos.tituloAba,
    description: paginas.grupos.descricao,
    alternates: { canonical: '/grupos' },
    openGraph: {
      title: paginas.grupos.ogTitulo,
      description: paginas.grupos.ogDescricao,
      url: `${config.siteUrl}/grupos`,
    },
  }
}

/**
 * A PÁGINA DE ENTRADA DOS GRUPOS.
 *
 * ⚠️ É AQUI QUE O ANÚNCIO CAI, e não na home. Quem toca no anúncio de
 *    Cabixi chega em `/?cidade=cabixi`, e o `proxy.ts` entrega esta
 *    página no lugar da home, sem mudar o endereço.
 *
 *    O motivo está nos números de 10 a 17/09. Quem vinha do anúncio não
 *    rolava a home: 1,5% chegava à metade dela, e a seção de grupos, no
 *    12º bloco, não recebeu nenhum toque de anúncio. Na primeira tela do
 *    celular o primeiro botão visível levava ao filtro de foto, o do
 *    grupo ficava cortado no pé da tela, e a palavra WhatsApp não
 *    aparecia. Com o botão do topo indo direto ao grupo, 6,5% entravam.
 *
 *    Esta página faz um pedido só, com a cidade do anúncio no título e o
 *    botão na primeira tela de qualquer celular. A home continua sendo a
 *    página de quem vem da bio do Instagram — lá ela converte bem.
 *
 * Textos e fotos vêm do painel: Seções ▸ Página de entrada do anúncio.
 *
 * O mesmo endereço atende três chegadas, e a URL diz qual é:
 *   · `?cidade=` com grupo aberto → página de entrada daquela cidade;
 *   · `?cidade=&situacao=` → desvio do redirecionador (grupo cheio ou
 *     ainda fechado), com o aviso e a busca;
 *   · sem cidade → a busca logo abaixo do título.
 */
export default async function PaginaGrupos({
  searchParams,
}: {
  searchParams: Promise<Parametros>
}) {
  const [slots, municipios, params, conteudo] = await Promise.all([
    lerSlots(),
    listarMunicipiosComStatus(),
    searchParams,
    lerConteudo(),
  ])
  const { candidata, ctas, grupos: copy, entrada } = conteudo
  const simboloDaMarca = slots['marca.simbolo']?.url ?? null

  // Quem chegou aqui vindo de /g/[slug] com grupo indisponível merece
  // saber exatamente o que aconteceu, não uma lista muda.
  //
  // ⚠️ O AVISO EXIGE `situacao`, E NÃO SÓ `cidade`. Quem manda para cá
  //    com grupo indisponível é o redirecionador, e ele SEMPRE manda as
  //    duas coisas. Sem esta condição, `?cidade=` sozinho — que é
  //    exatamente a forma do link de anúncio — caía no ramo do "ainda
  //    não abriu": a página recebia quem clicou no anúncio de uma
  //    cidade com o grupo aberto e avisava, em amarelo, que aquele
  //    grupo não tinha aberto, logo acima do botão que abria ele.
  const situacao = params.situacao
  const cidadeVinda = params.cidade && situacao ? municipioPorSlug(params.cidade) : undefined

  const alvo = emSilencioEleitoral() ? null : resolverCidadeAlvo(params.cidade, municipios)
  const naoEncontrado = params['nao-encontrado'] === '1'
  // Chegou aqui vindo de /g/ durante o silêncio eleitoral: o
  // redirecionador recusou de propósito.
  const emSilencio = params.silencio === '1'

  // Com `situacao` na URL, quem trouxe esta pessoa foi o nosso
  // redirecionador, não um anúncio. Ver RegistroDePagina.
  const cidadeDaVisita = situacao ? null : (alvo?.municipioSlug ?? alvo?.slug ?? null)

  const faixaDaMarca = (
    // ⚠️ SEM MENU, de propósito. Cada item de menu é uma saída antes do
    //    único pedido desta página. Quem quer a história inteira tem o
    //    link no fim, e o "voltar" do navegador.
    <div className="flex items-center gap-2">
      <Simbolo prioridade url={simboloDaMarca} className="h-6 w-auto shrink-0" />
      {/* Uma linha só: em 360px, "· PL" descia sozinho para a segunda e
          comia 18px da altura que o botão precisa. O partido volta a
          partir de 640px, e a identificação completa está no rodapé. */}
      <p className="truncate text-[0.8125rem] leading-none text-grafite">
        <span className="font-[family-name:var(--font-titulo)] font-bold tracking-[-0.02em] text-tinta">
          {candidata.nome}
        </span>{' '}
        · {candidata.cargo}
        <span className="hidden sm:inline"> · {candidata.partido}</span>
      </p>
    </div>
  )

  // ── A página de entrada ──────────────────────────────────────
  if (alvo?.disponivel && !situacao && !emSilencio && !naoEncontrado) {
    const acao = {
      modelo: entrada.botao,
      textos: {
        botaoAbrindo: entrada.botaoAbrindo,
        naoAbriuTitulo: entrada.naoAbriuTitulo,
        naoAbriuBotao: entrada.naoAbriuBotao,
        naoAbriuDica: entrada.naoAbriuDica,
      },
      situacoes: {
        cheio: copy.cheio,
        emBreve: copy.emBreve,
        avisoCheio: copy.avisoCheio,
        avisoEmBreve: copy.avisoEmBreve,
      },
    }
    // As duas fotos têm substituta enquanto o painel não recebe as
    // próprias: a página nunca abre com um quadro cinza no lugar do rosto.
    //
    // ⚠️ A DE CIMA PRECISA SER RECORTE SEM FUNDO, porque entra sobre o
    //    painel amarelo da tarja. `hero.retrato` é o recorte que a
    //    campanha já usa na capa — daí ele, e não `cta.retrato`, ser a
    //    reserva desta.
    const slotDaFoto = slots['entrada.foto'] ? 'entrada.foto' : 'hero.retrato'
    // `cta.retrato` antes de `origem.retrato`: o de origem é ela pendurando
    // uma bandeira, e ao lado de "Sofia é direita raiz" o que a página
    // pede é um retrato.
    const slotDoRetrato = slots['entrada.retrato']
      ? 'entrada.retrato'
      : slots['cta.retrato']
        ? 'cta.retrato'
        : 'origem.retrato'

    // ⚠️ A CONTAGEM SOME SOZINHA NA RETA FINAL. Com um dia ou menos, o
    //    número deixa de ajudar — e no dia 3 os botões de grupo já saíram
    //    do ar pelo silêncio eleitoral. No lugar dela volta o selo fixo.
    const dias = diasAteAEleicao()
    const selo =
      entrada.contagem && dias !== null && dias >= 2
        ? entrada.contagem.replaceAll('{dias}', String(dias))
        : null

    return (
      <EntradaProvider inicial={alvo}>
        {/* `lp`: a visita caiu na página de entrada, e não na home. É o
            par que a conta de conversão do anúncio compara. */}
        <RegistroDePagina cidadeDoAnuncio={cidadeDaVisita} origem="lp" />

        {/* ⚠️ O AZUL É MOLDURA, e o conteúdo mora num cartão branco em
            cima dele. A campanha pediu uma página bonita sem deixar de
            ser simples: a moldura custa uma cor, não uma imagem, e o
            cartão arredondado já dá o ar de peça montada — em vez de
            texto solto correndo de ponta a ponta da tela. */}
        <main id="conteudo" className="fundo-azul-profundo pt-3 pb-5 sm:pt-6 sm:pb-8">
          <div className="mx-auto w-full max-w-xl px-3 sm:px-4">
            <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-alta ring-1 ring-tinta/5">
              <FaixaDoTopo slots={slots} slotDaFoto={slotDaFoto} numero={candidata.numero} />

              <div className="relative isolate px-5 pt-4 pb-7 sm:px-8 sm:pt-6 sm:pb-8">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-claro" />

                {faixaDaMarca}

                {/* A contagem regressiva, ou o selo do grupo. Amarelo com
                    azul-escuro: é a cor de ação do site, e passa no
                    contraste em letra pequena — verde com branco não passa. */}
                <p className="mt-4 inline-flex items-center rounded-full bg-amarelo px-3 py-1.5 text-[0.6875rem] font-bold tracking-[0.08em] text-azul-escuro uppercase">
                  {selo ?? <TextoDaCidade modelo={entrada.etiqueta} />}
                </p>

                <h1 className="mt-2.5 font-[family-name:var(--font-titulo)] text-[1.875rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-tinta sm:text-[2.375rem]">
                  <TextoDaCidade modelo={entrada.titulo} tom="verde" />
                </h1>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-grafite">
                  <TextoDaCidade modelo={entrada.apoio} tom="verde" />
                </p>

                {/* ⚠️ O BOTÃO VEM ANTES DOS MARCADORES. Numa tela de
                    360×640 dentro do Instagram ele precisa caber inteiro
                    sem rolar — os marcadores ajudam quem hesita, e quem
                    hesita rola. */}
                <AcaoDaEntrada {...acao} nota={entrada.notaBotao} principal className="mt-5" />

                <MarcadoresDaCidade itens={entrada.itens} />
                <TrocarCidade rotulo={entrada.trocarCidade} municipios={municipios} />
              </div>

              {/* ── Trajetória, no azul ─────────────────────────── */}
              <section className="fundo-azul-profundo relative isolate px-5 py-9 text-white sm:px-8 sm:py-10">
                {/* Um brilho só, no canto: o azul liso lia como bloco de sistema. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-20 -z-10 size-72 rounded-full bg-azul/50 blur-3xl"
                />

                <div className="flex items-end gap-5">
                  <figure className="relative w-[40%] max-w-40 shrink-0">
                    {/* A borda amarela deslocada é a mesma assinatura das
                        molduras da campanha, em tamanho de detalhe. */}
                    <span aria-hidden className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl bg-amarelo" />
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/20">
                      <Imagem
                        slot={slotDoRetrato}
                        slots={slots}
                        sizes="160px"
                        className="size-full object-cover"
                      />
                    </div>
                  </figure>

                  <div className="min-w-0 pb-2">
                    <p className="etiqueta text-amarelo">{entrada.quemEtiqueta}</p>
                    <h2 className="mt-2 font-[family-name:var(--font-titulo)] text-[1.625rem] leading-[1.08] font-bold tracking-[-0.02em] text-balance">
                      <TextoComDestaque texto={entrada.quemTitulo} tom="amarelo" />
                    </h2>
                  </div>
                </div>

                <ul className="mt-8 grid gap-4 border-l-2 border-amarelo/80 pl-4">
                  {entrada.quem.map((linha, i) => (
                    <li key={i} className="text-[1.0625rem] leading-relaxed text-white/85">
                      <TextoComDestaque texto={linha} tom="amarelo" />
                    </li>
                  ))}
                </ul>

                {/* A frase de convicção. Vazia no painel, o bloco some. */}
                {entrada.quemCitacao ? (
                  <blockquote className="mt-7 rounded-2xl bg-white/10 p-5 text-[1.0625rem] leading-relaxed font-medium text-white ring-1 ring-white/15">
                    <TextoComDestaque texto={entrada.quemCitacao} tom="amarelo" />
                  </blockquote>
                ) : null}

                <AcaoDaEntrada {...acao} sobreEscuro className="mt-8" />

                <div className="mt-6 flex items-center justify-between gap-4">
                  {/* `prefetch={false}`: a home é a página mais pesada do
                      site, e pré-carregá-la no 4G de quem só veio entrar
                      no grupo gastaria a banda dessa pessoa à toa. */}
                  <Link
                    href="/"
                    prefetch={false}
                    className="inline-flex min-h-12 items-center font-semibold text-white underline decoration-white/40 underline-offset-[6px] transition-colors hover:decoration-white"
                  >
                    {entrada.conhecer}
                  </Link>
                  <Numero className="w-24 shrink-0" />
                </div>
              </section>
            </article>
          </div>
        </main>

        <RodapeLegal />
      </EntradaProvider>
    )
  }

  // ── A busca: sem cidade, cidade desconhecida, ou grupo fechado ──
  //
  // Mesma moldura azul e mesmo cartão da página de entrada: quem cai
  // aqui vindo do redirecionador não pode achar que trocou de site.
  const slotDaTarja = slots['entrada.foto'] ? 'entrada.foto' : 'hero.retrato'

  return (
    <>
      <RegistroDePagina cidadeDoAnuncio={cidadeDaVisita} origem="lp" />

      <main id="conteudo" className="fundo-azul-profundo pt-3 pb-5 sm:pt-6 sm:pb-8">
        <div className="mx-auto w-full max-w-xl px-3 sm:px-4">
          <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-alta ring-1 ring-tinta/5">
            <FaixaDoTopo slots={slots} slotDaFoto={slotDaTarja} numero={candidata.numero} />

            <div className="relative isolate px-5 pt-4 pb-8 sm:px-8 sm:pt-6">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-claro" />

              {faixaDaMarca}

              <h1 className="mt-5 font-[family-name:var(--font-titulo)] text-[1.875rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-tinta sm:text-[2.375rem]">
                <TextoComDestaque texto={copy.titulo} tom="azul" />
              </h1>

              {emSilencio ? (
                <Aviso tom="info" className="mt-6">
                  <strong className="font-semibold">{ctas.silencio}</strong>
                </Aviso>
              ) : null}

              {/* Com a cidade já escolhida no painel logo abaixo, é ele que
                  diz se o grupo está cheio ou ainda não abriu — o aviso
                  repetiria a mesma frase duas vezes na mesma tela. */}
              {cidadeVinda && !emSilencio && !alvo ? (
                <Aviso tom={situacao === 'cheio' ? 'info' : 'alerta'} className="mt-6">
                  {situacao === 'cheio' ? (
                    <>
                      <strong className="font-semibold">
                        O grupo de {cidadeVinda.nome} está cheio.
                      </strong>{' '}
                      Estamos abrindo o próximo. Escolha outra cidade próxima ou volte em algumas horas.
                    </>
                  ) : (
                    <>
                      <strong className="font-semibold">
                        O grupo de {cidadeVinda.nome} ainda não abriu.
                      </strong>{' '}
                      {copy.avisoEmBreve}
                    </>
                  )}
                </Aviso>
              ) : null}

              {naoEncontrado ? (
                <Aviso tom="info" className="mt-6">
                  Não encontramos essa cidade. Digite o nome dela aqui embaixo.
                </Aviso>
              ) : null}

              {/* ⚠️ A BUSCA ANTES DA EXPLICAÇÃO. Com o texto de introdução
                  em cima, o botão de localização caía em y≈630 num celular
                  — no pé da tela ou abaixo dela. */}
              <BuscadorDeGrupo municipios={municipios} alvo={alvo} className="mt-6" />
              <p className="mt-6 text-lg text-grafite">{copy.intro}</p>

              <Link
                href="/"
                prefetch={false}
                className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 6l-6 6 6 6" />
                </svg>
                Voltar para a página
              </Link>
            </div>
          </article>
        </div>
      </main>

      <RodapeLegal />
    </>
  )
}

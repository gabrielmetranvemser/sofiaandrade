import type { Metadata } from 'next'
import { lerSlots } from '@/lib/midia/ler'
import Link from 'next/link'
import { lerConteudo } from '@/lib/conteudo/ler'
import { listarMunicipiosComStatus, municipioPorSlug } from '@/lib/dados'
import { resolverCidadeAlvo } from '@/lib/campanha/alvo'
import { config, emSilencioEleitoral } from '@/lib/config'
import { RodapeLegal } from '@/components/site/RodapeLegal'
import { RegistroDePagina } from '@/components/site/RegistroDePagina'
import { BuscadorDeGrupo } from '@/components/grupos/BuscadorDeGrupo'
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
    <div className="flex items-center gap-3 pt-5">
      <Simbolo prioridade url={simboloDaMarca} className="h-8 w-auto shrink-0" />
      <p className="leading-tight">
        <span className="block font-[family-name:var(--font-titulo)] text-[1.0625rem] font-bold tracking-[-0.025em] text-tinta">
          {candidata.nome}
        </span>
        <span className="block text-[0.6875rem] font-medium tracking-[0.08em] text-grafite">
          {candidata.cargo} · {candidata.partido}
        </span>
      </p>
    </div>
  )

  // ── A página de entrada ──────────────────────────────────────
  if (alvo?.disponivel && !situacao && !emSilencio && !naoEncontrado) {
    const acao = {
      rotuloDe: ctas.grupoDe,
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
    const slotDaFoto = slots['entrada.foto'] ? 'entrada.foto' : 'cta.retrato'
    const slotDoRetrato = slots['entrada.retrato'] ? 'entrada.retrato' : 'origem.retrato'

    return (
      <EntradaProvider inicial={alvo}>
        {/* `lp`: a visita caiu na página de entrada, e não na home. É o
            par que a conta de conversão do anúncio compara. */}
        <RegistroDePagina cidadeDoAnuncio={cidadeDaVisita} origem="lp" />

        <main id="conteudo">
          <section className="relative isolate overflow-hidden bg-white pb-10">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-claro" />

            <div className="container-lp max-w-xl">
              {faixaDaMarca}

              <div className="mt-7 flex items-center gap-3">
                {/* O rosto que a pessoa acabou de ver no anúncio. */}
                <div className="size-14 shrink-0 overflow-hidden rounded-full ring-4 ring-azul-suave">
                  <Imagem
                    slot={slotDaFoto}
                    slots={slots}
                    sizes="56px"
                    prioridade
                    className="size-full object-cover"
                  />
                </div>
                <p className="etiqueta text-verde-escuro">{entrada.etiqueta}</p>
              </div>

              <h1 className="mt-4 font-[family-name:var(--font-titulo)] text-[2rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-tinta sm:text-[2.5rem]">
                <TextoDaCidade modelo={entrada.titulo} tom="verde" />
              </h1>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-grafite">
                <TextoDaCidade modelo={entrada.apoio} tom="verde" />
              </p>

              {/* ⚠️ O BOTÃO VEM ANTES DOS MARCADORES. Numa tela de
                  360×640 dentro do Instagram ele precisa caber inteiro
                  sem rolar — os marcadores ajudam quem hesita, e quem
                  hesita rola. */}
              <AcaoDaEntrada {...acao} nota={entrada.notaBotao} principal className="mt-6" />

              <MarcadoresDaCidade itens={entrada.itens} />
              <TrocarCidade rotulo={entrada.trocarCidade} municipios={municipios} />
            </div>
          </section>

          {/* ── Quem é a Sofia, no azul ─────────────────────────── */}
          <section className="relative isolate overflow-hidden fundo-azul-profundo py-12 text-white">
            {/* Um brilho só, no canto: o azul liso lia como bloco de sistema. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-28 -right-24 -z-10 size-80 rounded-full bg-azul/50 blur-3xl"
            />

            <div className="container-lp max-w-xl">
              <div className="flex items-end gap-5">
                <figure className="relative w-[42%] max-w-44 shrink-0">
                  {/* A borda amarela deslocada é a mesma assinatura das
                      molduras da campanha, em tamanho de detalhe. */}
                  <span aria-hidden className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl bg-amarelo" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/20">
                    <Imagem
                      slot={slotDoRetrato}
                      slots={slots}
                      sizes="176px"
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

              <ul className="mt-9 grid gap-4 border-l-2 border-amarelo/80 pl-4">
                {entrada.quem.map((linha, i) => (
                  <li key={i} className="text-[1.0625rem] leading-relaxed text-white/85">
                    <TextoComDestaque texto={linha} tom="amarelo" />
                  </li>
                ))}
              </ul>

              <AcaoDaEntrada {...acao} sobreEscuro className="mt-9" />

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
            </div>
          </section>
        </main>

        <RodapeLegal />
      </EntradaProvider>
    )
  }

  // ── A busca: sem cidade, cidade desconhecida, ou grupo fechado ──
  return (
    <>
      <RegistroDePagina cidadeDoAnuncio={cidadeDaVisita} origem="lp" />

      <main id="conteudo">
        <section className="relative isolate overflow-hidden bg-white pb-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-claro" />

          <div className="container-lp max-w-xl">
            {faixaDaMarca}

            <Link
              href="/"
              prefetch={false}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 6l-6 6 6 6" />
              </svg>
              Voltar para a página
            </Link>

            <h1 className="mt-4 font-[family-name:var(--font-titulo)] text-[2rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-tinta sm:text-[2.5rem]">
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
          </div>
        </section>
      </main>

      <RodapeLegal />
    </>
  )
}

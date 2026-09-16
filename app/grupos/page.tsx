import type { Metadata } from 'next'
import { lerSlots } from '@/lib/midia/ler'
import Link from 'next/link'
import { lerConteudo } from '@/lib/conteudo/ler'
import { listarMunicipiosComStatus, municipioPorSlug } from '@/lib/dados'
import { resolverCidadeAlvo } from '@/lib/campanha/alvo'
import { CidadeAlvoProvider } from '@/lib/campanha/contexto'
import { config, emSilencioEleitoral } from '@/lib/config'
import { Header } from '@/components/site/Header'
import { RodapeLegal } from '@/components/site/RodapeLegal'
import { RegistroDePagina } from '@/components/site/RegistroDePagina'
import { BuscadorDeGrupo } from '@/components/grupos/BuscadorDeGrupo'
import { Aviso } from '@/components/ui/Aviso'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { paginas } = await lerConteudo()
  return {
    title: paginas.grupos.tituloAba,
    description: paginas.grupos.descricao,
    alternates: { canonical: '/grupos' },
    openGraph: {
      title: paginas.grupos.ogTitulo,
      description: paginas.grupos.ogDescricao,
      url: `${config.siteUrl}/grupos`,
    },
  }
}

export default async function PaginaGrupos({
  searchParams,
}: {
  searchParams: Promise<{
    cidade?: string
    situacao?: string
    'nao-encontrado'?: string
    silencio?: string
  }>
}) {
  const simboloDaMarca = (await lerSlots())['marca.simbolo']?.url ?? null
  const [municipios, params, conteudo] = await Promise.all([
    listarMunicipiosComStatus(),
    searchParams,
    lerConteudo(),
  ])
  const { ctas, grupos: copy } = conteudo

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

  // ⚠️ O MESMO `?cidade=` SERVE A DUAS CHEGADAS DIFERENTES, e por isso
  //    convive com `situacao` em vez de brigar com ele.
  //
  //    Uma é o link do anúncio: `/grupos?cidade=porto-velho`, e a
  //    cidade aparece já escolhida no painel do buscador.
  //
  //    A outra é o desvio do redirecionador, que manda para cá quando o
  //    grupo está cheio ou ainda não abriu — e aí `situacao` também vem
  //    junto, o aviso amarelo explica o que houve, e o painel mostra a
  //    situação em vez do botão. As duas leituras são verdadeiras ao mesmo
  //    tempo; separá-las em dois parâmetros só criaria uma terceira
  //    combinação para alguém errar.
  const alvo = emSilencioEleitoral() ? null : resolverCidadeAlvo(params.cidade, municipios)
  const naoEncontrado = params['nao-encontrado'] === '1'
  // Chegou aqui vindo de /g/ durante o silêncio eleitoral: o
  // redirecionador recusou de propósito.
  const emSilencio = params.silencio === '1'

  return (
    <CidadeAlvoProvider valor={alvo}>
      {/* Com `situacao` na URL, quem trouxe esta pessoa foi o nosso
          redirecionador, não um anúncio. Ver RegistroDePagina. */}
      <RegistroDePagina
        cidadeDoAnuncio={situacao ? null : (alvo?.municipioSlug ?? alvo?.slug ?? null)}
      />
      <Header silencio={emSilencioEleitoral()} simbolo={simboloDaMarca} />

      <main id="conteudo" className="pt-24 md:pt-28">
        <section className="relative isolate overflow-hidden bg-white pb-12 pt-8 md:pb-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-claro" />

          <div className="container-lp">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 6l-6 6 6 6" />
              </svg>
              Voltar para a página
            </Link>

            <h1 className="mt-6 titulo-cartaz">
              <TextoComDestaque texto={copy.titulo} tom="azul" />
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-grafite md:text-xl">{copy.intro}</p>
          </div>
        </section>

        <section className="bg-areia pb-20 pt-2 md:pb-28">
          <div className="container-lp">
            {emSilencio ? (
              <Aviso tom="info" className="mb-2">
                <strong className="font-semibold">{ctas.silencio}</strong>
              </Aviso>
            ) : null}

            {/* Com a cidade já escolhida no painel logo abaixo, é ele que
                diz se o grupo está cheio ou ainda não abriu — o aviso
                repetiria a mesma frase duas vezes na mesma tela. */}
            {cidadeVinda && !emSilencio && !alvo ? (
              <Aviso tom={situacao === 'cheio' ? 'info' : 'alerta'} className="mb-2">
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
              <Aviso tom="info" className="mb-2">
                Não encontramos essa cidade. Digite o nome dela aqui embaixo.
              </Aviso>
            ) : null}

            <BuscadorDeGrupo municipios={municipios} alvo={alvo} className="mt-8 max-w-xl" />
          </div>
        </section>
      </main>

      <RodapeLegal />
    </CidadeAlvoProvider>
  )
}

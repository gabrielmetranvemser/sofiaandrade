import type { Metadata } from 'next'
import Link from 'next/link'
import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { lerApoios, formatarApoios } from '@/lib/apoios'
import { resolverMolduras } from '@/lib/molduras'
import { config, emSilencioEleitoral } from '@/lib/config'
import { Header } from '@/components/site/Header'
import { RodapeLegal } from '@/components/site/RodapeLegal'
import { TextoComDestaque, Texto } from '@/components/ui/TextoComDestaque'
import { AvisoWebview } from '@/components/filtro/AvisoWebview'
import { Fluxo } from '@/components/filtro/Fluxo'

export async function generateMetadata(): Promise<Metadata> {
  const { paginas } = await lerConteudo()
  return {
    title: paginas.filtro.tituloAba,
    description: paginas.filtro.descricao,
    alternates: { canonical: '/filtro' },
    openGraph: {
      title: paginas.filtro.ogTitulo,
      description: paginas.filtro.ogDescricao,
      url: `${config.siteUrl}/filtro`,
    },
  }
}

export default async function PaginaFiltro() {
  const simboloDaMarca = (await lerSlots())['marca.simbolo']?.url ?? null
  const [{ filtro: copy }, slots, apoios] = await Promise.all([
    lerConteudo(),
    lerSlots(),
    lerApoios(),
  ])

  const silencio = emSilencioEleitoral()

  // A arte final da moldura vem do painel. O SVG em /public é a rede
  // de segurança, e a resolução acontece aqui porque o fluxo é Client
  // Component e não alcança o Storage.
  const molduras = resolverMolduras(slots)

  return (
    <>
      <Header silencio={silencio} simbolo={simboloDaMarca} />

      <main id="conteudo" className="pt-[4.5rem]">
        {/* A faixa do webview do Instagram fica no TOPO da página,
            antes de qualquer coisa. É onde ela é vista. */}
        <AvisoWebview />

        {/* A abertura é curta de propósito: quem chega aqui já decidiu
            fazer a foto. Título, uma linha e o fluxo — a explicação
            longa empurrava o primeiro controle para fora da tela. */}
        <section className="relative isolate overflow-hidden bg-white pt-10 pb-10 md:pt-14">
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

            <h1 className="mt-5 titulo-cartaz">
              <TextoComDestaque texto={copy.titulo} tom="azul" />
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-grafite"><Texto>{copy.intro}</Texto></p>
          </div>
        </section>

        <section className="bg-areia pt-10 pb-16 md:pt-14 md:pb-24">
          <div className="container-lp">
            <Fluxo molduras={molduras} apoios={apoios ? formatarApoios(apoios) : null} />
          </div>
        </section>
      </main>

      <RodapeLegal />
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { lerConteudo } from '@/lib/conteudo/ler'
import { config } from '@/lib/config'
import { Header } from '@/components/site/Header'
import { RodapeLegal } from '@/components/site/RodapeLegal'
import { AvisoWebview } from '@/components/filtro/AvisoWebview'
import { GeradorDeFiltro } from '@/components/filtro/GeradorDeFiltro'
import { emSilencioEleitoral } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Coloque o 2233 na sua foto',
  description:
    'Gere sua foto de perfil e seu story com a moldura da campanha. ' +
    'Sem cadastro. Sua foto não sai do seu aparelho.',
  alternates: { canonical: '/filtro' },
  openGraph: {
    title: 'Coloque o 2233 na sua foto · Sofia Andrade',
    description: 'Sem cadastro. Sua foto não sai do seu aparelho.',
    url: `${config.siteUrl}/filtro`,
  },
}

export default async function PaginaFiltro() {
  const { filtro: copy } = await lerConteudo()
  const silencio = emSilencioEleitoral()

  return (
    <>
      <Header silencio={silencio} />

      <main id="conteudo" className="pt-[4.5rem]">
        {/* A faixa do webview do Instagram fica no TOPO da página,
            antes de qualquer coisa. É onde ela é vista. */}
        <AvisoWebview />

        <section className="relative isolate overflow-hidden bg-white pt-12 pb-14 md:pt-16 md:pb-20">
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

            <p className="mt-6 flex w-fit items-center gap-2 rounded-full border border-azul/15 bg-white/70 px-4 py-2 text-[0.8125rem] font-semibold tracking-[0.04em] text-azul">
              <span className="size-1.5 rounded-full bg-verde" aria-hidden />
              {copy.etiqueta}
            </p>

            <h1 className="mt-6 titulo-cartaz">
              Coloque o <span className="text-azul">2233</span> na sua foto.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-grafite md:text-xl">{copy.intro}</p>
          </div>
        </section>

        <section className="bg-areia py-14 md:py-20">
          <div className="container-lp">
            <GeradorDeFiltro />
          </div>
        </section>
      </main>

      <RodapeLegal />
    </>
  )
}

import type { Metadata } from 'next'
import { lerSlots } from '@/lib/midia/ler'
import Link from 'next/link'
import { lerConteudo } from '@/lib/conteudo/ler'
import { resolverTokens } from '@/lib/conteudo/tokens'
import { config, emSilencioEleitoral } from '@/lib/config'
import { Header } from '@/components/site/Header'
import { RodapeLegal } from '@/components/site/RodapeLegal'
import { Aviso } from '@/components/ui/Aviso'

export async function generateMetadata(): Promise<Metadata> {
  const { paginas } = await lerConteudo()
  return {
    title: paginas.privacidade.tituloAba,
    description: paginas.privacidade.descricao,
    alternates: { canonical: '/politica-de-privacidade' },
    openGraph: {
      title: paginas.privacidade.ogTitulo,
      description: paginas.privacidade.ogDescricao,
    },
    robots: { index: true, follow: true },
  }
}


export default async function PaginaPrivacidade() {
  const simboloDaMarca = (await lerSlots())['marca.simbolo']?.url ?? null
  const conteudo = await lerConteudo()
  const { privacidade } = conteudo

  return (
    <>
      <Header silencio={emSilencioEleitoral()} simbolo={simboloDaMarca} />

      <main id="conteudo" className="pt-24 md:pt-28">
        <section className="relative isolate overflow-hidden bg-white pb-12 pt-8">
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

            <h1 className="mt-6 titulo-secao">{privacidade.titulo}</h1>
            <p className="mt-3 text-sm text-grafite">
              Atualizada em {privacidade.atualizadoEm}
            </p>

            <Aviso tom="sucesso" className="mt-8 max-w-3xl">
              <strong className="font-semibold">{privacidade.resumo}</strong>
            </Aviso>
          </div>
        </section>

        <section className="bg-white pb-24">
          <div className="container-lp">
            <div className="max-w-3xl space-y-10">
              {privacidade.secoes.map((s) => (
                <article key={s.id}>
                  <h2 className="text-xl md:text-2xl">{s.titulo}</h2>
                  <div className="mt-3 space-y-4">
                    {s.conteudo.map((p, i) => (
                      <p key={i} className="text-lg text-grafite">
                        {resolverTokens(p, conteudo)}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-14 max-w-3xl text-sm text-grafite">
              Endereço desta página: {config.siteUrl}/politica-de-privacidade
            </p>
          </div>
        </section>
      </main>

      <RodapeLegal />
    </>
  )
}

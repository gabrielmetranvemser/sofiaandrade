import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { lerConteudo } from '@/lib/conteudo/ler'
import { listarMunicipiosComStatus, municipioPorSlug } from '@/lib/dados'
import { casarCidadePorHeader } from '@/lib/geo'
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
  const [municipios, cabecalhos, params, conteudo] = await Promise.all([
    listarMunicipiosComStatus(),
    headers(),
    searchParams,
    lerConteudo(),
  ])
  const { ctas, grupos: copy } = conteudo

  const sugerido = casarCidadePorHeader(
    municipios,
    cabecalhos.get('x-vercel-ip-city'),
    cabecalhos.get('x-vercel-ip-country-region'),
  )

  // Quem chegou aqui vindo de /g/[slug] com grupo indisponível merece
  // saber exatamente o que aconteceu, não uma lista muda.
  const cidadeVinda = params.cidade ? municipioPorSlug(params.cidade) : undefined
  const situacao = params.situacao
  const naoEncontrado = params['nao-encontrado'] === '1'
  // Chegou aqui vindo de /g/ durante o silêncio eleitoral: o
  // redirecionador recusou de propósito.
  const emSilencio = params.silencio === '1'

  return (
    <>
      <RegistroDePagina />
      <Header silencio={emSilencioEleitoral()} />

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

            {cidadeVinda && !emSilencio ? (
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
                Não encontramos essa cidade. Procure na lista abaixo.
              </Aviso>
            ) : null}

            <BuscadorDeGrupo municipios={municipios} sugerido={sugerido} />
          </div>
        </section>
      </main>

      <RodapeLegal />
    </>
  )
}

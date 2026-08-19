import { headers } from 'next/headers'
import { listarMunicipiosComStatus } from '@/lib/dados'
import { casarCidadePorHeader } from '@/lib/geo'
import { config, emSilencioEleitoral } from '@/lib/config'
import { candidata, meta } from '@/content/copy'

import { Header } from '@/components/site/Header'
import { BotaoFlutuante } from '@/components/site/BotaoFlutuante'
import { RegistroDePagina } from '@/components/site/RegistroDePagina'
import { Hero } from '@/components/site/Hero'
import { Origem } from '@/components/site/Origem'
import { Problema } from '@/components/site/Problema'
import { Valores } from '@/components/site/Valores'
import { Provas } from '@/components/site/Provas'
import { Futuro } from '@/components/site/Futuro'
import { SecaoGrupos } from '@/components/site/SecaoGrupos'
import { SecaoFiltro } from '@/components/site/SecaoFiltro'
import { Compartilhar } from '@/components/site/Compartilhar'
import { CtaFinal } from '@/components/site/CtaFinal'
import { RodapeLegal } from '@/components/site/RodapeLegal'

/**
 * Revalida de hora em hora. Dois motivos:
 *  · o status dos grupos muda no painel e precisa aparecer sem redeploy
 *  · o silêncio eleitoral vira sozinho, sem alguém lembrar de apagar CTA
 */
export const revalidate = 3600

export default async function Home() {
  const [municipios, cabecalhos] = await Promise.all([
    listarMunicipiosComStatus(),
    headers(),
  ])

  // Sugestão silenciosa por IP: o header vem da Vercel, de graça,
  // sem pedir permissão nenhuma para a pessoa.
  const sugerido = casarCidadePorHeader(
    municipios,
    cabecalhos.get('x-vercel-ip-city'),
    cabecalhos.get('x-vercel-ip-country-region'),
  )

  const silencio = emSilencioEleitoral()

  return (
    <>
      <RegistroDePagina />
      <Header silencio={silencio} />

      <main id="conteudo">
        <Hero silencio={silencio} />
        <Origem />
        <Problema />
        <Valores />
        <Provas />
        <Futuro />
        <SecaoGrupos municipios={municipios} sugerido={sugerido} />
        <SecaoFiltro />
        <Compartilhar siteUrl={config.siteUrl} />
        <CtaFinal silencio={silencio} />
      </main>

      <RodapeLegal />
      <BotaoFlutuante silencio={silencio} />

      {/* Dados estruturados: ajuda o Google a entender quem é a pessoa.
          SEO importa pouco aqui (o tráfego vem do Instagram), mas custa
          zero e resolve a busca por nome próprio. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: candidata.nome,
            jobTitle: `Candidata a ${candidata.cargo}`,
            description: meta.descricao,
            url: config.siteUrl,
            sameAs: [candidata.instagram],
            affiliation: { '@type': 'Organization', name: candidata.partidoExtenso },
            homeLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressRegion: candidata.uf,
                addressCountry: 'BR',
              },
            },
          }),
        }}
      />
    </>
  )
}

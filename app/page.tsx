import { headers } from 'next/headers'
import { lerSlots } from '@/lib/midia/ler'
import { listarMunicipiosComStatus } from '@/lib/dados'
import { casarCidadePorHeader } from '@/lib/geo'
import { resolverCidadeAlvo } from '@/lib/campanha/alvo'
import { CidadeAlvoProvider } from '@/lib/campanha/contexto'
import { config, emSilencioEleitoral } from '@/lib/config'
import { candidata, meta } from '@/content/copy'
import { lerConteudo } from '@/lib/conteudo/ler'
import { destinoGrupo, secoesOcultas } from '@/lib/conteudo/secoes'

import { Header } from '@/components/site/Header'
import { BotaoFlutuante } from '@/components/site/BotaoFlutuante'
import { RegistroDePagina } from '@/components/site/RegistroDePagina'
import { Hero } from '@/components/site/Hero'
import { FaixaCorrida } from '@/components/site/FaixaCorrida'
import { Origem } from '@/components/site/Origem'
import { Album } from '@/components/site/Album'
import { Rua } from '@/components/site/Rua'
import { Problema } from '@/components/site/Problema'
import { Valores } from '@/components/site/Valores'
import { CenaBandeira } from '@/components/animacao/CenaBandeira'
import { Provas } from '@/components/site/Provas'
import { ProvaSocial } from '@/components/site/ProvaSocial'
import { Trilha } from '@/components/site/Trilha'
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>
}) {
  const simboloDaMarca = (await lerSlots())['marca.simbolo']?.url ?? null
  // Quais seções estão ligadas. Vem do painel; ver content/copy.ts.
  const { exibir } = await lerConteudo()
  const [municipios, cabecalhos, params] = await Promise.all([
    listarMunicipiosComStatus(),
    headers(),
    searchParams,
  ])

  // Sugestão silenciosa por IP: o header vem da Vercel, de graça,
  // sem pedir permissão nenhuma para a pessoa.
  const sugerido = casarCidadePorHeader(
    municipios,
    cabecalhos.get('x-vercel-ip-city'),
    cabecalhos.get('x-vercel-ip-country-region'),
  )

  const silencio = emSilencioEleitoral()

  // ── A CIDADE DO ANÚNCIO ─────────────────────────────────────
  //
  // ⚠️ EM SILÊNCIO ELEITORAL O ALVO É `null`, e não basta confiar em
  //    quem renderiza os botões. Cada CTA já se esconde sozinho no
  //    silêncio, mas o alvo é o que os transforma em link direto para o
  //    WhatsApp: deixá-lo de pé seria manter carregada a única peça que
  //    ainda pode levar alguém a um grupo depois da hora. A trava
  //    definitiva continua no redirecionador, que recusa de qualquer
  //    jeito — esta aqui é a que impede o botão de existir.
  const alvo = silencio ? null : resolverCidadeAlvo(params.cidade, municipios)

  return (
    <CidadeAlvoProvider valor={alvo}>
      {/* Na home, `?cidade=` só pode ter vindo de um link de anúncio: o
          redirecionador nunca manda ninguém para cá. */}
      <RegistroDePagina cidadeDoAnuncio={alvo?.municipioSlug ?? alvo?.slug ?? null} />
      <Header silencio={silencio} simbolo={simboloDaMarca} ocultas={secoesOcultas(exibir)} />

      <main id="conteudo">
        <Hero silencio={silencio} />
        {exibir.faixa ? <FaixaCorrida /> : null}
        {exibir.origem ? <Origem /> : null}
        {/* Álbum e Rua ficam entre Origem e Problema porque a ordem
            aqui é cronológica: ela conta de onde veio, o álbum mostra
            o passado, a rua mostra 2020 — e só então a página vira
            para o que está errado hoje. */}
        {exibir.album ? <Album /> : null}
        {exibir.rua ? <Rua /> : null}
        {exibir.problema ? <Problema /> : null}
        {exibir.valores ? <Valores /> : null}
        {exibir.cena ? <CenaBandeira /> : null}
        {exibir.provas ? <Provas /> : null}
        {/* Depois de Provas, nunca antes: primeiro a lei, depois o
            elogio. Invertido, os depoimentos chegam antes de existir
            motivo para eles. */}
        {exibir.social ? <ProvaSocial /> : null}
        {/* A trilha vem antes de Compromissos porque é o último bloco
            de prova: depois dela a página para de olhar para trás e
            começa a prometer. E vem depois da prova social pela mesma
            regra que já rege esta ordem — primeiro o que aconteceu,
            depois o que dizem sobre isso, só então o que virá. */}
        {exibir.trilha ? <Trilha /> : null}
        {exibir.futuro ? <Futuro /> : null}
        {exibir.grupos ? (
          <SecaoGrupos municipios={municipios} sugerido={sugerido} alvo={alvo} />
        ) : null}
        {exibir.filtro ? <SecaoFiltro /> : null}
        {exibir.compartilhar ? <Compartilhar siteUrl={config.siteUrl} /> : null}
        <CtaFinal silencio={silencio} />
      </main>

      <RodapeLegal />
      <BotaoFlutuante silencio={silencio} destino={destinoGrupo(exibir)} />

      {/* Dados estruturados: ajuda o Google a entender quem é a pessoa.
          SEO importa pouco aqui (o tráfego vem do Instagram), mas custa
          zero e resolve a busca por nome próprio.

          ⚠️ O `replace` NÃO É ENFEITE, e é o único ponto da página que
          escreve HTML sem passar pelo React. `JSON.stringify` escapa
          aspas, mas NÃO escapa `</script>` — e o navegador fecha a tag
          ao ver essa sequência, esteja ela dentro de uma string JSON ou
          não. Um nome de candidata com `</script><script>…` gravado no
          painel viraria código executado em toda visita.

          Trocar `<` pelo seu escape unicode resolve na origem: dentro
          de JSON, `\u003c` é lido como `<` e o valor continua correto;
          para o analisador de HTML, a sequência que fecha a tag deixa
          de existir. É a mesma defesa que as bibliotecas seriam
          obrigadas a aplicar — aqui é explícita porque o `dangerously`
          no nome da prop é o aviso de que ninguém mais vai proteger. */}
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
          }).replace(/</g, '\\u003c'),
        }}
      />
    </CidadeAlvoProvider>
  )
}

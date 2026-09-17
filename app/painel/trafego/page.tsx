import Link from 'next/link'
import { config } from '@/lib/config'
import { lerTrafego } from '@/lib/trafego/ler'
import { EVENTO_META, EXPLICACAO_EVENTO, EVENTOS_PADRAO_META } from '@/lib/trafego/tipos'
import type { TipoEvento } from '@/lib/tipos'
import { EditorTrafego } from './EditorTrafego'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Tráfego', robots: { index: false } }

/**
 * TRÁFEGO — onde o rastreamento de anúncio é ligado.
 *
 * ⚠️ ESTA TELA NÃO USA O EDITOR GENÉRICO DE SEÇÕES, e a razão é o
 *    token. O editor genérico grava em `conteudo`, que é versionado:
 *    cada salvamento guarda uma cópia integral em `conteudo_versoes`,
 *    para sempre. Uma credencial ali ficaria em texto puro no
 *    histórico, e continuaria lá depois de trocada.
 *
 *    Por isso a tabela é própria, sem gatilho de versão, e por isso a
 *    tela é escrita à mão: ela precisa mascarar o token na leitura,
 *    exigir um gesto explícito para trocá-lo, e nunca devolvê-lo ao
 *    navegador. Nada disso o formulário genérico sabe fazer.
 */
export default async function PaginaTrafego() {
  const t = await lerTrafego()

  const estados = [
    {
      nome: 'Pixel da Meta',
      ligado: Boolean(t.metaPixelId),
      detalhe: t.metaPixelId ? `ID ${t.metaPixelId}` : 'Nenhum evento sai para a Meta.',
    },
    {
      nome: 'Conversions API',
      ligado: Boolean(t.metaPixelId && t.capiToken && t.capiAtiva),
      detalhe: !t.capiToken
        ? 'Sem token: só o navegador mede.'
        : !t.capiAtiva
          ? 'Token salvo, envio desligado no interruptor abaixo.'
          : t.capiTeste
            ? `Em modo de teste (${t.capiTeste}) — nada conta como conversão.`
            : 'Medindo pelo servidor.',
    },
    {
      nome: 'Google Tag Manager',
      ligado: Boolean(t.gtmId),
      detalhe: t.gtmId ? `Contêiner ${t.gtmId}` : 'Nenhuma tag do GTM carrega.',
    },
  ]

  return (
    <>
      <header>
        <h1 className="titulo-secao">Tráfego</h1>
        <p className="mt-2 max-w-3xl text-grafite">
          O rastreamento dos anúncios. Preencha só o que a campanha usa: campo vazio não carrega
          nada — nem uma tag, nem uma requisição a mais na página.
        </p>
      </header>

      {/* ⚠️ ESTE AVISO EXPLICA POR QUE A META VAI CONTAR MENOS QUE O
          PAINEL, e fica na tela porque é a primeira dúvida de quem
          compara os dois números. Desde 17/09 nada daqui carrega sem
          autorização no aviso de cookies — ver lib/consentimento.ts. */}
      <div className="mt-8 rounded-2xl border border-amarelo bg-amarelo/15 p-5 text-sm">
        <h2 className="text-base font-semibold">Tudo aqui depende do aviso de cookies</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="font-medium">Google Tag Manager</strong> (e o GA4 e o Clarity dentro
            dele) só carrega para quem autorizou <em>desempenho</em>.
          </li>
          <li>
            <strong className="font-medium">Pixel e Conversions API</strong> só enviam para quem
            autorizou <em>publicidade</em> — inclusive o <code className="font-mono">Lead</code> do
            clique no grupo.
          </li>
          <li>
            Quem rejeita continua contando nas métricas do painel, que não usam cookie. Por isso o
            Gerenciador de Eventos vai mostrar menos que o painel, e isso é o esperado.
          </li>
          <li>
            Ferramenta nova no GTM? Diga qual em <em>Aviso de cookies</em> e na{' '}
            <em>Política de privacidade</em>, no painel, antes de publicar o contêiner.
          </li>
        </ul>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {estados.map((e) => (
          <li key={e.nome} className="rounded-2xl border border-linha bg-white p-4">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={`size-2.5 rounded-full ${e.ligado ? 'bg-verde' : 'bg-linha'}`}
              />
              <span className="text-sm font-medium">{e.nome}</span>
            </div>
            <p className="mt-1 text-xs text-grafite">
              {e.ligado ? 'Ligado' : 'Desligado'}
              {e.detalhe ? ` · ${e.detalhe}` : ''}
            </p>
          </li>
        ))}
      </ul>

      {/* ── A PORTA PARA OS LINKS DE ANÚNCIO ───────────────────
          Fica antes do formulário de propósito. Quem abre esta tela no
          meio de uma campanha quase sempre veio buscar um link, não
          trocar o token — e o token só se mexe uma vez na vida do
          projeto. */}
      <section className="mt-8 rounded-2xl border border-linha bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-lg">Links de anúncio por município</h2>
            <p className="mt-1 text-sm text-grafite">
              Um link por cidade, com o município já escolhido e o UTM certo. Quem clica cai na
              página com o grupo da cidade dele a um toque, de qualquer botão. É também o que faz
              a entrada em grupo chegar ao painel com o nome da campanha — sem esses links, toda
              conversão aparece como orgânica.
            </p>
          </div>
          <Link
            href="/painel/trafego/links"
            className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-azul px-6 font-semibold text-white transition-colors hover:bg-azul-escuro"
          >
            Gerar os links
          </Link>
        </div>
      </section>

      <div className="mt-8">
        <EditorTrafego
          editavel={config.supabaseAtivo}
          inicial={{
            metaPixelId: t.metaPixelId,
            gtmId: t.gtmId,
            metaDominio: t.metaDominio,
            capiTeste: t.capiTeste,
            apiVersao: t.apiVersao,
            capiAtiva: t.capiAtiva,
            // ⚠️ SÓ OS QUATRO ÚLTIMOS. O suficiente para alguém
            //    reconhecer qual token está lá; insuficiente para
            //    usá-lo. O valor inteiro nunca entra no HTML.
            tokenMascara: t.capiToken ? t.capiToken.slice(-4) : '',
          }}
        />
      </div>

      {/* ── O MAPA DE EVENTOS ──────────────────────────────────
          É a tabela que o gestor de tráfego precisa ter na mão para
          criar Conversão Personalizada e público no Gerenciador. Sem
          ela, ele teria de descobrir os nomes por tentativa. */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">O que o site manda para a Meta</h2>
        <p className="mt-1 max-w-3xl text-sm text-grafite">
          Todos chegam pelos dois caminhos ao mesmo tempo — navegador e servidor — com o mesmo
          identificador, então contam uma vez só.{' '}
          <strong className="font-medium text-tinta">Lead</strong> é a conversão da página: é nele
          que a campanha deve otimizar. Os demais são eventos personalizados; para usá-los como
          objetivo, crie uma Conversão Personalizada no Gerenciador com o nome exato da coluna.
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-linha bg-white">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="border-b border-linha text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nome na Meta</th>
                <th className="px-4 py-3 font-medium">O que a pessoa fez</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-linha">
                <td className="px-4 py-3">
                  <code className="font-mono">PageView</code>
                  <span className="ml-2 rounded-full bg-azul-suave px-2 py-0.5 text-xs">padrão</span>
                </td>
                <td className="px-4 py-3 text-grafite">Abriu qualquer página do site.</td>
              </tr>
              {(Object.keys(EVENTO_META) as TipoEvento[]).map((tipo) => {
                const nome = EVENTO_META[tipo]!
                return (
                  <tr key={tipo} className="border-b border-linha last:border-0">
                    <td className="px-4 py-3">
                      <code className="font-mono">{nome}</code>
                      {EVENTOS_PADRAO_META.has(nome) ? (
                        <span className="ml-2 rounded-full bg-amarelo px-2 py-0.5 text-xs font-medium text-azul-escuro">
                          conversão
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-grafite">{EXPLICACAO_EVENTO[tipo]}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-linha bg-white p-6 text-sm text-grafite">
        <h2 className="text-base font-semibold text-tinta">Antes de subir campanha</h2>
        <ol className="mt-3 space-y-2">
          <li>
            <strong className="font-medium text-tinta">1.</strong> Preencha o ID do pixel e o token,
            salve, e aperte <em>Enviar evento de teste</em>. A resposta vem da própria Meta.
          </li>
          <li>
            <strong className="font-medium text-tinta">2.</strong> Com o código de teste preenchido,
            abra o site numa janela anônima (o navegador em que você entrou no painel não conta), toque
            em <em>Aceitar todos</em> no aviso de cookies e entre num grupo — sem autorização de
            publicidade, nada sai para a Meta. O <code className="font-mono">Lead</code>{' '}
            deve aparecer em <em>Eventos de teste</em> uma vez só — se aparecer duas, há um pixel
            duplicado (quase sempre dentro do GTM).
          </li>
          <li>
            <strong className="font-medium text-tinta">3.</strong> Apague o código de teste. Enquanto
            ele estiver aqui, nada conta como conversão de verdade.
          </li>
          <li>
            <strong className="font-medium text-tinta">4.</strong> Confira em{' '}
            <em>Gerenciador de Eventos ▸ Qualidade da correspondência</em>. O site manda IP, agente,
            os cookies do pixel e um identificador anônimo de sessão — não há e-mail nem telefone
            para coletar aqui, então a nota fica em torno de 5 e isso é o teto honesto desta página.
          </li>
        </ol>
      </section>
    </>
  )
}

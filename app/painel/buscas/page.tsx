import Link from 'next/link'
import sitemap from '@/app/sitemap'
import { config, siteIndexavel } from '@/lib/config'
import { lerConteudoFresco } from '@/lib/conteudo/ler'
import { EditorVerificacao } from './EditorVerificacao'
import { Enderecos } from './Enderecos'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Buscas', robots: { index: false } }

/**
 * BUSCAS — a tela do Google Search Console.
 *
 * ⚠️ ELA NÃO CONFIGURA NADA, e é isso que ela é. Sitemap, robots.txt e
 *    llms.txt já são gerados pelo próprio site, sozinhos, a partir do
 *    que está no painel: não há ajuste a fazer neles. O que faltava era
 *    o outro lado — a pessoa que está com o Search Console aberto numa
 *    aba e precisa saber QUAL endereço colar, se o site está liberado
 *    para ser indexado, e onde vai o código de verificação.
 *
 *    Sem esta tela, essa informação existia só no código-fonte. Com
 *    ela, a tarefa inteira cabe em copiar três coisas.
 *
 * ⚠️ O ESTADO DE INDEXAÇÃO VEM PRIMEIRO, antes dos endereços, porque é
 *    ele que explica o fracasso mais provável: em endereço de preview
 *    o robots.txt manda ignorar o site inteiro, e o Search Console
 *    aceita o cadastro assim mesmo — só responde "bloqueado pelo
 *    robots.txt" dias depois, numa tela que ninguém volta para olhar.
 */
export default async function PaginaBuscas() {
  const conteudo = await lerConteudoFresco()
  const paginas = sitemap()
  const noAr = siteIndexavel()

  const enderecos = [
    {
      nome: 'Sitemap',
      url: `${config.siteUrl}/sitemap.xml`,
      explicacao:
        'A lista das páginas do site, no formato que o Google lê. Gerada sozinha — nunca fica desatualizada.',
      principal: true,
    },
    {
      nome: 'robots.txt',
      url: `${config.siteUrl}/robots.txt`,
      explicacao:
        'As regras para os robôs de busca: o que pode ser visitado e o que deve ser ignorado. O Search Console lê sozinho, mas vale conferir com os próprios olhos.',
    },
    {
      nome: 'llms.txt',
      url: `${config.siteUrl}/llms.txt`,
      explicacao:
        'O mesmo resumo, escrito para assistentes de IA. Não é padrão oficial e o Search Console não usa: serve para quem pergunta ao ChatGPT ou ao Gemini quem é a candidata.',
    },
  ]

  return (
    <>
      <header>
        <h1 className="titulo-secao">Buscas</h1>
        <p className="mt-2 max-w-3xl text-grafite">
          Tudo que o Google Search Console pede, pronto para copiar. Os três arquivos abaixo são
          gerados pelo próprio site a partir do que está no painel — não há nada para escrever
          neles.
        </p>
      </header>

      {/* ── ESTADO ────────────────────────────────────────────── */}
      {noAr ? (
        <div className="mt-8 rounded-2xl border border-linha bg-white p-5">
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-full bg-verde" />
            <h2 className="text-base font-semibold">O site está liberado para o Google</h2>
          </div>
          <p className="mt-2 text-sm text-grafite">
            O robots.txt permite indexar tudo, menos o que não tem o que indexar: o painel, a API e
            os links <code className="font-mono">/g/</code>, que são redirecionadores para grupos de
            WhatsApp e mudam durante a campanha.
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-amarelo bg-amarelo/15 p-5">
          <h2 className="text-base font-semibold">
            Ainda não adianta cadastrar: este endereço não é indexável
          </h2>
          <p className="mt-2 text-sm">
            O site está respondendo em{' '}
            <code className="font-mono">{config.siteUrl}</code> — um endereço de teste. Enquanto
            for assim, o robots.txt manda os buscadores{' '}
            <strong className="font-medium">ignorarem o site inteiro</strong>, de propósito: uma
            cópia de trabalho indexada concorre com a oficial na busca pelo nome da candidata.
          </p>
          <p className="mt-2 text-sm">
            O Search Console aceita o cadastro mesmo assim e só reclama dias depois. Faça o cadastro
            quando o domínio próprio estiver no ar e a variável{' '}
            <code className="font-mono">NEXT_PUBLIC_SITE_URL</code> apontar para ele — os endereços
            abaixo passam a valer sozinhos.
          </p>
        </div>
      )}

      {/* ── OS ENDEREÇOS ──────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Os endereços</h2>
        <Enderecos itens={enderecos} />
      </section>

      {/* ── VERIFICAÇÃO ───────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Provar que o site é seu</h2>
        <p className="mt-1 max-w-3xl text-sm text-grafite">
          O Search Console só entrega os dados depois de confirmar que quem cadastrou manda no site.
          Há dois caminhos, e o primeiro é melhor:
        </p>

        <div className="mt-4 rounded-2xl border border-linha bg-white p-6">
          <h3 className="text-base font-semibold">1. Pelo DNS — recomendado</h3>
          <p className="mt-2 text-sm text-grafite">
            No Search Console, escolha <em>Domínio</em> ao adicionar a propriedade. Ele mostra um
            registro TXT para criar no painel do domínio (onde ele foi registrado ou, se for o caso,
            na Vercel). Nada muda no site, e a verificação vale para todos os endereços de uma vez:
            com www e sem, e qualquer subdomínio que a campanha crie depois.
          </p>
        </div>

        <EditorVerificacao
          inicial={conteudo.meta.verificacaoGoogle}
          editavel={config.supabaseAtivo}
        />
      </section>

      {/* ── O PASSO A PASSO ───────────────────────────────────── */}
      <section className="mt-10 rounded-2xl border border-linha bg-white p-6 text-sm text-grafite">
        <h2 className="text-base font-semibold text-tinta">A ordem das coisas</h2>
        <ol className="mt-3 space-y-2">
          <li>
            <strong className="font-medium text-tinta">1.</strong>{' '}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-azul underline decoration-1 underline-offset-2"
            >
              Abra o Search Console
            </a>{' '}
            e adicione a propriedade. Prefira <em>Domínio</em>.
          </li>
          <li>
            <strong className="font-medium text-tinta">2.</strong> Verifique — pelo DNS, ou colando
            a meta tag no campo acima e apertando <em>Verificar</em> lá.
          </li>
          <li>
            <strong className="font-medium text-tinta">3.</strong> Em{' '}
            <em>Sitemaps</em>, cole o endereço do sitemap e envie. É a única coisa que precisa ser
            informada uma vez.
          </li>
          <li>
            <strong className="font-medium text-tinta">4.</strong> Em{' '}
            <em>Inspeção de URL</em>, cole o endereço da home e peça indexação. Encurta a primeira
            visita do robô de dias para horas.
          </li>
          <li>
            <strong className="font-medium text-tinta">5.</strong> Volte em uma semana. Antes disso
            o relatório está vazio porque o Google ainda não passou, e não porque algo deu errado.
          </li>
        </ol>
        <p className="mt-4">
          O sitemap não precisa ser reenviado quando o conteúdo mudar: o Google volta sozinho, e o
          arquivo é montado na hora do pedido.
        </p>
      </section>

      {/* ── O QUE ESTÁ NO SITEMAP ─────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          O que o sitemap declara{' '}
          <span className="font-normal text-grafite">({paginas.length} páginas)</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-grafite">
          Os links <code className="font-mono">/g/</code> ficam de fora de propósito: são
          redirecionadores, não páginas. Indexar um redirecionamento não ajuda ninguém — e o destino
          dele muda quando um grupo enche.
        </p>
        <ul className="mt-4 divide-y divide-linha overflow-hidden rounded-2xl border border-linha bg-white text-sm">
          {paginas.map((p) => (
            <li key={p.url} className="px-4 py-3">
              <code className="font-mono break-all">{p.url}</code>
            </li>
          ))}
        </ul>
      </section>

      {/* ── O QUE JÁ ESTÁ FEITO ───────────────────────────────── */}
      <section className="mt-10 rounded-2xl border border-linha bg-white p-6 text-sm text-grafite">
        <h2 className="text-base font-semibold text-tinta">O que o site já faz sozinho</h2>
        <ul className="mt-3 space-y-2">
          <li>
            Título, descrição e palavras-chave em toda página — editáveis em{' '}
            <Link
              href="/painel/secoes/meta"
              className="font-medium text-azul underline decoration-1 underline-offset-2"
            >
              Identidade ▸ Busca e compartilhamento
            </Link>
            .
          </li>
          <li>
            Endereço canônico em cada página, para o Google não tratar a mesma página como duas.
          </li>
          <li>
            Cartão de compartilhamento com imagem própria, gerada com o nome e o número — é o que
            aparece ao mandar o link no WhatsApp.
          </li>
          <li>
            Dados estruturados de pessoa (nome, cargo, partido, estado, Instagram) na home, que é o
            que resolve a busca pelo nome próprio.
          </li>
          <li>Sitemap e robots.txt gerados a cada pedido, sempre em dia com o painel.</li>
        </ul>
        <p className="mt-4">
          A busca não é o canal desta campanha — o tráfego vem da bio do Instagram e dos anúncios.
          O que está aqui resolve quem procura pelo nome da candidata, pelo número ou pelo nome da
          própria cidade, e isso é o teto honesto de SEO para uma página só. Medição de anúncio é
          outra tela:{' '}
          <Link
            href="/painel/trafego"
            className="font-medium text-azul underline decoration-1 underline-offset-2"
          >
            Tráfego
          </Link>
          .
        </p>
      </section>
    </>
  )
}

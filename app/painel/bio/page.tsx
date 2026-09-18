import Link from 'next/link'
import { botoesDaBio, FUNCOES_BIO, type LinkDaBio } from '@/lib/bio'
import { config } from '@/lib/config'
import { lerConteudoFresco } from '@/lib/conteudo/ler'
import { carregarMetricasDaBio } from '@/lib/metricas'
import { Icone } from '@/components/ui/Icone'
import { EnderecosDaBio } from './EnderecosDaBio'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Link da bio', robots: { index: false } }

const ROTULO_DA_FUNCAO = new Map(FUNCOES_BIO.map((f) => [f.valor, f.rotulo]))

/**
 * LINK DA BIO — a tela de operação.
 *
 * ⚠️ NÃO É O EDITOR, e a divisão é a mesma que o painel já faz em
 *    Grupos: escrever o conteúdo é uma tarefa (Seções ▸ Link da bio,
 *    com prévia ao vivo e histórico de versões), e operar o link é
 *    outra. Quem abre esta tela quer uma de três coisas — o endereço
 *    para colar em algum lugar, a conferência do que está no ar, ou
 *    saber em que botão as pessoas tocam. Nenhuma delas é redigir.
 *
 *    Duplicar o editor aqui criaria dois lugares para editar a mesma
 *    coisa, com dois estados possíveis do mesmo campo. O que existe é
 *    um atalho.
 */
export default async function PainelBio() {
  const [conteudo, metricas] = await Promise.all([
    lerConteudoFresco(),
    carregarMetricasDaBio(),
  ])

  const links = conteudo.bio.links as unknown as LinkDaBio[]

  // A mesma função que a página usa — então esta lista é o que está no
  // ar, e não uma leitura otimista do que foi digitado. Botão sem
  // endereço não aparece aqui pelo mesmo motivo que não aparece lá.
  const noAr = botoesDaBio({ links, conteudo, emSilencio: false })
  const noArPorId = new Set(noAr.map((b) => b.id))

  const totalDeToques = metricas.porBotao.reduce((t, b) => t + b.toques, 0)
  const ultimosDias = metricas.porDia.slice(0, 7)
  const visitas = ultimosDias.reduce((t, d) => t + d.visitas, 0)
  const tocaram = ultimosDias.reduce((t, d) => t + d.tocaram, 0)
  const entraram = ultimosDias.reduce((t, d) => t + d.entraramNoGrupo, 0)

  return (
    <>
      <header>
        <h1 className="titulo-secao">Link da bio</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          A página curta que fica na bio do Instagram:{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-sm">/bio</code>. Aqui ficam os
          endereços prontos para colar e o que as pessoas fazem quando chegam.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-grafite">
          Os botões, o título e os textos se editam em{' '}
          <Link
            href="/painel/secoes/bio"
            className="font-medium text-azul underline decoration-1 underline-offset-2"
          >
            Seções ▸ Link da bio
          </Link>
          , com prévia ao vivo.
        </p>
      </header>

      {/* ── O que está no ar ─────────────────────────────────── */}
      <section className="mt-8 rounded-2xl border border-linha bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg">Os botões que estão no ar</h2>
            <p className="mt-1 text-sm text-grafite">
              Na ordem em que aparecem. O de cima recebe a maior parte dos toques.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/painel/secoes/bio"
              className="inline-flex min-h-11 items-center rounded-full bg-azul px-5 text-sm font-medium text-white transition-colors hover:bg-azul-escuro"
            >
              Editar os botões
            </Link>
            <Link
              href="/bio?previa=1"
              target="_blank"
              className="inline-flex min-h-11 items-center rounded-full border border-linha px-5 text-sm font-medium text-grafite transition-colors hover:border-azul/30 hover:text-azul"
            >
              Ver a página
            </Link>
          </div>
        </div>

        <ul className="mt-5 grid gap-2">
          {links.map((link) => {
            const some = !noArPorId.has(link.id)
            const funcao = ROTULO_DA_FUNCAO.get(link.funcao) ?? link.funcao
            // O botão pode ter sido montado com ícone em branco: quem
            // decide o desenho nesse caso é a função, e `botoesDaBio`
            // já resolveu isso — para os que estão no ar.
            const icone = noAr.find((b) => b.id === link.id)?.icone ?? link.icone

            return (
              <li
                key={link.id}
                className={`flex items-center gap-3 rounded-xl border border-linha p-3 ${
                  some ? 'opacity-60' : ''
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-azul-suave text-azul-escuro">
                  {icone ? <Icone nome={icone} className="size-[1.125rem]" /> : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{link.rotulo || '(sem texto)'}</span>
                    {link.destaque ? (
                      <span className="rounded-full bg-verde-suave px-2 py-0.5 text-xs font-medium text-verde">
                        principal
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-grafite">{funcao}</span>
                </span>

                {some ? (
                  <span className="shrink-0 rounded-full bg-areia px-2.5 py-1 text-xs text-grafite">
                    {/* Os dois motivos de um botão não aparecer, e a
                        diferença importa: um é escolha, o outro é
                        campo em branco esperando alguém. */}
                    {link.ligado ? 'sem endereço' : 'desligado'}
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>

        {noAr.length === 0 ? (
          <p className="mt-4 rounded-xl bg-amarelo-suave px-4 py-3 text-sm ring-1 ring-amarelo/50">
            <strong className="font-semibold">Nenhum botão no ar.</strong> A página abre com o
            título e mais nada. Ligue pelo menos um em Seções ▸ Link da bio.
          </p>
        ) : null}
      </section>

      <EnderecosDaBio siteUrl={config.siteUrl} />

      {/* ── O que acontece depois ────────────────────────────── */}
      <section className="mt-6 rounded-2xl border border-linha bg-white p-6">
        <h2 className="text-lg">Em que botão as pessoas tocam</h2>

        {!metricas.ativo ? (
          <p className="mt-3 text-sm text-grafite">
            Sem Supabase conectado, não há o que contar.
          </p>
        ) : totalDeToques === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-grafite">
            Ainda não há toque registrado. Depois que o endereço estiver na bio, esta lista
            responde qual botão trabalha — e qual está só ocupando lugar.
          </p>
        ) : (
          <>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              <Cartao rotulo="chegaram" valor={visitas} nota="últimos 7 dias" />
              <Cartao rotulo="tocaram" valor={tocaram} nota="em algum botão" />
              <Cartao rotulo="entraram no grupo" valor={entraram} nota="na mesma visita" />
            </dl>

            <ul className="mt-5 grid gap-1.5">
              {metricas.porBotao.map((b) => {
                // Barra proporcional ao mais tocado, e não ao total: com
                // seis botões, todas as barras ficariam curtas demais
                // para comparar uma com a outra.
                const maior = metricas.porBotao[0]?.toques || 1
                return (
                  <li key={b.botao} className="flex items-center gap-3">
                    <span className="w-1/2 shrink-0 truncate text-sm">{b.botao}</span>
                    <span className="h-2 min-w-0 flex-1 rounded-full bg-areia">
                      <span
                        className="block h-2 rounded-full bg-azul"
                        style={{ width: `${Math.round((b.toques / maior) * 100)}%` }}
                      />
                    </span>
                    <span className="w-24 shrink-0 text-right text-sm tabular-nums">
                      <strong className="font-semibold">{b.toques}</strong>{' '}
                      <span className="text-grafite">
                        · {b.pessoas} {b.pessoas === 1 ? 'pessoa' : 'pessoas'}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>

            <p className="mt-4 text-xs leading-relaxed text-grafite">
              A lista agrupa pelo TEXTO do botão. Trocar o texto de um botão no painel abre uma
              linha nova aqui — o histórico do texto antigo continua, embaixo.
            </p>
          </>
        )}
      </section>
    </>
  )
}

function Cartao({ rotulo, valor, nota }: { rotulo: string; valor: number; nota: string }) {
  return (
    <div className="rounded-xl border border-linha p-4">
      <dt className="text-xs tracking-[0.06em] text-grafite uppercase">{rotulo}</dt>
      <dd className="mt-1 font-[family-name:var(--font-titulo)] text-2xl font-bold tabular-nums">
        {valor}
      </dd>
      <p className="text-xs text-grafite">{nota}</p>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import type { StatusGrupo } from '@/lib/tipos'

interface DestinoLinha {
  slug: string
  nome: string
  dentroDe: string | null
  status: StatusGrupo
  disponivel: boolean
}

/** Só letras, números e hífen: é o que a Meta e o painel leem sem ambiguidade. */
const limparUtm = (v: string) => v.replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40)

export function GeradorLinks({
  destinos,
  siteUrl,
}: {
  destinos: DestinoLinha[]
  siteUrl: string
}) {
  const [pagina, setPagina] = useState<'/' | '/grupos'>('/')
  const [source, setSource] = useState('meta')
  const [medium, setMedium] = useState('cpc')
  const [campanha, setCampanha] = useState('grupos-municipios')
  const [soAbertos, setSoAbertos] = useState(true)
  const [copiado, setCopiado] = useState<string | null>(null)

  const base = siteUrl.replace(/\/$/, '')

  /**
   * ⚠️ `utm_content` LEVA O SLUG DA CIDADE, e não um nome bonito. É a
   *    chave que amarra as duas pontas: a mesma string aparece na coluna
   *    `utm` do banco e no relatório da Meta, e é por ela que a tela de
   *    métricas junta "quem chegou pelo anúncio de Vilhena" com "quem
   *    entrou no grupo de Vilhena". Um acento ou um espaço aqui separa
   *    as duas metades em linhas que não somam.
   */
  function montar(slug: string): string {
    const p = new URLSearchParams()
    p.set('cidade', slug)
    if (source) p.set('utm_source', source)
    if (medium) p.set('utm_medium', medium)
    if (campanha) p.set('utm_campaign', campanha)
    p.set('utm_content', slug)
    // Sem barra antes do `?`: `/grupos/?…` faria o Next devolver um
    // redirecionamento antes da página, e um salto a mais em 4G é
    // exatamente o que faz a pessoa desistir no caminho que a campanha
    // pagou para abrir.
    return `${base}${pagina}?${p.toString()}`
  }

  /** O link único, para quem preferir uma campanha só e deixar a pessoa escolher. */
  const linkUnico = useMemo(() => {
    const p = new URLSearchParams()
    if (source) p.set('utm_source', source)
    if (medium) p.set('utm_medium', medium)
    if (campanha) p.set('utm_campaign', campanha)
    p.set('utm_content', 'todas-as-cidades')
    return `${base}${pagina}?${p.toString()}`
  }, [base, pagina, source, medium, campanha])

  const linhas = useMemo(
    () => destinos.filter((d) => !soAbertos || d.disponivel),
    [destinos, soAbertos],
  )

  const fechados = destinos.filter((d) => !d.disponivel).length

  async function copiar(texto: string, marca: string) {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      window.prompt('Copie:', texto)
    }
    setCopiado(marca)
    setTimeout(() => setCopiado(null), 2200)
  }

  function baixarCsv() {
    const cabecalho = 'municipio,slug,situacao,url\n'
    const corpo = linhas
      .map((d) => [d.nome, d.slug, d.status, montar(d.slug)].map((c) => `"${c}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([cabecalho + corpo], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `links-anuncio-${campanha || 'campanha'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const campo =
    'mt-1.5 min-h-12 w-full rounded-xl border border-linha bg-areia px-3 focus:border-azul/40 focus:bg-white'

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-2xl border border-linha bg-white p-6">
        <h2 className="text-lg">Como montar</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="pagina" className="text-sm font-medium">
              Onde a pessoa cai
            </label>
            <select
              id="pagina"
              value={pagina}
              onChange={(e) => setPagina(e.target.value as '/' | '/grupos')}
              className={campo}
            >
              <option value="/">Página inteira — mais convence</option>
              <option value="/grupos">Só a lista — mais direto</option>
            </select>
          </div>

          <div>
            <label htmlFor="source" className="text-sm font-medium">
              utm_source
            </label>
            <input
              id="source"
              value={source}
              onChange={(e) => setSource(limparUtm(e.target.value))}
              placeholder="meta, google, tiktok…"
              className={campo}
            />
          </div>

          <div>
            <label htmlFor="medium" className="text-sm font-medium">
              utm_medium
            </label>
            <input
              id="medium"
              value={medium}
              onChange={(e) => setMedium(limparUtm(e.target.value))}
              placeholder="cpc, story, whatsapp…"
              className={campo}
            />
          </div>

          <div>
            <label htmlFor="campanha" className="text-sm font-medium">
              utm_campaign
            </label>
            <input
              id="campanha"
              value={campanha}
              onChange={(e) => setCampanha(limparUtm(e.target.value))}
              placeholder="grupos-municipios"
              className={campo}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-grafite">
          O <code className="rounded bg-areia px-1.5 py-0.5">utm_content</code> é preenchido sozinho
          com o nome da cidade — é ele que faz o painel juntar &ldquo;chegou pelo anúncio de
          Vilhena&rdquo; com &ldquo;entrou no grupo de Vilhena&rdquo;. Não mexa nele à mão.
        </p>
      </section>

      {/* ── O caminho de um conjunto por cidade ─────────────────
          Fica em cima porque é o que a campanha pediu e o que mede
          melhor: com um conjunto de anúncios por município, o próprio
          Gerenciador da Meta já separa o resultado por cidade, sem
          depender de relatório nenhum do nosso lado. */}
      <section className="rounded-2xl border border-linha bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg">Um link por cidade</h2>
            <p className="mt-1 text-sm text-grafite">
              Um conjunto de anúncios por município, cada um com o seu link. A Meta já reporta o
              resultado separado por conjunto — é o jeito que dá o número por cidade sem depender
              de mais nada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                copiar(linhas.map((d) => `${d.nome}\t${montar(d.slug)}`).join('\n'), 'todos')
              }
              className="inline-flex min-h-11 items-center rounded-full border border-azul px-5 text-sm font-medium text-azul"
            >
              {copiado === 'todos' ? 'Copiado' : `Copiar ${linhas.length} links`}
            </button>
            <button
              type="button"
              onClick={baixarCsv}
              className="inline-flex min-h-11 items-center rounded-full bg-azul px-5 text-sm font-semibold text-white"
            >
              Baixar CSV
            </button>
          </div>
        </div>

        {fechados > 0 ? (
          <label className="mt-4 flex items-center gap-2.5 rounded-xl bg-amarelo/15 p-3 text-sm">
            <input
              type="checkbox"
              checked={soAbertos}
              onChange={(e) => setSoAbertos(e.target.checked)}
              className="size-4"
            />
            <span>
              <strong className="font-semibold">Esconder as {fechados} cidades sem grupo aberto.</strong>{' '}
              Anunciar uma delas é pagar por um clique que termina num aviso de &ldquo;em
              breve&rdquo;.
            </span>
          </label>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-xl border border-linha">
          <table className="w-full min-w-[44rem] text-sm">
            <thead className="border-b border-linha bg-areia text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium">Cidade</th>
                <th className="px-4 py-2.5 font-medium">Situação</th>
                <th className="px-4 py-2.5 font-medium">Link do anúncio</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {linhas.map((d) => {
                const url = montar(d.slug)
                return (
                  <tr key={d.slug} className="border-b border-linha last:border-0">
                    <td className="px-4 py-2.5">
                      <span className="font-medium">{d.nome}</span>
                      {d.dentroDe ? (
                        <span className="ml-1.5 text-xs text-grafite">· {d.dentroDe}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          d.disponivel
                            ? 'bg-verde text-white'
                            : 'bg-areia text-grafite ring-1 ring-linha'
                        }`}
                      >
                        {d.disponivel ? 'aberto' : d.status === 'cheio' ? 'cheio' : 'em breve'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block max-w-[28rem] truncate font-mono text-xs text-grafite">
                        {url}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => copiar(url, d.slug)}
                        className="inline-flex min-h-9 items-center rounded-full border border-linha px-3 text-xs font-medium transition-colors hover:border-azul hover:text-azul"
                      >
                        {copiado === d.slug ? 'Copiado' : 'Copiar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── O caminho de link único ─────────────────────────────
          Continua existindo, e não é consolo: com uma campanha só para
          Rondônia inteira, este é o link certo. A pessoa escolhe a
          cidade na página — pelo IP, pelo GPS, pelo mapa ou pela busca —
          e o funil continua completo, só sem o número por município do
          lado da Meta. */}
      <section className="rounded-2xl border border-linha bg-white p-6">
        <h2 className="text-lg">Ou um link só, para todo o estado</h2>
        <p className="mt-1 max-w-3xl text-sm text-grafite">
          Sem <code className="rounded bg-areia px-1.5 py-0.5">cidade</code> no fim, a página segue
          adivinhando: sugere pelo IP, oferece o GPS, mostra o mapa e a busca. Mede tudo igual —
          o que não dá é o resultado separado por município dentro da Meta, porque para ela é uma
          campanha só.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-areia p-4">
          <span className="min-w-0 flex-1 break-all font-mono text-xs">{linkUnico}</span>
          <button
            type="button"
            onClick={() => copiar(linkUnico, 'unico')}
            className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-azul px-4 text-sm font-medium text-azul"
          >
            {copiado === 'unico' ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </section>
    </div>
  )
}

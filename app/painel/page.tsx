import Link from 'next/link'
import { PADRAO } from '@/content/copy'
import { SECOES_DO_PAINEL } from '@/content/mapa'
import { config } from '@/lib/config'
import { listarGrupos, MUNICIPIOS } from '@/lib/dados'
import { lerConteudoFresco } from '@/lib/conteudo/ler'
import { carregarMetricas, somarFunil } from '@/lib/metricas'
import { criarClienteAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Início', robots: { index: false } }

/**
 * O que a campanha precisa ver ao abrir, em ordem de urgência:
 * o que bloqueia a publicação, o que falta preencher, e como foi ontem.
 */
export default async function PainelInicio() {
  const [grupos, metricas, conteudo] = await Promise.all([
    listarGrupos(),
    carregarMetricas(),
    lerConteudoFresco(),
  ])

  const semLink = grupos.filter((g) => !g.link).length
  const abertos = grupos.filter((g) => g.status === 'aberto').length
  const hoje = somarFunil(metricas.funil, 1)
  const mes = somarFunil(metricas.funil, 30)

  // Campos ainda idênticos ao texto de fábrica — aposenta a lista
  // manual do PENDENCIAS.md.
  const naoTocadas = await secoesNaoTocadas()

  const pendencias: { texto: string; onde?: string }[] = []

  // Identificação eleitoral em branco impede publicar. Agora ela vive
  // no próprio painel, então a pendência aponta para onde resolver.
  const legal = conteudo.rodape.legal
  const faltaLegal = (
    [
      ['Eleição', legal.eleicao],
      ['Nome completo na urna', legal.candidato],
      ['Cargo', legal.cargo],
      ['Partido', legal.partido],
      ['CNPJ da campanha', legal.cnpj],
    ] as const
  ).filter(([, v]) => !v.trim())

  for (const [nome] of faltaLegal) {
    pendencias.push({
      texto: `${nome} não preenchido na identificação eleitoral`,
      onde: '/painel/secoes/rodape',
    })
  }
  if (semLink > 0)
    pendencias.push({ texto: `${semLink} município${semLink === 1 ? '' : 's'} sem link de grupo`, onde: '/painel/grupos' })
  // A pendência de "números de exemplo" em "O que já foi feito" saiu
  // junto com os números: a campanha pediu a remoção da faixa de
  // 9 leis / 1 comissão / 7 projetos / 14.634 votos, e sem o campo a
  // conferência ficou apontando para `undefined` — que era o que
  // derrubava esta página inteira.
  //
  // No lugar entram os vídeos: oito espaços que não quebram nada
  // vazios, mas que a campanha precisa lembrar de preencher.
  const videosVazios = [
    conteudo.origem.video.url,
    conteudo.rua.video.url,
    conteudo.problema.video.url,
    conteudo.provas.video.url,
    ...conteudo.social.videos.map((v) => v.url),
    ...conteudo.social.processos.flatMap((p) => p.videos.map((v) => v.url)),
    ...conteudo.trilha.itens.map((v) => v.url),
  ].filter((url) => !url.trim()).length

  if (videosVazios > 0)
    pendencias.push({
      texto: `${videosVazios} espaço${videosVazios === 1 ? '' : 's'} de vídeo ainda sem endereço`,
      onde: '/painel/videos',
    })

  return (
    <>
      <header>
        <h1 className="titulo-secao">Início</h1>
        <p className="mt-2 text-grafite">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </header>

      {pendencias.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-amarelo/40 bg-amarelo-suave p-6">
          <h2 className="text-lg">O que falta</h2>
          <ul className="mt-3 space-y-2">
            {pendencias.map((p) => (
              <li key={p.texto} className="flex items-start gap-2.5 text-[0.9375rem]">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amarelo" aria-hidden />
                <span>
                  {p.texto}
                  {p.onde ? (
                    <>
                      {' — '}
                      <Link href={p.onde} className="font-medium text-azul underline decoration-1 underline-offset-2">
                        resolver
                      </Link>
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-8 rounded-2xl border border-verde/30 bg-verde-suave p-6 text-[0.9375rem]">
          Nada bloqueando a publicação.
        </p>
      )}

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { r: 'Grupos abertos', v: `${abertos} de ${MUNICIPIOS.length}` },
          { r: 'Visitas hoje', v: hoje.viram },
          { r: 'Entraram em grupo hoje', v: hoje.clicaram },
          { r: 'Fizeram o filtro (30d)', v: mes.geraram },
        ].map((c) => (
          <div key={c.r} className="rounded-2xl border border-linha bg-white p-5">
            <dt className="text-sm text-grafite">{c.r}</dt>
            <dd className="mt-1 font-[family-name:var(--font-titulo)] text-3xl font-bold tabular-nums">
              {c.v}
            </dd>
          </div>
        ))}
      </dl>

      {/* Atalho para as seções, na ORDEM DA PÁGINA — a mesma da tela
          de Seções. Já foi a ordem do objeto do esquema, que é a ordem
          em que alguém escreveu o arquivo: útil para quem programa,
          inútil para quem edita. */}
      <section className="mt-6 rounded-2xl border border-linha bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg">Seções</h2>
          <p className="text-sm text-grafite">
            {SECOES_DO_PAINEL.length - naoTocadas.size} de {SECOES_DO_PAINEL.length} editadas
          </p>
        </div>
        <p className="mt-1 text-sm text-grafite">
          Textos, imagens e vídeos de cada bloco da página. Seções ainda com o conteúdo de fábrica
          aparecem sem marca.
        </p>

        <ul className="mt-4 grid gap-1 sm:grid-cols-2">
          {SECOES_DO_PAINEL.map((s) => (
            <li key={s.chave}>
              <Link
                href={`/painel/secoes/${s.chave}`}
                className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-[0.9375rem] transition-colors hover:bg-areia"
              >
                <span className="truncate">{s.rotulo}</span>
                {!naoTocadas.has(s.chave) ? (
                  <span className="shrink-0 rounded-full bg-verde-suave px-2.5 py-0.5 text-xs font-medium text-verde">
                    editada
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

/** Seções que ainda não têm override no banco. */
async function secoesNaoTocadas(): Promise<Set<string>> {
  const todas = new Set(Object.keys(PADRAO))
  if (!config.supabaseAtivo) return todas
  const sb = criarClienteAdmin()
  if (!sb) return todas

  const { data } = await sb.from('conteudo').select('secao, dados')
  for (const linha of (data ?? []) as { secao: string; dados: unknown }[]) {
    if (linha.dados && Object.keys(linha.dados).length > 0) todas.delete(linha.secao)
  }
  return todas
}

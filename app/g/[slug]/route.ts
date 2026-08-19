import { NextResponse, type NextRequest } from 'next/server'
import { grupoDeDestino, municipioPorSlug, registrarCliqueNoGrupo } from '@/lib/dados'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { config } from '@/lib/config'
import type { OrigemClique } from '@/lib/tipos'

/**
 * O REDIRECIONADOR.
 *
 * É a peça de maior valor do projeto: o link `/g/ji-parana` fica no
 * panfleto, no QR do carro de som e no botão da página. Trocar o
 * destino é editar uma linha no painel — nada de republicar site.
 *
 * `force-dynamic` é obrigatório. Se a Vercel cachear esta rota, o
 * clique não conta e o link antigo persiste depois de trocado.
 * Sintoma silencioso, diagnóstico difícil. Está no plano como risco médio.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ORIGENS_VALIDAS = new Set<OrigemClique>([
  'hero', 'topo', 'flutuante', 'lista', 'busca', 'geo',
  'cta_final', 'rodape', 'grupos_pagina', 'qr', 'direto',
])

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params
  const municipio = municipioPorSlug(slug)

  // Município que não existe: manda para a lista, nunca erro 404 seco.
  if (!municipio) {
    return NextResponse.redirect(new URL('/grupos?nao-encontrado=1', req.url), 307)
  }

  const deParam = req.nextUrl.searchParams.get('de')
  const origem: OrigemClique = ORIGENS_VALIDAS.has(deParam as OrigemClique)
    ? (deParam as OrigemClique)
    : 'direto'

  const grupo = await grupoDeDestino(slug)
  const podeEntrar =
    grupo?.status === 'aberto' &&
    Boolean(grupo.link) &&
    (grupo.limite_cliques === null || grupo.cliques < grupo.limite_cliques)

  // Sem grupo aberto: volta para a lista com a mensagem certa.
  // "cheio" e "em breve" são situações diferentes e a pessoa merece
  // saber qual das duas é.
  if (!grupo || !podeEntrar) {
    await gravarEvento({
      tipo: 'entrou_grupo_indisponivel',
      municipio_slug: slug,
      grupo_id: grupo?.id ?? null,
      origem,
      req,
    })

    const destino = new URL('/grupos', req.url)
    destino.searchParams.set('cidade', slug)
    destino.searchParams.set('situacao', grupo?.status ?? 'em_breve')
    return NextResponse.redirect(destino, 307)
  }

  // Conta o clique e aplica a virada automática por limite.
  await Promise.all([
    registrarCliqueNoGrupo(grupo),
    gravarEvento({
      tipo: 'clicou_grupo',
      municipio_slug: slug,
      grupo_id: grupo.id,
      origem,
      req,
    }),
  ])

  const resposta = NextResponse.redirect(grupo.link!, 307)
  resposta.headers.set('cache-control', 'no-store, max-age=0')
  return resposta
}

async function gravarEvento({
  tipo,
  municipio_slug,
  grupo_id,
  origem,
  req,
}: {
  tipo: string
  municipio_slug: string
  grupo_id: string | null
  origem: OrigemClique
  req: NextRequest
}) {
  if (!config.supabaseAtivo) return
  const sb = criarClienteAdmin()
  if (!sb) return

  const ua = req.headers.get('user-agent') ?? ''
  const utm = ['utm_source', 'utm_medium', 'utm_campaign']
    .map((k) => req.nextUrl.searchParams.get(k))
    .filter(Boolean)
    .join('|')

  try {
    await sb.from('eventos').insert({
      tipo,
      municipio_slug,
      grupo_id,
      origem,
      utm: utm || null,
      // Sem sessão aqui: o clique de QR não passa pelo navegador da
      // página, então não existe id de sessão para associar.
      sessao: null,
      dispositivo: /Mobile|Android|iPhone/i.test(ua) ? 'celular' : 'desktop',
    })
  } catch {
    // Métrica nunca pode impedir a pessoa de entrar no grupo.
  }
}

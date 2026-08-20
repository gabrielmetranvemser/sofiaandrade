import { NextResponse, type NextRequest } from 'next/server'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Recebe os eventos do navegador. Endpoint público de propósito —
 * é chamado por sendBeacon, que não carrega cabeçalho customizado.
 *
 * O que protege aqui não é autenticação, é o formato: só os tipos
 * da lista branca entram, nada de campo livre, tamanho limitado.
 * O pior que alguém consegue fazer é inflar métrica própria.
 */

// `clicou_grupo` NÃO está aqui de propósito: quem grava esse evento é
// a rota /g/[slug], no servidor, quando a pessoa realmente sai para o
// WhatsApp. Aceitar do navegador criaria contagem dobrada.
const TIPOS = new Set([
  'pagina_vista', 'rolou_50', 'rolou_90',
  'buscou_cidade', 'usou_localizacao',
  'clicou_cta', 'entrou_grupo_indisponivel',
  'abriu_filtro', 'subiu_foto', 'gerou_filtro',
  'baixou_filtro', 'compartilhou_filtro',
  'compartilhou_pagina', 'clicou_instagram',
])

const ORIGENS = new Set([
  'hero', 'topo', 'flutuante', 'lista', 'busca', 'geo',
  'cta_final', 'rodape', 'grupos_pagina', 'qr', 'direto',
])

const LIMITE_CORPO = 2_048

function texto(v: unknown, max = 120): string | null {
  if (typeof v !== 'string') return null
  const limpo = v.trim().slice(0, max)
  return limpo.length ? limpo : null
}

export async function POST(req: NextRequest) {
  // 204 em qualquer falha: o navegador não deve nem saber que houve erro.
  const ok = () => new NextResponse(null, { status: 204 })

  try {
    const bruto = await req.text()
    if (bruto.length > LIMITE_CORPO) return ok()

    const corpo = JSON.parse(bruto) as Record<string, unknown>
    if (!TIPOS.has(String(corpo.tipo))) return ok()

    if (!config.supabaseAtivo) {
      // Fase local: sem banco, o evento vai para o log do servidor.
      // Serve para conferir a instrumentação antes de ligar o Supabase.
      if (process.env.NODE_ENV === 'development') {
        console.log('[evento]', corpo.tipo, corpo.origem ?? '', corpo.municipio_slug ?? '')
      }
      return ok()
    }

    const sb = criarClienteAdmin()
    if (!sb) return ok()

    const origem = texto(corpo.origem, 24)
    const dispositivo = texto(corpo.dispositivo, 12)

    await sb.from('eventos').insert({
      tipo: String(corpo.tipo),
      municipio_slug: texto(corpo.municipio_slug, 64),
      grupo_id: texto(corpo.grupo_id, 40),
      origem: origem && ORIGENS.has(origem) ? origem : null,
      utm: texto(corpo.utm, 200),
      sessao: texto(corpo.sessao, 40),
      dispositivo:
        dispositivo === 'celular' || dispositivo === 'desktop' ? dispositivo : null,
    })

    return ok()
  } catch {
    return ok()
  }
}

import { NextResponse, type NextRequest } from 'next/server'
import {
  analisarMarcas,
  combinarMarcas,
  COOKIE_CAMPANHA,
  marcasDaUrl,
  serializarMarcas,
} from '@/lib/campanha/marcas'

/**
 * Duas tarefas, e só duas, antes de qualquer página renderizar:
 * trancar o `/painel` e guardar de qual anúncio a pessoa veio.
 *
 * ⚠️ ERA `middleware.ts`. O Next 16 renomeou o arquivo e a função para
 *    `proxy`; o antigo ainda funciona, mas está marcado como obsoleto —
 *    ver `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md`.
 *    Com a mudança veio outra: o runtime padrão agora é o Node, e não
 *    mais o Edge. A verificação abaixo continua em Web Crypto mesmo
 *    assim, porque o HMAC-SHA256 em hex é o mesmo dos dois lados e o
 *    cookie precisa continuar intercambiável com `lib/painel/sessao.ts`,
 *    que roda no servidor de páginas.
 */

const NOME_COOKIE = 'sofia_painel'

/** Mesma cadeia de lib/painel/sessao.ts, e falha fechado igual. */
function segredo(): string {
  const s = process.env.PAINEL_SESSION_SECRET || process.env.PAINEL_SENHA
  if (s) return s
  if (process.env.NODE_ENV === 'production') {
    throw new Error('PAINEL_SESSION_SECRET (ou PAINEL_SENHA) não está definida.')
  }
  return 'segredo-apenas-de-desenvolvimento'
}

async function assinar(valor: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segredo()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const assinatura = await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(valor))
  return Array.from(new Uint8Array(assinatura))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function valido(valor: string | undefined): Promise<boolean> {
  if (!valor) return false
  const [expira, assinatura] = valor.split('.')
  if (!expira || !assinatura) return false
  if ((await assinar(expira)) !== assinatura) return false
  return Number(expira) > Date.now()
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/painel') && !pathname.startsWith('/painel/login')) {
    if (!(await valido(req.cookies.get(NOME_COOKIE)?.value))) {
      const destino = new URL('/painel/login', req.url)
      destino.searchParams.set('proximo', pathname)
      return NextResponse.redirect(destino)
    }
    return NextResponse.next()
  }

  // ── A ORIGEM DO ANÚNCIO, GUARDADA NA CHEGADA ────────────────
  //
  // ⚠️ TEM DE SER AQUI, e não numa página. Um Server Component não
  //    pode escrever cookie — só Server Action e Route Handler podem —
  //    e as duas rotas que precisam ler este valor (`/g/[slug]` e
  //    `/api/evento`) são justamente as que acontecem DEPOIS, quando a
  //    URL do anúncio já ficou para trás. O proxy é o único ponto que
  //    vê a chegada e pode responder com `Set-Cookie`.
  //
  // O porquê inteiro está em `lib/campanha/tipos.ts`.
  const novas = marcasDaUrl(req.nextUrl)
  if (!novas) return NextResponse.next()

  // ⚠️ COMBINA, não substitui. Um `?cidade=` sozinho pode ser o desvio
  //    do próprio redirecionador, e sobrescrever ali apagaria o anúncio
  //    de origem no meio do caminho. Ver `combinarMarcas`.
  const marcas = combinarMarcas(
    analisarMarcas(req.cookies.get(COOKIE_CAMPANHA)?.value),
    novas,
  )

  const resposta = NextResponse.next()
  resposta.cookies.set(COOKIE_CAMPANHA, serializarMarcas(marcas), {
    httpOnly: true,
    sameSite: 'lax',
    // Sem `maxAge`: cookie de sessão, morre quando o navegador fecha.
    // Ver o comentário em lib/campanha/marcas.ts.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return resposta
}

/**
 * ⚠️ O SEGUNDO GRUPO DE ENTRADAS NÃO RODA EM VISITA NORMAL, e é por
 *    isso que ele existe em três linhas em vez de uma. Um matcher de
 *    caminho puro (`'/'`) faria o proxy ser invocado em TODA abertura
 *    da home — a rota de maior tráfego do site — para, na quase
 *    totalidade das vezes, concluir que não há anúncio nenhum e seguir
 *    adiante. Com `has`, o Next só chama a função quando a URL traz
 *    mesmo uma das três marcas.
 *
 *    `fbclid` cobre quem veio da Meta, `utm_source` cobre qualquer
 *    outra mídia paga (Google, TikTok, disparo de WhatsApp) e `cidade`
 *    cobre o link de anúncio deste projeto, que pode ser colado sem
 *    UTM nenhum. Basta uma delas.
 *
 * O valor precisa ser constante literal: o Next analisa este objeto em
 * tempo de build e ignora variável.
 */
export const config = {
  matcher: [
    '/painel/:path*',
    { source: '/((?!api|_next|painel|g/).*)', has: [{ type: 'query', key: 'fbclid' }] },
    { source: '/((?!api|_next|painel|g/).*)', has: [{ type: 'query', key: 'utm_source' }] },
    { source: '/((?!api|_next|painel|g/).*)', has: [{ type: 'query', key: 'cidade' }] },
  ],
}

import { NextResponse, type NextRequest } from 'next/server'

/**
 * Tranca o /painel. Roda antes de qualquer página renderizar.
 *
 * A verificação é reimplementada aqui, com Web Crypto, em vez de
 * importar lib/painel/sessao: o middleware roda no runtime Edge, onde
 * `node:crypto` e `next/headers` não existem. HMAC-SHA256 em hex é o
 * mesmo dos dois lados, então o cookie é intercambiável.
 */

const NOME_COOKIE = 'sofia_painel'

function segredo(): string {
  return (
    process.env.PAINEL_SESSION_SECRET ||
    process.env.PAINEL_SENHA ||
    'segredo-de-desenvolvimento-trocar'
  )
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/painel') && !pathname.startsWith('/painel/login')) {
    if (!(await valido(req.cookies.get(NOME_COOKIE)?.value))) {
      const destino = new URL('/painel/login', req.url)
      destino.searchParams.set('proximo', pathname)
      return NextResponse.redirect(destino)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/painel/:path*'],
}

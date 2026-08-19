import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Sessão do painel — FASE LOCAL.
 *
 * Senha única em variável de ambiente, cookie assinado com HMAC.
 * Simples de propósito: o painel é usado por duas ou três pessoas da
 * campanha e precisa estar no ar hoje.
 *
 * ⚠️ QUANDO O SUPABASE ENTRAR: trocar por Supabase Auth + a tabela
 *    `administradores` (migration 0001) e a função `eh_admin()`
 *    (migration 0002). O resto do painel não muda: só estas funções.
 */

const NOME_COOKIE = 'sofia_painel'
const DURACAO = 60 * 60 * 12 // 12 horas

function segredo(): string {
  return (
    process.env.PAINEL_SESSION_SECRET ||
    process.env.PAINEL_SENHA ||
    'segredo-de-desenvolvimento-trocar'
  )
}

function assinar(valor: string): string {
  return createHmac('sha256', segredo()).update(valor).digest('hex')
}

export function senhaConfere(tentativa: string): boolean {
  const esperada = process.env.PAINEL_SENHA || ''
  if (!esperada) return false

  const a = Buffer.from(assinar(tentativa))
  const b = Buffer.from(assinar(esperada))
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function abrirSessao(): Promise<void> {
  const expira = String(Date.now() + DURACAO * 1000)
  const jar = await cookies()
  jar.set(NOME_COOKIE, `${expira}.${assinar(expira)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/painel',
    maxAge: DURACAO,
  })
}

export async function fecharSessao(): Promise<void> {
  const jar = await cookies()
  jar.delete({ name: NOME_COOKIE, path: '/painel' })
}

export async function estaLogado(): Promise<boolean> {
  const jar = await cookies()
  const valor = jar.get(NOME_COOKIE)?.value
  if (!valor) return false
  const [expira, assinatura] = valor.split('.')
  if (!expira || !assinatura) return false
  if (assinar(expira) !== assinatura) return false
  return Number(expira) > Date.now()
}

export const COOKIE_PAINEL = NOME_COOKIE

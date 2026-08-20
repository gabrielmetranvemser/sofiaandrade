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

/**
 * O segredo que assina o cookie.
 *
 * ⚠️ FALHA FECHADO. Antes isto caía num literal escrito neste arquivo
 *    quando as duas variáveis faltavam — ou seja, em produção sem
 *    ambiente configurado, a aplicação aceitaria em silêncio cookies
 *    assinados com um segredo publicado no repositório. Agora quebra.
 */
function segredo(): string {
  const s = process.env.PAINEL_SESSION_SECRET || process.env.PAINEL_SENHA
  if (s) return s

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'PAINEL_SESSION_SECRET (ou PAINEL_SENHA) não está definida. ' +
        'O painel não sobe sem segredo próprio.',
    )
  }
  return 'segredo-apenas-de-desenvolvimento'
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
    // ⚠️ NÃO TROQUE para '/'. Com o caminho restrito a /painel, o cookie
    //    não é enviado num POST para '/', e é isso que faz uma Server
    //    Action invocada de outra rota falhar em exigirSessao(). É
    //    defesa em profundidade, não organização.
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

/**
 * Guarda de toda Server Action do painel.
 *
 * LANÇA em vez de devolver `{ erro }` de propósito: um objeto de erro
 * faz chamada não autorizada parecer falha de validação, e é fácil de
 * ignorar sem querer numa ação nova.
 *
 * Existe porque o `middleware` NÃO é suficiente. Server Action é um
 * POST endereçado por action ID, não por rota: um POST para '/' com o
 * cabeçalho `Next-Action` não passa pelo matcher `/painel/:path*` e
 * executa a ação assim mesmo.
 */
export async function exigirSessao(): Promise<void> {
  if (!(await estaLogado())) {
    throw new Error('nao-autorizado')
  }
}

export const COOKIE_PAINEL = NOME_COOKIE

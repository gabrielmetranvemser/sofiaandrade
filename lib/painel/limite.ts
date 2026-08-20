import 'server-only'

import { headers } from 'next/headers'

/**
 * Limite de tentativas de login.
 *
 * `entrar()` é a única Server Action não autenticada por desenho, e ela
 * compara uma senha única de ambiente. Sem limite, dá para moer a senha
 * na velocidade que a plataforma aguentar.
 *
 * Guarda em memória do processo de propósito: é uma tranca contra força
 * bruta, não um contador auditável. Numa função sem estado o pior caso é
 * o contador zerar quando a instância recicla — o que ainda torna o
 * ataque ordens de grandeza mais caro do que sem nada, sem custar uma
 * ida ao banco por tentativa.
 *
 * ⚠️ Quando o Supabase Auth entrar (fase 12), isto sai: o GoTrue já traz
 *    limite por IP e bloqueio de conta.
 */

const JANELA_MS = 15 * 60 * 1000 // 15 minutos
const TETO = 8 // tentativas erradas na janela

interface Registro {
  erros: number[]
}

const porOrigem = new Map<string, Registro>()

async function chave(): Promise<string> {
  const h = await headers()
  // Em produção na Vercel o primeiro item de x-forwarded-for é o cliente.
  const ip =
    h.get('x-real-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'desconhecido'
  return ip
}

function limpar(reg: Registro, agora: number): void {
  reg.erros = reg.erros.filter((t) => agora - t < JANELA_MS)
}

/** Segundos que faltam para poder tentar de novo. 0 = pode tentar. */
export async function tentativasDemais(): Promise<number> {
  const k = await chave()
  const reg = porOrigem.get(k)
  if (!reg) return 0

  const agora = Date.now()
  limpar(reg, agora)
  if (reg.erros.length < TETO) return 0

  const maisAntiga = Math.min(...reg.erros)
  return Math.max(1, Math.ceil((JANELA_MS - (agora - maisAntiga)) / 1000))
}

export async function registrarTentativa(): Promise<void> {
  const k = await chave()
  const agora = Date.now()
  const reg = porOrigem.get(k) ?? { erros: [] }
  limpar(reg, agora)
  reg.erros.push(agora)
  porOrigem.set(k, reg)

  // Não deixa o mapa crescer sem limite se alguém rodar por muitos IPs.
  if (porOrigem.size > 5000) {
    for (const [chaveVelha, r] of porOrigem) {
      limpar(r, agora)
      if (r.erros.length === 0) porOrigem.delete(chaveVelha)
    }
  }
}

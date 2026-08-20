'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { abrirSessao, exigirSessao, fecharSessao, senhaConfere } from '@/lib/painel/sessao'
import { registrarTentativa, tentativasDemais } from '@/lib/painel/limite'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { config } from '@/lib/config'
import type { StatusGrupo } from '@/lib/tipos'

/** Retorno de toda Server Action do painel. Serializável, sempre. */
export type EstadoAcao = { erro?: string; ok?: boolean } | null

/**
 * PONTO ÚNICO DE ESTRANGULAMENTO.
 *
 * Toda ação de escrita passa por aqui. Server Action é um POST
 * endereçado por action ID, não por rota — o `middleware`, cujo
 * matcher é `/painel/:path*`, NÃO cobre um POST para '/' com o
 * cabeçalho `Next-Action`. Sem esta guarda, `salvarGrupo` aceitaria
 * `id` e `link` arbitrários de qualquer pessoa na internet, e o
 * botão de qualquer uma das 52 cidades poderia apontar para o
 * grupo de outro.
 *
 * Ação nova que esquecer o invólucro salta à vista na revisão:
 * é a ausência de `acaoDoPainel(` na declaração.
 */
function acaoDoPainel<T extends unknown[]>(
  fn: (...args: T) => Promise<EstadoAcao>,
): (...args: T) => Promise<EstadoAcao> {
  return async (...args: T) => {
    await exigirSessao()
    return fn(...args)
  }
}

/**
 * Server Actions do painel.
 *
 * Toda escrita passa por aqui, no servidor, com service_role. O
 * navegador do administrador nunca vê a chave nem o link de grupo
 * fora do HTML já renderizado.
 */

const PREFIXO_WHATSAPP = 'https://chat.whatsapp.com/'

export async function entrar(_estado: EstadoAcao, dados: FormData): Promise<EstadoAcao> {
  const senha = String(dados.get('senha') ?? '')
  const proximo = String(dados.get('proximo') ?? '/painel')

  if (!process.env.PAINEL_SENHA) {
    return { erro: 'PAINEL_SENHA não está configurada no ambiente.' }
  }

  // Esta é a única ação não autenticada por desenho, e ela compara uma
  // senha única. Sem limite, dá para moer a senha na velocidade que a
  // plataforma permitir.
  const espera = await tentativasDemais()
  if (espera > 0) {
    return { erro: `Muitas tentativas. Tente de novo em ${espera} segundo${espera === 1 ? '' : 's'}.` }
  }

  if (!senhaConfere(senha)) {
    await registrarTentativa()
    return { erro: 'Senha incorreta.' }
  }

  await abrirSessao()
  redirect(proximo.startsWith('/painel') ? proximo : '/painel')
}

export async function sair() {
  await fecharSessao()
  redirect('/painel/login')
}

function exigirSupabase() {
  if (!config.supabaseAtivo) {
    return { erro: 'Supabase ainda não conectado. Edição indisponível na fase local.' }
  }
  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'SUPABASE_SERVICE_ROLE_KEY ausente.' }
  return { sb }
}

/** Validação do link ao colar. Evita suporte de madrugada. */
export async function validarLink(link: string): Promise<string | null> {
  if (!link) return null
  if (!link.startsWith(PREFIXO_WHATSAPP)) {
    return `O link precisa começar com ${PREFIXO_WHATSAPP}`
  }
  if (link.length < PREFIXO_WHATSAPP.length + 8) {
    return 'Esse link parece incompleto.'
  }
  return null
}

export const salvarGrupo = acaoDoPainel(async (_estado: EstadoAcao, dados: FormData): Promise<EstadoAcao> => {
  const ctx = exigirSupabase()
  if ('erro' in ctx) return ctx

  const id = String(dados.get('id') ?? '')
  const link = String(dados.get('link') ?? '').trim()
  const status = String(dados.get('status') ?? 'em_breve') as StatusGrupo
  const limiteBruto = String(dados.get('limite_cliques') ?? '').trim()
  const observacao = String(dados.get('observacao') ?? '').trim()

  if (link) {
    const erro = await validarLink(link)
    if (erro) return { erro }
  }
  if (status === 'aberto' && !link) {
    return { erro: 'Para marcar como aberto é preciso ter o link do grupo.' }
  }

  const { error } = await ctx.sb
    .from('grupos')
    .update({
      link: link || null,
      status,
      limite_cliques: limiteBruto ? Number(limiteBruto) : null,
      observacao: observacao || null,
    })
    .eq('id', id)

  if (error) return { erro: error.message }

  revalidatePath('/painel')
  revalidatePath('/')
  revalidatePath('/grupos')
  return { ok: true }
})

/** Vira o grupo na mão, ignorando o limite. Conveniência, não algema. */
export const fixarGrupo = acaoDoPainel(async (_estado: EstadoAcao, dados: FormData): Promise<EstadoAcao> => {
  const ctx = exigirSupabase()
  if ('erro' in ctx) return ctx

  const id = String(dados.get('id') ?? '')
  const municipio = String(dados.get('municipio_slug') ?? '')

  await ctx.sb.from('grupos').update({ fixado: false }).eq('municipio_slug', municipio)
  const { error } = await ctx.sb.from('grupos').update({ fixado: true }).eq('id', id)
  if (error) return { erro: error.message }

  revalidatePath('/painel')
  revalidatePath('/')
  return { ok: true }
})

export const adicionarGrupo = acaoDoPainel(async (_estado: EstadoAcao, dados: FormData): Promise<EstadoAcao> => {
  const ctx = exigirSupabase()
  if ('erro' in ctx) return ctx

  const municipio = String(dados.get('municipio_slug') ?? '')

  const { data: existentes } = await ctx.sb
    .from('grupos')
    .select('ordem')
    .eq('municipio_slug', municipio)
    .order('ordem', { ascending: false })
    .limit(1)

  const proximaOrdem = (existentes?.[0]?.ordem ?? 0) + 1

  const { error } = await ctx.sb.from('grupos').insert({
    municipio_slug: municipio,
    ordem: proximaOrdem,
    status: 'em_breve',
    fixado: false,
    limite_cliques: 700,
  })

  if (error) return { erro: error.message }

  revalidatePath('/painel')
  return { ok: true }
})

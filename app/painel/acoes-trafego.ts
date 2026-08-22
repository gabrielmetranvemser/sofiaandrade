'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { config } from '@/lib/config'
import { exigirSessao } from '@/lib/painel/sessao'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { lerTrafego, TAG_TRAFEGO } from '@/lib/trafego/ler'
import { enviarComConfig } from '@/lib/trafego/meta'

export type EstadoTrafego = {
  ok?: boolean
  erro?: string
  erros?: Record<string, string>
  aviso?: string
  salvoEm?: string
} | null

/**
 * ⚠️ VALIDAR FORMATO AQUI NÃO É PREZIOSISMO. Todo erro de rastreamento
 *    é SILENCIOSO: um ID de pixel com um dígito a mais não dá erro em
 *    lugar nenhum — o site carrega, a página funciona, e a campanha
 *    descobre semanas depois que gastou verba otimizando para um
 *    evento que nunca chegou. As checagens abaixo são a única chance
 *    de transformar esse silêncio em uma mensagem na tela.
 */
const FORMATOS: Record<string, { regra: RegExp; erro: string }> = {
  metaPixelId: {
    regra: /^\d{15,17}$/,
    erro: 'O ID do pixel é só números, normalmente 15 ou 16 dígitos. Copie do Gerenciador de Eventos.',
  },
  gtmId: {
    regra: /^GTM-[A-Z0-9]{4,10}$/,
    erro: 'O ID do contêiner começa com GTM- e vem em letras maiúsculas. Ex.: GTM-ABC1234.',
  },
  metaDominio: {
    regra: /^[a-z0-9]{20,80}$/,
    erro: 'É a sequência que aparece no atributo content da meta tag, sem aspas e sem o resto da linha.',
  },
  capiTeste: {
    regra: /^TEST\d{3,8}$/,
    erro: 'O código de teste começa com TEST seguido de números. Ex.: TEST12345.',
  },
  apiVersao: {
    regra: /^v\d{1,2}\.0$/,
    erro: 'A versão tem o formato vNN.0. Ex.: v21.0.',
  },
}

export async function salvarTrafego(
  _estado: EstadoTrafego,
  dados: FormData,
): Promise<EstadoTrafego> {
  await exigirSessao()

  const campo = (nome: string) => String(dados.get(nome) ?? '').trim()

  const valores = {
    metaPixelId: campo('metaPixelId'),
    gtmId: campo('gtmId').toUpperCase(),
    metaDominio: campo('metaDominio'),
    capiTeste: campo('capiTeste').toUpperCase(),
    apiVersao: campo('apiVersao') || 'v21.0',
  }

  const erros: Record<string, string> = {}
  for (const [nome, valor] of Object.entries(valores)) {
    // Vazio é estado legítimo: campo em branco desliga aquele pedaço.
    if (!valor) continue
    const f = FORMATOS[nome]
    if (f && !f.regra.test(valor)) erros[nome] = f.erro
  }

  // ⚠️ O TOKEN NUNCA VOLTA DO FORMULÁRIO. A tela mostra só os quatro
  //    últimos caracteres, e o campo chega vazio quando ninguém o
  //    tocou. Vazio significa MANTER, não apagar — senão salvar uma
  //    vírgula no ID do pixel derrubaria o rastreamento pelo servidor
  //    da campanha inteira, em silêncio.
  //
  //    Para apagar de verdade existe uma caixa própria, marcada de
  //    propósito: remover credencial é decisão, não efeito colateral.
  const tokenNovo = String(dados.get('capiToken') ?? '').trim()
  const removerToken = dados.get('removerToken') === 'on'

  if (tokenNovo && tokenNovo.length < 40) {
    erros.capiToken =
      'Esse token parece curto demais. O da Conversions API tem mais de 150 caracteres e começa com EAA.'
  }

  if (Object.keys(erros).length > 0) {
    return { erro: 'Confira os campos marcados.', erros }
  }

  if (!config.supabaseAtivo) return { erro: 'Supabase não conectado.' }
  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'SUPABASE_SERVICE_ROLE_KEY ausente.' }

  const linha: Record<string, unknown> = {
    id: true,
    meta_pixel_id: valores.metaPixelId || null,
    gtm_id: valores.gtmId || null,
    meta_dominio: valores.metaDominio || null,
    meta_capi_teste: valores.capiTeste || null,
    meta_api_versao: valores.apiVersao,
    capi_ativa: dados.get('capiAtiva') === 'on',
    atualizado_por: 'painel',
    atualizado_em: new Date().toISOString(),
  }

  if (removerToken) linha.meta_capi_token = null
  else if (tokenNovo) linha.meta_capi_token = tokenNovo

  const { error } = await sb.from('trafego').upsert(linha, { onConflict: 'id' })
  if (error) return { erro: error.message }

  updateTag(TAG_TRAFEGO)
  revalidatePath('/', 'layout')

  // O aviso que o pedido original citou por nome. Não bloqueia nada:
  // usar os dois é uma escolha legítima, desde que o pixel esteja em
  // um lugar só.
  const aviso =
    valores.metaPixelId && valores.gtmId
      ? 'Pixel e GTM ligados ao mesmo tempo. Confira que NÃO existe uma tag do pixel da Meta dentro do contêiner do GTM — seriam dois pixels, e todo evento contaria em dobro.'
      : undefined

  return { ok: true, aviso, salvoEm: new Date().toISOString() }
}

/**
 * O BOTÃO DE PROVA.
 *
 * ⚠️ EXISTE PORQUE RASTREAMENTO ERRADO NÃO RECLAMA. Sem isto, a única
 *    forma de saber se o token está certo é esperar uma conversão real
 *    acontecer e torcer para ela aparecer no Gerenciador — ou seja,
 *    descobrir o erro pelo prejuízo. Aqui a resposta é da própria
 *    Meta, na hora: quantos eventos ela recebeu, ou o motivo exato da
 *    recusa.
 *
 * Manda um `PageView` de teste. Se o código de teste estiver
 * preenchido, ele aparece em "Eventos de teste" e NÃO conta como
 * conversão; sem código, cai no fluxo normal — por isso a tela avisa.
 */
export async function testarCapi(_estado: EstadoTrafego, _dados: FormData): Promise<EstadoTrafego> {
  await exigirSessao()

  const cfg = await lerTrafego()
  if (!cfg.metaPixelId) return { erro: 'Preencha e salve o ID do pixel antes de testar.' }
  if (!cfg.capiToken) return { erro: 'Preencha e salve o token da Conversions API antes de testar.' }

  const resultado = await enviarComConfig(cfg, {
    nome: 'PageView',
    eventId: `teste-do-painel-${Date.now()}`,
    url: config.siteUrl,
    identidade: {
      ip: null,
      agente: 'Painel Sofia 2233 (teste de configuração)',
      fbp: null,
      fbc: null,
      sessao: null,
    },
  })

  if (!resultado.ok) {
    return {
      erro: `A Meta recusou: ${resultado.mensagem ?? 'sem detalhe'}${
        resultado.fbtrace ? ` (fbtrace ${resultado.fbtrace})` : ''
      }`,
    }
  }

  return {
    ok: true,
    aviso: cfg.capiTeste
      ? `A Meta recebeu ${resultado.recebidos} evento. Ele está em Gerenciador de Eventos ▸ Eventos de teste, e não conta como conversão.`
      : `A Meta recebeu ${resultado.recebidos} evento. Sem código de teste preenchido, ele entrou no fluxo normal e vai aparecer como um PageView de verdade.`,
  }
}

'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { config } from '@/lib/config'
import { TAG_CONTEUDO } from '@/lib/conteudo/ler'
import { exigirSessao } from '@/lib/painel/sessao'
import { criarClienteAdmin } from '@/lib/supabase/admin'

export type EstadoBuscas = {
  ok?: boolean
  erro?: string
  aviso?: string
  salvoEm?: string
} | null

/**
 * O código do Google só pode ser isto: letras, números, hífen e
 * sublinhado. Hoje ele tem 43 caracteres, mas o Google já mudou esse
 * tamanho antes — a faixa é larga de propósito, para a validação
 * recusar o que é claramente errado sem virar obstáculo no dia em que
 * o formato mudar de novo.
 */
const FORMATO = /^[A-Za-z0-9_-]{20,100}$/

/**
 * ⚠️ O ENGANO MAIS PROVÁVEL PASSA PELO FORMATO ACIMA. Quem cola o
 *    nome do atributo em vez do valor — a string literal
 *    `google-site-verification`, que é o que o olho pega primeiro na
 *    linha do Google — entrega 24 caracteres de letras e hífens, e a
 *    regra de cima aceita numa boa. O site então publica uma tag com
 *    conteúdo errado, o Search Console responde "não foi possível
 *    verificar" e não diz por quê.
 *
 *    Código de verdade é aleatório: tem maiúscula, ou número, ou
 *    sublinhado. Só minúsculas e hífens é nome de atributo, não valor.
 */
const PARECE_NOME_DE_ATRIBUTO = /^[a-z-]+$/

/**
 * ACEITA A LINHA INTEIRA DA META TAG, e isso é o ponto.
 *
 * O Search Console entrega a verificação assim, num campo com botão de
 * copiar:
 *
 *   <meta name="google-site-verification" content="AbC-123..." />
 *
 * Quem está cadastrando o site copia esse bloco inteiro — é o que o
 * botão da tela do Google põe na área de transferência. Um campo que
 * exigisse "cole só o miolo entre aspas" transformaria um Ctrl+V em
 * uma tarefa de edição de texto, e edição de texto à mão é onde o
 * caractere some. Então quem separa o código da tag é o servidor.
 */
function extrairCodigo(bruto: string): string {
  const texto = bruto.trim()
  if (!texto) return ''

  // Colou a tag inteira: fica o que estiver no content.
  const comTag = texto.match(/content\s*=\s*["']([^"']+)["']/i)
  if (comTag) return comTag[1].trim()

  return texto
}

/**
 * Grava o código de verificação do Google Search Console.
 *
 * ⚠️ ESCREVE NA SEÇÃO `meta` DO CONTEÚDO, e por isso precisa MESCLAR
 *    com o que já está lá em vez de sobrescrever. O registro de `meta`
 *    guarda também título, descrição e palavras-chave editados no
 *    painel: um upsert com `{ verificacaoGoogle }` sozinho apagaria
 *    todos eles de uma vez, e a página voltaria ao texto de fábrica
 *    sem ninguém entender por quê.
 */
export async function salvarVerificacaoGoogle(
  _estado: EstadoBuscas,
  dados: FormData,
): Promise<EstadoBuscas> {
  await exigirSessao()

  const codigo = extrairCodigo(String(dados.get('verificacaoGoogle') ?? ''))

  if (codigo && (!FORMATO.test(codigo) || PARECE_NOME_DE_ATRIBUTO.test(codigo))) {
    return {
      erro: 'Isso não parece o código de verificação. Cole a linha inteira que o Google mostra, começando com <meta name="google-site-verification" — ou só a sequência que está entre aspas depois de content=.',
    }
  }

  if (!config.supabaseAtivo) {
    return { erro: 'Supabase não conectado. Edição indisponível.' }
  }
  const sb = criarClienteAdmin()
  if (!sb) return { erro: 'SUPABASE_SERVICE_ROLE_KEY ausente.' }

  const { data } = await sb.from('conteudo').select('dados').eq('secao', 'meta').maybeSingle()
  const atual = ((data?.dados ?? {}) as Record<string, unknown>) ?? {}

  const override = { ...atual }
  // Apagar a chave, e não gravá-la vazia: assim a seção volta ao
  // padrão de fábrica (que é vazio) em vez de carregar para sempre um
  // campo em branco no override.
  if (codigo) override.verificacaoGoogle = codigo
  else delete override.verificacaoGoogle

  const { error } = await sb
    .from('conteudo')
    .upsert({ secao: 'meta', dados: override, atualizado_por: 'painel (buscas)' }, { onConflict: 'secao' })

  if (error) return { erro: error.message }

  updateTag(TAG_CONTEUDO)
  // A tag mora no <head> do layout: é a raiz que precisa ser refeita.
  revalidatePath('/', 'layout')

  return {
    ok: true,
    salvoEm: new Date().toISOString(),
    aviso: codigo
      ? undefined
      : 'Código removido. A tag de verificação não sai mais no site — se a propriedade tiver sido verificada por ela, o Google vai perdê-la na próxima checagem.',
  }
}

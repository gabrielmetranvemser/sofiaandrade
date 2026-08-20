import 'server-only'

import { lerConteudo } from './ler'
import { CHAVES_CLIENTE, type ConteudoCliente } from './recorte'

/** Recorta, no servidor, só o que a árvore de cliente consome. */
export async function lerConteudoCliente(): Promise<ConteudoCliente> {
  const todo = await lerConteudo()
  const saida = {} as Record<string, unknown>
  for (const chave of CHAVES_CLIENTE) saida[chave] = todo[chave]
  return saida as ConteudoCliente
}

import { createHash } from 'node:crypto'
import { PADRAO } from '@/content/copy'

/**
 * Impressão digital do padrão de fábrica de uma seção.
 *
 * O diff é calculado contra o padrão do MOMENTO DO SUBMIT. Se um deploy
 * mudar content/copy.ts enquanto alguém edita, um campo não tocado pode
 * virar override — ou deixar de ser — sem ninguém perceber. O hash vai
 * escondido no formulário e é conferido na volta.
 *
 * ⚠️ Mora fora de acoes-conteudo.ts porque num módulo 'use server' todo
 *    export precisa ser função async: o build recusa com
 *    "Server Actions must be async functions".
 */
export function hashPadrao(secao: string): string {
  const base = (PADRAO as Record<string, unknown>)[secao]
  return createHash('sha256').update(JSON.stringify(base ?? {})).digest('hex').slice(0, 12)
}

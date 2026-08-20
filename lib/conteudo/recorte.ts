import type { Conteudo } from './tipos'

/**
 * O recorte do conteúdo que atravessa a fronteira servidor→cliente.
 *
 * ⚠️ Este arquivo é NEUTRO de propósito: sem `'use client'`, sem
 *    `server-only`. Um módulo de servidor que importa um valor de um
 *    módulo marcado `'use client'` recebe a referência de cliente, não
 *    o valor — `CHAVES_CLIENTE` chegava como proxy e o build quebrava
 *    com "CHAVES_CLIENTE is not iterable". A constante precisa morar
 *    fora dos dois lados.
 */
export type ConteudoCliente = Pick<
  Conteudo,
  'candidata' | 'ctas' | 'navegacao' | 'grupos' | 'filtro' | 'compartilhar'
>

export const CHAVES_CLIENTE = [
  'candidata',
  'ctas',
  'navegacao',
  'grupos',
  'filtro',
  'compartilhar',
] as const satisfies readonly (keyof ConteudoCliente)[]

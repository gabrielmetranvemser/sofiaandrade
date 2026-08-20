import type { PADRAO } from '@/content/copy'

/**
 * Alarga o tipo de `content/copy.ts` para o que o painel pode produzir.
 *
 * `copy.ts` é declarado `as const`, então `hero.titulo` tem o tipo
 * `readonly ['Eu sou Sofia Andrade.', 'E eu não peço licença.']` — uma
 * tupla de dois literais. O banco devolve `string[]`. Sem este alargador
 * nada do que vem do banco encaixa, e o admin não poderia acrescentar
 * uma terceira linha ao título.
 *
 * ⚠️ A ORDEM DOS TESTES IMPORTA:
 *    1. array ANTES de string, senão `readonly string[]` cai no ramo errado
 *    2. `[T] extends [string]` com colchetes, para não distribuir sobre união
 *       (sem eles, `'a' | 'b'` viraria `string` e perderia o enum)
 *    3. boolean antes de object
 */
export type Editavel<T> =
  T extends readonly (infer U)[]
    ? Editavel<U>[]
    : [T] extends [string]
      ? string
      : [T] extends [number]
        ? number
        : [T] extends [boolean]
          ? boolean
          : T extends object
            ? { -readonly [K in keyof T]: Editavel<T[K]> }
            : T

/** O conteúdo inteiro do site, no formato editável. */
export type Conteudo = Editavel<typeof PADRAO>

/** As chaves de seção. */
export type ChaveSecao = keyof Conteudo

/** O que o banco guarda: override parcial e profundo de uma seção. */
export type Override<T> = T extends readonly (infer U)[]
  ? Editavel<U>[]
  : T extends object
    ? { [K in keyof T]?: Override<T[K]> }
    : Editavel<T>

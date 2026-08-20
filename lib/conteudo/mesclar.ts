/**
 * Mescla o padrão de fábrica com o que a campanha editou.
 *
 * ⚠️ A REGRA MAIS IMPORTANTE DESTE ARQUIVO: array do override
 *    SUBSTITUI o array padrão inteiro. Nunca elemento a elemento.
 *
 *    Um merge profundo que entra em array por índice ressuscita o item
 *    que o admin removeu: se o padrão tem 3 parágrafos e o override tem
 *    2, o resultado precisa ter 2. Com merge por índice, o terceiro
 *    parágrafo do padrão volta do túmulo e ninguém entende por quê.
 *
 * A segunda regra: chave que o padrão não conhece é DESCARTADA. Isso é
 * a validação final — linha corrompida ou adulterada no banco não chega
 * a renderizar, porque o formato de saída é sempre o formato do padrão.
 */
export function mesclar<T>(padrao: T, override: unknown): T {
  if (override === undefined || override === null) return padrao

  if (Array.isArray(padrao)) {
    return (Array.isArray(override) ? override : padrao) as T
  }

  if (
    typeof padrao === 'object' &&
    padrao !== null &&
    typeof override === 'object' &&
    !Array.isArray(override)
  ) {
    const saida: Record<string, unknown> = { ...(padrao as Record<string, unknown>) }
    for (const chave of Object.keys(padrao as Record<string, unknown>)) {
      if (chave in (override as Record<string, unknown>)) {
        saida[chave] = mesclar(
          (padrao as Record<string, unknown>)[chave],
          (override as Record<string, unknown>)[chave],
        )
      }
    }
    return saida as T
  }

  // Escalar: o override só vence se for do mesmo tipo. Protege contra
  // um número gravado onde a página espera string.
  return (typeof override === typeof padrao ? override : padrao) as T
}

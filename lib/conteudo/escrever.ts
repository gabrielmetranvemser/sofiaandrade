/**
 * Escreve num caminho aninhado sem mutar o original.
 *
 * "itens.2.titulo" vira `{...alvo, itens: [..., {...item2, titulo}]}`.
 *
 * ⚠️ Mora aqui, e não dentro do formulário, porque agora tem dois
 *    donos: o editor de seção (no navegador) e a gravação de vídeos
 *    (no servidor, aplicando um lote de caminhos de uma vez). Duas
 *    cópias desta função divergiriam na primeira correção de borda.
 */
export function escrever(
  alvo: Record<string, unknown>,
  caminho: string[],
  valor: unknown,
): Record<string, unknown> {
  const [chave, ...resto] = caminho
  if (resto.length === 0) return { ...alvo, [chave]: valor }

  const atual = alvo[chave]
  if (Array.isArray(atual)) {
    const i = Number(resto[0])
    const copia = [...atual]
    copia[i] = escrever((copia[i] ?? {}) as Record<string, unknown>, resto.slice(1), valor)
    return { ...alvo, [chave]: copia }
  }
  return {
    ...alvo,
    [chave]: escrever((atual ?? {}) as Record<string, unknown>, resto, valor),
  }
}

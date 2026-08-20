import type { Conteudo } from './tipos'

/**
 * As seções que o painel pode desligar.
 *
 * ⚠️ Desligar uma seção não é só deixar de renderizá-la: é preciso
 *    cuidar de quem APONTA para ela. Um item de menu levando a uma
 *    âncora que não existe mais não dá erro — ele simplesmente não faz
 *    nada quando a pessoa toca, que é pior que um erro, porque parece
 *    site quebrado sem dizer o que quebrou.
 */
export type Exibir = Conteudo['exibir']

/** Os ids de seção desligados, no formato das âncoras (`origem`, `futuro`…). */
export function secoesOcultas(exibir: Exibir): string[] {
  return Object.entries(exibir)
    .filter(([, ligada]) => !ligada)
    .map(([chave]) => chave)
}

/**
 * Para onde os botões de grupo devem apontar.
 *
 * Com a seção de grupos no ar, é a âncora — rolar é mais rápido que
 * carregar página. Com ela desligada, a âncora não existe, e o destino
 * passa a ser `/grupos`, que é a mesma lista numa página própria e já
 * existia. Assim desligar a seção encurta a home sem derrubar o funil
 * inteiro da campanha, que é o que aconteceria se os botões virassem
 * cliques mortos.
 */
export function destinoGrupo(exibir: Exibir): string {
  return exibir.grupos ? '/#grupos' : '/grupos'
}

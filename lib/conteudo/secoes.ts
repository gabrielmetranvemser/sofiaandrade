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
 * Para onde os botões de grupo devem apontar quando não há cidade no link.
 *
 * ⚠️ ERA A ÂNCORA `#grupos`, com a ideia de que rolar é mais rápido que
 *    carregar página. Não é: a seção fica a ~20 mil px do topo, depois
 *    de duas seções que travam a rolagem, e para quem chegou com UTM na
 *    URL o toque ainda virava uma navegação completa, sem aviso, antes
 *    de rolar. `/grupos` é leve (uma imagem) e abre com a busca logo
 *    abaixo do título.
 *
 * O parâmetro fica: é a assinatura que as telas já chamam, e a seção
 * desligada no painel continua levando ao mesmo lugar.
 */
export function destinoGrupo(_exibir?: Exibir): string {
  return '/grupos'
}

/**
 * O CONSENTIMENTO DE COOKIES — o formato, lido dos dois lados.
 *
 * ⚠️ ESTE ARQUIVO É NEUTRO: sem `'use client'` e sem `server-only`. O
 *    navegador grava a escolha, e o SERVIDOR precisa lê-la — é dele que
 *    saem o PageView, os eventos e o Lead pela Conversions API. Um envio
 *    à Meta sem autorização de publicidade é justamente o que o aviso
 *    promete que não acontece, e ele sairia pelo servidor sem passar por
 *    nenhum código de navegador.
 *
 * Três categorias, e não as quatro de outros sites: esta página não tem
 * cookie de "preferências". Oferecer uma categoria que não existe seria
 * pedir autorização para nada.
 *
 *   · necessários   — sempre ativos: guardar esta escolha, não contar o
 *                     mesmo toque no grupo duas vezes.
 *   · desempenho    — Google Tag Manager, com GA4 e Clarity dentro.
 *   · publicidade   — pixel e Conversions API da Meta.
 *
 * As métricas próprias do painel não dependem disto: não usam cookie,
 * não guardam endereço de rede e não identificam ninguém (ver a seção
 * "O que medimos" da política de privacidade).
 */

export const COOKIE_CONSENTIMENTO = 'sofia_consentimento'

/**
 * Sobe quando o texto do aviso ou as categorias mudarem de sentido: uma
 * autorização dada para outra coisa não vale para a nova, e o aviso
 * volta a aparecer para todo mundo.
 */
export const VERSAO_CONSENTIMENTO = 1

/** Seis meses. Depois disso a escolha é pedida de novo. */
export const VALIDADE_CONSENTIMENTO_S = 60 * 60 * 24 * 180

export interface Consentimento {
  desempenho: boolean
  publicidade: boolean
}

/**
 * `1.d1.p0.1726600000` — versão, desempenho, publicidade, instante.
 *
 * Pontos, e não `=` e `&`: o valor vive num cookie, e cookie com
 * caracteres de URL precisa de codificação num lado e decodificação no
 * outro — mais um lugar para os dois lados divergirem.
 */
export function serializarConsentimento(escolha: Consentimento): string {
  return [
    VERSAO_CONSENTIMENTO,
    escolha.desempenho ? 'd1' : 'd0',
    escolha.publicidade ? 'p1' : 'p0',
    Math.floor(Date.now() / 1000),
  ].join('.')
}

/** Escolha válida, ou `null` — sem escolha, com versão antiga ou adulterada. */
export function analisarConsentimento(valor: string | null | undefined): Consentimento | null {
  if (!valor) return null
  const [versao, d, p] = valor.split('.')
  if (versao !== String(VERSAO_CONSENTIMENTO)) return null
  if (!/^d[01]$/.test(d ?? '') || !/^p[01]$/.test(p ?? '')) return null
  return { desempenho: d === 'd1', publicidade: p === 'p1' }
}

/**
 * Este pedido traz autorização de publicidade? Sem escolha, é não.
 *
 * Recebe o valor do cookie, e não o pedido, para servir igual ao Route
 * Handler (`req.cookies`) e a quem só tem o cabeçalho.
 */
export function autorizouPublicidade(valorDoCookie: string | null | undefined): boolean {
  return analisarConsentimento(valorDoCookie)?.publicidade === true
}

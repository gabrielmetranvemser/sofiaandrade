'use client'

import { useMemo, useSyncExternalStore } from 'react'
import {
  analisarConsentimento,
  COOKIE_CONSENTIMENTO,
  serializarConsentimento,
  VALIDADE_CONSENTIMENTO_S,
  type Consentimento,
} from './consentimento'

/** Avisa quem lê a escolha — o aviso e o carregador de terceiros. */
const EVENTO_MUDOU = 'sofia:consentimento'
/** Pede para abrir as escolhas ("Gerenciar cookies", no rodapé). */
const EVENTO_ABRIR = 'sofia:consentimento-abrir'

/**
 * Quando a pessoa salvou a escolha pelo aviso. O carregador de terceiros
 * usa isto para não esperar o próximo toque: o toque foi o próprio botão.
 */
let salvoEm = 0

export function salvoAgoraPouco(): boolean {
  return Date.now() - salvoEm < 2_000
}

function valorDoCookie(): string {
  if (typeof document === 'undefined') return ''
  const par = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE_CONSENTIMENTO}=`))
  return par ? par.slice(COOKIE_CONSENTIMENTO.length + 1) : ''
}

/**
 * Os cookies que as ferramentas opcionais gravam neste domínio. Apagados
 * quando a pessoa retira a autorização — o script já carregado não se
 * descarrega, e por isso a página também recarrega (ver `salvarEscolha`).
 */
const COOKIES_DE_DESEMPENHO = /^(_ga|_gid|_gat|_clck|_clsk|CLID|MUID)/
const COOKIES_DE_PUBLICIDADE = /^(_fbp|_fbc)$/

function apagarCookies(padrao: RegExp): void {
  const dominios = ['', location.hostname, `.${location.hostname.replace(/^www\./, '')}`]
  for (const par of document.cookie.split('; ')) {
    const nome = par.split('=')[0]
    if (!padrao.test(nome)) continue
    for (const dominio of dominios) {
      document.cookie = `${nome}=; path=/; max-age=0${dominio ? `; domain=${dominio}` : ''}`
    }
  }
}

export function salvarEscolha(escolha: Consentimento): void {
  const antes = analisarConsentimento(valorDoCookie())
  const seguro = location.protocol === 'https:' ? '; secure' : ''
  document.cookie =
    `${COOKIE_CONSENTIMENTO}=${serializarConsentimento(escolha)}; path=/; ` +
    `max-age=${VALIDADE_CONSENTIMENTO_S}; samesite=lax${seguro}`
  salvoEm = Date.now()

  // ⚠️ RETIRAR AUTORIZAÇÃO RECARREGA A PÁGINA. GA4, Clarity e o pixel,
  //    uma vez carregados, continuam rodando até a página ser descartada
  //    — não existe "descarregar script". Apagar os cookies deles e
  //    recarregar é o único jeito de a escolha valer já nesta visita.
  const retirouDesempenho = antes?.desempenho && !escolha.desempenho
  const retirouPublicidade = antes?.publicidade && !escolha.publicidade
  if (retirouDesempenho) apagarCookies(COOKIES_DE_DESEMPENHO)
  if (retirouPublicidade) apagarCookies(COOKIES_DE_PUBLICIDADE)
  if (retirouDesempenho || retirouPublicidade) {
    location.reload()
    return
  }

  window.dispatchEvent(new Event(EVENTO_MUDOU))
}

export function abrirEscolhasDeCookies(): void {
  window.dispatchEvent(new Event(EVENTO_ABRIR))
}

export function aoPedirEscolhas(fazer: () => void): () => void {
  window.addEventListener(EVENTO_ABRIR, fazer)
  return () => window.removeEventListener(EVENTO_ABRIR, fazer)
}

function assinar(avisar: () => void): () => void {
  window.addEventListener(EVENTO_MUDOU, avisar)
  return () => window.removeEventListener(EVENTO_MUDOU, avisar)
}

/**
 * A escolha atual. `undefined` enquanto não se sabe (no servidor e na
 * hidratação), `null` quando a pessoa ainda não escolheu.
 *
 * ⚠️ `undefined` E `null` SÃO COISAS DIFERENTES, e a diferença importa
 *    para o aviso: no HTML do servidor não há cookie para ler, e mostrar
 *    o aviso ali faria ele piscar para quem já escolheu.
 */
export function useConsentimento(): Consentimento | null | undefined {
  // O retrato é a STRING do cookie, e não o objeto: o React compara por
  // identidade, e um objeto novo a cada leitura faria re-render sem fim.
  const valor = useSyncExternalStore(assinar, valorDoCookie, () => undefined)
  // ⚠️ E O OBJETO SAI MEMORIZADO, pelo mesmo motivo, um degrau acima: quem
  //    põe a escolha na lista de dependências de um efeito veria um
  //    objeto novo a cada render. No aviso, isso desfazia o interruptor
  //    no mesmo instante em que a pessoa o tocava.
  return useMemo(() => (valor === undefined ? undefined : analisarConsentimento(valor)), [valor])
}

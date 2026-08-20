'use client'

import type { Evento, TipoEvento } from './tipos'

const CHAVE_SESSAO = 'sofia2233.sessao'

/**
 * Identificador aleatório por navegador. Sem nome, sem telefone, sem IP.
 * Serve só para não contar a mesma pessoa cinco vezes.
 * Fica em sessionStorage: morre quando a aba fecha, o que nos mantém
 * fora da exigência de banner de consentimento.
 */
export function idSessao(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = sessionStorage.getItem(CHAVE_SESSAO)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(CHAVE_SESSAO, id)
    }
    return id
  } catch {
    return ''
  }
}

export function dispositivo(): 'celular' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia('(max-width: 768px)').matches ? 'celular' : 'desktop'
}

export function utmDaUrl(): string | null {
  if (typeof window === 'undefined') return null
  const p = new URLSearchParams(window.location.search)
  const partes = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']
    .map((k) => p.get(k))
    .filter(Boolean)
  return partes.length ? partes.join('|') : null
}

/**
 * Dispara um evento. Nunca lança, nunca bloqueia a navegação.
 * Usa sendBeacon quando existe — sobrevive ao unload da página,
 * que é exatamente o caso do clique que leva pro WhatsApp.
 */
export function evento(
  tipo: TipoEvento,
  extra: Omit<Evento, 'tipo' | 'sessao' | 'dispositivo' | 'utm'> = {},
): void {
  if (typeof window === 'undefined') return

  const corpo: Evento = {
    tipo,
    ...extra,
    utm: utmDaUrl(),
    sessao: idSessao(),
    dispositivo: dispositivo(),
  }

  try {
    const dados = JSON.stringify(corpo)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/evento', new Blob([dados], { type: 'application/json' }))
      return
    }
    void fetch('/api/evento', {
      method: 'POST',
      body: dados,
      headers: { 'content-type': 'application/json' },
      keepalive: true,
    })
  } catch {
    // Métrica nunca pode quebrar a página.
  }
}

/** Marca de rolagem: dispara rolou_50 e rolou_90 uma vez cada. */
export function observarRolagem(): () => void {
  if (typeof window === 'undefined') return () => {}
  const disparados = new Set<TipoEvento>()

  const aoRolar = () => {
    const alturaDoc = document.documentElement.scrollHeight - window.innerHeight
    if (alturaDoc <= 0) return
    const pct = (window.scrollY / alturaDoc) * 100
    if (pct >= 50 && !disparados.has('rolou_50')) {
      disparados.add('rolou_50')
      evento('rolou_50')
    }
    if (pct >= 90 && !disparados.has('rolou_90')) {
      disparados.add('rolou_90')
      evento('rolou_90')
      window.removeEventListener('scroll', aoRolar)
    }
  }

  window.addEventListener('scroll', aoRolar, { passive: true })
  return () => window.removeEventListener('scroll', aoRolar)
}

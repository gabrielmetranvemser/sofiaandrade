'use client'

/**
 * Seção 4 do plano — a armadilha do Instagram.
 *
 * O tráfego vem da bio do Instagram. Quem clica ali abre o webview
 * interno do app, onde `<a download>` frequentemente não faz nada.
 * Detectar isso é o que separa o filtro que funciona do que morre calado.
 */

export type Webview = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | null

export function detectarWebview(ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''): Webview {
  if (!ua) return null
  if (/Instagram/i.test(ua)) return 'instagram'
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'facebook'
  if (/BytedanceWebview|TikTok|musical_ly/i.test(ua)) return 'tiktok'
  if (/LinkedInApp/i.test(ua)) return 'linkedin'
  return null
}

export function ehIOS(ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)
}

export function ehAndroid(ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  return /Android/i.test(ua)
}

/** O aparelho consegue compartilhar arquivo? É o caminho melhor que download. */
export function podeCompartilharArquivo(arquivos: File[]): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (!nav.share || !nav.canShare) return false
  try {
    return nav.canShare({ files: arquivos })
  } catch {
    return false
  }
}

/**
 * Tenta sair do webview para o navegador do sistema.
 * Android: intent:// resolve limpo. iOS: não existe caminho programático
 * confiável, então o certo é instruir o toque nos "…" → "Abrir no navegador".
 */
export function abrirNoNavegador(url: string): void {
  if (typeof window === 'undefined') return
  if (ehAndroid()) {
    const semProtocolo = url.replace(/^https?:\/\//, '')
    window.location.href = `intent://${semProtocolo}#Intent;scheme=https;package=com.android.chrome;end`
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** Instrução textual certa para cada plataforma. Sem isso o usuário trava. */
export function instrucaoSairDoWebview(webview: Webview): string {
  if (!webview) return ''
  if (ehIOS()) {
    return 'Toque nos três pontinhos no canto da tela e escolha "Abrir no navegador".'
  }
  return 'Toque nos três pontinhos no canto da tela e escolha "Abrir no Chrome".'
}

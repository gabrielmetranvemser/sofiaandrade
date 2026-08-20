import { ImageResponse } from 'next/og'
import { candidata, meta } from '@/content/copy'

/**
 * O cartão que aparece quando alguém cola o link no WhatsApp.
 *
 * Isso não é enfeite: a página nasceu para circular, e um link sem
 * cartão no WhatsApp parece spam. É a diferença entre ser repassado
 * e ser ignorado.
 *
 * Gerado em tempo de build/edge — não depende de designer nem de
 * arquivo chegar. Quando a arte oficial chegar, trocar por um PNG
 * estático em app/opengraph-image.png (o Next prioriza o arquivo).
 */
export const alt = `${candidata.nome} — ${candidata.numero}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Imagem() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0d2440 0%, #12539e 100%)',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#10884f',
            }}
          />
          <div style={{ fontSize: 26, color: '#f2b134', letterSpacing: 2, fontWeight: 600 }}>
            {meta.og.subtitulo.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            {candidata.nome}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                color: '#12539e',
                fontSize: 76,
                fontWeight: 800,
                letterSpacing: -4,
                padding: '10px 32px',
                borderRadius: 28,
              }}
            >
              {candidata.numero}
            </div>
            <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.8)' }}>
              {meta.og.chamada}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.6)' }}>
          52 municípios de Rondônia · um grupo de WhatsApp para cada
        </div>
      </div>
    ),
    size,
  )
}

import type { MetadataRoute } from 'next'
import { meta } from '@/content/copy'
import { lerSlots } from '@/lib/midia/ler'

// Assíncrono para ler o ícone do painel. O atalho na tela inicial do
// celular usa ESTES ícones, não o da aba — então trocar um sem o outro
// deixaria o site com duas caras.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const icone = (await lerSlots())['marca.favicon']?.url ?? null

  return {
    name: meta.titulo,
    short_name: meta.tituloCurto,
    description: meta.descricao,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#01518f',
    lang: 'pt-BR',
    icons: icone
      ? [{ src: icone, sizes: '512x512', type: 'image/webp', purpose: 'any' }]
      : [
          { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
        ],
  }
}

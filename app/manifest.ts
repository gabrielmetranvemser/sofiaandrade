import type { MetadataRoute } from 'next'
import { meta } from '@/content/copy'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: meta.titulo,
    short_name: meta.tituloCurto,
    description: meta.descricao,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#01518f',
    lang: 'pt-BR',
    icons: [
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}

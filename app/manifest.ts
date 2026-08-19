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
    theme_color: '#12539e',
    lang: 'pt-BR',
    icons: [
      // ⚠️ Substituir pelos ícones da campanha quando a arte chegar.
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}

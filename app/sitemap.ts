import type { MetadataRoute } from 'next'
import { config } from '@/lib/config'
import { MUNICIPIOS } from '@/lib/dados'

/**
 * SEO importa pouco aqui — o tráfego vem da bio do Instagram, não do
 * Google. Mas custa zero e resolve a busca pelo nome próprio e pelo
 * nome de cada município.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date()

  const paginas: MetadataRoute.Sitemap = [
    { url: config.siteUrl, lastModified: agora, changeFrequency: 'daily', priority: 1 },
    { url: `${config.siteUrl}/grupos`, lastModified: agora, changeFrequency: 'daily', priority: 0.9 },
    { url: `${config.siteUrl}/filtro`, lastModified: agora, changeFrequency: 'weekly', priority: 0.8 },
    {
      url: `${config.siteUrl}/politica-de-privacidade`,
      lastModified: agora,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // As rotas /g/[slug] são redirecionadores, não páginas: ficam de fora
  // do sitemap de propósito. Indexar um redirect não ajuda ninguém.
  return paginas
}

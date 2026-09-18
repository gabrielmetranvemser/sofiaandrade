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
    // O link da bio entra com prioridade baixa de propósito: ele existe
    // para ser colado num perfil, não para ser achado no Google. Fica
    // no mapa porque uma página que responde 200 e não está listada é
    // exatamente o que o Search Console reclama como "descoberta, não
    // indexada" — ruído na tela de Buscas por nada.
    { url: `${config.siteUrl}/bio`, lastModified: agora, changeFrequency: 'weekly', priority: 0.4 },
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

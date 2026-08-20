import type { MetadataRoute } from 'next'
import { config } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  // Enquanto estiver em URL de preview, não indexa. Publicação em
  // domínio próprio depende de CNPJ e domínio confirmados — está no
  // plano como risco que BLOQUEIA a publicação.
  const emProducao = !config.siteUrl.includes('localhost') && !config.siteUrl.includes('vercel.app')

  if (!emProducao) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Redirecionadores, painel e API não têm o que indexar.
        disallow: ['/g/', '/painel', '/painel/', '/api/'],
      },
    ],
    sitemap: `${config.siteUrl}/sitemap.xml`,
    host: config.siteUrl,
  }
}

import type { MetadataRoute } from 'next'
import { config, siteIndexavel } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  // Enquanto estiver em URL de preview, não indexa. Publicação em
  // domínio próprio depende de CNPJ e domínio confirmados — está no
  // plano como risco que BLOQUEIA a publicação.
  //
  // A regra em si está em lib/config.ts: a tela de Buscas do painel
  // mostra o mesmo estado para quem for cadastrar no Search Console.
  if (!siteIndexavel()) {
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

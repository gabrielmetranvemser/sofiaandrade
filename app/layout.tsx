import type { Metadata, Viewport } from 'next'
import { Archivo, Inter } from 'next/font/google'
import { candidata, meta } from '@/content/copy'
import { config } from '@/lib/config'
import { Revelar } from '@/components/ui/Revelar'
import './globals.css'

/**
 * TÍTULO — Archivo.
 *
 * O logotipo da campanha é uma grotesca condensada, pesada e itálica.
 * Repetir esse peso nos títulos da página deixa tudo pesado demais:
 * é o problema da Tusker. A Archivo tem o mesmo esqueleto industrial
 * e o mesmo ar de campanha, mas com peso graduável — 700 dá autoridade
 * sem virar bloco, e o itálico dela ecoa a marca nos destaques curtos.
 *
 * CORPO — Inter. Público de 35 a 64 anos lendo 18px no celular.
 *
 * `display: swap` porque o teto do plano é 3 segundos até o botão
 * principal ficar clicável — texto invisível esperando fonte é o
 * jeito mais barato de estourar esse teto.
 */
const titulo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--fonte-titulo',
  display: 'swap',
})

const corpo = Inter({
  subsets: ['latin'],
  variable: '--fonte-corpo',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: meta.titulo,
    template: `%s · ${meta.tituloCurto}`,
  },
  description: meta.descricao,
  keywords: [...meta.palavrasChave],
  authors: [{ name: candidata.nome }],
  creator: candidata.nome,
  publisher: candidata.nome,
  applicationName: meta.tituloCurto,
  category: 'politics',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: config.siteUrl,
    siteName: meta.tituloCurto,
    title: meta.titulo,
    description: meta.descricao,
  },
  twitter: {
    card: 'summary_large_image',
    title: meta.titulo,
    description: meta.descricao,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false, address: false, email: false },
}

export const viewport: Viewport = {
  themeColor: '#01518f',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${corpo.variable} sem-js`}>
      <body>
        {/* Pular para o conteúdo: leitor de tela e navegação por teclado */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-amarelo focus:px-6 focus:py-3 focus:font-semibold focus:text-azul-escuro"
        >
          Pular para o conteúdo
        </a>

        {children}
        <Revelar />
      </body>
    </html>
  )
}

import Link from 'next/link'
import { listarMunicipiosComStatus } from '@/lib/dados'
import { achatarDestinos } from '@/lib/destinos'
import { config } from '@/lib/config'
import { GeradorLinks } from './GeradorLinks'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Links de anúncio', robots: { index: false } }

/**
 * LINKS DE ANÚNCIO POR MUNICÍPIO.
 *
 * ⚠️ ESTA TELA EXISTE PARA QUE NINGUÉM DIGITE UM DESTES LINKS À MÃO.
 *
 *    São 52 municípios e mais os distritos com grupo próprio. Cada
 *    anúncio precisa da cidade certa no `?cidade=` e do mesmo
 *    `utm_campaign` dos outros, com o `utm_content` diferente em cada
 *    um. Feito à mão, o erro é garantido — e é o pior tipo de erro que
 *    existe neste projeto: um `cidade=porto-velo` não dá erro nenhum,
 *    a página abre normalmente, o anúncio roda a semana inteira, e a
 *    única pista é que aquela cidade não pré-seleciona. Ninguém olha
 *    para isso enquanto o dinheiro sai.
 *
 * ⚠️ A TELA MOSTRA O ESTADO DO GRUPO ao lado de cada linha, e essa é a
 *    informação que mais economiza verba aqui: anunciar uma cidade cujo
 *    grupo está cheio ou ainda não abriu é pagar por um clique que
 *    termina num aviso. O gerador não impede — pode haver motivo para
 *    aquecer público antes de abrir o grupo — mas avisa em letra
 *    grande, e a lista pode ser filtrada só nos que estão abertos.
 */
export default async function PaginaLinksDeAnuncio() {
  const municipios = await listarMunicipiosComStatus()

  const destinos = achatarDestinos(municipios).map(({ destino, dentroDe }) => ({
    slug: destino.slug,
    nome: destino.nome,
    dentroDe: dentroDe ?? null,
    status: destino.status,
    disponivel: destino.disponivel,
  }))

  return (
    <>
      <header>
        <Link
          href="/painel/trafego"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Voltar para Tráfego
        </Link>
        <h1 className="mt-4 titulo-secao">Links de anúncio</h1>
        <p className="mt-2 max-w-3xl text-grafite">
          Um link por município, para rodar um conjunto de anúncios por cidade. Quem clica cai na
          página com a cidade dela já escolhida: todo botão de grupo, do topo ao rodapé, passa a
          levar direto para o grupo daquela cidade — sem rolar, sem procurar entre 52 nomes.
        </p>
      </header>

      <GeradorLinks destinos={destinos} siteUrl={config.siteUrl} />
    </>
  )
}

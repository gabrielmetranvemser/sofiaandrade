import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ESQUEMA } from '@/content/esquema'
import { lerHistorico } from '@/lib/conteudo/historico'
import { Historico } from '../../../_componentes/Historico'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ secao: string }> }) {
  const { secao } = await params
  return { title: `Histórico · ${ESQUEMA[secao]?.rotulo ?? ''}`, robots: { index: false } }
}

export default async function PaginaHistorico({
  params,
}: {
  params: Promise<{ secao: string }>
}) {
  const { secao } = await params
  const esquema = ESQUEMA[secao]
  if (!esquema) notFound()

  const versoes = await lerHistorico(secao)

  return (
    <>
      <header className="mb-8">
        <Link
          href={`/painel/secoes/${secao}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
          {esquema.rotulo}
        </Link>
        <h1 className="mt-4 titulo-secao">Histórico</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          Cada salvamento fica guardado. Restaurar não apaga nada — escreve a versão
          antiga por cima e gera uma nova, então dá para desfazer o desfazer.
        </p>
      </header>

      <Historico secao={secao} esquema={esquema} versoes={versoes} />
    </>
  )
}

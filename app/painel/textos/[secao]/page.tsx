import { notFound } from 'next/navigation'
import { ESQUEMA } from '@/content/esquema'
import { config } from '@/lib/config'
import { lerConteudoFresco } from '@/lib/conteudo/ler'
import { hashPadrao } from '@/lib/conteudo/hash'
import { FormularioSecao } from '../../_componentes/FormularioSecao'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ secao: string }> }) {
  const { secao } = await params
  return { title: ESQUEMA[secao]?.rotulo ?? 'Texto', robots: { index: false } }
}

export default async function EditorSecao({
  params,
}: {
  params: Promise<{ secao: string }>
}) {
  const { secao } = await params
  const esquema = ESQUEMA[secao]
  if (!esquema) notFound()

  // Fresco, e não do cache: o editor abriria o formulário com o valor
  // antigo logo depois de salvar.
  const conteudo = await lerConteudoFresco()
  const inicial = (conteudo as Record<string, unknown>)[secao] as Record<string, unknown>

  return (
    <FormularioSecao
      secao={secao}
      esquema={esquema}
      inicial={inicial}
      baseHash={hashPadrao(secao)}
      editavel={config.supabaseAtivo}
    />
  )
}

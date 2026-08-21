import { notFound } from 'next/navigation'
import { SECOES_POR_CHAVE } from '@/content/mapa'
import { config } from '@/lib/config'
import { lerConteudoFresco } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { hashPadrao } from '@/lib/conteudo/hash'
import { EditorSecao } from '../../_componentes/EditorSecao'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ secao: string }> }) {
  const { secao } = await params
  return { title: SECOES_POR_CHAVE[secao]?.rotulo ?? 'Seção', robots: { index: false } }
}

export default async function PaginaSecao({ params }: { params: Promise<{ secao: string }> }) {
  const { secao } = await params
  const mapa = SECOES_POR_CHAVE[secao]
  if (!mapa) notFound()

  // Fresco, e não do cache: o editor abriria o formulário com o valor
  // antigo logo depois de salvar.
  const [conteudo, imagens] = await Promise.all([lerConteudoFresco(), lerSlots()])
  const inicial = (conteudo as unknown as Record<string, unknown>)[secao] as Record<string, unknown>

  // `exibir` guarda o interruptor de cada seção. Nem toda seção tem um
  // — a primeira dobra e o rodapé não podem ser desligados.
  const interruptores = conteudo.exibir as unknown as Record<string, boolean>
  const ligada = secao in interruptores ? Boolean(interruptores[secao]) : null

  return (
    <EditorSecao
      secao={secao}
      rotulo={mapa.rotulo}
      resumo={mapa.resumo}
      nota={mapa.esquema.nota}
      ancora={mapa.ancora}
      visual={mapa.visual}
      ligada={ligada}
      camposDeTexto={mapa.camposDeTexto}
      camposDeVideo={mapa.camposDeVideo}
      espacos={mapa.espacos}
      imagens={imagens}
      inicial={inicial}
      baseHash={hashPadrao(secao)}
      editavel={config.supabaseAtivo}
    />
  )
}

import { config } from '@/lib/config'
import { lerConteudoFresco } from '@/lib/conteudo/ler'
import { destinosDeVideo } from '@/lib/painel/videos'
import { EditorVideos } from '../_componentes/EditorVideos'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Vídeos', robots: { index: false } }

export default async function PaginaVideos() {
  // Fresco, e não do cache: quem acabou de salvar não pode reabrir a
  // tela e ver o endereço antigo.
  const conteudo = await lerConteudoFresco()
  return (
    <EditorVideos destinos={destinosDeVideo(conteudo)} editavel={config.supabaseAtivo} />
  )
}

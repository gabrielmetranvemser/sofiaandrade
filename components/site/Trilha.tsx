import { lerConteudo } from '@/lib/conteudo/ler'
import { CabecalhoSecao } from '@/components/ui/Secao'
import { interpretarVideo } from '@/lib/video'
import { FitaDeVideos } from './FitaDeVideos'

/**
 * A TRILHA DE VÍDEOS.
 *
 * ⚠️ ELA JÁ FOI UM PALCO E NÃO É MAIS. A campanha pediu "igual na
 *    parte que tá escrito 'o que eu levo pra Brasília'", e foi assim
 *    que nasceu: mesmo mecanismo de Compromissos, com a tela presa e a
 *    fila andando de lado conforme a página descia.
 *
 *    Em vídeo aquilo não se sustentou. O palco troca rolagem vertical
 *    por avanço horizontal, e vídeo é o único conteúdo da página que
 *    pede para a pessoa PARAR — os dois gestos brigam pelo mesmo dedo.
 *    Somava-se a isso o custo de travessia: oito cartões de rolagem
 *    presa entre quem chega aqui e os grupos de WhatsApp, que é o
 *    destino que a página inteira existe para alcançar.
 *
 *    Ficou uma seção comum, com a fita rolável e setas — ver
 *    `FitaDeVideos`. Compromissos segue com o palco: lá são frases
 *    curtas, que se leem de passagem.
 *
 * Fica logo acima de Compromissos porque é o último bloco de prova
 * antes de a página parar de olhar para trás e começar a prometer.
 *
 * A seção some sozinha enquanto nenhum item tiver endereço — não é
 * preciso lembrar de desligá-la no painel enquanto os vídeos não sobem.
 */
export async function Trilha() {
  const { trilha } = await lerConteudo()

  // Só o que dá para tocar. Filtrar AQUI, no servidor, e não dentro do
  // <Video>, evita cartões vazios ocupando lugar na fita — e com eles
  // as setas prometendo conteúdo que não existe.
  const itens = trilha.itens.filter((item) => interpretarVideo(item.url))
  if (itens.length === 0) return null

  return (
    <section id="trilha" className="relative fundo-azul-profundo py-20 text-white md:py-28">
      <div className="container-lp">
        <CabecalhoSecao
          etiqueta={trilha.etiqueta}
          titulo={trilha.titulo}
          intro={trilha.intro}
          tom="escuro"
        />
      </div>

      <FitaDeVideos itens={itens} />
    </section>
  )
}

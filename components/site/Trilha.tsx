import { lerConteudo } from '@/lib/conteudo/ler'
import { CabecalhoSecao } from '@/components/ui/Secao'
import { PalcoMotor } from '@/components/animacao/PalcoMotor'
import { interpretarVideo } from '@/lib/video'
import { FitaDeVideos } from './FitaDeVideos'

/**
 * A TRILHA DE VÍDEOS.
 *
 * A campanha pediu com estas palavras: "ela quer igual na parte que tá
 * escrito 'o que eu levo pra Brasília', que tem uma trilha com as
 * propostas dela". Então é o mesmo mecanismo, literalmente: as classes
 * .palco-trilho / .palco-fixa / .palco-fita e o PalcoMotor que
 * Compromissos já usa. A tela prende, a fita anda de lado conforme a
 * página desce, e rolar para cima traz de volta. Nenhuma animação nova.
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
  // <Video>, é o que faz a fita ter o tamanho certo: com os vazios
  // dentro, o palco calcularia a duração da rolagem por oito cartões e
  // prenderia a tela o dobro do necessário para mostrar três.
  const itens = trilha.itens.filter((item) => interpretarVideo(item.url))
  if (itens.length === 0) return null

  return (
    <section id="trilha" data-palco className="relative fundo-azul-profundo text-white">
      <div
        className="palco-trilho"
        // Igual a Compromissos: menos passos que cartões, porque mais de
        // um cabe na tela ao mesmo tempo.
        style={{ ['--palco-passos' as string]: Math.max(2, itens.length - 2) }}
      >
        <div className="palco-fixa flex flex-col justify-center gap-10">
          <PalcoMotor />

          <div className="container-lp">
            <CabecalhoSecao
              etiqueta={trilha.etiqueta}
              titulo={trilha.titulo}
              intro={trilha.intro}
              tom="escuro"
            />
          </div>

          <FitaDeVideos itens={itens} />
        </div>
      </div>
    </section>
  )
}

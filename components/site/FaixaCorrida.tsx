import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Simbolo } from '@/components/ui/Marca'
import { Texto } from '@/components/ui/TextoComDestaque'

/**
 * A tarja que corre entre a primeira dobra e o resto.
 *
 * Serve para o que precisa ser lembrado sem ocupar uma seção inteira:
 * número, nome de urna, partido. Fica no amarelo porque é a única
 * superfície amarela da página inteira — uma faixa de 60px é detalhe,
 * e detalhe é o lugar do amarelo nesta marca.
 *
 * A lista é repetida DUAS vezes no HTML, e não é engano. O laço anda
 * a trilha inteira até -50% e recomeça: como a segunda metade é igual
 * à primeira, o ponto de emenda cai exatamente onde o desenho se
 * repete e a volta não aparece. Com uma cópia só, a trilha esvaziaria
 * pela direita antes de reiniciar.
 *
 * A segunda cópia é aria-hidden: quem usa leitor de tela ouviria tudo
 * duas vezes, sem nenhum motivo.
 */
export async function FaixaCorrida() {
  const [{ faixa }, slots] = await Promise.all([lerConteudo(), lerSlots()])
  if (faixa.itens.length === 0) return null

  const simbolo = slots['marca.simbolo']?.url ?? null

  const fila = (oculta: boolean) =>
    faixa.itens.map((item) => (
      <li key={`${oculta ? 'b' : 'a'}-${item.id}`} className="flex shrink-0 items-center gap-8 px-8">
        <span className="voz-marca text-lg whitespace-nowrap md:text-xl"><Texto>{item.texto}</Texto></span>
        <Simbolo url={simbolo} className="h-5 w-auto shrink-0 opacity-90" />
      </li>
    ))

  return (
    <div className="faixa relative isolate overflow-hidden bg-amarelo py-3.5 text-azul-escuro">
      <ul className="faixa-trilha">
        {fila(false)}
        <li aria-hidden className="contents">
          <ul className="contents">{fila(true)}</ul>
        </li>
      </ul>
    </div>
  )
}

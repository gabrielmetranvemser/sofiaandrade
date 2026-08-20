import { lerConteudo } from '@/lib/conteudo/ler'
import { CabecalhoSecao } from '@/components/ui/Secao'
import { PalcoMotor } from '@/components/animacao/PalcoMotor'

/**
 * Compromissos — palco: a tela prende e a fita de cartões anda de lado
 * conforme a página desce. Rolar para cima traz de volta.
 *
 * Antes eram cinco cartões largos empilhados: 1.444px de altura no
 * celular que ninguém rolava até o fim. Depois virou barra rolável
 * horizontal, que era pior: no desktop, o trackpad manda um pouco de
 * X junto com o Y, o navegador tranca o gesto no eixo horizontal e a
 * página inteira para de descer. Barra rolável dentro de página que
 * rola é sempre uma briga entre dois alvos de rolagem.
 *
 * No palco não existe segundo alvo. Quem rola é a página, sempre; o
 * movimento lateral é consequência da posição, não um gesto
 * concorrente. E é a mesma mecânica da cena da bandeira — um motor só
 * para os dois.
 */
export async function Futuro() {
  const { futuro } = await lerConteudo()

  return (
    <section id="futuro" data-palco className="relative bg-white text-tinta">
      <div
        className="palco-trilho"
        // Passos definem a duração. Menos que o número de cartões de
        // propósito: mais de um cabe na tela ao mesmo tempo, então
        // pedir uma rolagem inteira por cartão faria a seção arrastar.
        style={{ ['--palco-passos' as string]: Math.max(2, futuro.itens.length - 2) }}
      >
        <div className="palco-fixa flex flex-col justify-center gap-12">
          <PalcoMotor />

          <div className="container-lp">
            <CabecalhoSecao
              etiqueta={futuro.etiqueta}
              titulo={futuro.titulo}
              destaque="grifo"
              intro={futuro.intro}
            />
          </div>

          <ol className="palco-fita gap-5">
            {futuro.itens.map((item) => (
              <li
                key={item.id}
                className="flex w-[80vw] flex-col rounded-2xl border border-linha bg-white p-7 shadow-suave sm:w-[23rem] md:p-8"
              >
                <span
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-verde-escuro font-[family-name:var(--font-titulo)] text-base font-bold text-white"
                  aria-hidden
                >
                  {item.numero}
                </span>
                <h3 className="mt-6 text-xl text-tinta md:text-2xl">{item.titulo}</h3>
                <p className="mt-3 text-base text-grafite">{item.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

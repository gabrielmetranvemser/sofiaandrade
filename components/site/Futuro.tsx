import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'

export async function Futuro() {
  const { futuro } = await lerConteudo()

  return (
    <Secao id="futuro" fundo="branco" espaco="solto">
      <CabecalhoSecao
        etiqueta={futuro.etiqueta}
        titulo={
          <>
            Cinco compromissos. <span className="grifo">Assinados.</span>
          </>
        }
        intro={futuro.intro}
      />

      <ol className="mt-14 grid gap-4">
        {futuro.itens.map((item, i) => (
          <li
            key={item.id}
            data-revelar
            style={{ ['--atraso' as string]: `${i * 70}ms` }}
            className="group grid gap-3 rounded-2xl border border-linha bg-white p-7 transition-all duration-300 hover:border-verde/40 hover:shadow-media md:grid-cols-[4rem_1fr_1.15fr] md:items-start md:gap-8 md:p-8"
          >
            <span
              className="inline-flex size-12 items-center justify-center rounded-full bg-verde-escuro font-[family-name:var(--font-titulo)] text-base font-bold text-white transition-colors duration-300 group-hover:bg-amarelo group-hover:text-azul-escuro"
              aria-hidden
            >
              {item.numero}
            </span>
            <h3 className="text-xl md:text-2xl">{item.titulo}</h3>
            <p className="text-base text-grafite md:pt-1">{item.texto}</p>
          </li>
        ))}
      </ol>
    </Secao>
  )
}

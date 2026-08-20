import { problema } from '@/content/copy'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'

export function Problema() {
  return (
    <Secao id="problema" fundo="areia" espaco="solto">
      <CabecalhoSecao
        etiqueta={problema.etiqueta}
        titulo={
          <>
            Rondônia produz.{' '}
            <span className="text-azul">Brasília consome.</span>
          </>
        }
        intro={problema.intro}
      />

      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {problema.itens.map((item, i) => (
          <li
            key={item.numero}
            data-revelar
            style={{ ['--atraso' as string]: `${i * 80}ms` }}
            className="cartao group p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-media md:p-8"
          >
            <span
              className="inline-flex size-11 items-center justify-center rounded-full bg-azul-suave font-[family-name:var(--font-titulo)] text-base font-bold text-azul transition-colors duration-300 group-hover:bg-azul group-hover:text-white"
              aria-hidden
            >
              {item.numero}
            </span>
            <h3 className="mt-5 text-xl md:text-2xl">{item.titulo}</h3>
            <p className="mt-3 text-base text-grafite">{item.texto}</p>
          </li>
        ))}
      </ul>
    </Secao>
  )
}

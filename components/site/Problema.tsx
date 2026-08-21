import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Video } from '@/components/ui/Video'

export async function Problema() {
  const { problema } = await lerConteudo()

  return (
    <Secao id="problema" fundo="areia" espaco="solto">
      <CabecalhoSecao
        etiqueta={problema.etiqueta}
        titulo={problema.titulo}
        intro={problema.intro}
      />

      <ul className="mt-14 grid gap-5 md:grid-cols-2">
        {problema.itens.map((item, i) => (
          <li
            key={item.id}
            data-revelar
            style={{ ['--atraso' as string]: `${i * 80}ms` }}
            className="cartao group p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-media md:p-8"
          >
            <span
              className="inline-flex size-11 items-center justify-center rounded-full bg-azul-escuro font-[family-name:var(--font-titulo)] text-base font-bold text-white transition-colors duration-300 group-hover:bg-amarelo group-hover:text-azul-escuro"
              aria-hidden
            >
              {item.numero}
            </span>
            <h3 className="mt-5 text-xl md:text-2xl">{item.titulo}</h3>
            <p className="mt-3 text-base text-grafite">{item.texto}</p>
          </li>
        ))}
      </ul>

      {/* O vídeo fecha a seção, e fecha de propósito: os quatro cartões
          listam o que está errado em texto frio, e é ela quem dá voz a
          isso. Centralizado e contido — a seção é uma grade de dois, e
          um vídeo de largura total viraria uma quinta caixa maior que
          as outras quatro. */}
      {problema.video ? (
        <div data-revelar className="mx-auto mt-8 max-w-3xl">
          <Video url={problema.video} titulo={problema.titulo.replace(/\[\[|\]\]/g, '')} />
        </div>
      ) : null}
    </Secao>
  )
}

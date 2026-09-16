import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { BuscadorDeGrupo } from '@/components/grupos/BuscadorDeGrupo'
import type { Destino, MunicipioComGrupo } from '@/lib/tipos'

export async function SecaoGrupos({
  municipios,
  alvo,
}: {
  municipios: MunicipioComGrupo[]
  /** A cidade que veio no link do anúncio. Ver `lib/campanha/alvo.ts`. */
  alvo?: Destino | null
}) {
  const { grupos: copy } = await lerConteudo()

  return (
    <Secao id="grupos" fundo="branco" espaco="solto">
      {/* Lado a lado no desktop, empilhado no celular. `items-start` e
          não `center`: o cartão cresce quando a lista de sugestões abre,
          e centralizado ele arrastaria o título junto a cada letra. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start lg:gap-16">
        <CabecalhoSecao
          etiqueta={copy.etiqueta}
          titulo={copy.titulo}
          destaque="grifo"
          intro={copy.intro}
        />
        <BuscadorDeGrupo municipios={municipios} alvo={alvo} />
      </div>
    </Secao>
  )
}

import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { BuscadorDeGrupo } from '@/components/grupos/BuscadorDeGrupo'
import { MapaRondonia } from '@/components/grupos/MapaRondonia'
import type { Destino, MunicipioComGrupo } from '@/lib/tipos'

export async function SecaoGrupos({
  municipios,
  sugerido,
  alvo,
}: {
  municipios: MunicipioComGrupo[]
  sugerido?: MunicipioComGrupo | null
  /** A cidade que veio no link do anúncio. Ver `lib/campanha/alvo.ts`. */
  alvo?: Destino | null
}) {
  const { grupos: copy } = await lerConteudo()

  return (
    <Secao id="grupos" fundo="branco" espaco="solto">
      <CabecalhoSecao
        etiqueta={copy.etiqueta}
        titulo={copy.titulo}
        destaque="grifo"
        intro={copy.intro}
      />
      <BuscadorDeGrupo
        municipios={municipios}
        sugerido={sugerido}
        alvo={alvo}
        mapa={
          <MapaRondonia
            municipios={municipios}
            destacado={alvo?.municipioSlug ?? alvo?.slug ?? sugerido?.slug}
          />
        }
      />
    </Secao>
  )
}

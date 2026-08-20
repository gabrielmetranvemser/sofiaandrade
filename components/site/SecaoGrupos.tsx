import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { BuscadorDeGrupo } from '@/components/grupos/BuscadorDeGrupo'
import { MapaRondonia } from '@/components/grupos/MapaRondonia'
import type { MunicipioComGrupo } from '@/lib/tipos'

export async function SecaoGrupos({
  municipios,
  sugerido,
}: {
  municipios: MunicipioComGrupo[]
  sugerido?: MunicipioComGrupo | null
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
        mapa={<MapaRondonia municipios={municipios} destacado={sugerido?.slug} />}
      />
    </Secao>
  )
}

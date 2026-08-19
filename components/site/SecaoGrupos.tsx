import { grupos as copy } from '@/content/copy'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { BuscadorDeGrupo } from '@/components/grupos/BuscadorDeGrupo'
import type { MunicipioComGrupo } from '@/lib/tipos'

export function SecaoGrupos({
  municipios,
  sugerido,
}: {
  municipios: MunicipioComGrupo[]
  sugerido?: MunicipioComGrupo | null
}) {
  return (
    <Secao id="grupos" fundo="branco" espaco="solto">
      <CabecalhoSecao
        etiqueta={copy.etiqueta}
        titulo={
          <>
            Tem um grupo da Sofia <span className="grifo">na sua cidade.</span>
          </>
        }
        intro={copy.intro}
      />
      <BuscadorDeGrupo municipios={municipios} sugerido={sugerido} />
    </Secao>
  )
}

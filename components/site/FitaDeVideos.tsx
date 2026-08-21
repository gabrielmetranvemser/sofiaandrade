'use client'

import { useState } from 'react'
import { Video } from '@/components/ui/Video'
import { formatoValido } from '@/lib/video'

interface Item {
  id: string
  titulo: string
  url: string
  formato: string
}

/**
 * A fita da trilha — a única parte da seção que precisa de estado.
 *
 * ⚠️ UM VÍDEO POR VEZ, e isto é o motivo de o componente existir.
 *    São oito cartões. Se cada um guardasse o próprio estado, dar play
 *    em quatro deixaria quatro players do YouTube tocando ao mesmo
 *    tempo dentro de uma fita horizontal — quatro áudios sobrepostos e
 *    quatro streams de vídeo num celular que a primeira dobra desta
 *    página foi desenhada para respeitar.
 *
 *    Quem manda no que está aberto é aqui, e abrir um DESMONTA o
 *    anterior. Desmontar e não pausar: iframe pausado continua com a
 *    conexão viva e a memória ocupada. O cartão volta a ser capa, que é
 *    o estado barato.
 */
export function FitaDeVideos({ itens }: { itens: readonly Item[] }) {
  const [aberto, setAberto] = useState<string | null>(null)

  return (
    <ol className="palco-fita gap-5">
      {itens.map((item) => (
        <li key={item.id} className="w-[80vw] sm:w-[26rem]">
          <Video
            url={item.url}
            formato={formatoValido(item.formato)}
            titulo={item.titulo}
            aberto={aberto === item.id}
            onAbrir={() => setAberto(item.id)}
          />
        </li>
      ))}
    </ol>
  )
}

import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Imagem } from '@/components/ui/Imagem'
import { Texto } from '@/components/ui/TextoComDestaque'

/**
 * O acervo de família, mostrado COMO papel.
 *
 * O material é analógico: fotos impressas, fotografadas de celular em
 * cima de um lençol. A tentação é limpar isso — recortar na borda,
 * corrigir a cor, uniformizar. Seria um erro. O amarelado e a borda
 * gasta são exatamente o que prova que a foto não foi produzida para
 * esta página. Então cada uma ganha um giro de meio grau e uma sombra
 * curta, como foto solta em cima da mesa.
 *
 * Rola no celular, vira grade no desktop. Os dois motivos:
 *
 * · No celular, empilhar oito verticais custa quatro telas de rolagem
 *   num ponto da página em que a pessoa ainda está decidindo se fica.
 *   Deslizar de lado com o polegar é o gesto natural de álbum.
 *
 * · No desktop, NÃO. Provas já documenta por que: barra rolável
 *   horizontal dentro de página que rola é briga entre dois alvos de
 *   rolagem — no trackpad vai um pouco de X junto com o Y, o navegador
 *   tranca o gesto na horizontal e a página inteira para de descer.
 *   Onde existe trackpad, isto é uma grade de quatro colunas e o
 *   problema não chega a existir.
 *
 * ⚠️ O giro é decorativo e vai em `rotate` — nunca em `transform` —
 *    porque o parallax e as animações de revelação escrevem em
 *    transform, e a última declaração apagaria a outra.
 */
export async function Album() {
  const [{ album }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  return (
    <Secao id="album" fundo="areia" espaco="normal">
      <CabecalhoSecao etiqueta={album.etiqueta} titulo={album.titulo} intro={album.intro} />

      {/* A trilha sangra até a borda no celular: foto cortada na
          margem é o que diz "tem mais pro lado" sem precisar de seta. */}
      <ul className="album-trilha mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0">
        {album.fotos.map((foto, i) => (
          <li
            key={foto.id}
            data-revelar
            style={{
              ['--atraso' as string]: `${i * 60}ms`,
              rotate: i % 2 === 0 ? '-0.6deg' : '0.7deg',
            }}
            className="w-[62vw] shrink-0 snap-start sm:w-56 md:w-auto"
          >
            {/* A moldura branca é a margem da foto revelada. Sem ela a
                imagem encosta no fundo areia e perde a leitura de papel. */}
            <figure className="rounded-[3px] bg-white p-2.5 pb-3 shadow-media">
              <Imagem
                slot={`album.${i + 1}`}
                slots={slots}
                sizes="(max-width: 640px) 62vw, 16rem"
                className="w-full rounded-[2px] object-cover"
              />
              <figcaption className="mt-2.5 px-0.5">
                <span className="block text-sm leading-snug text-tinta"><Texto>{foto.legenda}</Texto></span>
                {foto.ano ? (
                  <span className="mt-0.5 block text-xs text-grafite">{foto.ano}</span>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {album.rodape ? <p className="mt-2 text-xs text-grafite">{album.rodape}</p> : null}
    </Secao>
  )
}

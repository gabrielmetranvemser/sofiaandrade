import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Imagem } from '@/components/ui/Imagem'
import { Video } from '@/components/ui/Video'

/**
 * De onde ela vem.
 *
 * ⚠️ A LINHA DO TEMPO SAIU. Eram quatro cartões (2020 · 2022 · 2024 ·
 *    2026) fechando a seção, e a campanha pediu para tirar. Faz
 *    sentido: os quatro repetiam, em tópico curto, os mesmos fatos que
 *    os parágrafos ao lado já contam em primeira pessoa — e o cartão
 *    de 2022 carregava o número de votos, que era o único dado não
 *    confirmado da página.
 *
 *    No lugar entra o vídeo em que ela conta a história ela mesma, no
 *    topo da coluna de fotos. Enquanto o endereço não é colado no
 *    painel, o bloco não existe e a seção fica exatamente como estava.
 */
export async function Origem() {
  const [{ origem, candidata }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  return (
    <Secao id="origem" fundo="branco" espaco="solto">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <CabecalhoSecao etiqueta={origem.etiqueta} titulo={origem.titulo} />

          <div className="mt-8 space-y-5">
            {origem.paragrafos.map((p, i) => (
              <p
                key={i}
                data-revelar
                style={{ ['--atraso' as string]: `${i * 80}ms` }}
                className="max-w-2xl text-lg text-grafite"
              >
                {p}
              </p>
            ))}
          </div>

          <blockquote
            data-revelar
            className="mt-10 rounded-2xl fundo-azul-profundo p-7 text-white md:p-8"
          >
            <svg viewBox="0 0 24 24" className="size-8 text-amarelo" fill="currentColor" aria-hidden>
              <path d="M9.5 5C6.5 6.6 5 9 5 12.2c0 .6.1 1.2.2 1.8h.3c.5-.5 1.2-.8 2.1-.8 1.7 0 3 1.3 3 3.1S9.2 19.5 7.4 19.5C5 19.5 3.2 17.4 3.2 14c0-4.3 2.3-7.6 6.3-9.7L9.5 5Zm10 0C16.5 6.6 15 9 15 12.2c0 .6.1 1.2.2 1.8h.3c.5-.5 1.2-.8 2.1-.8 1.7 0 3 1.3 3 3.1s-1.4 3.2-3.2 3.2c-2.4 0-4.2-2.1-4.2-5.5 0-4.3 2.3-7.6 6.3-9.7l.2.7Z" />
            </svg>
            <p className="mt-4 font-[family-name:var(--font-titulo)] text-xl font-semibold leading-snug tracking-[-0.02em] md:text-2xl">
              {origem.citacao}
            </p>
          </blockquote>
        </div>

        <div data-revelar className="space-y-4">
          <Video
            url={origem.video}
            titulo={`${candidata.nome} conta a própria história`}
            className="w-full"
          />
          <Imagem
            slot="origem.retrato"
            slots={slots}
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="w-full rounded-2xl object-cover"
          />
          <div className="grid grid-cols-2 gap-4">
            <Imagem slot="origem.detalhe.1" slots={slots} sizes="20vw" className="w-full rounded-xl object-cover" />
            <Imagem slot="origem.detalhe.2" slots={slots} sizes="20vw" className="w-full rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </Secao>
  )
}

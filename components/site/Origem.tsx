import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Imagem } from '@/components/ui/Imagem'
import { Video } from '@/components/ui/Video'
import { emPe, formatoValido } from '@/lib/video'
import { Texto } from '@/components/ui/TextoComDestaque'

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
 *    No lugar entra o vídeo em que ela conta a história ela mesma.
 *    Enquanto o endereço não é colado no painel, o bloco não existe e
 *    a seção fica exatamente como estava.
 *
 * ⚠️ A SEÇÃO TEM DOIS DESENHOS, um por enquadramento do vídeo.
 *
 *    DEITADO — duas colunas: o texto à esquerda, com o vídeo no alto
 *    dela, e a coluna de fotos à direita. É o desenho de sempre.
 *
 *    EM PÉ — o vídeo não cabe na coluna de texto: ela tem 554 px, ele
 *    tem 306, e sobram 124 de branco de cada lado, no meio de uma
 *    coluna cuja única régua é a margem esquerda do texto. Então a
 *    seção passa a ser duas faixas:
 *
 *      1. o vídeo, grande, com o título e os parágrafos ao lado dele;
 *      2. as três fotos e a frase de efeito, lado a lado, embaixo.
 *
 *    O vídeo fica com o peso que a campanha pediu — é o objeto mais
 *    alto da seção — e nada sobra boiando: a faixa de baixo tem altura
 *    única e atravessa a seção de borda a borda.
 */

/** A largura do vídeo em pé. `vw` para encolher junto em tela menor. */
const LARGURA_EM_PE = 'min(26rem, 34vw)'

/** A altura da faixa de fotos + frase, no desenho em pé. */
const ALTURA_DA_FAIXA = 'lg:h-[26rem]'

export async function Origem() {
  const [{ origem }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  const formato = formatoValido(origem.video.formato)
  const vertical = emPe(formato)

  const video = origem.video.url ? (
    <Video
      url={origem.video.url}
      formato={formato}
      opcoes={origem.video.opcoes}
      titulo={origem.video.titulo}
      preencher={vertical}
    />
  ) : null

  const cabecalho = <CabecalhoSecao etiqueta={origem.etiqueta} titulo={origem.titulo} />

  const paragrafos = (
    <div className="space-y-5">
      {origem.paragrafos.map((p, i) => (
        <p
          key={i}
          data-revelar
          style={{ ['--atraso' as string]: `${i * 80}ms` }}
          className="max-w-2xl text-lg text-grafite"
        >
          <Texto>{p}</Texto>
        </p>
      ))}
    </div>
  )

  const citacao = (
    <blockquote
      data-revelar
      className={`flex flex-col justify-center rounded-2xl fundo-azul-profundo p-7 text-white md:p-8 ${
        vertical ? 'h-full' : 'mt-10'
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-8 text-amarelo" fill="currentColor" aria-hidden>
        <path d="M9.5 5C6.5 6.6 5 9 5 12.2c0 .6.1 1.2.2 1.8h.3c.5-.5 1.2-.8 2.1-.8 1.7 0 3 1.3 3 3.1S9.2 19.5 7.4 19.5C5 19.5 3.2 17.4 3.2 14c0-4.3 2.3-7.6 6.3-9.7L9.5 5Zm10 0C16.5 6.6 15 9 15 12.2c0 .6.1 1.2.2 1.8h.3c.5-.5 1.2-.8 2.1-.8 1.7 0 3 1.3 3 3.1s-1.4 3.2-3.2 3.2c-2.4 0-4.2-2.1-4.2-5.5 0-4.3 2.3-7.6 6.3-9.7l.2.7Z" />
      </svg>
      <p className="mt-4 font-[family-name:var(--font-titulo)] text-xl font-semibold leading-snug tracking-[-0.02em] md:text-2xl">
        <Texto tom="amarelo">{origem.citacao}</Texto>
      </p>
    </blockquote>
  )

  // ── EM PÉ ────────────────────────────────────────────────────────
  if (vertical && video) {
    return (
      <Secao id="origem" fundo="branco" espaco="solto">
        {/* ⚠️ TRÊS CÉLULAS EM DUAS COLUNAS, E A ORDEM MUDA NO CELULAR.
            Na tela larga o vídeo ocupa a coluna da esquerda inteira —
            as duas linhas — e o texto se organiza à direita: título em
            cima, parágrafos embaixo. No celular não há colunas, e a
            ordem natural do JSX (título, vídeo, parágrafos) é
            justamente a certa: ninguém deve encontrar um vídeo antes de
            saber do que ele trata. */}
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-14">
          <div className="lg:col-start-2 lg:row-start-1">{cabecalho}</div>

          <div
            data-revelar
            // ⚠️ LARGURA FLUIDA NO CELULAR, ESCRITA NO DESKTOP. A medida
            //    de baixo (`34vw`) é a proporção certa numa tela larga e
            //    um selo de 133 px num telefone. Então ela só entra a
            //    partir do `lg`, por variável; abaixo disso o vídeo
            //    ocupa a coluna inteira, que é a forma como um vídeo em
            //    pé é visto no celular de qualquer jeito.
            style={{ ['--largura' as string]: LARGURA_EM_PE }}
            className="mx-auto w-full lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:w-[var(--largura)]"
          >
            {video}
          </div>

          <div className="lg:col-start-2 lg:row-start-2">{paragrafos}</div>
        </div>

        {/* ⚠️ FAIXA DE ALTURA ÚNICA. As três fotos e a frase de efeito
            dividem a mesma linha, e é a altura escrita (26rem) que faz
            as quatro bordas de baixo coincidirem. Sem ela cada foto
            teria a altura da própria proporção — 4/5 no retrato, 1/1
            nos detalhes — e a faixa viraria um serrote.

            O recorte que isso custa é pequeno: o retrato passa de 4/5
            para 0,83, diferença que ninguém enxerga, e os dois detalhes
            quadrados viram dois quase quadrados empilhados. */}
        <div className={`mt-14 grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr] ${ALTURA_DA_FAIXA}`}>
          <Imagem
            slot="origem.retrato"
            slots={slots}
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="size-full rounded-2xl object-cover"
          />

          <div className="grid grid-cols-2 gap-4 lg:h-full lg:grid-cols-1 lg:grid-rows-2">
            <Imagem
              slot="origem.detalhe.1"
              slots={slots}
              sizes="20vw"
              className="size-full rounded-xl object-cover"
            />
            <Imagem
              slot="origem.detalhe.2"
              slots={slots}
              sizes="20vw"
              className="size-full rounded-xl object-cover"
            />
          </div>

          {citacao}
        </div>
      </Secao>
    )
  }

  // ── DEITADO — o desenho de sempre ────────────────────────────────
  return (
    <Secao id="origem" fundo="branco" espaco="solto">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          {cabecalho}

          {/* O vídeo fica na coluna do texto, entre o título e o
              primeiro parágrafo: é o vídeo em que ela narra a própria
              história, e pertence ao lugar onde a história é contada.
              Quem chega encontra a versão em voz dela antes da versão
              escrita, e escolhe. */}
          {video ? (
            <div data-revelar className="mt-8">
              {video}
            </div>
          ) : null}

          <div className="mt-8">{paragrafos}</div>

          {citacao}
        </div>

        <div data-revelar className="space-y-4">
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

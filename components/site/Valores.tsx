import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Imagem } from '@/components/ui/Imagem'
import { Texto } from '@/components/ui/TextoComDestaque'

const ICONES: Record<string, React.ReactNode> = {
  familia: (
    <path d="M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-6 4a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm12 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM12 11c3 0 5 1.8 5 4.5V21H7v-5.5C7 12.8 9 11 12 11ZM5 13c.7 0 1.4.1 2 .4A6.6 6.6 0 0 0 5.2 18H2v-2.6C2 13.9 3.3 13 5 13Zm14 0c1.7 0 3 .9 3 2.4V18h-3.2a6.6 6.6 0 0 0-1.8-4.6c.6-.3 1.3-.4 2-.4Z" />
  ),
  liberdade: (
    <path d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Zm-1 13-3-3 1.4-1.4L11 12.2l4.6-4.6L17 9l-6 6Z" />
  ),
  segurança: (
    <path d="M12 2 4 5.5V11c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5.5L12 2Zm0 4a2.5 2.5 0 0 1 2.5 2.5V10H16v6H8v-6h1.5V8.5A2.5 2.5 0 0 1 12 6Zm0 1.5c-.6 0-1 .4-1 1V10h2V8.5c0-.6-.4-1-1-1Z" />
  ),
  producao: (
    <path d="M3 20V9l6-4 6 4v2h6v9H3Zm2-2h4v-4H5v4Zm6 0h2v-6h-2v6Zm4 0h4v-5h-4v5ZM9 7.3 6.5 9H11L9 7.3Z" />
  ),
  imposto: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15.9V19h-2v-1.1c-1.6-.3-2.8-1.3-3-3h2c.1.8.9 1.4 2 1.4 1.1 0 1.8-.5 1.8-1.2 0-.7-.5-1-2.2-1.4-2.1-.5-3.4-1.2-3.4-3 0-1.5 1.1-2.5 2.8-2.8V6h2v1c1.5.3 2.6 1.2 2.8 2.8h-2c-.1-.7-.7-1.2-1.7-1.2s-1.7.4-1.7 1.1c0 .6.5.9 2.2 1.3 2.2.5 3.4 1.3 3.4 3.1 0 1.6-1.2 2.6-3 2.8Z" />
  ),
  fe: <path d="M10 2h4v5h5v4h-5v11h-4V11H5V7h5V2Z" />,
  // Balança: "leis mais rígidas" é sobre a lei, não sobre polícia —
  // o escudo já é a bandeira da segurança e repetir confundiria os dois.
  lei: (
    <path d="M11 2h2v2.3l7 1.9-.5 1.9-1.7-.4L21 15c0 1.9-1.8 3.2-4 3.2S13 16.9 13 15l3.2-7.8-3.2-.9V20h5v2H6v-2h5V6.3l-3.2.9L11 15c0 1.9-1.8 3.2-4 3.2S3 16.9 3 15l3.2-7.7-1.7.4L4 5.8l7-1.9V2Zm-4 8.6L5.4 15h3.2L7 10.6Zm10 0L15.4 15h3.2L17 10.6Z" />
  ),
  // Escudo com estrela: direito de se proteger. Desenhar uma arma
  // marcaria a página em classificador de conteúdo de rede social, e o
  // custo disso cai justamente no alcance orgânico, que é o motor aqui.
  armas: (
    <path d="M12 2 4 5.5V11c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5.5L12 2Zm0 4.6 1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4L7.1 10.2l3.4-.5L12 6.6Z" />
  ),
}

export async function Valores() {
  const [{ valores }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  return (
    <Secao id="valores" fundo="verde" espaco="solto">
      <CabecalhoSecao
        etiqueta={valores.etiqueta}
        titulo={valores.titulo}
        intro={valores.intro}
        tom="escuro"
      />

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {valores.itens.map((item, i) => (
          <li
            key={item.id}
            data-revelar
            style={{ ['--atraso' as string]: `${i * 70}ms` }}
            className="group rounded-2xl bg-white p-7 shadow-suave transition-transform duration-300 hover:-translate-y-1 hover:shadow-alta"
          >
            <span
              className="inline-flex size-12 items-center justify-center rounded-2xl bg-verde-escuro text-white"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
                {ICONES[item.chave]}
              </svg>
            </span>
            <h3 className="mt-5 text-xl text-tinta"><Texto>{item.titulo}</Texto></h3>
            <p className="mt-2 text-base text-grafite"><Texto>{item.texto}</Texto></p>
          </li>
        ))}
      </ul>

      {/* A foto de apoio, com a frase que fecha a seção.
          Os ícones dizem o que ela defende; a foto diz que ela vive
          disso. Fica no fim e não no começo de propósito — quem chegou
          até aqui já leu as seis bandeiras, e a imagem fecha em vez de
          anunciar.

          ⚠️ ISTO JÁ FOI UMA LINHA DE TEXTO AO LADO DE UMA FOTO PEQUENA,
          e ficou ruim por um motivo estrutural, não de gosto: a frase
          são quatro palavras, então uma coluna de 1,2fr recebia meia
          linha de texto e mais de meia tela de verde vazio. Uma palavra
          por linha resolve — o texto passa a ter altura, encosta na
          altura da foto, e as quatro afirmações ganham o peso de
          manifesto em vez de virarem uma legenda.

          ⚠️ O ícone desta seção evita desenhar arma por causa de
          classificador de rede social (ver ICONES, acima). Uma FOTO
          pesa mais nesse classificador que um ícone. A escolha do que
          sobe neste espaço é da campanha, e está registrada no card do
          espaço `valores.imagem` no painel. */}
      <figure
        data-revelar
        className="mt-14 grid overflow-hidden rounded-3xl bg-verde-escuro/35 ring-1 ring-white/15 md:mt-16 md:grid-cols-[0.9fr_1.1fr]"
      >
        {/* `object-cover` com altura mínima: a foto preenche a coluna
            inteira em vez de flutuar dentro de um cartão acolchoado. */}
        <div className="relative min-h-[19rem] md:min-h-[26rem]">
          <Imagem
            slot="valores.imagem"
            slots={slots}
            sizes="(max-width: 768px) 100vw, 42vw"
            /* No celular a caixa é quase quadrada e o recorte centrado
               come a cabeça: uma foto 3:4 perde topo e base por igual.
               Puxar para 35% preserva o rosto. No desktop a coluna é
               alta e o centro já enquadra certo. */
            className="absolute inset-0 size-full object-cover object-[50%_35%] md:object-center"
          />
          {/* Emenda entre a foto e o verde. Sem ela a foto termina num
              corte reto no meio do cartão e lê como imagem colada. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-verde-escuro/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-verde-escuro/60"
          />
        </div>

        <figcaption className="flex flex-col justify-center gap-1 p-7 md:p-12">
          {palavras(valores.frase).map((palavra, i) => (
            <span
              key={palavra}
              data-revelar
              style={{ ['--atraso' as string]: `${i * 90}ms` }}
              className="font-[family-name:var(--font-titulo)] text-3xl leading-[1.06] font-bold tracking-[-0.03em] text-white md:text-5xl"
            >
              {palavra}
              <span className="text-amarelo">.</span>
            </span>
          ))}
        </figcaption>
      </figure>
    </Secao>
  )
}

/**
 * "Cristã. Patriota. Armamentista." → uma palavra por linha.
 *
 * O ponto final é devolvido pelo componente, em amarelo. Se o admin
 * escrever uma frase corrida em vez das quatro palavras, isto devolve
 * as orações dela — que continua legível, só não fica igual.
 */
function palavras(frase: string): string[] {
  const partes = frase
    .split('.')
    .map((p) => p.trim())
    .filter(Boolean)
  return partes.length > 0 ? partes : [frase]
}

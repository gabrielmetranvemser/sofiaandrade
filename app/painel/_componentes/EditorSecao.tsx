'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import type { Campo } from '@/content/esquema'
import type { Slot } from '@/content/slots'
import { escrever } from '@/lib/conteudo/escrever'
import type { ImagemDoSlot } from '@/lib/midia/ler'
import { CartaoSlot } from './CartaoSlot'
import { FormularioSecao } from './FormularioSecao'
import { PreviaAoVivo } from './PreviaAoVivo'

/**
 * UMA SEÇÃO DA PÁGINA, INTEIRA, NUMA TELA SÓ.
 *
 * ⚠️ O PAINEL ERA ORGANIZADO POR TIPO e o pedido foi para reorganizar:
 *    "permita que eu edite cada seção de forma organizada (os textos,
 *    imagens e vídeos) por seção".
 *
 *    Antes, mexer em "A rua" era: abrir Textos → A rua, salvar, voltar,
 *    abrir Imagens, rolar até achar o grupo "A rua", trocar as fotos.
 *    Duas telas e dois modelos mentais para uma coisa só — e o vídeo
 *    não aparecia em lugar nenhum. Ninguém chega no painel pensando
 *    "quero editar uma imagem"; chega pensando "quero mexer no bloco
 *    da rua".
 *
 * ⚠️ ABAS, E NÃO UMA PÁGINA ROLANDO. A seção do gerador de filtro tem
 *    quarenta campos de texto; empilhar imagens e vídeos embaixo disso
 *    esconderia os dois atrás de um rolo interminável. A aba diz
 *    quantos itens tem antes de você clicar, então nada fica escondido
 *    por acidente.
 *
 * ⚠️ IMAGENS FICA FORA DO FORMULÁRIO, e é uma exigência do HTML, não
 *    uma escolha: cada espaço de imagem tem o próprio formulário de
 *    envio, e formulário dentro de formulário é inválido — o navegador
 *    desmonta o de dentro e o envio simplesmente não acontece.
 *
 *    Elas também gravam em outro lugar: texto e vídeo vão para a
 *    tabela de conteúdo com histórico e "voltar ao original"; imagem
 *    vai para o Storage. Por isso Imagens não tem botão de salvar — o
 *    envio é imediato, por espaço.
 */

type Aba = 'textos' | 'imagens' | 'videos'

export function EditorSecao({
  secao,
  rotulo,
  resumo,
  nota,
  ancora,
  visual,
  ligada,
  camposDeTexto,
  camposDeVideo,
  espacos,
  imagens,
  inicial,
  baseHash,
  editavel,
}: {
  secao: string
  rotulo: string
  resumo: string
  nota?: string
  ancora: string | null
  /** Falso para painéis de ajuste que não têm forma visual na página. */
  visual: boolean
  /** null quando a seção não pode ser desligada. */
  ligada: boolean | null
  camposDeTexto: [string, Campo][]
  camposDeVideo: [string, Campo][]
  espacos: Slot[]
  imagens: Record<string, ImagemDoSlot>
  inicial: Record<string, unknown>
  baseHash: string
  editavel: boolean
}) {
  // ⚠️ O RASCUNHO MORA AQUI, e não dentro do formulário. A maquete ao
  //    lado tem de mostrar o que está sendo digitado AGORA — não o que
  //    foi salvo. Com o estado no formulário, a prévia dependeria de um
  //    segundo estado sincronizado por efeito, que é a versão frágil da
  //    mesma coisa.
  const [dados, setDados] = useState<Record<string, unknown>>(inicial)
  const mudar = (caminho: string, valor: unknown) =>
    setDados((atual) => escrever(atual, caminho.split('.'), valor))

  // Começa na aba que tem conteúdo. Uma seção só de vídeos abrindo numa
  // aba de textos vazia faria parecer que não há nada para editar.
  // Cada salvamento bem-sucedido incrementa isto, e é o que manda a
  // prévia recarregar. Salvar já republica o site na hora, então o
  // quadro mostra o resultado sem ninguém pedir.
  const [versao, setVersao] = useState(0)
  const aoSalvar = useCallback(() => setVersao((n) => n + 1), [])

  const [aba, setAba] = useState<Aba>(
    camposDeTexto.length > 0 ? 'textos' : camposDeVideo.length > 0 ? 'videos' : 'imagens',
  )

  const abas: { chave: Aba; rotulo: string; total: number }[] = [
    { chave: 'textos', rotulo: 'Textos', total: camposDeTexto.length },
    { chave: 'imagens', rotulo: 'Imagens', total: espacos.length },
    { chave: 'videos', rotulo: 'Vídeos', total: camposDeVideo.length },
  ]

  const preenchidas = espacos.filter((e) => imagens[e.chave]).length

  return (
    <>
      <header className="mb-6">
        <Link
          href="/painel/secoes"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Todas as seções
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="titulo-secao">{rotulo}</h1>
              {ligada === false ? (
                <span className="rounded-full bg-areia px-3 py-1 text-xs font-medium text-grafite">
                  desligada no site
                </span>
              ) : null}
            </div>
            {resumo ? <p className="mt-1.5 max-w-2xl text-grafite">{resumo}</p> : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {ancora ? (
              <a
                href={ancora}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-linha bg-white px-4 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d="M14 3v2h3.6l-8.3 8.3 1.4 1.4L19 6.4V10h2V3h-7ZM5 5h5v2H7v10h10v-3h2v5H5V5Z" />
                </svg>
                Ver no site
              </a>
            ) : null}
            <Link
              href={`/painel/secoes/${secao}/historico`}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-linha bg-white px-4 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d="M13 3a9 9 0 1 0 8.5 12h-2.1A7 7 0 1 1 13 5v4l5-5-5-5v4Zm-1 5v5l4 2 .7-1.3L13.5 12V8H12Z" />
              </svg>
              Histórico
            </Link>
          </div>
        </div>

        {nota ? (
          <p className="mt-4 max-w-2xl rounded-xl bg-azul-suave px-4 py-3 text-[0.9375rem]">
            {nota}
          </p>
        ) : null}
      </header>

      {/* As abas. O número ao lado do nome é o que evita a pergunta
          "será que tem alguma coisa lá dentro?" antes de cada clique. */}
      <div role="tablist" aria-label="O que editar" className="flex flex-wrap gap-1 border-b border-linha">
        {abas.map((a) => {
          const ativa = aba === a.chave
          return (
            <button
              key={a.chave}
              type="button"
              role="tab"
              aria-selected={ativa}
              disabled={a.total === 0}
              onClick={() => setAba(a.chave)}
              className={`-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-[0.9375rem] font-medium transition-colors disabled:opacity-35 ${
                ativa
                  ? 'border-azul text-azul'
                  : 'border-transparent text-grafite hover:text-tinta'
              }`}
            >
              {a.rotulo}
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  ativa ? 'bg-azul-suave text-azul-escuro' : 'bg-areia text-grafite'
                }`}
              >
                {a.chave === 'imagens' && a.total > 0 ? `${preenchidas}/${a.total}` : a.total}
              </span>
            </button>
          )
        })}
      </div>

      {/* ⚠️ DUAS COLUNAS A PARTIR DE 1280px, e uma só abaixo disso. A
          maquete só ajuda se estiver VISÍVEL ao mesmo tempo que o
          campo — embaixo do formulário ela viraria mais uma coisa para
          rolar até, e ninguém rolaria. Em tela estreita ela vai para o
          topo, encolhida, onde ainda dá para acompanhar de canto de
          olho sem empurrar os campos para fora da tela. */}
      <div className="mt-6 gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="min-w-0 xl:order-1">
        {/* Nunca desmontado: trocar de aba não pode apagar o que a
            pessoa digitou na outra. Ver FormularioSecao. */}
        <div className={aba === 'imagens' ? 'hidden' : undefined}>
          <FormularioSecao
            secao={secao}
            camposDeTexto={camposDeTexto}
            camposDeVideo={camposDeVideo}
            dados={dados}
            onMudar={mudar}
            baseHash={baseHash}
            editavel={editavel}
            aba={aba === 'videos' ? 'videos' : 'textos'}
            aoSalvar={aoSalvar}
          />
        </div>

        <div className={aba === 'imagens' ? undefined : 'hidden'}>
          {espacos.length > 0 ? (
            <>
              <p className="mb-4 rounded-xl bg-areia px-4 py-3 text-sm text-grafite">
                Cada imagem é enviada na hora, uma por vez — esta aba não tem botão de salvar. O
                tamanho e o formato exigidos estão escritos em cada espaço.
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                {espacos.map((slot) => (
                  <CartaoSlot
                    key={slot.chave}
                    slot={slot}
                    imagem={imagens[slot.chave]}
                    editavel={editavel}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-linha bg-white px-5 py-8 text-center text-sm text-grafite">
              Esta seção não tem espaço de imagem.
            </p>
          )}
        </div>
        </div>

        {visual ? (
          <aside className="mb-6 xl:sticky xl:top-6 xl:order-2 xl:mb-0">
            <PreviaAoVivo ancora={ancora} versao={versao} />
          </aside>
        ) : null}
      </div>
    </>
  )
}

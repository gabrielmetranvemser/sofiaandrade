'use client'

import { useEffect, useRef, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { evento } from '@/lib/eventos'
import {
  canvasParaBlob,
  carregarFoto,
  desenharFoto,
  ENQUADRAMENTO_INICIAL,
  type Enquadramento,
  type FotoCarregada,
} from '@/lib/imagem'
import type { FormatoMoldura, Moldura } from '@/lib/molduras'
import { Botao } from '@/components/ui/Botao'
import { Aviso } from '@/components/ui/Aviso'
import { ControleSegmentado } from '@/components/ui/ControleSegmentado'
import { EditorCanvas } from './EditorCanvas'
import { AcoesDoResultado } from './Resultado'

/**
 * O fluxo do filtro, em quatro etapas.
 *
 * O QUE ESTAVA ERRADO ANTES, e não era só o visual:
 *
 *  · a ordem de leitura no celular era 1, 2, 4, 3 — os passos viviam em
 *    duas colunas, e a coluna quebrava depois do passo 2, então o 4
 *    aparecia antes do 3
 *  · a escolha de moldura era uma grade de até três colunas para DUAS
 *    opções, de proporções diferentes: sobrava coluna vazia e um cartão
 *    ficava o dobro da altura do outro
 *  · a prévia era max-w-md numa coluna de 1.1fr, ou seja, pequena
 *    justamente na tela em que a pessoa decide se a foto ficou boa
 *  · o rótulo da zona segura estava em -top-7 dentro de um contêiner
 *    com overflow-hidden: nunca apareceu para ninguém
 *
 * A ideia que resolve os quatro de uma vez: O PALCO NÃO SE MEXE. A
 * prévia ocupa o mesmo lugar e o mesmo tamanho nas quatro etapas — o
 * que muda é o que está dentro dela e o controle embaixo. É o que faz
 * parecer aplicativo em vez de formulário, e é o que garante uma ordem
 * de leitura só, de cima para baixo, em qualquer largura.
 */

const TOTAL = 4

export function Fluxo({ molduras, apoios }: { molduras: Moldura[]; apoios: string | null }) {
  const { filtro: copy } = useConteudo()

  const [etapa, setEtapa] = useState(0)
  const [formato, setFormato] = useState<FormatoMoldura>('story')
  const [foto, setFoto] = useState<FotoCarregada | null>(null)
  const [enquadramento, setEnquadramento] = useState<Enquadramento>(ENQUADRAMENTO_INICIAL)
  const [erro, setErro] = useState<string | null>(null)
  const [avisoQualidade, setAvisoQualidade] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [resultado, setResultado] = useState<Blob | null>(null)
  const [urlResultado, setUrlResultado] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const moldura = molduras.find((m) => m.formato === formato) ?? molduras[0]
  const passo = copy.passos[etapa] ?? copy.passos[copy.passos.length - 1]

  useEffect(() => {
    evento('abriu_filtro')
  }, [])

  // O object URL vive aqui porque duas coisas o usam: a imagem grande
  // no palco e o botão de baixar. Criar dois seria vazar um.
  useEffect(() => {
    if (!resultado) {
      setUrlResultado('')
      return
    }
    const url = URL.createObjectURL(resultado)
    setUrlResultado(url)
    return () => URL.revokeObjectURL(url)
  }, [resultado])

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    setErro(null)
    setAvisoQualidade(false)
    evento('subiu_foto')

    try {
      const carregada = await carregarFoto(arquivo)
      setFoto(carregada)
      setEnquadramento(ENQUADRAMENTO_INICIAL)
      setAvisoQualidade(carregada.pequena)
      setEtapa(2)
    } catch {
      // HEIC de iPhone e afins. A mensagem diz o que FAZER, não o que
      // aconteceu — "formato não suportado" não ajuda ninguém.
      setErro(copy.erroFormato)
    } finally {
      // Permite escolher o MESMO arquivo de novo depois de um erro.
      e.target.value = ''
    }
  }

  async function gerar() {
    if (!foto) return
    setGerando(true)
    setErro(null)

    try {
      // Redesenha em 1080, não na resolução da tela.
      const canvas = document.createElement('canvas')
      canvas.width = moldura.largura
      canvas.height = moldura.altura
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('sem-canvas')

      ctx.fillStyle = '#faf8f5'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      desenharFoto(ctx, foto, canvas.width, canvas.height, enquadramento)

      const arte = await carregarMoldura(moldura.arquivo)
      ctx.drawImage(arte, 0, 0, canvas.width, canvas.height)

      setResultado(await canvasParaBlob(canvas, 0.92))
      setEtapa(3)
      evento('gerou_filtro')
    } catch {
      setErro(copy.erroGerar)
    } finally {
      setGerando(false)
    }
  }

  function refazer() {
    setResultado(null)
    setEtapa(foto ? 2 : 1)
  }

  return (
    // No desktop a coluna de controle é FIXA em 24rem e o palco fica
    // com o resto. Invertido dava 696px para um interruptor de duas
    // opções e um botão, enquanto a prévia — a única coisa que a pessoa
    // realmente olha — ficava espremida em 290px.
    <div className="grid gap-8 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start lg:gap-14">
      {/* ── PALCO ───────────────────────────────────────────────
          Sempre o mesmo lugar, sempre o mesmo tamanho. No desktop
          fica grudado enquanto a coluna de controle rola. */}
      <div className="lg:sticky lg:top-28 lg:order-2">
        <div
          className="palco-filtro relative mx-auto w-full overflow-hidden rounded-3xl border border-linha bg-areia shadow-suave"
          style={{
            aspectRatio: `${moldura.largura} / ${moldura.altura}`,
            // O teto de altura mora no CSS (utilitária palco-filtro),
            // que muda por largura de tela. Aqui só vai a proporção.
            ['--palco-prop' as string]: moldura.largura / moldura.altura,
          }}
        >
          {etapa === 3 && urlResultado ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={urlResultado}
              alt={copy.tituloPronto}
              className="absolute inset-0 size-full object-contain"
            />
          ) : foto && etapa === 2 ? (
            <EditorCanvas
              foto={foto}
              moldura={moldura}
              enquadramento={enquadramento}
              onMudarEnquadramento={setEnquadramento}
            />
          ) : (
            <PalcoVazio moldura={moldura} texto={copy.vazioPrevia} />
          )}
        </div>

        {apoios ? (
          <p className="mt-4 text-center text-base font-medium text-verde">
            <strong className="font-[family-name:var(--font-titulo)] text-lg font-bold tabular-nums">
              {apoios}
            </strong>{' '}
            {copy.apoios}
          </p>
        ) : null}
      </div>

      {/* ── CONTROLE ────────────────────────────────────────────── */}
      <div className="lg:order-1">
        <Trilha
          etapa={etapa}
          passos={copy.passos}
          onIr={(i) => setEtapa(i)}
          liberado={(i) => i === 0 || (i >= 2 ? Boolean(foto) : true)}
        />

        <div key={etapa} className="anima-etapa mt-7">
          <p className="etiqueta text-azul">
            {passo.numero} · {passo.titulo}
          </p>
          <p className="mt-2 text-base text-grafite">{passo.texto}</p>

          <div className="mt-6">
            {etapa === 0 ? (
              <ControleSegmentado
                nome="formato"
                rotulo={passo.titulo}
                valor={formato}
                onMudar={setFormato}
                opcoes={[
                  { valor: 'story', ...copy.formatos.story },
                  { valor: 'perfil', ...copy.formatos.perfil },
                ]}
              />
            ) : null}

            {etapa === 1 ? (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={aoEscolherArquivo}
                  className="sr-only"
                />
                <Botao
                  variante="acao"
                  tamanho="lg"
                  onClick={() => inputRef.current?.click()}
                  className="w-full"
                >
                  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
                    <path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
                  </svg>
                  {foto ? copy.botaoTrocarFoto : copy.botaoEscolherFoto}
                </Botao>
              </>
            ) : null}

            {etapa === 2 && foto ? (
              <Ajuste
                enquadramento={enquadramento}
                onMudar={setEnquadramento}
                onTrocarFoto={() => inputRef.current?.click()}
              />
            ) : null}

            {etapa === 3 && resultado ? (
              <AcoesDoResultado
                blob={resultado}
                url={urlResultado}
                nomeArquivo={`sofia-andrade-2233-${moldura.formato}.jpg`}
                onRefazer={refazer}
              />
            ) : null}
          </div>
        </div>

        {erro ? (
          <Aviso tom="erro" className="mt-5">
            {erro}
          </Aviso>
        ) : null}

        {avisoQualidade && etapa === 2 ? (
          <Aviso tom="alerta" className="mt-4">
            {copy.erroPequena}
          </Aviso>
        ) : null}

        <p className="mt-6 flex items-start gap-2 text-base text-verde">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0" fill="currentColor" aria-hidden>
            <path d="M12 2 4 5.5V11c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5.5L12 2Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z" />
          </svg>
          {copy.privacidade}
        </p>

        {/* Barra de ação. No celular fica grudada embaixo, com a área
            segura do iPhone somada — sem isso ela cai debaixo do
            indicador de home e o toque vira gesto do sistema. */}
        {etapa < 3 ? (
          <div
            // Botões flutuando, sem barra por baixo. Uma barra branca de
            // ponta a ponta fica correta enquanto está grudada e vira um
            // traço solto no meio da página quando a coluna acaba —
            // sticky não avisa ao CSS que parou de grudar.
            className="sticky bottom-0 z-30 mt-8 flex gap-3 lg:static"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            {/* Só a seta no celular. "Gerar minha foto" ao lado de
                "Voltar" não cabe em 335px: o texto quebra em duas
                linhas e os dois botões ficam de alturas diferentes. */}
            {etapa > 0 ? (
              <button
                type="button"
                onClick={() => setEtapa(etapa - 1)}
                aria-label={copy.botaoVoltar}
                className="toque inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full border border-linha bg-white px-5 font-semibold text-azul-escuro shadow-alta sm:px-7"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 6l-6 6 6 6" />
                </svg>
                <span className="hidden sm:inline">{copy.botaoVoltar}</span>
              </button>
            ) : null}

            {etapa === 0 ? (
              <Botao variante="acao" tamanho="lg" onClick={() => setEtapa(1)} className="flex-1 shadow-alta">
                {copy.botaoAvancar}
              </Botao>
            ) : null}

            {etapa === 2 ? (
              <Botao
                variante="verde"
                tamanho="lg"
                onClick={gerar}
                disabled={gerando}
                className="flex-1 px-5 shadow-alta sm:px-8"
              >
                {gerando ? copy.botaoGerando : copy.botaoGerar}
              </Botao>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Os quatro pontos. Voltar a um passo já cumprido é um toque. */
function Trilha({
  etapa,
  passos,
  onIr,
  liberado,
}: {
  etapa: number
  passos: readonly { id: string; numero: string; titulo: string }[]
  onIr: (i: number) => void
  liberado: (i: number) => boolean
}) {
  return (
    <ol className="flex items-center gap-2" aria-label="Etapas">
      {Array.from({ length: TOTAL }, (_, i) => {
        const atual = i === etapa
        const passado = i < etapa
        const podeIr = liberado(i) && i !== etapa
        return (
          <li key={passos[i]?.id ?? i} className="flex-1">
            <button
              type="button"
              onClick={() => podeIr && onIr(i)}
              disabled={!podeIr}
              aria-current={atual ? 'step' : undefined}
              aria-label={`${passos[i]?.numero ?? i + 1} · ${passos[i]?.titulo ?? ''}`}
              className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                atual ? 'bg-azul' : passado ? 'bg-azul/45' : 'bg-linha'
              } ${podeIr ? 'cursor-pointer hover:bg-azul/70' : 'cursor-default'}`}
            />
          </li>
        )
      })}
    </ol>
  )
}

function Ajuste({
  enquadramento,
  onMudar,
  onTrocarFoto,
}: {
  enquadramento: Enquadramento
  onMudar: (e: Enquadramento) => void
  onTrocarFoto: () => void
}) {
  const { filtro: copy } = useConteudo()
  return (
    <div>
      <div className="flex items-center gap-4">
        <label htmlFor="zoom" className="text-sm font-medium text-grafite">
          {copy.rotuloZoom}
        </label>
        <input
          id="zoom"
          type="range"
          min={1}
          max={4}
          step={0.02}
          value={enquadramento.zoom}
          onChange={(e) => onMudar({ ...enquadramento, zoom: Number(e.target.value) })}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-linha accent-azul"
        />
        <button
          type="button"
          onClick={() => onMudar(ENQUADRAMENTO_INICIAL)}
          className="min-h-11 shrink-0 px-2 text-sm font-medium text-azul underline decoration-1 underline-offset-[6px]"
        >
          {copy.botaoCentralizar}
        </button>
      </div>

      <p className="mt-3 text-base text-grafite">{copy.dicaAjuste}</p>

      <button
        type="button"
        onClick={onTrocarFoto}
        className="mt-4 min-h-11 text-base font-semibold text-azul underline decoration-1 underline-offset-[6px]"
      >
        {copy.botaoTrocarFoto}
      </button>
    </div>
  )
}

function PalcoVazio({ moldura, texto }: { moldura: Moldura; texto: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={moldura.arquivo}
        alt=""
        className="absolute inset-0 size-full object-contain"
      />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <p className="max-w-[20ch] rounded-2xl bg-azul-escuro/80 px-5 py-3 text-center text-base font-medium text-white">
          {texto}
        </p>
      </div>
    </>
  )
}

/** Carrega a arte da moldura para desenhar no canvas de exportação. */
function carregarMoldura(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('moldura-nao-carregou'))
    img.src = src
  })
}

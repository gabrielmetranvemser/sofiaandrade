'use client'

import { useEffect, useRef, useState } from 'react'
import { filtro as copy } from '@/content/copy'
import { evento } from '@/lib/eventos'
import {
  canvasParaBlob,
  carregarFoto,
  desenharFoto,
  ENQUADRAMENTO_INICIAL,
  ErroFormatoImagem,
  type Enquadramento,
  type FotoCarregada,
} from '@/lib/imagem'
import { MOLDURA_PADRAO, type Moldura } from '@/lib/molduras'
import { Botao } from '@/components/ui/Botao'
import { Aviso } from '@/components/ui/Aviso'
import { SeletorDeMoldura } from './SeletorDeMoldura'
import { EditorCanvas } from './EditorCanvas'
import { Resultado } from './Resultado'

type Etapa = 'escolher' | 'ajustar' | 'pronto'

export function GeradorDeFiltro() {
  const [etapa, setEtapa] = useState<Etapa>('escolher')
  const [moldura, setMoldura] = useState<Moldura>(MOLDURA_PADRAO)
  const [foto, setFoto] = useState<FotoCarregada | null>(null)
  const [enquadramento, setEnquadramento] = useState<Enquadramento>(ENQUADRAMENTO_INICIAL)
  const [erro, setErro] = useState<string | null>(null)
  const [avisoQualidade, setAvisoQualidade] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [resultado, setResultado] = useState<Blob | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    evento('abriu_filtro')
  }, [])

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
      setEtapa('ajustar')
    } catch (err) {
      // HEIC de iPhone e afins. A mensagem precisa dizer o que fazer,
      // não o que aconteceu.
      setErro(err instanceof ErroFormatoImagem ? copy.erroFormato : copy.erroFormato)
    } finally {
      // Permite escolher o MESMO arquivo de novo depois de um erro.
      e.target.value = ''
    }
  }

  async function gerar() {
    if (!foto) return
    setGerando(true)

    try {
      // Redesenha em resolução final (1080), não na resolução de tela.
      const canvas = document.createElement('canvas')
      canvas.width = moldura.largura
      canvas.height = moldura.altura
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('sem-canvas')

      ctx.fillStyle = '#faf8f5'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      desenharFoto(ctx, foto, canvas.width, canvas.height, enquadramento)

      const arte = await carregarMoldura(moldura.arquivo, moldura.largura, moldura.altura)
      ctx.drawImage(arte, 0, 0, canvas.width, canvas.height)

      const blob = await canvasParaBlob(canvas, 0.92)
      setResultado(blob)
      setEtapa('pronto')
      evento('gerou_filtro')
    } catch {
      setErro('Não foi possível gerar a imagem neste aparelho. Tente uma foto menor.')
    } finally {
      setGerando(false)
    }
  }

  function refazer() {
    setResultado(null)
    setEtapa(foto ? 'ajustar' : 'escolher')
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      {/* ── Coluna de controles ── */}
      <div className={etapa === 'pronto' ? 'hidden lg:block' : ''}>
        <SeletorDeMoldura selecionada={moldura} onSelecionar={setMoldura} />

        <div className="mt-10">
          <p className="text-sm font-semibold tracking-[0.06em] text-azul uppercase">
            2 · Escolha sua foto
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={aoEscolherArquivo}
            className="sr-only"
            id="entrada-foto"
          />

          <Botao
            variante={foto ? 'contorno' : 'acao'}
            tamanho="lg"
            onClick={() => inputRef.current?.click()}
            className={`mt-4 w-full ${foto ? 'text-azul hover:text-white' : ''}`}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
              <path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3H9Zm3 5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
            </svg>
            {foto ? copy.botaoTrocarFoto : copy.botaoEscolherFoto}
          </Botao>

          <p className="mt-3 flex items-start gap-2 text-base text-verde">
            <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0" fill="currentColor" aria-hidden>
              <path d="M12 2 4 5.5V11c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5.5L12 2Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z" />
            </svg>
            {copy.privacidade}
          </p>

          {erro ? (
            <Aviso tom="erro" className="mt-5">
              {erro}
            </Aviso>
          ) : null}

          {avisoQualidade ? (
            <Aviso tom="alerta" className="mt-4">
              {copy.erroPequena}
            </Aviso>
          ) : null}
        </div>

        {foto && etapa !== 'pronto' ? (
          <div className="mt-10">
            <p className="text-sm font-semibold tracking-[0.06em] text-azul uppercase">4 · Gerar</p>
            <Botao
              variante="verde"
              tamanho="lg"
              onClick={gerar}
              disabled={gerando}
              className="mt-4 w-full"
            >
              {gerando ? copy.botaoGerando : copy.botaoGerar}
            </Botao>
          </div>
        ) : null}
      </div>

      {/* ── Coluna do palco ── */}
      <div>
        {etapa === 'pronto' && resultado ? (
          <Resultado
            blob={resultado}
            nomeArquivo={`sofia-andrade-2233-${moldura.formato}.jpg`}
            proporcao={`${moldura.largura}/${moldura.altura}`}
            onRefazer={refazer}
          />
        ) : foto ? (
          <>
            <p className="text-sm font-semibold tracking-[0.06em] text-azul uppercase">3 · Ajuste</p>
            <div className="mt-4">
              <EditorCanvas
                foto={foto}
                moldura={moldura}
                enquadramento={enquadramento}
                onMudarEnquadramento={setEnquadramento}
              />
            </div>
          </>
        ) : (
          <PreviaVazia moldura={moldura} />
        )}
      </div>
    </div>
  )
}

function PreviaVazia({ moldura }: { moldura: Moldura }) {
  return (
    <div className="rounded-2xl border border-dashed border-linha bg-white p-3">
      <div
        className="relative mx-auto w-full max-w-md"
        style={{ aspectRatio: `${moldura.largura}/${moldura.altura}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={moldura.arquivo}
          alt="Prévia da moldura escolhida"
          className="absolute inset-0 size-full object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <p className="max-w-[22ch] rounded-xl bg-azul-escuro/80 px-4 py-3 text-center text-base font-medium text-white">
            Sua foto entra aqui.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Carrega a arte da moldura já no tamanho final de exportação. */
function carregarMoldura(src: string, w: number, h: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.width = w
    img.height = h
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('moldura-nao-carregou'))
    img.src = src
  })
}

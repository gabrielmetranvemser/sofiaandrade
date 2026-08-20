'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { tamanhoDeSaida, type Slot } from '@/content/slots'
import { ControleSegmentado } from '@/components/ui/ControleSegmentado'

/**
 * RECORTE NA PRÓPRIA PÁGINA.
 *
 * O espaço já sabe a proporção e o tamanho que precisa. Então a pessoa
 * não escolhe nada disso: ela arrasta, dá zoom e corta. O arquivo que
 * sai daqui já nasce válido — mesma proporção, nunca abaixo do mínimo,
 * dentro do teto de 2400. O servidor continua conferindo tudo de novo,
 * porque validação no navegador é conveniência, não segurança.
 *
 * Três coisas que existem por motivo prático, não por capricho:
 *
 * · GIRAR. Metade do acervo de família são fotos de papel fotografadas
 *   de celular, deitadas 90°. Sem o botão de girar, esse material
 *   simplesmente não entra no site.
 *
 * · PROPORÇÃO ESCOLHIDA. Nos espaços de proporção livre — os prints de
 *   comentário — o corte útil é justamente MUDAR a proporção, para
 *   aparar o "Responder" do rodapé do print. Trava a janela na
 *   proporção da foto e essa tesoura some.
 *
 * · AVISO DE AMPLIAÇÃO. Quando a área escolhida é menor que o mínimo do
 *   espaço, a saída é ampliada. Ampliar é ruim e a tela diz isso, em
 *   vez de barrar a única foto que a campanha tem.
 */

type Rotacao = 0 | 90 | 180 | 270

const ZOOM_MAX = 6

/** Proporções oferecidas quando o espaço não impõe uma. */
const LIVRES = [
  { valor: 'original', rotulo: 'Original' },
  { valor: '4/3', rotulo: '4:3' },
  { valor: '1/1', rotulo: '1:1' },
  { valor: '3/4', rotulo: '3:4' },
  { valor: '16/9', rotulo: '16:9' },
] as const

type Livre = (typeof LIVRES)[number]['valor']

function razao(p: string): number {
  const [a, b] = p.split('/').map(Number)
  return a / b
}

export function Recortador({
  slot,
  arquivo,
  aoConfirmar,
  aoCancelar,
}: {
  slot: Slot
  arquivo: File
  aoConfirmar: (recortado: File) => void
  aoCancelar: () => void
}) {
  const [fonte, setFonte] = useState<CanvasImageSource | null>(null)
  const [dimensao, setDimensao] = useState({ largura: 0, altura: 0 })
  const [rotacao, setRotacao] = useState<Rotacao>(0)
  const [livre, setLivre] = useState<Livre>('original')
  const [zoom, setZoom] = useState(1)
  const [desloc, setDesloc] = useState({ x: 0, y: 0 })
  const [erro, setErro] = useState<string | null>(null)
  const [semAlpha, setSemAlpha] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  /** Tamanho real da janela de corte. Alimentado pelo ResizeObserver. */
  const [medida, setMedida] = useState({ largura: 0, altura: 0 })

  const palcoRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const arraste = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null)
  const pinca = useRef<{ distancia: number; zoom: number } | null>(null)

  // ── carregar o arquivo ─────────────────────────────────────────
  // createImageBitmap com imageOrientation aplica o EXIF na hora de
  // decodificar. Sem isso, uma foto de celular na vertical chega aqui
  // deitada — e o usuário giraria à mão uma foto que já estava certa.
  useEffect(() => {
    let vivo = true
    let url: string | null = null

    async function carregar() {
      try {
        let bitmap: CanvasImageSource
        let w: number
        let h: number

        if (typeof createImageBitmap === 'function') {
          const bm = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
          bitmap = bm
          w = bm.width
          h = bm.height
        } else {
          url = URL.createObjectURL(arquivo)
          const img = new Image()
          img.src = url
          await img.decode()
          bitmap = img
          w = img.naturalWidth
          h = img.naturalHeight
        }

        if (!vivo) return
        setFonte(bitmap)
        setDimensao({ largura: w, altura: h })
        if (slot.alpha) setSemAlpha(vazadoDemaisPouco(bitmap, w, h))
      } catch {
        if (vivo) setErro('Não consegui abrir essa imagem. Tente PNG, JPG ou WebP.')
      }
    }

    void carregar()
    return () => {
      vivo = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [arquivo, slot.alpha])

  // Girar troca largura por altura, e qualquer enquadramento anterior
  // deixa de fazer sentido. Voltar ao começo é o comportamento honesto.
  useEffect(() => {
    setZoom(1)
    setDesloc({ x: 0, y: 0 })
  }, [rotacao, livre])

  const fonteLargura = rotacao % 180 === 0 ? dimensao.largura : dimensao.altura
  const fonteAltura = rotacao % 180 === 0 ? dimensao.altura : dimensao.largura

  const proporcao =
    slot.proporcao !== null
      ? razao(slot.proporcao)
      : livre === 'original'
        ? fonteLargura && fonteAltura
          ? fonteLargura / fonteAltura
          : 1
        : razao(livre)

  // ── desenhar a prévia ──────────────────────────────────────────
  const desenhar = useCallback(() => {
    const canvas = canvasRef.current
    const palco = palcoRef.current
    if (!canvas || !palco || !fonte || !fonteLargura || !fonteAltura) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const fw = palco.clientWidth
    const fh = palco.clientHeight
    canvas.width = Math.max(1, Math.round(fw * dpr))
    canvas.height = Math.max(1, Math.round(fh * dpr))

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, fw, fh)

    // Xadrez atrás só quando a transparência importa — assim dá para
    // ver o que é buraco e o que é branco.
    if (slot.alpha) {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, fw, fh)
      ctx.fillStyle = '#e9e6e1'
      const q = 12
      for (let y = 0; y < fh; y += q) {
        for (let x = 0; x < fw; x += q) {
          if (((x / q) | 0) % 2 === ((y / q) | 0) % 2) ctx.fillRect(x, y, q, q)
        }
      }
    } else {
      ctx.fillStyle = '#f5f2ee'
      ctx.fillRect(0, 0, fw, fh)
    }

    const escala = escalaDeCobertura(fw, fh, fonteLargura, fonteAltura) * zoom
    const larguraNaTela = fonteLargura * escala
    const alturaNaTela = fonteAltura * escala
    const esq = (fw - larguraNaTela) / 2 + desloc.x
    const topo = (fh - alturaNaTela) / 2 + desloc.y

    ctx.save()
    ctx.translate(esq + larguraNaTela / 2, topo + alturaNaTela / 2)
    ctx.rotate((rotacao * Math.PI) / 180)
    ctx.drawImage(
      fonte,
      -(dimensao.largura * escala) / 2,
      -(dimensao.altura * escala) / 2,
      dimensao.largura * escala,
      dimensao.altura * escala,
    )
    ctx.restore()
  }, [fonte, fonteLargura, fonteAltura, dimensao, zoom, desloc, rotacao, slot.alpha])

  useEffect(() => {
    desenhar()
  }, [desenhar])

  useEffect(() => {
    const palco = palcoRef.current
    if (!palco) return
    const ro = new ResizeObserver(() => {
      setMedida({ largura: palco.clientWidth, altura: palco.clientHeight })
      desenhar()
    })
    ro.observe(palco)
    setMedida({ largura: palco.clientWidth, altura: palco.clientHeight })
    return () => ro.disconnect()
  }, [desenhar])

  // ── limitar o arraste ──────────────────────────────────────────
  // A foto nunca pode descolar da janela: se descolasse, o corte teria
  // uma faixa vazia e o servidor receberia uma imagem com tarja.
  const limitar = useCallback(
    (d: { x: number; y: number }, z: number) => {
      const fw = medida.largura
      const fh = medida.altura
      if (!fw || !fh) return d
      const escala = escalaDeCobertura(fw, fh, fonteLargura, fonteAltura) * z
      const folgaX = Math.max(0, (fonteLargura * escala - fw) / 2)
      const folgaY = Math.max(0, (fonteAltura * escala - fh) / 2)
      return {
        x: Math.min(folgaX, Math.max(-folgaX, d.x)),
        y: Math.min(folgaY, Math.max(-folgaY, d.y)),
      }
    },
    [fonteLargura, fonteAltura, medida],
  )

  const mudarZoom = useCallback(
    (z: number) => {
      const novo = Math.min(ZOOM_MAX, Math.max(1, z))
      setZoom(novo)
      setDesloc((d) => limitar(d, novo))
    },
    [limitar],
  )

  // ── área de corte, em pixels da imagem original ────────────────
  //
  // Mede pelo ESTADO, não por `palcoRef.current`. Ler o ref durante a
  // renderização devolvia null na primeira passada — a janela ainda
  // não existe no DOM — e o rodapé caía num 1×1 degenerado. Como
  // `tamanhoDeSaida` nunca desce abaixo do mínimo, o resultado era
  // sempre "sai como <mínimo>, vai ser ampliada": um print de
  // 1179×465 anunciava 600×600 e um aviso de perda de nitidez que não
  // ia acontecer. O corte em si sempre esteve certo (lê o tamanho na
  // hora do clique) — quem mentia era só o texto, que é pior, porque
  // o texto é justamente o que a pessoa usa para decidir.
  const escalaAtual =
    escalaDeCobertura(medida.largura, medida.altura, fonteLargura, fonteAltura) * zoom
  const pronto = medida.largura > 0 && fonteLargura > 0
  const saida = pronto
    ? tamanhoDeSaida(slot, medida.largura / escalaAtual, medida.altura / escalaAtual)
    : null

  async function cortar() {
    const palcoEl = palcoRef.current
    if (!fonte || !palcoEl) return
    setOcupado(true)
    try {
      const larguraJanela = palcoEl.clientWidth
      const alturaJanela = palcoEl.clientHeight
      const escala = escalaDeCobertura(larguraJanela, alturaJanela, fonteLargura, fonteAltura) * zoom

      // Canto superior esquerdo da janela, em coordenadas da imagem já
      // girada. Sai direto da mesma conta do desenho — se as duas
      // divergirem, o corte não é o que a pessoa viu.
      const sx = (fonteLargura * escala - larguraJanela) / 2 / escala - desloc.x / escala
      const sy = (fonteAltura * escala - alturaJanela) / 2 / escala - desloc.y / escala
      const sw = larguraJanela / escala
      const sh = alturaJanela / escala

      const alvo = tamanhoDeSaida(slot, sw, sh)

      const saidaCanvas = document.createElement('canvas')
      saidaCanvas.width = alvo.largura
      saidaCanvas.height = alvo.altura
      const ctx = saidaCanvas.getContext('2d')
      if (!ctx) throw new Error('sem contexto')
      ctx.imageSmoothingQuality = 'high'

      // Girar no destino e recortar na origem ao mesmo tempo dá conta
      // errada. Passo intermediário: primeiro materializa a imagem já
      // girada, depois recorta dela.
      const girada = document.createElement('canvas')
      girada.width = fonteLargura
      girada.height = fonteAltura
      const gctx = girada.getContext('2d')
      if (!gctx) throw new Error('sem contexto')
      gctx.save()
      gctx.translate(fonteLargura / 2, fonteAltura / 2)
      gctx.rotate((rotacao * Math.PI) / 180)
      gctx.drawImage(fonte, -dimensao.largura / 2, -dimensao.altura / 2)
      gctx.restore()

      ctx.drawImage(girada, sx, sy, sw, sh, 0, 0, alvo.largura, alvo.altura)

      // PNG onde a transparência importa; JPEG no resto. O servidor
      // converte para WebP de qualquer jeito — o que não pode é o
      // JPEG comer o canal alpha no caminho.
      const tipo = slot.alpha ? 'image/png' : 'image/jpeg'
      const blob = await new Promise<Blob | null>((r) =>
        saidaCanvas.toBlob(r, tipo, slot.alpha ? undefined : 0.92),
      )
      if (!blob) throw new Error('sem blob')

      const nome = arquivo.name.replace(/\.[^.]+$/, '') || slot.chave
      aoConfirmar(
        new File([blob], `${nome}-recorte.${slot.alpha ? 'png' : 'jpg'}`, { type: tipo }),
      )
    } catch {
      setErro('Não consegui gerar o recorte. Tente uma imagem menor.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Recortar — ${slot.rotulo}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-azul-escuro/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white sm:max-h-[92vh] sm:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-linha px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-medium">Recortar</h2>
            <p className="truncate text-sm text-grafite">
              {slot.rotulo} · {slot.onde}
            </p>
          </div>
          <button
            type="button"
            onClick={aoCancelar}
            className="-mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-grafite transition-colors hover:bg-areia"
            aria-label="Fechar sem cortar"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
              <path d="m12 10.6 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4 5.3 5.3Z" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {erro ? (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">
              {erro}
            </p>
          ) : null}

          {/* O palco tem a proporção do espaço. É literalmente a janela
              que o site vai mostrar — o que estiver aqui dentro é o que
              vai para o ar, nada além. */}
          <div
            ref={palcoRef}
            style={{ aspectRatio: String(proporcao) }}
            className="relative w-full touch-none overflow-hidden rounded-2xl bg-areia ring-1 ring-linha select-none"
            onPointerDown={(e) => {
              // A captura é otimização, não requisito: ela mantém o
              // arraste vivo quando o dedo sai da janela. Se o
              // navegador recusar o id, o arraste ainda funciona —
              // deixar lançar aqui mataria o gesto inteiro.
              try {
                ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
              } catch {
                /* ponteiro não capturável */
              }
              arraste.current = { x: e.clientX, y: e.clientY, dx: desloc.x, dy: desloc.y }
            }}
            onPointerMove={(e) => {
              const a = arraste.current
              if (!a) return
              setDesloc(
                limitar({ x: a.dx + (e.clientX - a.x), y: a.dy + (e.clientY - a.y) }, zoom),
              )
            }}
            onPointerUp={(e) => {
              arraste.current = null
              try {
                ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
              } catch {
                /* ponteiro já solto */
              }
            }}
            onPointerCancel={() => (arraste.current = null)}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                arraste.current = null
                pinca.current = { distancia: distanciaEntre(e), zoom }
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length !== 2 || !pinca.current) return
              e.preventDefault()
              mudarZoom((pinca.current.zoom * distanciaEntre(e)) / pinca.current.distancia)
            }}
            onTouchEnd={() => (pinca.current = null)}
            onWheel={(e) => {
              if (!fonte) return
              mudarZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08))
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 size-full cursor-grab active:cursor-grabbing"
            />
            {!fonte && !erro ? (
              <p className="absolute inset-0 grid place-items-center text-sm text-grafite">
                Abrindo…
              </p>
            ) : null}
            {/* Terços. Não é enfeite: em retrato o olho tem que cair na
                linha de cima, e sem guia ninguém acerta isso a olho. */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute inset-y-0 left-1/3 w-px bg-white/35" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-white/35" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-white/35" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-white/35" />
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-grafite">
            Arraste para mover. Pinça ou roda do mouse para o zoom.
          </p>

          {/* ── controles ── */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => mudarZoom(1)}
              disabled={!fonte}
              className="shrink-0 text-sm font-medium text-azul transition-opacity disabled:opacity-40"
            >
              Centralizar
            </button>
            <input
              type="range"
              min={1}
              max={ZOOM_MAX}
              step={0.01}
              value={zoom}
              disabled={!fonte}
              onChange={(e) => mudarZoom(Number(e.target.value))}
              aria-label="Zoom"
              className="h-9 w-full accent-azul"
            />
            <button
              type="button"
              onClick={() => setRotacao(((rotacao + 90) % 360) as Rotacao)}
              disabled={!fonte}
              title="Girar 90°"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-linha transition-colors hover:border-azul/30 disabled:opacity-40"
              aria-label="Girar 90 graus"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M13 4V1L9 5l4 4V6a5 5 0 1 1-5 5H6a7 7 0 1 0 7-7Z" />
              </svg>
            </button>
          </div>

          {slot.proporcao === null ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Proporção do recorte</p>
              <ControleSegmentado
                nome={`prop-${slot.chave}`}
                rotulo="Proporção do recorte"
                opcoes={LIVRES.map((o) => ({ valor: o.valor, rotulo: o.rotulo }))}
                valor={livre}
                onMudar={(v) => setLivre(v)}
              />
              <p className="mt-2 text-xs text-grafite">
                Este espaço aceita qualquer proporção. Em print de comentário, apare o
                &ldquo;Responder&rdquo; do rodapé.
              </p>
            </div>
          ) : null}

          {/* ── o que vai sair ── */}
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 rounded-xl bg-areia px-4 py-3 text-xs">
            <div className="flex gap-1.5">
              <dt className="text-grafite">Sai como</dt>
              <dd className="font-medium tabular-nums">
                {saida ? `${saida.largura}×${saida.altura}` : '—'}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-grafite">Mínimo do espaço</dt>
              <dd className="font-medium tabular-nums">
                {slot.larguraMin}×{slot.alturaMin}
              </dd>
            </div>
          </dl>

          {saida?.ampliando ? (
            <p className="mt-2 rounded-xl bg-amarelo/25 px-4 py-3 text-xs text-azul-escuro">
              Essa área é menor que o mínimo do espaço, então ela vai ser ampliada e perder
              nitidez. Dá pra publicar — mas se existir uma versão maior da foto, use ela.
            </p>
          ) : null}

          {semAlpha ? (
            <p className="mt-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-900">
              {slot.exata
                ? 'Isto é uma MOLDURA: o miolo tem que ser vazado, porque é por ali que aparece a foto de quem usa. Esta imagem é opaca de ponta a ponta — parece uma foto, não uma moldura. O servidor vai recusar.'
                : 'Este espaço fica sobre o azul e precisa de fundo transparente. Esta imagem ainda tem fundo. Recorte num editor e envie PNG — o servidor vai recusar assim.'}
            </p>
          ) : null}
        </div>

        <footer className="flex gap-2 border-t border-linha px-5 py-4">
          <button
            type="button"
            onClick={aoCancelar}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-linha px-5 text-sm font-medium transition-colors hover:border-azul/30"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={cortar}
            disabled={!fonte || ocupado}
            className="inline-flex min-h-11 flex-[2] items-center justify-center rounded-full bg-azul px-5 text-sm font-semibold text-white transition-colors hover:bg-azul-escuro disabled:opacity-40"
          >
            {ocupado ? 'Cortando…' : 'Cortar'}
          </button>
        </footer>
      </div>
    </div>
  )
}

/** A menor escala em que a imagem ainda cobre a janela inteira. */
function escalaDeCobertura(fw: number, fh: number, iw: number, ih: number): number {
  if (!iw || !ih) return 1
  return Math.max(fw / iw, fh / ih)
}

function distanciaEntre(e: React.TouchEvent): number {
  return Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY,
  )
}

/**
 * Falta buraco nesta imagem?
 *
 * Não pergunta "existe canal alfa" — todo PNG tem — nem "existe UM
 * pixel translúcido", que uma borda suavizada de foto satisfaz
 * sozinha. Pergunta quanto da imagem é REALMENTE vazado, porque foi
 * exatamente por essa fresta que um retrato entrou no espaço da
 * moldura e o gerador de filtro passou a tapar a foto de quem usa.
 *
 * Faz a conta numa miniatura de 48px: a proporção é a mesma e não
 * trava o celular de quem edita. Serve para avisar ANTES de subir —
 * quem decide continua sendo o servidor.
 */
function vazadoDemaisPouco(fonte: CanvasImageSource, largura: number, altura: number): boolean {
  try {
    const lado = 48
    const c = document.createElement('canvas')
    c.width = lado
    c.height = lado
    const ctx = c.getContext('2d', { willReadFrequently: true })
    if (!ctx) return false
    ctx.clearRect(0, 0, lado, lado)
    ctx.drawImage(fonte, 0, 0, largura, altura, 0, 0, lado, lado)
    const dados = ctx.getImageData(0, 0, lado, lado).data
    let vazados = 0
    for (let i = 3; i < dados.length; i += 4) if (dados[i] < 40) vazados++
    // 2% é folgado de propósito: recorte justo de meio corpo deixa
    // pouca margem, e o alvo aqui é a imagem CHAPADA, não a apertada.
    return vazados / (lado * lado) < 0.02
  } catch {
    // Canvas manchado ou navegador antigo: não dá para saber, e acusar
    // por dúvida é pior que deixar o servidor conferir.
    return false
  }
}

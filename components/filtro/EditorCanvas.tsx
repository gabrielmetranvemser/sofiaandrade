'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { desenharFoto, ENQUADRAMENTO_INICIAL, type Enquadramento, type FotoCarregada } from '@/lib/imagem'
import type { Moldura } from '@/lib/molduras'

/**
 * Editor: arrasta e dá zoom. Desenha numa resolução de tela e só na
 * hora de exportar redesenha em 1080. Assim o arraste fica fluido até
 * em celular antigo, que é onde o público está.
 *
 * A zona segura visível existe porque rosto cortado pela moldura =
 * resultado ruim = ninguém compartilha. Está no plano como armadilha.
 */
export function EditorCanvas({
  foto,
  moldura,
  enquadramento,
  onMudarEnquadramento,
}: {
  foto: FotoCarregada
  moldura: Moldura
  enquadramento: Enquadramento
  onMudarEnquadramento: (e: Enquadramento) => void
}) {
  const { filtro: copy } = useConteudo()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const molduraRef = useRef<HTMLImageElement | null>(null)
  const [molduraPronta, setMolduraPronta] = useState(false)

  const arraste = useRef<{ ativo: boolean; x: number; y: number; base: Enquadramento } | null>(null)
  const pinca = useRef<{ distancia: number; zoom: number } | null>(null)

  // Carrega a moldura uma vez por id.
  useEffect(() => {
    let cancelado = false
    setMolduraPronta(false)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelado) return
      molduraRef.current = img
      setMolduraPronta(true)
    }
    img.src = moldura.arquivo
    return () => {
      cancelado = true
    }
  }, [moldura.arquivo])

  const desenhar = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#faf8f5'
    ctx.fillRect(0, 0, width, height)

    desenharFoto(ctx, foto, width, height, enquadramento)

    if (molduraRef.current && molduraPronta) {
      ctx.drawImage(molduraRef.current, 0, 0, width, height)
    }
  }, [foto, enquadramento, molduraPronta])

  // Dimensiona o canvas de tela conforme a largura disponível.
  useEffect(() => {
    const area = areaRef.current
    const canvas = canvasRef.current
    if (!area || !canvas) return

    const redimensionar = () => {
      const larguraCss = area.clientWidth
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(larguraCss * dpr)
      canvas.height = Math.round((larguraCss * moldura.altura) / moldura.largura * dpr)
      canvas.style.height = `${(larguraCss * moldura.altura) / moldura.largura}px`
      desenhar()
    }

    redimensionar()
    const ro = new ResizeObserver(redimensionar)
    ro.observe(area)
    return () => ro.disconnect()
  }, [moldura.largura, moldura.altura, desenhar])

  useEffect(() => {
    desenhar()
  }, [desenhar])

  // ── Arraste ──
  function aoDescer(e: React.PointerEvent<HTMLCanvasElement>) {
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
    arraste.current = { ativo: true, x: e.clientX, y: e.clientY, base: enquadramento }
  }

  function aoMover(e: React.PointerEvent<HTMLCanvasElement>) {
    const a = arraste.current
    const canvas = canvasRef.current
    if (!a?.ativo || !canvas) return
    const larguraCss = canvas.getBoundingClientRect().width
    const alturaCss = (larguraCss * moldura.altura) / moldura.largura
    const menorLado = Math.min(larguraCss, alturaCss)

    onMudarEnquadramento({
      ...a.base,
      x: a.base.x + (e.clientX - a.x) / menorLado,
      y: a.base.y + (e.clientY - a.y) / menorLado,
    })
  }

  function aoSubir(e: React.PointerEvent<HTMLCanvasElement>) {
    arraste.current = null
    try {
      ;(e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ponteiro já solto */
    }
  }

  // ── Pinça de dois dedos ──
  function aoTocar(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length !== 2) return
    const d = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
    pinca.current = { distancia: d, zoom: enquadramento.zoom }
  }

  function aoMoverToque(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length !== 2 || !pinca.current) return
    e.preventDefault()
    const d = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
    const z = Math.min(4, Math.max(1, (pinca.current.zoom * d) / pinca.current.distancia))
    onMudarEnquadramento({ ...enquadramento, zoom: z })
  }

  const zs = moldura.zonaSegura

  return (
    <div>
      <div ref={areaRef} className="relative select-none rounded-2xl border border-linha bg-areia overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={aoDescer}
          onPointerMove={aoMover}
          onPointerUp={aoSubir}
          onPointerCancel={aoSubir}
          onTouchStart={aoTocar}
          onTouchMove={aoMoverToque}
          onTouchEnd={() => (pinca.current = null)}
          className="w-full cursor-grab touch-none active:cursor-grabbing"
          aria-label="Área de ajuste da foto. Arraste para mover, use o controle abaixo para o zoom."
        />

        {/* Guia de zona segura */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl border border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(13,36,64,0.12)]"
          style={{
            left: `${zs.x * 100}%`,
            top: `${zs.y * 100}%`,
            width: `${zs.largura * 100}%`,
            height: `${zs.altura * 100}%`,
          }}
        >
          <span className="absolute -top-7 left-0 rounded-full bg-azul-escuro/80 px-3 py-1 text-[0.6875rem] font-medium text-white">
            {copy.avisoZonaSegura}
          </span>
        </div>
      </div>

      {/* Zoom */}
      <div className="mt-4 flex items-center gap-4">
        <label htmlFor="zoom" className="text-sm font-medium text-grafite">
          Zoom
        </label>
        <input
          id="zoom"
          type="range"
          min={1}
          max={4}
          step={0.02}
          value={enquadramento.zoom}
          onChange={(e) =>
            onMudarEnquadramento({ ...enquadramento, zoom: Number(e.target.value) })
          }
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-linha accent-azul"
        />
        <button
          type="button"
          onClick={() => onMudarEnquadramento(ENQUADRAMENTO_INICIAL)}
          className="min-h-11 shrink-0 px-3 text-sm font-medium text-azul underline decoration-1 underline-offset-[6px]"
        >
          Centralizar
        </button>
      </div>

      <p className="mt-2 text-sm text-grafite">
        Arraste a foto para posicionar. No celular, use dois dedos para aproximar.
      </p>
    </div>
  )
}

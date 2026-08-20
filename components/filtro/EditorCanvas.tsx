'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { desenharFoto, type Enquadramento, type FotoCarregada } from '@/lib/imagem'
import type { Moldura } from '@/lib/molduras'

/**
 * A superfície de ajuste: arrasta e dá pinça. Preenche o palco que o
 * fluxo desenha, em vez de trazer moldura e tamanho próprios — assim a
 * prévia não muda de lugar nem de tamanho entre uma etapa e outra, que
 * é o que dá a sensação de aplicativo em vez de formulário.
 *
 * Desenha na resolução da tela e só redesenha em 1080 na exportação.
 * O arraste fica fluido até em celular velho, que é onde o público está.
 *
 * A zona segura visível existe porque rosto cortado pela moldura =
 * resultado ruim = ninguém compartilha.
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
  const molduraRef = useRef<HTMLImageElement | null>(null)
  const [molduraPronta, setMolduraPronta] = useState(false)

  const arraste = useRef<{ x: number; y: number; base: Enquadramento } | null>(null)
  const pinca = useRef<{ distancia: number; zoom: number } | null>(null)

  useEffect(() => {
    let cancelado = false
    setMolduraPronta(false)
    const img = new Image()
    // A arte pode vir do Storage. Sem isto o canvas fica manchado e o
    // toBlob da exportação lança SecurityError.
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

  // O canvas segue a caixa do palco, que já tem a proporção certa.
  useEffect(() => {
    const canvas = canvasRef.current
    const caixa = canvas?.parentElement
    if (!canvas || !caixa) return

    const redimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(caixa.clientWidth * dpr))
      canvas.height = Math.max(1, Math.round(caixa.clientHeight * dpr))
      desenhar()
    }

    redimensionar()
    const ro = new ResizeObserver(redimensionar)
    ro.observe(caixa)
    return () => ro.disconnect()
  }, [desenhar])

  useEffect(() => {
    desenhar()
  }, [desenhar])

  function aoDescer(e: React.PointerEvent<HTMLCanvasElement>) {
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
    arraste.current = { x: e.clientX, y: e.clientY, base: enquadramento }
  }

  function aoMover(e: React.PointerEvent<HTMLCanvasElement>) {
    const a = arraste.current
    const canvas = canvasRef.current
    if (!a || !canvas) return
    const caixa = canvas.getBoundingClientRect()
    const menorLado = Math.min(caixa.width, caixa.height)

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

  function aoTocar(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length !== 2) return
    pinca.current = {
      distancia: distancia(e),
      zoom: enquadramento.zoom,
    }
  }

  function aoMoverToque(e: React.TouchEvent<HTMLCanvasElement>) {
    if (e.touches.length !== 2 || !pinca.current) return
    e.preventDefault()
    const z = Math.min(4, Math.max(1, (pinca.current.zoom * distancia(e)) / pinca.current.distancia))
    onMudarEnquadramento({ ...enquadramento, zoom: z })
  }

  const zs = moldura.zonaSegura

  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={aoDescer}
        onPointerMove={aoMover}
        onPointerUp={aoSubir}
        onPointerCancel={aoSubir}
        onTouchStart={aoTocar}
        onTouchMove={aoMoverToque}
        onTouchEnd={() => (pinca.current = null)}
        className="absolute inset-0 size-full cursor-grab touch-none active:cursor-grabbing"
        aria-label={copy.dicaAjuste}
      />

      {/* Guia da zona segura. O rótulo fica DENTRO da área: a versão
          anterior o pendurava em -top-7, fora de um contêiner com
          overflow-hidden, e ele simplesmente não aparecia. */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-2xl border border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(1,58,103,0.16)]"
        style={{
          left: `${zs.x * 100}%`,
          top: `${zs.y * 100}%`,
          width: `${zs.largura * 100}%`,
          height: `${zs.altura * 100}%`,
        }}
      >
        <span className="absolute top-2 left-2 rounded-full bg-azul-escuro/75 px-3 py-1 text-[0.6875rem] font-medium text-white">
          {copy.avisoZonaSegura}
        </span>
      </div>
    </>
  )
}

function distancia(e: React.TouchEvent): number {
  return Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY,
  )
}

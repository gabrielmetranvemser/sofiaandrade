'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface MunicipioSimples {
  slug: string
  nome: string
}

export function GeradorQr({
  municipios,
  siteUrl,
}: {
  municipios: MunicipioSimples[]
  siteUrl: string
}) {
  const [slug, setSlug] = useState(municipios[0]?.slug ?? '')
  const [tamanho, setTamanho] = useState(1024)
  const [utm, setUtm] = useState('panfleto')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const municipio = municipios.find((m) => m.slug === slug)
  const url = `${siteUrl}/g/${slug}?de=qr${utm ? `&utm_source=${encodeURIComponent(utm)}&utm_medium=impresso` : ''}`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !slug) return
    void QRCode.toCanvas(canvas, url, {
      width: tamanho,
      margin: 2,
      errorCorrectionLevel: 'M', // sobrevive a impressão e a dobra de papel
      color: { dark: '#0d2440ff', light: '#ffffffff' },
    })
  }, [url, tamanho, slug])

  function baixar() {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `qr-${slug}-${tamanho}.png`
    a.click()
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
      <div className="rounded-2xl border border-linha bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="municipio" className="text-sm font-medium">
              Município
            </label>
            <select
              id="municipio"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-linha bg-areia px-3 focus:border-azul/40 focus:bg-white"
            >
              {municipios.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tamanho" className="text-sm font-medium">
              Tamanho do PNG
            </label>
            <select
              id="tamanho"
              value={tamanho}
              onChange={(e) => setTamanho(Number(e.target.value))}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-linha bg-areia px-3 focus:border-azul/40 focus:bg-white"
            >
              <option value={512}>512 px — adesivo pequeno</option>
              <option value={1024}>1024 px — panfleto</option>
              <option value={2048}>2048 px — banner e carro de som</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="utm" className="text-sm font-medium">
              Identificação da peça (utm_source)
            </label>
            <input
              id="utm"
              value={utm}
              onChange={(e) => setUtm(e.target.value.replace(/[^a-z0-9-]/gi, '-').toLowerCase())}
              placeholder="panfleto, adesivo, carro-de-som…"
              className="mt-1.5 min-h-12 w-full rounded-xl border border-linha bg-areia px-3 focus:border-azul/40 focus:bg-white"
            />
            <p className="mt-1.5 text-sm text-grafite">
              Use um nome diferente por peça. É assim que o painel separa o panfleto do adesivo.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-areia p-4">
          <p className="text-sm font-medium">Destino do código</p>
          <p className="mt-1 break-all font-mono text-sm text-grafite">{url}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-linha bg-white p-6 text-center">
        <canvas ref={canvasRef} className="mx-auto size-56 rounded-xl" />
        <p className="mt-4 font-medium">{municipio?.nome}</p>
        <button
          type="button"
          onClick={baixar}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-azul px-6 font-semibold text-white transition-colors hover:bg-azul-escuro"
        >
          Baixar PNG
        </button>
        <p className="mt-3 text-sm text-grafite">
          Teste o código impresso antes de mandar rodar a tiragem.
        </p>
      </div>
    </div>
  )
}

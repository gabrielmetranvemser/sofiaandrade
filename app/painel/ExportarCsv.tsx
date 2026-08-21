'use client'

/**
 * Exportar CSV.
 *
 * Se o Supabase cair ou alguém apagar algo, a campanha ainda tem os
 * links. É a coisa que se agradece depois, não na hora.
 *
 * Gera o arquivo no próprio navegador a partir do que já está na tela —
 * sem endpoint novo, sem chave exposta.
 */
export function ExportarCsv() {
  function exportar() {
    const linhas: string[][] = [['municipio', 'slug', 'ordem', 'status', 'fixado', 'link', 'cliques', 'limite']]

    document.querySelectorAll<HTMLElement>('[data-linha-grupo]').forEach((el) => {
      linhas.push([
        el.dataset.municipio ?? '',
        el.dataset.slug ?? '',
        el.dataset.ordem ?? '',
        el.dataset.status ?? '',
        el.dataset.fixado ?? '',
        el.dataset.link ?? '',
        el.dataset.cliques ?? '',
        el.dataset.limite ?? '',
      ])
    })

    const csv = linhas
      .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grupos-sofia-2233-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={exportar}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-linha bg-white px-5 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M12 3v10.2l3.6-3.6L17 11l-5 5-5-5 1.4-1.4L12 13.2V3ZM5 19h14v2H5v-2Z" />
      </svg>
      Exportar CSV
    </button>
  )
}

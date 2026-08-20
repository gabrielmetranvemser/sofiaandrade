import { MUNICIPIOS } from '@/lib/dados'
import { config } from '@/lib/config'
import { GeradorQr } from './GeradorQr'

export const metadata = { title: 'QR por município', robots: { index: false } }

/**
 * QR POR MUNICÍPIO.
 *
 * Campanha tem adesivo, panfleto, carro de som e evento. Como o QR
 * aponta para /g/nome-da-cidade no domínio próprio, o clique de rua
 * entra na MESMA métrica do clique digital. Passa a dar para saber
 * que o panfleto de Vilhena funcionou.
 */
export default function PainelQr() {
  return (
    <>
      <header>
        <a
          href="/painel/grupos"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Voltar para Grupos
        </a>
        <h1 className="mt-4 titulo-secao">QR por município</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          Um QR por cidade, apontando para{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-sm">/g/nome-da-cidade</code>. Como o
          código aponta para o domínio da campanha, o clique do panfleto entra na mesma métrica do
          clique do site.
        </p>
      </header>

      <GeradorQr
        municipios={MUNICIPIOS.map((m) => ({ slug: m.slug, nome: m.nome }))}
        siteUrl={config.siteUrl}
      />
    </>
  )
}

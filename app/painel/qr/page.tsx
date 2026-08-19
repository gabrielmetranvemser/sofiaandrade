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
        <h1 className="titulo-secao">QR por município</h1>
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

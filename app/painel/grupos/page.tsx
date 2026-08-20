import { listarGrupos, MUNICIPIOS } from '@/lib/dados'
import { config } from '@/lib/config'
import { LinhaGrupo } from './LinhaGrupo'
import { ExportarCsv } from './ExportarCsv'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Grupos', robots: { index: false } }

export default async function PainelGrupos() {
  const grupos = await listarGrupos()

  const porMunicipio = MUNICIPIOS.map((m) => ({
    municipio: m,
    grupos: grupos
      .filter((g) => g.municipio_slug === m.slug)
      .sort((a, b) => a.ordem - b.ordem),
  }))

  const abertos = grupos.filter((g) => g.status === 'aberto').length
  const cheios = grupos.filter((g) => g.status === 'cheio').length
  const cliquesTotais = grupos.reduce((soma, g) => soma + g.cliques, 0)

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="titulo-secao">Grupos</h1>
          <p className="mt-2 text-grafite">
            Um por município, com a ordem de virada. Trocar o link aqui muda o destino de{' '}
            <code className="rounded bg-white px-1.5 py-0.5 text-sm">/g/nome-da-cidade</code> sem
            republicar o site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/painel/grupos/qr"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-linha bg-white px-5 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm8-2h3v3h-3v-3Zm5 0h3v3h-3v-3Zm-5 5h3v3h-3v-3Zm5 0h3v3h-3v-3Z" />
            </svg>
            Gerar QR
          </a>
          <ExportarCsv />
        </div>
      </header>

      <dl className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { r: 'Municípios', v: MUNICIPIOS.length },
          { r: 'Grupos abertos', v: abertos },
          { r: 'Grupos cheios', v: cheios },
          { r: 'Cliques contados', v: cliquesTotais },
        ].map((c) => (
          <div key={c.r} className="rounded-2xl border border-linha bg-white p-5">
            <dt className="text-sm text-grafite">{c.r}</dt>
            <dd className="mt-1 font-[family-name:var(--font-titulo)] text-3xl font-bold tabular-nums">
              {c.v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 space-y-3">
        {porMunicipio.map(({ municipio, grupos: doMunicipio }) => (
          <section
            key={municipio.slug}
            className="rounded-2xl border border-linha bg-white p-5 md:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg">{municipio.nome}</h2>
                <p className="text-sm text-grafite">
                  <code className="rounded bg-areia px-1.5 py-0.5">/g/{municipio.slug}</code>
                </p>
              </div>
              <a
                href={`/g/${municipio.slug}?de=direto`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-linha px-5 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
              >
                Testar
              </a>
            </div>

            <div className="mt-4 space-y-3">
              {doMunicipio.length === 0 ? (
                <p className="rounded-xl border border-dashed border-linha px-4 py-5 text-sm text-grafite">
                  Nenhum grupo cadastrado para este município.
                </p>
              ) : (
                doMunicipio.map((g) => (
                  <LinhaGrupo
                    key={g.id}
                    grupo={g}
                    editavel={config.supabaseAtivo}
                    municipioNome={municipio.nome}
                  />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

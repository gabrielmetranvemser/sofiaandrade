import Link from 'next/link'
import { ESQUEMA, GRUPOS_MENU } from '@/content/esquema'
import { config } from '@/lib/config'
import { criarClienteAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Textos', robots: { index: false } }

export default async function ListaTextos() {
  const editadas = await secoesEditadas()

  return (
    <>
      <header>
        <h1 className="titulo-secao">Textos</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          Tudo que é texto na página pública. Salvar aqui muda o site na hora, sem publicar de novo.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {GRUPOS_MENU.map((grupo) => {
          const secoes = Object.entries(ESQUEMA).filter(([, s]) => s.grupo === grupo)
          if (secoes.length === 0) return null
          return (
            <section key={grupo}>
              <h2 className="text-sm font-semibold tracking-[0.06em] text-grafite uppercase">
                {grupo}
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {secoes.map(([chave, s]) => (
                  <li key={chave}>
                    <Link
                      href={`/painel/textos/${chave}`}
                      className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-linha bg-white px-5 transition-colors hover:border-azul/30"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{s.rotulo}</span>
                        <span className="block text-xs text-grafite">
                          {Object.keys(s.campos).length} campos
                        </span>
                      </span>
                      {editadas.has(chave) ? (
                        <span className="shrink-0 rounded-full bg-verde-suave px-2.5 py-0.5 text-xs font-medium text-verde">
                          editada
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}

async function secoesEditadas(): Promise<Set<string>> {
  const editadas = new Set<string>()
  if (!config.supabaseAtivo) return editadas
  const sb = criarClienteAdmin()
  if (!sb) return editadas
  const { data } = await sb.from('conteudo').select('secao, dados')
  for (const l of (data ?? []) as { secao: string; dados: unknown }[]) {
    if (l.dados && Object.keys(l.dados).length > 0) editadas.add(l.secao)
  }
  return editadas
}

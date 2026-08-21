import Link from 'next/link'
import { SECOES_DE_IDENTIDADE } from '@/content/mapa'
import { config } from '@/lib/config'
import { lerSlots } from '@/lib/midia/ler'
import { criarClienteAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Identidade', robots: { index: false } }

/**
 * IDENTIDADE — tudo que vale para o site inteiro.
 *
 * ⚠️ POR QUE SEPARADO DAS SEÇÕES. Estava tudo na mesma lista, e a
 *    diferença entre as duas coisas não é de tipo, é de FREQUÊNCIA:
 *    conteúdo se mexe toda semana; nome, número, CNPJ e ícone se
 *    definem uma vez e quase não se tocam. Misturados, a lista de
 *    seções abria com quatro itens que ninguém estava procurando — e
 *    quem procurava o favicon tinha de saber que ele morava dentro de
 *    "Busca e compartilhamento".
 *
 * Os grupos abaixo são os do próprio esquema. A ordem foi escolhida
 * pela pergunta que a pessoa traz: primeiro quem é, depois como
 * aparece, depois o que se repete, por último o que a lei exige.
 */
const ORDEM_DOS_GRUPOS = ['Identidade', 'Textos gerais'] as const

const EXPLICACAO: Record<string, string> = {
  Identidade: 'Quem é a candidata, como o site se veste e como ele aparece na busca.',
  'Textos gerais': 'Textos que se repetem em vários pontos do site.',
}

export default async function PaginaIdentidade() {
  const [imagens, editadas] = await Promise.all([lerSlots(), secoesEditadas()])

  return (
    <>
      <header>
        <h1 className="titulo-secao">Identidade</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          O que vale para o site inteiro: nome e número, marca e ícone, cores e textura, o cartão
          que aparece ao compartilhar o link, e a identificação eleitoral do rodapé.
        </p>
      </header>

      <div className="mt-8 space-y-10">
        {ORDEM_DOS_GRUPOS.map((grupo) => {
          const secoes = SECOES_DE_IDENTIDADE.filter((s) => s.grupo === grupo)
          if (secoes.length === 0) return null

          return (
            <section key={grupo}>
              <h2 className="text-sm font-semibold tracking-[0.06em] text-grafite uppercase">
                {grupo}
              </h2>
              {EXPLICACAO[grupo] ? (
                <p className="mt-1 text-sm text-grafite">{EXPLICACAO[grupo]}</p>
              ) : null}

              <ul className="mt-3 grid gap-3 lg:grid-cols-2">
                {secoes.map((s) => {
                  const cheias = s.espacos.filter((e) => imagens[e.chave]).length
                  return (
                    <li key={s.chave}>
                      <Link
                        href={`/painel/secoes/${s.chave}`}
                        className="flex h-full flex-col gap-2 rounded-2xl border border-linha bg-white p-5 transition-colors hover:border-azul/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-medium">{s.rotulo}</span>
                          {editadas.has(s.chave) ? (
                            <span className="shrink-0 rounded-full bg-verde-suave px-2.5 py-0.5 text-xs font-medium text-verde">
                              editada
                            </span>
                          ) : null}
                        </div>

                        {s.resumo ? (
                          <p className="text-sm leading-relaxed text-grafite">{s.resumo}</p>
                        ) : null}

                        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-grafite">
                          <span>
                            <span className="font-medium tabular-nums">
                              {s.camposDeTexto.length}
                            </span>{' '}
                            campos
                          </span>
                          {s.espacos.length > 0 ? (
                            <span>
                              <span
                                className={`tabular-nums ${
                                  cheias < s.espacos.length
                                    ? 'font-semibold text-azul'
                                    : 'font-medium'
                                }`}
                              >
                                {cheias}/{s.espacos.length}
                              </span>{' '}
                              {s.chave === 'candidata' ? 'marca' : 'imagens'}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <p className="mt-10 rounded-2xl border border-linha bg-white px-5 py-4 text-sm text-grafite">
        <strong className="font-medium text-tinta">Onde fica a marca?</strong> O símbolo do
        cabeçalho está em <em>A candidata</em>, aba Imagens. O ícone do navegador está em{' '}
        <em>Busca e compartilhamento</em>. Os dois aparecem em toda página do site, e por isso não
        pertencem a nenhuma seção.
      </p>
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

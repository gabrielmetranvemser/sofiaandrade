import Link from 'next/link'
import { SECOES_DA_PAGINA } from '@/content/mapa'
import { config } from '@/lib/config'
import { lerConteudoFresco } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { destinosDeVideo } from '@/lib/painel/videos'
import { criarClienteAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Seções', robots: { index: false } }

/**
 * A LISTA DE SEÇÕES — a porta de entrada da edição.
 *
 * ⚠️ NA ORDEM DA PÁGINA, de cima para baixo. Era alfabética por grupo,
 *    e alfabética é a ordem de quem arquiva, não a de quem edita. Quem
 *    abre o painel tem a página na cabeça: "o bloco depois das fotos",
 *    "o penúltimo antes do rodapé". A lista agora acompanha esse
 *    percurso.
 *
 * Cada cartão diz o que a seção contém — quantos textos, quantas
 * imagens já enviadas, quantos vídeos preenchidos — para a pessoa
 * escolher onde entrar sem precisar entrar para descobrir.
 */
export default async function ListaSecoes() {
  const [conteudo, imagens, editadas] = await Promise.all([
    lerConteudoFresco(),
    lerSlots(),
    secoesEditadas(),
  ])

  const videos = destinosDeVideo(conteudo)
  const interruptores = conteudo.exibir as unknown as Record<string, boolean>

  return (
    <>
      <header>
        <h1 className="titulo-secao">Seções</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          A página inteira, na ordem em que ela aparece no site. Dentro de cada seção estão os
          textos, as imagens e os vídeos dela — tudo no mesmo lugar. Salvar muda o site na hora,
          sem publicar de novo.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-grafite">
          Nome, marca, cores, SEO e rodapé ficam em{' '}
          <Link href="/painel/identidade" className="font-medium text-azul underline decoration-1 underline-offset-2">
            Identidade
          </Link>
          .
        </p>
      </header>

      <div className="mt-8">
        <ul className="grid gap-3 lg:grid-cols-2">
          {SECOES_DA_PAGINA.map((s) => {
            const daSecao = videos.filter((v) => v.secao === s.chave)
            const videosCheios = daSecao.filter((v) => v.url.trim()).length
            const imagensCheias = s.espacos.filter((e) => imagens[e.chave]).length
            const desligada = s.chave in interruptores && !interruptores[s.chave]

            return (
              <li key={s.chave}>
                <Link
                  href={`/painel/secoes/${s.chave}`}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-linha bg-white p-5 transition-colors hover:border-azul/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium">{s.rotulo}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {desligada ? (
                        <span className="rounded-full bg-areia px-2.5 py-0.5 text-xs text-grafite">
                          desligada
                        </span>
                      ) : null}
                      {editadas.has(s.chave) ? (
                        <span className="rounded-full bg-verde-suave px-2.5 py-0.5 text-xs font-medium text-verde">
                          editada
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {s.resumo ? (
                    <p className="text-sm leading-relaxed text-grafite">{s.resumo}</p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-grafite">
                    <Conta rotulo="textos" valor={`${s.camposDeTexto.length}`} />
                    {s.espacos.length > 0 ? (
                      <Conta
                        rotulo="imagens"
                        valor={`${imagensCheias}/${s.espacos.length}`}
                        alerta={imagensCheias < s.espacos.length}
                      />
                    ) : null}
                    {daSecao.length > 0 ? (
                      <Conta
                        rotulo="vídeos"
                        valor={`${videosCheios}/${daSecao.length}`}
                        alerta={videosCheios < daSecao.length}
                      />
                    ) : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

function Conta({
  rotulo,
  valor,
  alerta = false,
}: {
  rotulo: string
  valor: string
  alerta?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`tabular-nums ${alerta ? 'font-semibold text-azul' : 'font-medium'}`}>
        {valor}
      </span>
      {rotulo}
    </span>
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

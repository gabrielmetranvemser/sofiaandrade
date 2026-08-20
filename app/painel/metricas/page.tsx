import { carregarMetricas, somarFunil, type LinhaOrigem } from '@/lib/metricas'
import { Aviso } from '@/components/ui/Aviso'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Métricas', robots: { index: false } }

function Barra({ rotulo, valor, maximo, secundario }: { rotulo: string; valor: number; maximo: number; secundario?: number }) {
  const pct = maximo > 0 ? Math.round((valor / maximo) * 100) : 0
  return (
    <li className="py-2.5">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="truncate font-medium">{rotulo}</span>
        <span className="shrink-0 text-grafite tabular-nums">
          {valor}
          {secundario !== undefined ? ` · ${secundario} pessoas` : ''}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-areia">
        <div className="h-full rounded-full bg-azul transition-all" style={{ width: `${pct}%` }} />
      </div>
    </li>
  )
}

/**
 * Duas barras por origem: a clara é quem apertou o botão, a cheia é
 * quem entrou no grupo. A distância entre as duas é o que interessa —
 * botão muito clicado com pouca entrada é botão que promete e não entrega.
 */
function LinhaDeOrigem({ origem, maximo }: { origem: LinhaOrigem; maximo: number }) {
  const pctBotao = maximo > 0 ? Math.round((origem.cliquesNoBotao / maximo) * 100) : 0
  const pctEntrada = maximo > 0 ? Math.round((origem.entradas / maximo) * 100) : 0
  const conversao =
    origem.cliquesNoBotao > 0
      ? Math.round((origem.entradas / origem.cliquesNoBotao) * 100)
      : null

  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="truncate font-medium">{origem.rotulo}</span>
        <span className="shrink-0 text-grafite tabular-nums">
          {origem.cliquesNoBotao} → {origem.entradas}
          {conversao !== null ? ` · ${conversao}%` : ''}
        </span>
      </div>
      <div className="mt-1.5 space-y-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-areia">
          <div className="h-full rounded-full bg-azul/30" style={{ width: `${pctBotao}%` }} />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-areia">
          <div className="h-full rounded-full bg-azul" style={{ width: `${pctEntrada}%` }} />
        </div>
      </div>
    </li>
  )
}

function Painel({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-linha bg-white p-6">
      <h2 className="text-lg">{titulo}</h2>
      {nota ? <p className="mt-1 text-sm text-grafite">{nota}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default async function PainelMetricas() {
  const m = await carregarMetricas()
  const hoje = somarFunil(m.funil, 1)
  const mes = somarFunil(m.funil, 30)

  const maxMunicipio = Math.max(1, ...m.porMunicipio.map((x) => x.cliques))
  const maxOrigem = Math.max(1, ...m.porOrigem.map((x) => Math.max(x.cliquesNoBotao, x.entradas)))
  const maxUtm = Math.max(1, ...m.porUtm.map((x) => x.valor))
  const maxDisp = Math.max(1, ...m.porDispositivo.map((x) => x.valor))

  const etapas = [
    { r: 'Abriram a página', v: mes.viram },
    { r: 'Rolaram metade', v: mes.rolaramMetade },
    { r: 'Buscaram a cidade', v: mes.buscaram },
    { r: 'Apertaram um botão de grupo', v: mes.clicaramCta },
    { r: 'Entraram no grupo', v: mes.clicaram },
    { r: 'Abriram o filtro', v: mes.abriramFiltro },
    { r: 'Geraram a foto', v: mes.geraram },
    { r: 'Salvaram ou compartilharam', v: mes.salvaram },
  ]

  return (
    <>
      <header>
        <h1 className="titulo-secao">Métricas</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          De cada 100 pessoas que abrem a página, quantas buscam cidade, quantas clicam no grupo e
          quantas fazem o filtro. É esse número que diz se o problema é a copy, o botão ou o grupo.
        </p>
      </header>

      {!m.ativo ? (
        <Aviso tom="alerta" className="mt-6">
          <strong className="font-semibold">Sem dados ainda.</strong> As telas abaixo estão montadas
          e passam a preencher sozinhas assim que o Supabase for conectado e os primeiros eventos
          chegarem em <code className="rounded bg-white/70 px-1.5 py-0.5">/api/evento</code>.
        </Aviso>
      ) : null}

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { r: 'Visitas hoje', v: hoje.viram },
          { r: 'Cliques em grupo hoje', v: hoje.clicaram },
          { r: 'Conversão em grupo (30d)', v: `${mes.taxaClique.toFixed(1)}%` },
          { r: 'Fizeram o filtro (30d)', v: `${mes.taxaFiltro.toFixed(1)}%` },
        ].map((c) => (
          <div key={c.r} className="rounded-2xl border border-linha bg-white p-5">
            <dt className="text-sm text-grafite">{c.r}</dt>
            <dd className="mt-1 font-[family-name:var(--font-titulo)] text-3xl font-bold tabular-nums">
              {c.v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Painel titulo="Funil dos últimos 30 dias" nota="Cada etapa em relação a quem abriu a página.">
          <ul>
            {etapas.map((e) => (
              <Barra key={e.r} rotulo={e.r} valor={e.v} maximo={Math.max(1, mes.viram)} />
            ))}
          </ul>
        </Painel>

        <Painel
          titulo="Qual botão trabalha"
          nota="Quantos apertaram o botão × quantos entraram no grupo de fato. Em duas semanas isto diz qual CTA é enfeite."
        >
          {m.porOrigem.length ? (
            <ul>
              {m.porOrigem.map((o) => (
                <LinhaDeOrigem key={o.rotulo} origem={o} maximo={maxOrigem} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-grafite">Nenhum clique registrado ainda.</p>
          )}
        </Painel>

        <Painel titulo="Cliques por município" nota="Onde a campanha pegou e onde não pegou.">
          {m.porMunicipio.length ? (
            <ul className="max-h-96 overflow-y-auto pr-1">
              {m.porMunicipio.map((x) => (
                <Barra
                  key={x.slug}
                  rotulo={x.nome}
                  valor={x.cliques}
                  maximo={maxMunicipio}
                  secundario={x.pessoas}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-grafite">Nenhum clique registrado ainda.</p>
          )}
        </Painel>

        <div className="grid gap-4">
          <Painel titulo="Origem do tráfego" nota="Visitas por UTM. Serve para medir tráfego pago.">
            {m.porUtm.length ? (
              <ul>
                {m.porUtm.map((u) => (
                  <Barra key={u.rotulo} rotulo={u.rotulo} valor={u.valor} maximo={maxUtm} secundario={u.secundario} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-grafite">Sem dados.</p>
            )}
          </Painel>

          <Painel titulo="Celular vs desktop">
            {m.porDispositivo.length ? (
              <ul>
                {m.porDispositivo.map((d) => (
                  <Barra key={d.rotulo} rotulo={d.rotulo} valor={d.valor} maximo={maxDisp} secundario={d.secundario} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-grafite">Sem dados.</p>
            )}
          </Painel>
        </div>
      </div>
    </>
  )
}

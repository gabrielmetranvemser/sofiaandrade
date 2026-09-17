'use client'

import { createContext, useContext, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import type { Destino, MunicipioComGrupo } from '@/lib/tipos'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'
import dynamic from 'next/dynamic'
import { BotaoEntrarNoGrupo, type TextosDoBotao } from './BotaoEntrarNoGrupo'

/**
 * A CIDADE DA PÁGINA DE ENTRADA, que a pessoa pode trocar.
 *
 * ⚠️ UMA CIDADE SÓ NA TELA, sempre. A primeira versão tinha a cidade do
 *    anúncio desenhada no servidor — título e botão verde — e a busca de
 *    "Não é de Cabixi?" com painel e botão próprios. No teste da campanha,
 *    escolher Porto Velho fez aparecer um segundo botão, azul, "Entrar no
 *    grupo de Porto Velho", embaixo do verde que continuava dizendo
 *    Cabixi. Dois botões, duas cidades: confusão no único lugar da página
 *    que precisava ser óbvio.
 *
 *    Agora a cidade mora aqui. O título, os marcadores, o link de trocar
 *    e os DOIS botões verdes (o do topo e o da dobra azul) leem daqui, e a
 *    busca só escolhe — quem desenha o botão é a página.
 */

const ID_DO_BOTAO = 'entrar-no-grupo'

/**
 * A busca só baixa quando alguém abre "Não é de…?".
 *
 * Quase todo mundo que chega pelo anúncio é da cidade do anúncio e toca
 * direto no botão. A busca (componente, geolocalização, comparação de
 * nomes) era JavaScript que todo celular baixava e executava para uma
 * minoria usar — no PageSpeed de 17/09, tarefa longa na abertura.
 */
const BuscadorDeGrupo = dynamic(
  () => import('./BuscadorDeGrupo').then((m) => m.BuscadorDeGrupo),
  { ssr: false },
)

type Tom = ComponentProps<typeof TextoComDestaque>['tom']

const Contexto = createContext<{
  destino: Destino
  trocar: (d: Destino) => void
  /** A cidade mudou depois de a página abrir? Liga a animação do botão. */
  mudou: boolean
} | null>(null)

function useEntrada() {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('EntradaDoGrupo fora de <EntradaProvider>.')
  return valor
}

function comCidade(modelo: string, nome: string): string {
  return modelo.replaceAll('{cidade}', nome)
}

export function EntradaProvider({ inicial, children }: { inicial: Destino; children: ReactNode }) {
  const [destino, setDestino] = useState(inicial)
  const slugInicial = useRef(inicial.slug)

  return (
    <Contexto.Provider
      value={{ destino, trocar: setDestino, mudou: destino.slug !== slugInicial.current }}
    >
      {children}
    </Contexto.Provider>
  )
}

/** Um texto do painel com `{cidade}` trocado pela cidade da vez. */
export function TextoDaCidade({ modelo, tom }: { modelo: string; tom?: Tom }) {
  const { destino } = useEntrada()
  return <TextoComDestaque texto={comCidade(modelo, destino.nome)} tom={tom} />
}

export function MarcadoresDaCidade({ itens }: { itens: { id: string; texto: string }[] }) {
  const { destino } = useEntrada()
  if (itens.length === 0) return null

  return (
    <ul className="mt-7 grid gap-2.5">
      {itens.map((item) => (
        <li key={item.id} className="flex items-start gap-3 text-[1.0625rem] leading-snug text-tinta">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-verde" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>
            <TextoComDestaque texto={comCidade(item.texto, destino.nome)} tom="verde" />
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * O botão verde da cidade da vez — ou, com o grupo dela fechado, a
 * situação no lugar do botão.
 *
 * `principal` marca o do topo: é para ele que a página rola depois de
 * uma troca de cidade.
 */
export function AcaoDaEntrada({
  rotuloDe,
  nota,
  textos,
  situacoes,
  principal = false,
  sobreEscuro = false,
  className = '',
}: {
  /** "Entrar no grupo de", de Botões do site. */
  rotuloDe: string
  nota?: string
  textos: TextosDoBotao
  /** Rótulos e explicações de grupo cheio e em breve, da seção Grupos. */
  situacoes: { cheio: string; emBreve: string; avisoCheio: string; avisoEmBreve: string }
  principal?: boolean
  sobreEscuro?: boolean
  className?: string
}) {
  const { destino, mudou } = useEntrada()
  const cheio = destino.status === 'cheio'

  return (
    <div
      id={principal ? ID_DO_BOTAO : undefined}
      className={`scroll-mt-24 ${className}`}
    >
      {/* `key` pela cidade: trocar de cidade remonta o bloco, zera o
          "Abrindo o WhatsApp…" do botão anterior e, depois da primeira
          troca, repete a entrada animada — o olho percebe que mudou. */}
      <div key={destino.slug} className={mudou ? 'anima-etapa' : undefined}>
        {destino.disponivel ? (
          <>
            <BotaoEntrarNoGrupo
              slug={destino.slug}
              municipioSlug={destino.municipioSlug ?? destino.slug}
              rotulo={`${rotuloDe} ${destino.nome}`}
              textos={textos}
            />
            {nota ? (
              <p className={`mt-3 text-center text-sm ${sobreEscuro ? 'text-white/70' : 'text-grafite'}`}>
                {nota}
              </p>
            ) : null}
          </>
        ) : (
          <div
            role="status"
            className={`rounded-2xl p-5 ${sobreEscuro ? 'bg-white/10 ring-1 ring-white/15' : 'bg-azul-suave'}`}
          >
            <p className={`etiqueta ${sobreEscuro ? 'text-amarelo' : 'text-azul-escuro'}`}>
              {destino.nome} · {cheio ? situacoes.cheio : situacoes.emBreve}
            </p>
            <p className={`mt-2 text-base ${sobreEscuro ? 'text-white/80' : 'text-grafite'}`}>
              {cheio ? situacoes.avisoCheio : situacoes.avisoEmBreve}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * "Não é de Cabixi? Escolher outra cidade" e a busca que ele abre.
 *
 * A busca volta fechada depois da escolha, e a página rola até o botão
 * do topo — que é onde a troca aparece.
 */
export function TrocarCidade({
  rotulo,
  municipios,
}: {
  rotulo: string
  municipios: MunicipioComGrupo[]
}) {
  const { destino, trocar } = useEntrada()
  const [aberta, setAberta] = useState(false)

  function escolher(novo: Destino) {
    trocar(novo)
    setAberta(false)
    // Depois do próximo desenho, quando o botão já diz a cidade nova.
    requestAnimationFrame(() => {
      document.getElementById(ID_DO_BOTAO)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  return (
    <div className="mt-7">
      <button
        type="button"
        aria-expanded={aberta}
        onClick={() => setAberta((v) => !v)}
        className="inline-flex min-h-12 items-center text-left text-base font-semibold text-grafite underline decoration-1 underline-offset-[6px]"
      >
        <TextoComDestaque texto={comCidade(rotulo, destino.nome)} tom="verde" />
      </button>

      {aberta ? (
        <BuscadorDeGrupo municipios={municipios} aoEscolher={escolher} className="anima-etapa mt-3" />
      ) : null}
    </div>
  )
}

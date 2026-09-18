'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { sair } from '../acoes'

/**
 * Menu lateral do painel.
 *
 * ⚠️ OS DESTINOS MUDARAM DE EIXO. Eram "Textos" e "Imagens" — o
 *    painel organizado por TIPO de coisa. Quem edita não pensa assim:
 *    pensa "quero mexer no bloco da rua", e tinha de visitar duas telas
 *    para isso. Agora a porta de entrada é "Seções", e dentro de cada
 *    uma estão os textos, as imagens e os vídeos dela.
 *
 *    "Vídeos" ganhou destino próprio mesmo já existindo dentro de cada
 *    seção, e a duplicação é deliberada: as duas telas servem tarefas
 *    diferentes. Editar uma seção é trabalho de redação; subir os
 *    dezessete vídeos de uma vez, com os arquivos na mão, é trabalho de
 *    produção — e forçar quem faz o segundo a percorrer seis seções
 *    seria devolver a ele um problema de arrumação que é nosso.
 *
 * O item ativo é visível e anunciado (`aria-current`).
 *
 * No celular vira uma gaveta: o painel é usado no telefone de um
 * coordenador em carreata, não só no desktop do escritório.
 */

export interface ItemMenu {
  href: string
  rotulo: string
  icone: string
}

export const ITENS: ItemMenu[] = [
  { href: '/painel', rotulo: 'Início', icone: 'M4 12 12 4l8 8v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z' },
  { href: '/painel/secoes', rotulo: 'Seções', icone: 'M4 4h16v4H4V4Zm0 6h16v4H4v-4Zm0 6h16v4H4v-4Z' },
  { href: '/painel/videos', rotulo: 'Vídeos', icone: 'M4 5h11a2 2 0 0 1 2 2v2.4l4-2.6v10.4l-4-2.6V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h11V7H4Z' },
  { href: '/painel/identidade', rotulo: 'Identidade', icone: 'M12 2 3 6v6c0 5 3.8 9.4 9 10 5.2-.6 9-5 9-10V6l-9-4Zm0 2.2 7 3.1V12c0 4-2.9 7.6-7 8.2-4.1-.6-7-4.2-7-8.2V7.3l7-3.1ZM12 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm0 6.2c1.9 0 4.5.9 4.5 2.1V17h-9v-1.7c0-1.2 2.6-2.1 4.5-2.1Z' },
  { href: '/painel/grupos', rotulo: 'Grupos', icone: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 6.3 12.9l-2.1-2.1a5 5 0 1 0-8.4 0l-2.1 2.1A8 8 0 0 1 12 4Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z' },
  // Vizinho de Grupos porque as duas telas respondem à mesma pergunta:
  // qual endereço a campanha espalha, e o que acontece depois que
  // alguém toca nele. Os textos e os botões da bio ficam em Seções,
  // com prévia e histórico, como os de qualquer outra seção.
  { href: '/painel/bio', rotulo: 'Link da bio', icone: 'M3.9 12a5 5 0 0 1 5-5h3v1.9h-3a3.1 3.1 0 0 0 0 6.2h3V17h-3a5 5 0 0 1-5-5Zm5.1 1h6v-2H9v2Zm6.1-6h-3v1.9h3a3.1 3.1 0 0 1 0 6.2h-3V17h3a5 5 0 0 0 0-10Z' },
  { href: '/painel/metricas', rotulo: 'Métricas', icone: 'M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z' },
  // Tráfego é vizinho de Métricas de propósito: as duas respondem à
  // mesma pergunta em escalas diferentes — Métricas conta o que
  // aconteceu aqui dentro, Tráfego entrega o mesmo fato ao anúncio lá
  // fora. Quem procura uma quase sempre acaba precisando da outra.
  { href: '/painel/trafego', rotulo: 'Tráfego', icone: 'M12 2a3 3 0 0 1 3 3v3a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Zm0 8a3 3 0 0 1 3 3v3a3 3 0 0 1-6 0v-3a3 3 0 0 1 3-3Zm0 8a3 3 0 0 1 3 3H9a3 3 0 0 1 3-3ZM5 7h2v2H5V7Zm12 0h2v2h-2V7ZM5 15h2v2H5v-2Zm12 0h2v2h-2v-2Z' },
  // Depois de Tráfego, e no fim da lista, porque é a tela que se abre
  // MENOS: cadastrar o site no Search Console é tarefa de uma vez só.
  { href: '/painel/buscas', rotulo: 'Buscas', icone: 'M10 2a8 8 0 0 1 6.32 12.9l5.39 5.39-1.42 1.42-5.39-5.39A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z' },
]

export function MenuLateral({
  children,
  modoLocal,
}: {
  children: React.ReactNode
  /** Supabase desconectado: o painel lê dados locais e não grava. */
  modoLocal: boolean
}) {
  const caminho = usePathname()
  const [aberto, setAberto] = useState(false)

  // ⚠️ A TELA DE ENTRAR NÃO USA NADA DISTO, e a saída é antecipada em
  //    vez de escondida com CSS: markup escondido continua no HTML, e
  //    o que este bloco lista é o mapa do painel inteiro — quais telas
  //    existem e para onde levam. Isso é informação para quem já
  //    entrou. Quem está na porta vê só a porta.
  //
  //    A faixa de "Modo local" veio junto pelo mesmo motivo: ela conta
  //    o estado da conexão com o banco, que é diagnóstico interno.
  if (caminho.startsWith('/painel/login')) return <>{children}</>

  const ativo = (href: string) =>
    href === '/painel' ? caminho === '/painel' : caminho.startsWith(href)

  const lista = (
    <nav className="flex flex-col gap-1" aria-label="Seções do painel">
      {ITENS.map((item) => {
        const on = ativo(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? 'page' : undefined}
            onClick={() => setAberto(false)}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium transition-colors ${
              on ? 'bg-azul text-white' : 'text-grafite hover:bg-azul-suave hover:text-azul-escuro'
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden>
              <path d={item.icone} />
            </svg>
            {item.rotulo}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {modoLocal ? (
        <div className="border-b border-amarelo/30 bg-amarelo-suave">
          <p className="px-4 py-3 text-sm md:px-8">
            <strong className="font-semibold">Modo local.</strong> O Supabase não está conectado —
            o painel mostra os dados de{' '}
            <code className="rounded bg-white/70 px-1.5 py-0.5">data/grupos.local.json</code> e a
            edição está desligada.
          </p>
        </div>
      ) : null}

      {/* Barra do celular */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-linha bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-linha"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
          </svg>
        </button>
        <span className="font-[family-name:var(--font-titulo)] font-bold tracking-[-0.02em]">
          Painel
        </span>
      </div>

      {aberto ? (
        <div className="border-b border-linha bg-white p-3 lg:hidden">
          {lista}
          <form action={sair} className="mt-1 border-t border-linha pt-1">
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[0.9375rem] font-medium text-grafite"
            >
              Sair
            </button>
          </form>
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[15rem_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-linha bg-white p-4 lg:flex">
          <Link href="/painel" className="mb-6 flex items-center gap-3 px-1">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-azul text-[0.8125rem] font-bold text-white">
              2233
            </span>
            <span className="leading-tight">
              <span className="block font-[family-name:var(--font-titulo)] text-[0.9375rem] font-bold tracking-[-0.02em]">
                Painel
              </span>
              <span className="block text-xs text-grafite">Sofia Andrade</span>
            </span>
          </Link>

          {lista}

          <div className="mt-auto space-y-1 border-t border-linha pt-4">
            <Link
              href="/"
              target="_blank"
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9375rem] font-medium text-grafite transition-colors hover:bg-areia"
            >
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden>
                <path d="M14 3v2h3.6l-8.3 8.3 1.4 1.4L19 6.4V10h2V3h-7ZM5 5h5v2H7v10h10v-3h2v5H5V5Z" />
              </svg>
              Ver o site
            </Link>
            {/* Sair é ação, não destino — fica separado, depois da linha. */}
            <form action={sair}>
              <button
                type="submit"
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[0.9375rem] font-medium text-grafite transition-colors hover:bg-areia"
              >
                <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden>
                  <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3Zm6.6 3.6L15.2 8l3 3H9v2h9.2l-3 3 1.4 1.4L22 12l-5.4-5.4Z" />
                </svg>
                Sair
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </>
  )
}

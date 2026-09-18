'use client'

import { useMemo, useState } from 'react'
import { ehIcone, ICONES, ICONES_POR_GRUPO } from '@/lib/icones'
import { Icone } from '@/components/ui/Icone'

/**
 * A GRADE DE ÍCONES.
 *
 * ⚠️ NÃO É UM `<select>`, e a diferença não é estética: ninguém escolhe
 *    um desenho lendo o nome dele numa lista. "map-pin" e "navigation"
 *    são a mesma frase para quem está montando um botão; os dois
 *    desenhos, lado a lado, se decidem em meio segundo.
 *
 * ⚠️ FECHADA POR PADRÃO. São 85 desenhos, e eles ficam dentro de um
 *    repetidor que pode ter doze linhas abertas ao mesmo tempo — mil
 *    ícones numa tela, para escolher cinco. Aberta só quando alguém
 *    vai trocar.
 *
 * ⚠️ A BUSCA PROCURA PELOS DOIS NOMES: o em português, que é o que a
 *    pessoa tem na cabeça ("trator"), e o do Lucide, que é o que ela
 *    copia de lucide.dev quando foi procurar lá fora ("tractor"). É a
 *    promessa que o texto de ajuda faz, e ela precisa se cumprir aqui.
 */
export function SeletorDeIcone({
  id,
  rotulo,
  ajuda,
  valor,
  onMudar,
}: {
  id: string
  rotulo: string
  ajuda?: string
  valor: string
  onMudar: (valor: string) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')

  const escolhido = ehIcone(valor) ? valor : ''

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return ICONES_POR_GRUPO
    return ICONES_POR_GRUPO.map(
      ([grupo, itens]) =>
        [
          grupo,
          itens.filter(
            (i) => i.nome.includes(termo) || i.rotulo.toLowerCase().includes(termo),
          ),
        ] as const,
    ).filter(([, itens]) => itens.length > 0)
  }, [busca])

  const achou = grupos.reduce((n, [, itens]) => n + itens.length, 0)

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span id={`${id}-rotulo`} className="text-sm font-medium">
          {rotulo}
        </span>
        {escolhido ? (
          <button
            type="button"
            onClick={() => onMudar('')}
            className="text-xs font-medium text-grafite underline decoration-1 underline-offset-2 hover:text-azul"
          >
            usar o padrão
          </button>
        ) : null}
      </div>

      <button
        type="button"
        id={id}
        aria-expanded={aberto}
        aria-describedby={`${id}-rotulo`}
        onClick={() => setAberto((v) => !v)}
        className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-linha bg-areia px-3 text-left text-[0.9375rem] transition-colors hover:border-azul/30"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-azul ring-1 ring-linha">
          {escolhido ? (
            <Icone nome={escolhido} className="size-[1.125rem]" />
          ) : (
            <span aria-hidden className="text-xs text-grafite">
              —
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {escolhido ? (
            <>
              {ICONES[escolhido].rotulo}{' '}
              <span className="font-mono text-xs text-grafite">{escolhido}</span>
            </>
          ) : (
            <span className="text-grafite">O ícone da função escolhida</span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`size-4 shrink-0 text-grafite transition-transform ${aberto ? 'rotate-180' : ''}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 15.4 5.6 9l1.4-1.4 5 5 5-5L18.4 9 12 15.4Z" />
        </svg>
      </button>

      {aberto ? (
        <div className="mt-2 rounded-xl border border-linha bg-white p-3">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar: grupo, trator, tractor…"
            aria-label="Procurar ícone"
            className="min-h-11 w-full rounded-lg border border-linha bg-areia px-3 text-sm transition-colors focus:border-azul/40 focus:bg-white"
          />

          <div className="mt-3 max-h-72 overflow-y-auto pr-1">
            {achou === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-grafite">
                Nenhum ícone com esse nome. Procure em{' '}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-azul underline decoration-1 underline-offset-2"
                >
                  lucide.dev
                </a>{' '}
                e peça para incluirmos.
              </p>
            ) : (
              grupos.map(([grupo, itens]) => (
                <div key={grupo} className="mb-3 last:mb-0">
                  <p className="mb-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] text-grafite uppercase">
                    {grupo}
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
                    {itens.map((i) => {
                      const on = i.nome === escolhido
                      return (
                        <button
                          key={i.nome}
                          type="button"
                          aria-pressed={on}
                          // O nome em português e o do Lucide juntos:
                          // é o que um leitor de tela anuncia, e é o
                          // que aparece ao parar o cursor em cima.
                          title={`${i.rotulo} · ${i.nome}`}
                          aria-label={`${i.rotulo} (${i.nome})`}
                          onClick={() => {
                            onMudar(i.nome)
                            setAberto(false)
                          }}
                          className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
                            on
                              ? 'border-azul bg-azul text-white'
                              : 'border-linha text-tinta hover:border-azul/40 hover:text-azul'
                          }`}
                        >
                          <Icone nome={i.nome} className="size-5" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {ajuda ? <p className="mt-1 text-xs leading-relaxed text-grafite">{ajuda}</p> : null}
    </div>
  )
}

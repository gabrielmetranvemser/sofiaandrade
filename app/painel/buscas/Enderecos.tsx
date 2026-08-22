'use client'

import { useState } from 'react'

export interface Endereco {
  /** O que é, em uma expressão. */
  nome: string
  url: string
  /** O que fica dentro do arquivo, para quem nunca abriu um. */
  explicacao: string
  /** É este que se cola no Search Console? */
  principal?: boolean
}

/**
 * OS ENDEREÇOS DE SEO, COM BOTÃO DE COPIAR.
 *
 * ⚠️ O BOTÃO DE COPIAR É O MOTIVO DE ESTA TELA EXISTIR. Os três
 *    endereços são deriváveis do domínio — qualquer pessoa que saiba a
 *    convenção escreve `/sitemap.xml` de cabeça. Só que quem cadastra
 *    no Search Console não é essa pessoa, e digitar o endereço à mão é
 *    onde nasce o erro clássico: um "http" no lugar de "https", uma
 *    barra a mais no fim, e o Google responde "não foi possível buscar
 *    o sitemap" sem dizer qual dos dois lados errou.
 *
 *    Copiado do painel, o endereço é exatamente o que o site serve,
 *    inclusive quando o domínio muda.
 *
 * O `prompt` no fallback não é enfeite: `navigator.clipboard` exige
 * contexto seguro, e o painel é usado em `localhost` e, às vezes, no
 * navegador do celular de alguém em campo.
 */
export function Enderecos({ itens }: { itens: Endereco[] }) {
  const [copiado, setCopiado] = useState<string | null>(null)

  async function copiar(url: string) {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copie o endereço:', url)
    }
    setCopiado(url)
    setTimeout(() => setCopiado(null), 2600)
  }

  return (
    <ul className="mt-4 space-y-3">
      {itens.map((item) => (
        <li
          key={item.url}
          className={`rounded-2xl border bg-white p-5 ${
            item.principal ? 'border-azul/40 ring-1 ring-azul/20' : 'border-linha'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{item.nome}</span>
            {item.principal ? (
              <span className="rounded-full bg-azul-suave px-2.5 py-0.5 text-xs font-medium text-azul-escuro">
                é este que vai no Search Console
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-grafite">{item.explicacao}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-linha bg-areia px-3 py-2 font-mono text-sm whitespace-nowrap">
              {item.url}
            </code>
            <button
              type="button"
              onClick={() => copiar(item.url)}
              className="min-h-11 shrink-0 rounded-xl bg-azul px-4 text-sm font-medium text-white transition-colors hover:bg-azul-escuro"
            >
              {copiado === item.url ? 'Copiado' : 'Copiar'}
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-linha px-4 text-sm font-medium transition-colors hover:bg-areia"
            >
              Abrir
            </a>
          </div>
        </li>
      ))}
    </ul>
  )
}

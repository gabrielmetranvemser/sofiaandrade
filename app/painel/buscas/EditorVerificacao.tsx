'use client'

import { useActionState } from 'react'
import { salvarVerificacaoGoogle, type EstadoBuscas } from '../acoes-buscas'

/**
 * O CAMPO DA VERIFICAÇÃO DE PROPRIEDADE.
 *
 * ⚠️ ELE É O SEGUNDO CAMINHO, NÃO O PRIMEIRO — e a tela diz isso. A
 *    verificação por DNS é melhor em tudo que importa aqui: vale para
 *    o domínio inteiro (com www e sem, http e https, subdomínio
 *    futuro), não depende de o site continuar no ar do mesmo jeito, e
 *    não se perde numa republicação. A meta tag existe para quem não
 *    tem acesso ao painel do domínio na hora.
 *
 *    Dizer isso aqui é mais barato que consertar depois: campanha que
 *    verifica por tag descobre a limitação no dia em que troca o
 *    domínio, que costuma ser o pior dia possível.
 *
 * O campo é `textarea` de propósito: o que o Google entrega para
 * copiar é uma linha de HTML inteira, e um `input` de uma linha faria
 * a pessoa acreditar que colou errado.
 */
export function EditorVerificacao({
  inicial,
  editavel,
}: {
  inicial: string
  editavel: boolean
}) {
  const [estado, salvar, salvando] = useActionState<EstadoBuscas, FormData>(
    salvarVerificacaoGoogle,
    null,
  )

  return (
    <form action={salvar} className="mt-4 rounded-2xl border border-linha bg-white p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">Verificação por meta tag</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            inicial ? 'bg-verde-suave text-verde' : 'bg-areia text-grafite'
          }`}
        >
          {inicial ? 'tag no ar' : 'nenhuma tag no site'}
        </span>
      </div>

      <p className="mt-2 text-sm text-grafite">
        Só é necessário se você escolher <em>Tag HTML</em> na tela de verificação do Search
        Console. Verificando pelo DNS — o caminho recomendado — deixe este campo vazio.
      </p>

      <label htmlFor="verificacaoGoogle" className="mt-5 block text-sm font-medium">
        Cole aqui a linha que o Google mostrou
      </label>
      <textarea
        id="verificacaoGoogle"
        name="verificacaoGoogle"
        rows={3}
        defaultValue={inicial}
        disabled={!editavel}
        spellCheck={false}
        autoComplete="off"
        placeholder={'<meta name="google-site-verification" content="..." />'}
        className="mt-1.5 w-full rounded-xl border border-linha px-3 py-2 font-mono text-sm disabled:bg-areia"
      />
      <p className="mt-1 text-sm text-grafite">
        Pode colar a linha inteira — o painel separa o código sozinho. Para tirar a tag do ar,
        apague tudo e salve.
      </p>

      {estado?.erro ? <p className="mt-3 text-sm text-red-700">{estado.erro}</p> : null}
      {estado?.ok ? (
        <p className="mt-3 text-sm text-verde">
          Salvo. A tag já está no <code className="font-mono">&lt;head&gt;</code> do site — volte ao
          Search Console e aperte <em>Verificar</em>.
          {estado.aviso ? <span className="block text-grafite">{estado.aviso}</span> : null}
        </p>
      ) : null}

      <div className="mt-5">
        <button
          type="submit"
          disabled={!editavel || salvando}
          className="min-h-11 rounded-xl bg-azul px-5 text-sm font-medium text-white transition-colors hover:bg-azul-escuro disabled:opacity-50"
        >
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

'use client'

import { useActionState } from 'react'
import { entrar, type EstadoAcao } from '../acoes'

export function FormularioLogin({ proximo }: { proximo: string }) {
  const [estado, acao, pendente] = useActionState<EstadoAcao, FormData>(entrar, null)

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="proximo" value={proximo} />

      <div>
        <label htmlFor="senha" className="block font-medium">
          Senha do painel
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 min-h-12 w-full rounded-xl border border-linha bg-areia px-4 text-lg transition-colors focus:border-azul/40 focus:bg-white"
        />
      </div>

      {estado?.erro ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900 ring-1 ring-red-200">
          {estado.erro}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendente}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-azul px-6 font-semibold text-white transition-colors hover:bg-azul-escuro disabled:opacity-50"
      >
        {pendente ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

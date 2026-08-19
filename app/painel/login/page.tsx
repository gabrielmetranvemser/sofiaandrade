import { FormularioLogin } from './FormularioLogin'

export const metadata = {
  title: 'Entrar no painel',
  robots: { index: false, follow: false },
}

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>
}) {
  const { proximo } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-areia px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-azul text-sm font-bold text-white">
            2233
          </span>
          <div className="leading-tight">
            <p className="font-[family-name:var(--font-titulo)] font-bold tracking-[-0.02em]">
              Painel da campanha
            </p>
            <p className="text-sm text-grafite">Acesso restrito</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-linha bg-white p-7 shadow-suave">
          <FormularioLogin proximo={proximo ?? '/painel'} />
        </div>

        <p className="mt-5 text-sm text-grafite">
          Na fase local o acesso é por senha única, definida em{' '}
          <code className="rounded bg-white px-1.5 py-0.5">PAINEL_SENHA</code>. Quando o Supabase
          entrar, isto vira login por e-mail com a tabela de administradores.
        </p>
      </div>
    </div>
  )
}

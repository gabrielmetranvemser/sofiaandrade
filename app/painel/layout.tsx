import { config } from '@/lib/config'
import { MenuLateral } from './_componentes/MenuLateral'

export const metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-areia">
      {!config.supabaseAtivo ? (
        <div className="border-b border-amarelo/30 bg-amarelo-suave">
          <p className="px-4 py-3 text-sm md:px-8">
            <strong className="font-semibold">Modo local.</strong> O Supabase não está conectado —
            o painel mostra os dados de{' '}
            <code className="rounded bg-white/70 px-1.5 py-0.5">data/grupos.local.json</code> e a
            edição está desligada.
          </p>
        </div>
      ) : null}

      <MenuLateral>
        <div className="mx-auto max-w-4xl">{children}</div>
      </MenuLateral>
    </div>
  )
}

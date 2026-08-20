import Link from 'next/link'
import { candidata } from '@/content/copy'
import { config } from '@/lib/config'
import { sair } from './acoes'

export const metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

const ABAS = [
  { href: '/painel', rotulo: 'Grupos' },
  { href: '/painel/metricas', rotulo: 'Métricas' },
  { href: '/painel/qr', rotulo: 'QR por município' },
]

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-areia">
      <header className="border-b border-linha bg-white">
        <div className="container-lp flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-azul text-[0.8125rem] font-bold text-white">
              2233
            </span>
            <div className="leading-tight">
              <p className="font-[family-name:var(--font-titulo)] font-bold tracking-[-0.02em]">
                Painel da campanha
              </p>
              <p className="text-sm text-grafite">{candidata.nome}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-grafite transition-colors hover:bg-areia hover:text-azul"
            >
              Ver o site
            </Link>
            <form action={sair}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full border border-linha bg-white px-5 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <nav className="container-lp flex gap-1 overflow-x-auto pb-3" aria-label="Seções do painel">
          {ABAS.map((aba) => (
            <Link
              key={aba.href}
              href={aba.href}
              className="whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium text-grafite transition-colors hover:bg-azul-suave hover:text-azul"
            >
              {aba.rotulo}
            </Link>
          ))}
        </nav>
      </header>

      {!config.supabaseAtivo ? (
        <div className="border-b border-amarelo/30 bg-amarelo-suave">
          <p className="container-lp py-3 text-sm">
            <strong className="font-semibold">Modo local.</strong> O Supabase ainda não está
            conectado — o painel mostra os dados de <code className="rounded bg-white/70 px-1.5 py-0.5">data/grupos.local.json</code> e a
            edição está desligada. Preencha as variáveis do Supabase no{' '}
            <code className="rounded bg-white/70 px-1.5 py-0.5">.env.local</code> para liberar.
          </p>
        </div>
      ) : null}

      <main className="container-lp py-8 md:py-12">{children}</main>
    </div>
  )
}

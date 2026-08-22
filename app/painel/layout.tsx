import { config } from '@/lib/config'
import { MenuLateral } from './_componentes/MenuLateral'

export const metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

/**
 * ⚠️ A FAIXA DE "MODO LOCAL" MUDOU DE LUGAR — foi daqui para dentro do
 *    MenuLateral. Não é arrumação: este layout é servidor e não sabe
 *    em qual rota está, então a faixa aparecia também na tela de
 *    entrar, contando a quem ainda não passou pela senha se o banco da
 *    campanha está conectado ou não. Quem sabe a rota é o componente
 *    de cliente, que tem o caminho na mão.
 */
export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-areia">
      <MenuLateral modoLocal={!config.supabaseAtivo}>
        <div className="mx-auto max-w-6xl">{children}</div>
      </MenuLateral>
    </div>
  )
}

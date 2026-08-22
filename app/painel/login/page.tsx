import { FormularioLogin } from './FormularioLogin'

export const metadata = {
  title: 'Entrar no painel',
  robots: { index: false, follow: false },
}

/**
 * A TELA DE ENTRAR — só o campo da senha.
 *
 * ⚠️ NADA MAIS APARECE AQUI, E É DE PROPÓSITO. Esta tela tinha o menu
 *    lateral do painel em volta e um parágrafo embaixo explicando que
 *    o acesso é por senha única definida em `PAINEL_SENHA`. As duas
 *    coisas saíram pelo mesmo motivo: quem está diante desta tela
 *    ainda não provou quem é.
 *
 *    O menu anunciava a quem não entrou o mapa inteiro do painel —
 *    que existe Tráfego, Grupos, Métricas. O parágrafo ia além e dizia
 *    COMO a porta funciona, com o nome da variável de ambiente. Nada
 *    disso é segredo grave, e nada disso ajuda quem tem a senha: só
 *    informa quem não tem.
 *
 * O menu não é escondido com CSS — ele não é renderizado. Ver a saída
 * antecipada em `_componentes/MenuLateral.tsx`.
 */
export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>
}) {
  const { proximo } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-areia px-5 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-linha bg-white p-7 shadow-suave">
        <FormularioLogin proximo={proximo ?? '/painel'} />
      </div>
    </div>
  )
}

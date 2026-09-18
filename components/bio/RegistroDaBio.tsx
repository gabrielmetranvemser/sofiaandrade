'use client'

import { useEffect } from 'react'
import { evento, idSessao, marcarToqueDeRobo } from '@/lib/eventos'
import { ORIGEM_BIO } from '@/lib/bio'

/**
 * A MEDIÇÃO DO LINK DA BIO, NUM COMPONENTE SÓ.
 *
 * ⚠️ UM OUVINTE PARA TODOS OS BOTÕES, e não um componente de cliente
 *    por botão. É a decisão que sustenta o 100 de PageSpeed desta
 *    página: com um componente por botão, cada linha da lista viraria
 *    um pedaço de árvore para hidratar, e a lista inteira dependeria
 *    de JavaScript para existir. Aqui os botões são `<a>` escritos
 *    pelo servidor — clicáveis no primeiro quadro, antes de qualquer
 *    script — e este arquivo só escuta o clique que já aconteceu.
 *
 * ⚠️ O OUVINTE FICA NO `document`. Um contêiner com `ref` obrigaria a
 *    embrulhar a lista num componente de cliente, e o que entra dentro
 *    de um componente de cliente atravessa a fronteira como payload.
 *    No `document` não há wrapper nenhum: o servidor desenha a lista e
 *    este componente não renderiza nada.
 *
 * Faz três coisas no toque, nesta ordem:
 *
 *   1. marca toque de robô — o mesmo `wd=1` dos outros botões de `/g/`;
 *   2. completa o endereço do grupo com o id de sessão, que só existe
 *      no navegador e por isso não pode estar no HTML servido;
 *   3. conta `clicou_bio` com o texto do botão.
 */
export function RegistroDaBio() {
  useEffect(() => {
    // ⚠️ A PRÉVIA DO PAINEL NÃO CONTA. Ela recarrega a página a cada
    //    salvamento, e sem esta saída cada ajuste de vírgula viraria
    //    uma visita no funil da campanha.
    if (new URLSearchParams(window.location.search).has('previa')) return

    evento('pagina_vista', { origem: ORIGEM_BIO })

    const aoTocar = (e: MouseEvent) => {
      const alvo = e.target as Element | null
      const ancora = alvo?.closest?.('a[data-bio]') as HTMLAnchorElement | null
      if (!ancora) return

      marcarToqueDeRobo(ancora, e.isTrusted)

      // ⚠️ A SESSÃO ENTRA AGORA, e não no HTML. Ela mora no
      //    sessionStorage e não existe no servidor: escrevê-la no
      //    endereço durante o render faria o HTML e o navegador
      //    discordarem — e, nesta página, o HTML é prerenderizado e
      //    servido do cache, então não existe render por visita onde
      //    ela pudesse entrar. O `href` só é lido pelo navegador
      //    depois deste ouvinte, então a troca vale para este toque.
      //
      //    Vale para qualquer botão que aponte para `/g/`: hoje é um
      //    "Outra página deste site" com o grupo de um município fixo,
      //    e é a única forma de aquele clique contar como PESSOA.
      if (ancora.pathname.startsWith('/g/') && !ancora.search.includes('s=')) {
        const sessao = idSessao()
        if (sessao) ancora.search += `${ancora.search ? '&' : '?'}s=${sessao}`
      }

      evento('clicou_bio', {
        origem: ORIGEM_BIO,
        // O texto do botão. É o que o painel mostra em "qual link da
        // bio a pessoa usa" — ver lib/tipos.ts.
        rotulo: ancora.dataset.bio ?? null,
      })
    }

    // Captura: um `<a>` com conteúdo dentro entrega o clique no filho,
    // e há botão aqui cujo alvo real é o texto ou o ícone.
    document.addEventListener('click', aoTocar, { capture: true })
    return () => document.removeEventListener('click', aoTocar, { capture: true })
  }, [])

  return null
}

'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { evento, marcarToqueDeRobo } from '@/lib/eventos'
import { useCidadeAlvo, useDestinoDoGrupo } from '@/lib/campanha/contexto'
import type { OrigemClique } from '@/lib/tipos'

/**
 * Envelope fino em volta de um CTA que leva à lista de grupos.
 *
 * Grava `clicou_cta`, NÃO `clicou_grupo`: este botão só rola a tela
 * até a lista. Quem grava a entrada de verdade é a rota /g/[slug],
 * quando a pessoa sai para o WhatsApp. Sem essa separação o painel
 * diria que o hero converte quando ele só rolou a página.
 *
 * ⚠️ COM CIDADE VINDA DO ANÚNCIO, O BOTÃO MUDA DE DESTINO. Se a pessoa
 *    chegou por `?cidade=porto-velho`, ela já disse qual é a cidade
 *    dela — mandá-la rolar até a lista para procurar entre 52 nomes
 *    seria perguntar de novo o que já foi respondido. O `href` passa a
 *    ser o redirecionador daquele grupo.
 *
 *    O evento continua sendo `clicou_cta` com a MESMA origem. Ele não
 *    virou outra coisa: o hero continua sendo o hero. O que muda é que
 *    agora existe um `clicou_grupo` logo atrás dele, gravado pela rota
 *    /g/, e a tela "qual botão trabalha" passa a mostrar os dois lados
 *    do mesmo toque — que é exatamente o que ela existe para comparar.
 *
 * ⚠️ `<a>` E NÃO `<Link>` QUANDO O DESTINO É `/g/`, e isto não é
 *    detalhe de estilo. `/g/[slug]` é Route Handler, não página: o
 *    `<Link>` tentaria navegar por dentro do roteador e, pior,
 *    PRÉ-BUSCARIA o endereço ao entrar na tela. Cada pré-busca dessas
 *    contaria um clique no grupo e consumiria o limite de entradas —
 *    a campanha veria o contador subir sozinho, sem ninguém no grupo.
 */
export function CliqueGrupo({
  origem,
  children,
  href = '/#grupos',
  className = '',
}: {
  origem: OrigemClique
  children: ReactNode
  href?: string
  className?: string
}) {
  const destino = useDestinoDoGrupo(origem, href)
  const alvo = useCidadeAlvo()
  // A cidade vai junto quando o anúncio trouxe uma: é assim que a
  // medição separa município por município sem ler o texto do botão.
  const registrar = () =>
    evento('clicou_cta', { origem, municipio_slug: alvo?.municipioSlug ?? alvo?.slug })

  if (destino.direto) {
    return (
      <a
        href={destino.href}
        className={className}
        onClick={(e) => {
          marcarToqueDeRobo(e.currentTarget, e.nativeEvent.isTrusted)
          registrar()
        }}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={destino.href} className={className} onClick={registrar}>
      {children}
    </Link>
  )
}

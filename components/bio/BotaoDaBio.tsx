import type { BotaoDaBio as Botao } from '@/lib/bio'
import { Icone } from '@/components/ui/Icone'

/**
 * UM BOTÃO DA BIO.
 *
 * ⚠️ É `<a>` PURO, DESENHADO NO SERVIDOR. Nada aqui é componente de
 *    cliente: o link funciona antes de qualquer JavaScript carregar,
 *    que é a diferença entre converter e não converter num celular
 *    antigo, em 4G, dentro do navegador do Instagram. Quem mede o
 *    toque é um ouvinte só, no `document` — ver RegistroDaBio.
 *
 * ⚠️ `<Link>` NÃO SERVE PARA O GRUPO. `/g/[slug]` é Route Handler, e a
 *    pré-busca do `<Link>` contaria um clique sem ninguém ter tocado —
 *    o mesmo motivo que já está escrito em BotaoEntrarNoGrupo. Como um
 *    botão da bio pode apontar para lá, e misturar `<Link>` com `<a>`
 *    na mesma lista renderiza dois comportamentos de navegação lado a
 *    lado, todos são `<a>`.
 *
 * ── Tudo centrado ───────────────────────────────────────────────
 *
 * ⚠️ E ISTO MUDOU O DESENHO DO BOTÃO INTEIRO. A primeira versão era
 *    uma linha de lista: ícone encostado à esquerda, texto alinhado à
 *    esquerda, seta encostada à direita. É o desenho certo para uma
 *    lista longa que se varre com o olho — e errado para esta página,
 *    que é um cartão estreito num celular, com cinco botões e nenhuma
 *    varredura a fazer.
 *
 *    Centrado, o eixo da página é um só, de cima a baixo: tarja,
 *    título, botões, assinatura. A seta saiu junto porque ela existia
 *    para ancorar a borda direita — num botão centrado ela puxa o olho
 *    para fora do texto, que é o oposto do que um botão precisa fazer.
 *    O que ela dizia continua dito: "leva a outro lugar" é o que um
 *    botão já significa, e "sai do site" virou o símbolo diagonal
 *    logo depois da palavra, onde a leitura termina.
 *
 * ── Duas formas, e o contraste decide ───────────────────────────
 *
 * ⚠️ NO BOTÃO PRINCIPAL A LINHA DE BAIXO SAI DE DENTRO. Branco sobre o
 *    verde da campanha dá 3,4:1: passa em texto grande (19px negrito,
 *    que é o do rótulo) e NÃO passa em texto pequeno. A descrição em
 *    corpo menor dentro do verde seria ilegível para quem enxerga
 *    pouco — e é justamente quem mais precisa dela. Fora do botão, em
 *    cinza sobre branco, ela dá 7,2:1.
 *
 *    É a mesma solução da `notaBotao` da página de entrada, e não por
 *    acaso: o problema é o mesmo.
 */
export function BotaoDaBio({ botao }: { botao: Botao }) {
  const externo = botao.externo
  const comum = {
    href: botao.href,
    // O ouvinte acha o botão por este atributo, e conta o toque com o
    // texto que está escrito nele.
    'data-bio': botao.rotulo,
    ...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
  }

  const saida = externo ? (
    <>
      <SetaDeFora />
      <span className="sr-only"> (abre em outra aba)</span>
    </>
  ) : null

  // ── O principal ───────────────────────────────────────────────
  if (botao.destaque) {
    return (
      <li>
        <a
          {...comum}
          className="toque flex min-h-[3.75rem] w-full items-center justify-center gap-3 rounded-2xl bg-verde px-5 py-3 text-center text-[1.1875rem] leading-snug font-bold text-white shadow-alta transition-[filter] hover:brightness-110"
        >
          <Icone nome={botao.icone} className="size-6 shrink-0" />
          <span className="text-balance">
            {botao.rotulo}
            {saida}
          </span>
        </a>
        {botao.descricao ? (
          <p className="mt-2 text-center text-sm text-grafite">{botao.descricao}</p>
        ) : null}
      </li>
    )
  }

  // ── Os demais ─────────────────────────────────────────────────
  return (
    <li>
      <a
        {...comum}
        className="toque flex min-h-16 w-full flex-col items-center justify-center gap-0.5 rounded-2xl bg-areia px-4 py-3 text-center ring-1 ring-linha transition-colors hover:bg-white hover:ring-azul/40"
      >
        {/* O ícone entra na MESMA LINHA do rótulo, e não acima dele:
            empilhado, cada botão ganharia ~28px de altura e a lista
            deixaria de caber na primeira tela de um celular pequeno —
            que é o único lugar onde esta página é lida. */}
        <span className="flex items-center justify-center gap-2.5 text-balance text-[1.0625rem] leading-snug font-semibold text-tinta">
          <Icone nome={botao.icone} className="size-5 shrink-0 text-azul-escuro" />
          <span>
            {botao.rotulo}
            {saida}
          </span>
        </span>

        {botao.descricao ? (
          <span className="block text-balance text-sm leading-snug text-grafite">
            {botao.descricao}
          </span>
        ) : null}
      </a>
    </li>
  )
}

/**
 * "Sai do site", logo depois da palavra.
 *
 * `inline-block` com `align-[-0.1em]`: dentro de uma linha de texto que
 * pode quebrar, ele precisa acompanhar a última palavra em vez de
 * flutuar sozinho — e assentar na linha de base, senão fica pairando
 * acima do texto.
 */
function SetaDeFora() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="ml-1.5 inline-block size-[0.8em] align-[-0.1em] opacity-60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

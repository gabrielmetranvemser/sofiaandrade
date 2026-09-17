'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import type { Conteudo } from '@/lib/conteudo/tipos'
import { caminhoDoGrupo, evento, marcarToqueDeRobo, useSessao } from '@/lib/eventos'
import { IconeWhatsApp } from '@/components/ui/IconeWhatsApp'

/** As frases do botão. Vêm do painel, seção Página de entrada. */
export type TextosDoBotao = Pick<
  Conteudo['entrada'],
  'botaoAbrindo' | 'naoAbriuTitulo' | 'naoAbriuBotao' | 'naoAbriuDica'
>

/**
 * Quanto esperar a página sair da tela antes de oferecer "tocar de novo".
 *
 * Seis segundos e não três: o toque passa pelo redirecionador antes de
 * chegar ao WhatsApp, e em 4G do interior essa ida e volta sozinha leva
 * dois ou três. Oferecer ajuda antes disso seria interromper quem ia
 * conseguir.
 */
const ESPERA_MS = 6_000

type Fase = 'pronto' | 'abrindo' | 'travou'

/**
 * O BOTÃO DA PÁGINA DE ENTRADA, com ajuda para depois do toque.
 *
 * ⚠️ O TOQUE NÃO ERA O FIM DO CAMINHO. Das 44 pessoas que tocaram para
 *    entrar entre 15 e 17/09, 24 voltaram para a página segundos depois
 *    e 6 tocaram duas ou três vezes seguidas. Dentro do navegador do
 *    Instagram e do Facebook o WhatsApp demora, abre uma página dele em
 *    vez do aplicativo, ou não abre — e nada na tela dizia o que fazer.
 *
 *    Agora o botão avisa que está abrindo e, se a página continua na
 *    tela depois de seis segundos, oferece tocar de novo com uma dica.
 *    E mede os dois desfechos, que até aqui eram invisíveis:
 *
 *    · `saiu_para_whatsapp` — a página saiu da tela: o WhatsApp tomou a
 *      frente (o aplicativo, ou a página dele). Não prova que a pessoa
 *      entrou no grupo; prova que o caminho não travou.
 *    · `whatsapp_nao_abriu` — continuou aqui. Rede muito lenta também
 *      cai neste balde, e é por isso que a espera é generosa.
 *
 * `<a>` e não `<Link>`: `/g/` é Route Handler, e a pré-busca do `<Link>`
 * contaria clique sem ninguém ter tocado. Ver CliqueGrupo.
 */
export function BotaoEntrarNoGrupo({
  slug,
  municipioSlug,
  rotulo,
  textos,
  className = '',
}: {
  /** Slug do destino no `/g/` — município ou distrito. */
  slug: string
  /** O município que ancora o destino, que é como a métrica conta. */
  municipioSlug: string
  rotulo: string
  /**
   * Vêm do servidor, já com o que a campanha editou no painel — e sem
   * `content/copy.ts` inteiro descer para o celular por quatro frases.
   */
  textos: TextosDoBotao
  className?: string
}) {
  const sessao = useSessao()
  const [fase, setFase] = useState<Fase>('pronto')
  const desligar = useRef<(() => void) | null>(null)

  useEffect(() => {
    // ⚠️ QUEM VOLTA DO WHATSAPP COM O "VOLTAR" pode receber a página da
    //    memória do navegador, com o estado de antes — e o botão ficaria
    //    preso em "Abrindo o WhatsApp…" para sempre.
    const aoVoltar = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      desligar.current?.()
      setFase('pronto')
    }
    window.addEventListener('pageshow', aoVoltar)
    return () => {
      window.removeEventListener('pageshow', aoVoltar)
      desligar.current?.()
    }
  }, [])

  function acompanhar() {
    desligar.current?.()
    let concluido = false

    const concluir = (tipo: 'saiu_para_whatsapp' | 'whatsapp_nao_abriu') => {
      if (concluido) return
      concluido = true
      limpar()
      // sendBeacon por baixo: sobrevive à página indo embora.
      evento(tipo, { municipio_slug: municipioSlug, origem: 'lp' })
      if (tipo === 'whatsapp_nao_abriu') setFase('travou')
    }

    const aoEsconder = () => {
      if (document.visibilityState === 'hidden') concluir('saiu_para_whatsapp')
    }
    const aoSair = () => concluir('saiu_para_whatsapp')
    const relogio = setTimeout(() => concluir('whatsapp_nao_abriu'), ESPERA_MS)

    function limpar() {
      clearTimeout(relogio)
      document.removeEventListener('visibilitychange', aoEsconder)
      window.removeEventListener('pagehide', aoSair)
      desligar.current = null
    }

    document.addEventListener('visibilitychange', aoEsconder)
    window.addEventListener('pagehide', aoSair)
    desligar.current = limpar
  }

  function aoTocar(e: MouseEvent<HTMLAnchorElement>, origem: 'lp' | 'lp_de_novo') {
    marcarToqueDeRobo(e.currentTarget, e.nativeEvent.isTrusted)
    evento('clicou_cta', { origem })
    setFase('abrindo')
    acompanhar()
  }

  return (
    <div className={className}>
      <a
        href={caminhoDoGrupo(slug, 'lp', sessao)}
        onClick={(e) => aoTocar(e, 'lp')}
        // 19px e negrito: branco sobre este verde só passa no contraste
        // como texto grande, e 18px fica a um pixel de não ser.
        className="toque flex min-h-[3.75rem] w-full items-center justify-center gap-3 rounded-full bg-verde px-6 py-3 text-center text-[1.1875rem] leading-snug font-bold text-white shadow-alta transition-[filter] hover:brightness-110"
      >
        <IconeWhatsApp />
        {/* `text-balance`: "Entrar no grupo de Porto Velho" não cabe numa
            linha de celular, e sem equilíbrio quebrava deixando "Velho"
            sozinho embaixo. */}
        <span aria-live="polite" className="text-balance">
          {fase === 'abrindo' ? textos.botaoAbrindo : rotulo}
        </span>
      </a>

      {fase === 'travou' ? (
        <div role="status" className="anima-etapa mt-4 rounded-lg bg-amarelo-suave p-4 ring-1 ring-amarelo/60">
          <p className="text-base font-semibold text-tinta">{textos.naoAbriuTitulo}</p>
          <a
            href={caminhoDoGrupo(slug, 'lp_de_novo', sessao)}
            onClick={(e) => aoTocar(e, 'lp_de_novo')}
            className="mt-1 inline-flex min-h-12 items-center text-lg font-bold text-verde-escuro underline decoration-2 underline-offset-[6px]"
          >
            {textos.naoAbriuBotao}
          </a>
          <p className="mt-1 text-base text-grafite">{textos.naoAbriuDica}</p>
        </div>
      ) : null}
    </div>
  )
}

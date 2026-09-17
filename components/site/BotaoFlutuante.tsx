'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { evento, marcarToqueDeRobo } from '@/lib/eventos'
import { useCidadeAlvo, useDestinoDoGrupo } from '@/lib/campanha/contexto'
import { IconeWhatsApp } from '@/components/ui/IconeWhatsApp'

/**
 * O botão que segue a pessoa. Aparece depois do hero e some quando
 * a seção de grupos entra em tela — se o alvo já está visível,
 * o flutuante vira estorvo.
 *
 * A origem 'flutuante' no evento é o que responde, em duas semanas,
 * se ele trabalha ou é enfeite.
 */
export function BotaoFlutuante({
  silencio = false,
  destino = '/#grupos',
}: {
  silencio?: boolean
  /** Muda para /grupos quando a seção de grupos está desligada. */
  destino?: string
}) {
  const { ctas } = useConteudo()
  const [visivel, setVisivel] = useState(false)

  // Com cidade vinda do anúncio, este botão deixa de ser um atalho para
  // a lista e vira a porta do grupo — o mesmo raciocínio de CliqueGrupo,
  // e o mesmo motivo para trocar <Link> por <a>: /g/ é Route Handler, e
  // a pré-busca do <Link> contaria clique sem ninguém ter tocado.
  const alvo = useCidadeAlvo()
  const paraOGrupo = useDestinoDoGrupo('flutuante', destino)
  const rotulo = paraOGrupo.direto && alvo ? `${ctas.grupoDe} ${alvo.nome}` : ctas.grupoCurto

  useEffect(() => {
    if (silencio) return

    // ⚠️ APARECE QUANDO O BOTÃO DA PRIMEIRA DOBRA SAI DA TELA, e não mais
    //    depois de 560px. A regra dos 560px era do tempo em que o botão do
    //    hero morava no pé das figuras; com ele subindo para baixo do
    //    subtítulo, um número fixo ou deixava a pessoa sem botão nenhum na
    //    tela por um trecho, ou punha dois botões iguais ao mesmo tempo.
    //    Observar o próprio botão acerta nos dois sentidos, em qualquer
    //    altura de tela.
    //
    //    Some também sobre a seção de grupos e sobre a chamada final: as
    //    duas têm botão de grupo próprio, e um segundo por cima só atrapalha.
    const vigiados = {
      hero: document.getElementById('cta-hero'),
      grupos: document.getElementById('grupos'),
      final: document.getElementById('votar'),
    }
    const naTela = { hero: Boolean(vigiados.hero), grupos: false, final: false }

    const atualizar = () => {
      // Sem o bloco do hero (silêncio, ou outra página), fica a regra antiga.
      const passouDoHero = vigiados.hero ? !naTela.hero : window.scrollY > 560
      setVisivel(passouDoHero && !naTela.grupos && !naTela.final)
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.target === vigiados.hero) naTela.hero = e.isIntersecting
          else if (e.target === vigiados.grupos) naTela.grupos = e.isIntersecting
          else if (e.target === vigiados.final) naTela.final = e.isIntersecting
        }
        atualizar()
      },
      { threshold: 0.12 },
    )
    for (const el of Object.values(vigiados)) if (el) observador.observe(el)

    window.addEventListener('scroll', atualizar, { passive: true })
    atualizar()

    return () => {
      window.removeEventListener('scroll', atualizar)
      observador.disconnect()
    }
  }, [silencio])

  if (silencio) return null

  return (
    <div
      // pb inclui a área segura do iPhone: sem isso o botão fica
      // debaixo do indicador de home e o toque cai no gesto do sistema
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pt-4 transition-all duration-500 md:inset-x-auto md:right-6 md:bottom-6 md:p-0 ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
      }`}
    >
      <Envelope
        href={paraOGrupo.href}
        direto={paraOGrupo.direto}
        onClick={() => evento('clicou_cta', { origem: 'flutuante' })}
        className="toque flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-verde px-7 text-[1.1875rem] font-bold text-white shadow-alta transition-all duration-300 hover:brightness-110 md:w-auto"
      >
        <IconeWhatsApp />
        {/* `truncate` porque "Entrar no grupo de Alta Floresta d'Oeste"
            não cabe na largura de um telefone pequeno, e quebrar a
            linha empurraria o botão para fora da área segura. */}
        <span className="truncate">{rotulo}</span>
      </Envelope>
    </div>
  )
}

/** <a> para o redirecionador, <Link> para a âncora. Ver CliqueGrupo. */
function Envelope({
  href,
  direto,
  onClick,
  className,
  children,
}: {
  href: string
  direto: boolean
  onClick: () => void
  className: string
  children: React.ReactNode
}) {
  if (direto) {
    return (
      <a
        href={href}
        onClick={(e) => {
          marcarToqueDeRobo(e.currentTarget, e.nativeEvent.isTrusted)
          onClick()
        }}
        className={className}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  )
}

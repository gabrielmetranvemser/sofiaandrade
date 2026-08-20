import Image from 'next/image'
import { candidata } from '@/content/copy'

/**
 * A marca da campanha.
 *
 * O símbolo é a bandeira do Brasil estilizada. Existem três versões
 * do logotipo e cada uma tem o seu lugar:
 *
 *   branco → só sobre fundo escuro (hero, rodapé, CTA final)
 *   azul   → fundo claro, uso padrão
 *   verde  → fundo claro, quando a seção já é de ênfase verde
 *
 * O `Image` do Next serve nos dois casos com `sizes` certo, porque os
 * originais têm até 32.508px de largura e o público está em 4G.
 */

type Versao = 'branco' | 'azul' | 'verde'

const ARQUIVOS: Record<Versao, string> = {
  branco: '/marca/logo-vertical-branco.png',
  azul: '/marca/logo-vertical-azul.png',
  verde: '/marca/logo-vertical-verde.png',
}

export function LogoVertical({
  versao = 'azul',
  className = '',
  prioridade = false,
}: {
  versao?: Versao
  className?: string
  prioridade?: boolean
}) {
  return (
    <Image
      src={ARQUIVOS[versao]}
      alt={`${candidata.nome} — ${candidata.cargo} por ${candidata.estado}`}
      width={600}
      height={225}
      priority={prioridade}
      sizes="(max-width: 768px) 70vw, 340px"
      className={className}
    />
  )
}

/** Versão larga, branca. Só sobre fundo escuro. */
export function LogoHorizontal({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/marca/logo-horizontal-branco.png"
      alt={`${candidata.nome} — ${candidata.cargo}`}
      width={900}
      height={145}
      sizes="(max-width: 768px) 80vw, 420px"
      className={className}
    />
  )
}

/** Só o símbolo. Header, favicon, marcadores. */
export function Simbolo({
  className = '',
  prioridade = false,
}: {
  className?: string
  prioridade?: boolean
}) {
  return (
    <Image
      src="/marca/simbolo.png"
      alt=""
      aria-hidden
      width={512}
      height={337}
      priority={prioridade}
      sizes="64px"
      className={className}
    />
  )
}

/**
 * O 2233 como arte da campanha.
 * `cheio` traz a sombra azul (para fundo claro), `amarelo` é chapado
 * (para fundo escuro, onde a sombra azul sumiria).
 */
export function Numero({
  versao = 'amarelo',
  className = '',
  prioridade = false,
}: {
  versao?: 'amarelo' | 'cheio'
  className?: string
  prioridade?: boolean
}) {
  const src = versao === 'cheio' ? '/marca/marca-numero.png' : '/marca/numero-2233-amarelo.png'
  return (
    <Image
      src={src}
      alt={`Número ${candidata.numero}`}
      width={700}
      height={versao === 'cheio' ? 500 : 188}
      priority={prioridade}
      sizes="(max-width: 768px) 60vw, 380px"
      className={className}
    />
  )
}

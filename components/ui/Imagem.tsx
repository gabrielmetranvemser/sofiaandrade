import Image from 'next/image'
import { SLOTS_POR_CHAVE } from '@/content/slots'
import type { ImagemDoSlot } from '@/lib/midia/ler'
import { QuadroImagem } from './QuadroImagem'
import { Silhueta } from './Silhueta'

/**
 * Uma imagem de slot, ou o placeholder que já existe.
 *
 * É o que permite entregar as imagens SLOT A SLOT, sem esperar todas
 * chegarem: enquanto o slot está vazio, o quadro com a proporção
 * reservada continua segurando o layout — que é o que ele sempre fez.
 */
export function Imagem({
  slot,
  slots,
  className = '',
  sizes,
  prioridade = false,
  vazio = 'quadro',
}: {
  slot: string
  slots: Record<string, ImagemDoSlot>
  className?: string
  sizes?: string
  prioridade?: boolean
  vazio?: 'quadro' | 'silhueta'
}) {
  const def = SLOTS_POR_CHAVE[slot]
  const img = slots[slot]

  if (!img) {
    if (vazio === 'silhueta') {
      return (
        <Silhueta
          variante="meio-corpo"
          tom="claro"
          rotulo="Foto PNG · recorte sem fundo"
          className={className}
        />
      )
    }
    // Espaço sem proporção fixa reserva a razão do próprio mínimo. É
    // a melhor aproximação disponível do que vai entrar ali: um print
    // de comentário (600×160) reserva uma faixa larga e baixa, não um
    // retrato em pé.
    return (
      <QuadroImagem
        proporcao={
          def?.proporcao ?? (def ? `${def.larguraMin}/${def.alturaMin}` : '4/5')
        }
        livre={def ? def.proporcao === null : false}
        rotulo={def?.rotulo ?? 'Imagem'}
        nota={def ? `mínimo ${def.larguraMin}×${def.alturaMin}` : undefined}
        className={className}
      />
    )
  }

  return (
    <Image
      src={img.url}
      alt={img.alt}
      width={img.largura}
      height={img.altura}
      sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
      priority={prioridade}
      placeholder={img.blur ? 'blur' : 'empty'}
      blurDataURL={img.blur ?? undefined}
      className={className}
    />
  )
}

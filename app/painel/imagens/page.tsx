import { SLOTS_POR_ONDE } from '@/content/slots'
import { config } from '@/lib/config'
import { lerSlots } from '@/lib/midia/ler'
import { CartaoSlot } from '../_componentes/CartaoSlot'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Imagens', robots: { index: false } }

export default async function PaginaImagens() {
  const slots = await lerSlots()

  return (
    <>
      <header>
        <h1 className="titulo-secao">Imagens</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          Cada espaço tem o tamanho e o formato que ele precisa, escritos no próprio card.
          Toda imagem enviada vira WebP automaticamente, mantendo a transparência quando existe.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {Object.entries(SLOTS_POR_ONDE).map(([onde, lista]) => (
          <section key={onde}>
            <h2 className="text-sm font-semibold tracking-[0.06em] text-grafite uppercase">
              {onde}
            </h2>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              {lista.map((slot) => (
                <CartaoSlot
                  key={slot.chave}
                  slot={slot}
                  imagem={slots[slot.chave]}
                  editavel={config.supabaseAtivo}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Imagem } from '@/components/ui/Imagem'
import { Aviso } from '@/components/ui/Aviso'

/**
 * Prestação de contas do mandato de vereadora. Os números e as leis
 * vêm do registro público da Câmara Municipal de Porto Velho — o único
 * item ainda por confirmar está marcado em content/copy.ts.
 */
export async function Provas() {
  const [{ provas }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  return (
    <Secao id="provas" fundo="azul-profundo" espaco="solto" className="overflow-hidden">

      <div className="relative">
        <CabecalhoSecao
          etiqueta={provas.etiqueta}
          titulo={provas.titulo}
          intro={provas.intro}
          tom="escuro"
        />

        {/* Números */}
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {provas.numeros.map((n, i) => (
            <li
              key={n.id}
              data-revelar
              style={{ ['--atraso' as string]: `${i * 80}ms` }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-7"
            >
              <span className="block font-[family-name:var(--font-titulo)] text-5xl font-bold tracking-[-0.04em] text-amarelo tabular-nums">
                {n.valor}
              </span>
              <span className="mt-1 block text-sm font-medium text-white/70">{n.unidade}</span>
              <p className="mt-3 text-base leading-relaxed text-white/65">{n.texto}</p>
            </li>
          ))}
        </ul>

        {/* Entregas — grade simples, sem barra rolável.
            Já foi trilho horizontal e voltou atrás: barra rolável
            dentro de página que rola é sempre uma briga entre dois
            alvos de rolagem. No trackpad vai um pouco de X junto com o
            Y, o navegador tranca o gesto na horizontal e a página
            inteira para de descer.

            São três cartões. Não vale um mecanismo, e muito menos vale
            prender a tela como nas duas seções que usam palco: aqui a
            pessoa está a duas seções dos grupos de WhatsApp e cada
            tela a mais é gente que não chega lá. */}
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {provas.entregas.map((e, i) => (
            <li
              key={e.id}
              data-revelar
              style={{ ['--atraso' as string]: `${i * 80}ms` }}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]"
            >
              <Imagem
                slot={`provas.entrega.${i + 1}`}
                slots={slots}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="w-full border-b border-white/10 object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <span className="text-sm font-medium text-amarelo">{e.municipio}</span>
                <h3 className="mt-2 text-xl text-white">{e.titulo}</h3>
                <p className="mt-2 flex-1 text-base text-white/65">{e.texto}</p>
                <span className="mt-5 inline-flex self-start rounded-full bg-white/10 px-4 py-1.5 font-[family-name:var(--font-titulo)] text-lg font-bold text-white tabular-nums">
                  {e.valor}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Era um aviso de "seção em preenchimento", com triângulo de
            alerta, de quando os números eram placeholder. Agora a
            seção tem dado real e esta linha é a CONTINUAÇÃO da lista —
            as leis que não couberam nos três cartões. Alerta amarelo
            em cima de prestação de contas lia como problema. */}
        <div className="mt-8 flex items-start gap-3 rounded-lg bg-white/[0.06] px-5 py-4 text-base text-white/80 ring-1 ring-white/10">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-amarelo" fill="currentColor" aria-hidden>
            <path d="M4 6h2v2H4V6Zm4 0h12v2H8V6ZM4 11h2v2H4v-2Zm4 0h12v2H8v-2Zm-4 5h2v2H4v-2Zm4 0h12v2H8v-2Z" />
          </svg>
          <p>{provas.aviso}</p>
        </div>
      </div>
    </Secao>
  )
}

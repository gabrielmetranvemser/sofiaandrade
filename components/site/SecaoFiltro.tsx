import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { BotaoLink } from '@/components/ui/Botao'
import { QuadroImagem } from '@/components/ui/QuadroImagem'

/**
 * Chamada para o gerador de moldura.
 *
 * O filtro é a peça mais subestimada do projeto: cada foto de perfil
 * trocada é uma peça de campanha circulando de graça, assinada por
 * alguém que a rede da pessoa conhece.
 */
export async function SecaoFiltro() {
  const { filtro } = await lerConteudo()

  return (
    <Secao id="filtro" fundo="amarelo" espaco="solto">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
        <div>
          <CabecalhoSecao
            etiqueta={filtro.etiqueta}
            titulo={filtro.titulo}
            intro={filtro.intro}
          />

          <ol className="mt-10 grid gap-5 sm:grid-cols-2">
            {filtro.passos.map((p, i) => (
              <li
                key={p.id}
                data-revelar
                style={{ ['--atraso' as string]: `${i * 70}ms` }}
                className="flex gap-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-azul-escuro text-sm font-bold text-white">
                  {p.numero}
                </span>
                <span className="min-w-0">
                  <strong className="block font-semibold">{p.titulo}</strong>
                  <span className="text-base text-azul-escuro/75">{p.texto}</span>
                </span>
              </li>
            ))}
          </ol>

          <div data-revelar className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <BotaoLink href="/filtro" variante="azul" tamanho="lg">
              {filtro.botaoEscolherFoto}
            </BotaoLink>
            <p className="flex items-center gap-2 text-base text-azul-escuro">
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M12 2 4 5.5V11c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5.5L12 2Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z" />
              </svg>
              {filtro.privacidade}
            </p>
          </div>
        </div>

        {/* Prévia das duas molduras */}
        <div data-revelar className="grid grid-cols-2 items-start gap-4">
          <QuadroImagem
            proporcao="9/16"
            tom="claro"
            raio="2xl"
            rotulo="Story"
            nota="1080 × 1920"
          />
          <QuadroImagem
            proporcao="1/1"
            tom="claro"
            raio="2xl"
            rotulo="Perfil"
            nota="1080 × 1080"
            className="mt-10"
          />
        </div>
      </div>
    </Secao>
  )
}

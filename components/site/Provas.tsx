import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Imagem } from '@/components/ui/Imagem'
import { Video } from '@/components/ui/Video'
import { formatoValido } from '@/lib/video'
import { Texto } from '@/components/ui/TextoComDestaque'

/**
 * Prestação de contas do mandato de vereadora. As leis vêm do registro
 * público da Câmara Municipal de Porto Velho.
 *
 * ⚠️ A FAIXA DE NÚMEROS SAIU, a pedido da campanha. Eram quatro
 *    cartões grandes — 9 leis, 1 comissão, 7 projetos, 14.634 votos —
 *    ocupando a primeira tela da seção. Dois deles já viviam em outro
 *    lugar da página (a faixa corrida diz "9 leis sancionadas", a
 *    introdução explica a comissão), e o quarto era o único dado da
 *    página que ninguém tinha confirmado.
 *
 *    Tirar quatro cartões grandes do topo deixaria a seção abrindo em
 *    texto puro, então o peso visual não some: ele passa para o vídeo,
 *    que sobe para o lado da introdução. Prestação de contas dita por
 *    ela vale mais que quatro algarismos — e a prova que o leitor
 *    confere sozinho continua sendo o registro público, lá no fim.
 */
export async function Provas() {
  const [{ provas }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  return (
    <Secao id="provas" fundo="azul-profundo" espaco="solto" className="overflow-hidden">

      <div className="relative">
        {/* Sem o vídeo, isto é uma coluna só e o cabeçalho ocupa a
            largura inteira, como em toda outra seção. Com o vídeo, a
            grade abre em duas. É o `grid` com `md:grid-cols-2` só
            quando há o que pôr do lado — daí o ternário, e não uma
            coluna vazia esperando. */}
        <div
          className={
            provas.video.url
              ? 'grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14'
              : ''
          }
        >
          <CabecalhoSecao
            etiqueta={provas.etiqueta}
            titulo={provas.titulo}
            intro={provas.intro}
            tom="escuro"
          />
          {provas.video.url ? (
            <div data-revelar className="mt-10 md:mt-0">
              <Video
                url={provas.video.url}
                formato={formatoValido(provas.video.formato)}
                opcoes={provas.video.opcoes}
                titulo={provas.video.titulo}
              />
            </div>
          ) : null}
        </div>

        {/* Entregas — grade simples, sem barra rolável.
            Já foi trilho horizontal e voltou atrás: barra rolável
            dentro de página que rola é sempre uma briga entre dois
            alvos de rolagem. No trackpad vai um pouco de X junto com o
            Y, o navegador tranca o gesto na horizontal e a página
            inteira para de descer.

            São três cartões. Não vale um mecanismo, e muito menos vale
            prender a tela como nas duas seções que usam palco: aqui a
            pessoa está a duas seções dos grupos de WhatsApp e cada
            tela a mais é gente que não chega lá.

            ⚠️ TINHAM FOTO E NÃO TÊM MAIS. Cada cartão é uma LEI, e não
            existe foto de uma lei. O que existia era espaço reservado
            para foto ilustrativa ao lado de "Lei 3.285/2025" — e foto
            ilustrativa enfraquece o único bloco DOCUMENTAL da página,
            que é o bloco que separa candidata de vendedor de promessa.
            O número da lei virou o elemento visual, e a prova de
            verdade desceu para o registro público, logo abaixo. */}
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {provas.entregas.map((e, i) => (
            <li
              key={e.id}
              data-revelar
              style={{ ['--atraso' as string]: `${i * 80}ms` }}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-6"
            >
              <span className="text-sm font-medium text-amarelo">{e.municipio}</span>
              <h3 className="mt-2 text-xl text-white"><Texto tom="amarelo">{e.titulo}</Texto></h3>
              <p className="mt-2 flex-1 text-base text-white/65"><Texto tom="amarelo">{e.texto}</Texto></p>
              <span className="mt-5 inline-flex self-start rounded-full bg-white/10 px-4 py-1.5 font-[family-name:var(--font-titulo)] text-lg font-bold text-white tabular-nums">
                {e.valor}
              </span>
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
          <p><Texto tom="amarelo">{provas.aviso}</Texto></p>
        </div>

        {/* O registro público.
            É a única coisa desta seção que o leitor pode conferir
            sozinho, agora, sem confiar em nós — e por isso é a peça
            mais valiosa dela. O print entra clicável: quem duvida
            clica, e quem clica já não duvidava do mesmo jeito. */}
        <div className="mt-8 grid items-center gap-8 rounded-2xl border border-white/10 bg-white/[0.06] p-7 md:grid-cols-[1fr_1.1fr] md:p-9">
          <div>
            <h3 className="titulo-secao text-white">{provas.documento.titulo}</h3>
            <p className="mt-4 text-base text-white/70">{provas.documento.texto}</p>
            <a
              href={provas.documento.link}
              target="_blank"
              rel="noopener noreferrer"
              className="toque mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-amarelo px-6 font-semibold text-azul-escuro transition-all duration-300 hover:brightness-105"
            >
              {provas.documento.rotuloLink}
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3ZM5 5h4v2H6v11h11v-3h2v5H5V5Z" />
              </svg>
            </a>
          </div>

          <a
            href={provas.documento.link}
            target="_blank"
            rel="noopener noreferrer"
            data-revelar
            className="block overflow-hidden rounded-xl ring-1 ring-white/15 transition-transform duration-300 hover:scale-[1.01]"
          >
            <Imagem
              slot="provas.documento"
              slots={slots}
              sizes="(max-width: 768px) 100vw, 45vw"
              className="w-full object-cover"
            />
          </a>
        </div>
      </div>
    </Secao>
  )
}

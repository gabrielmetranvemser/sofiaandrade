import type { Metadata } from 'next'
import Link from 'next/link'
import { botoesDaBio, type LinkDaBio } from '@/lib/bio'
import { config, diasAteAEleicao, emSilencioEleitoral } from '@/lib/config'
import { lerConteudo } from '@/lib/conteudo/ler'
import { resolverTokens } from '@/lib/conteudo/tokens'
import { lerSlots } from '@/lib/midia/ler'
import { BotaoDaBio } from '@/components/bio/BotaoDaBio'
import { RegistroDaBio } from '@/components/bio/RegistroDaBio'
import { FaixaDoTopo } from '@/components/grupos/FaixaDoTopo'
import { RodapeLegal } from '@/components/site/RodapeLegal'
import { Aviso } from '@/components/ui/Aviso'
import { Numero, Simbolo } from '@/components/ui/Marca'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'

/**
 * ⚠️ ESTÁTICA, E É UMA ESCOLHA QUE CUSTOU UMA FUNCIONALIDADE.
 *
 *    A primeira versão lia `searchParams` para aceitar `/bio?cidade=`,
 *    e com isso o botão do grupo iria direto ao grupo daquela cidade,
 *    num toque. Ler `searchParams` torna a rota dinâmica — e o
 *    Lighthouse de 18/09 mostrou o preço: `Cache-Control: private,
 *    no-store`, que tira a página do cache da CDN (todo visitante paga
 *    o TTFB do servidor em Gru) e reprova a auditoria de bf-cache, que
 *    é o que faz o "voltar" do navegador devolver a página instantânea
 *    — o gesto exato de quem abre um link, olha e volta.
 *
 *    Prerenderizada, ela sai do edge com `s-maxage` e o "voltar" é de
 *    graça. A cidade não faz falta aqui: este endereço fica na bio do
 *    Instagram, onde ninguém acrescenta parâmetro nenhum, e quem
 *    precisa de "anúncio por cidade" já tem a página de entrada
 *    (`/?cidade=`), que foi desenhada para isso e converte melhor.
 *    O botão do grupo cai em `/grupos`, que tem busca e localização.
 */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { paginas } = await lerConteudo()
  const meta = paginas.bio

  return {
    title: meta.tituloAba,
    description: meta.descricao,
    alternates: { canonical: '/bio' },
    openGraph: {
      title: meta.ogTitulo,
      description: meta.ogDescricao,
      url: `${config.siteUrl}/bio`,
    },
  }
}

/**
 * O LINK DA BIO.
 *
 * É o endereço que fica na bio do Instagram — o lugar de onde vem, hoje,
 * a maior parte do tráfego orgânico desta campanha. Uma tela, uma
 * pergunta: por onde você quer começar?
 *
 * ⚠️ POR QUE NÃO MANDAR ESSE PÚBLICO DIRETO PARA A HOME, que é o que a
 *    bio fazia. Porque as duas páginas respondem a perguntas
 *    diferentes. A home existe para CONVENCER quem não sabe quem ela é:
 *    tem história, prova, vídeo, e vinte blocos até o fim. Quem toca no
 *    link da bio já está no perfil dela, já viu o rosto e já leu o nome
 *    — chegou decidido a fazer alguma coisa, e o que faltava era o
 *    caminho. Mandar essa pessoa para a página de convencimento é
 *    cobrar dela um argumento que ela não pediu.
 *
 *    A home continua a um toque daqui, para quem quiser a história
 *    inteira. Ela só deixou de ser a única porta.
 *
 * ⚠️ OS BOTÕES SÃO DA CAMPANHA, NÃO DO CÓDIGO. Quem monta a lista é o
 *    painel (Seções ▸ Link da bio): escolhe a função, escreve o texto,
 *    põe um ícone e liga. Nenhum deles exige deploy — que é o ponto,
 *    porque a bio de uma campanha muda na semana da carreata e na
 *    semana do debate, e sempre num sábado.
 *
 * ⚠️ DE ONDE VEM O UTM. Esta página não reescreve endereço nenhum para
 *    "levar o UTM adiante", e é deliberado. Quem guarda a origem é o
 *    cookie de primeira parte que o `proxy.ts` grava na CHEGADA, e as
 *    rotas de servidor leem na saída — inclusive na que sai para o
 *    WhatsApp, onde não há URL nossa para carregar parâmetro nenhum.
 *    Pendurar `utm_*` nos links daqui criaria um segundo caminho
 *    brigando com esse: `combinarMarcas` trata UTM novo como mídia
 *    nova e apagaria o `fbclid` do clique original, mandando à Meta uma
 *    conversão órfã. Ver `lib/campanha/marcas.ts`.
 *
 *    O que o painel entrega, em Link da bio, é o endereço DESTA página
 *    já com o UTM certo para colar em cada lugar — Instagram, TikTok,
 *    disparo. É ali que a origem entra: uma vez, na porta. E como o
 *    UTM fica na URL, ele continua chegando mesmo com a página servida
 *    do cache: quem lê a barra de endereço é o navegador e o proxy, e
 *    nenhum dos dois depende do HTML.
 */
export default async function PaginaBio() {
  const [conteudo, slots] = await Promise.all([lerConteudo(), lerSlots()])

  const { bio, candidata, ctas } = conteudo
  const emSilencio = emSilencioEleitoral()

  const botoes = botoesDaBio({
    links: bio.links as unknown as LinkDaBio[],
    conteudo,
    emSilencio,
  })

  // A mesma tarja da página de entrada, com as mesmas fotos: quem vem
  // da bio e quem vem do anúncio precisam reconhecer o mesmo lugar.
  const slotDaFoto = slots['entrada.foto'] ? 'entrada.foto' : 'hero.retrato'
  const simboloDaMarca = slots['marca.simbolo']?.url ?? null

  // Igual à página de entrada: com um dia ou menos a contagem deixa de
  // ajudar, e entra a etiqueta fixa no lugar.
  //
  // ⚠️ NO SILÊNCIO ELEITORAL O SELO INTEIRO SAI, contagem e etiqueta. Não
  //    é zelo excessivo: "Faltam 2 dias para a eleição" é chamamento de
  //    campanha, e a página continua no ar durante o silêncio — foi
  //    exatamente o que apareceu no primeiro teste, em cima do aviso que
  //    diz que os canais estão suspensos.
  const dias = diasAteAEleicao()
  const selo = emSilencio
    ? null
    : bio.contagem && dias !== null && dias >= 2
      ? bio.contagem.replaceAll('{dias}', String(dias))
      : resolverTokens(bio.etiqueta, conteudo)

  return (
    <>
      <RegistroDaBio />

      {/* Mesma moldura da página de entrada: azul como margem, e o
          conteúdo num cartão branco em cima. Custa uma cor, e não uma
          imagem. */}
      <main id="conteudo" className="fundo-azul-profundo pt-3 pb-5 sm:pt-6 sm:pb-8">
        <div className="mx-auto w-full max-w-md px-3 sm:px-4">
          <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-alta ring-1 ring-tinta/5">
            <FaixaDoTopo slots={slots} slotDaFoto={slotDaFoto} numero={candidata.numero} />

            <div className="relative isolate px-5 pt-4 pb-7 sm:px-7 sm:pt-6">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-claro" />

              {/* A assinatura, numa linha só. Sem menu: cada item de
                  menu seria uma saída antes da lista que é o conteúdo
                  desta página. */}
              <div className="flex items-center justify-center gap-2">
                <Simbolo prioridade url={simboloDaMarca} className="h-6 w-auto shrink-0" />
                <p className="truncate text-[0.8125rem] leading-none text-grafite">
                  <span className="font-[family-name:var(--font-titulo)] font-bold tracking-[-0.02em] text-tinta">
                    {candidata.nome}
                  </span>{' '}
                  · {candidata.cargo}
                  <span className="hidden sm:inline"> · {candidata.partido}</span>
                </p>
              </div>

              {/* ⚠️ TUDO CENTRADO daqui para baixo, e é o que a página
                  pediu: ela é um cartão estreito de celular, lido de
                  cima para baixo num eixo só. Texto alinhado à esquerda
                  cria uma segunda margem de leitura que briga com a
                  tarja e com os botões, que são simétricos. */}
              {selo ? (
                <p className="mt-4 flex justify-center">
                  <span className="inline-flex items-center rounded-full bg-amarelo px-3 py-1.5 text-[0.6875rem] font-bold tracking-[0.08em] text-azul-escuro uppercase">
                    {selo}
                  </span>
                </p>
              ) : null}

              <h1 className="mt-2.5 text-center font-[family-name:var(--font-titulo)] text-[1.75rem] leading-[1.06] font-bold tracking-[-0.03em] text-balance text-tinta sm:text-[2.125rem]">
                <TextoComDestaque texto={bio.titulo} tom="verde" />
              </h1>

              {bio.apoio ? (
                <p className="mt-2.5 text-center text-[1.0625rem] leading-relaxed text-balance text-grafite">
                  <TextoComDestaque texto={bio.apoio} tom="verde" />
                </p>
              ) : null}

              {emSilencio ? (
                <Aviso tom="info" className="mt-6">
                  <strong className="font-semibold">{ctas.silencio}</strong>
                </Aviso>
              ) : null}

              {botoes.length > 0 ? (
                // `<nav>` e não `<div>`: para um leitor de tela esta
                // lista É a navegação da página, e o rótulo abaixo
                // deixa passar direto quem não quer ouvir os seis.
                <nav aria-label="Links da campanha" className="mt-6">
                  <ul className="grid gap-2.5">
                    {botoes.map((botao) => (
                      <BotaoDaBio key={botao.id} botao={botao} />
                    ))}
                  </ul>
                </nav>
              ) : null}

              {bio.nota && !emSilencio ? (
                <p className="mt-6 text-center text-sm leading-relaxed text-grafite">
                  {resolverTokens(bio.nota, conteudo)}
                </p>
              ) : null}
            </div>

            {/* ── O pé do cartão, no azul ─────────────────────────
                O número e o Instagram. É o que fecha a peça e devolve a
                pessoa ao perfil de onde ela veio, se for o caso.

                ⚠️ EMPILHADO, E NÃO NAS DUAS PONTAS. Lado a lado eles
                formavam duas âncoras nas bordas, e era a única parte da
                página que não seguia o eixo do meio. */}
            <div className="fundo-azul-profundo flex flex-col items-center gap-3 px-5 py-6 text-center text-white sm:px-7">
              <Numero className="w-24" />
              {bio.instagramRotulo ? (
                <a
                  href={candidata.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-bio="Rodapé · Instagram"
                  className="inline-flex min-h-11 max-w-full items-center text-sm font-medium text-white/90 underline decoration-white/30 underline-offset-[5px] transition-colors hover:decoration-white"
                >
                  <span className="truncate">
                    {resolverTokens(bio.instagramRotulo, conteudo)}
                  </span>
                  <span className="sr-only"> (abre em outra aba)</span>
                </a>
              ) : null}
            </div>
          </article>

          {/* Fora do cartão, em letra pequena sobre o azul: é rodapé de
              página, não conteúdo. A identificação eleitoral completa
              está logo abaixo, no RodapeLegal. */}
          <p className="mt-4 text-center text-sm text-white/70">
            <Link
              href="/politica-de-privacidade"
              prefetch={false}
              className="min-h-11 underline decoration-white/30 underline-offset-[5px] transition-colors hover:decoration-white"
            >
              Política de privacidade
            </Link>
          </p>
        </div>
      </main>

      <RodapeLegal />
    </>
  )
}

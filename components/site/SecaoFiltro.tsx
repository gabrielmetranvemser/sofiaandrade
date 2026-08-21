import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { lerApoios, formatarApoios } from '@/lib/apoios'
import { resolverExemplos, resolverMolduras } from '@/lib/molduras'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { BotaoLink } from '@/components/ui/Botao'
import { Texto } from '@/components/ui/TextoComDestaque'
import { VitrineFiltro } from './VitrineFiltro'

/**
 * Chamada para o gerador de moldura.
 *
 * O filtro é a peça mais subestimada do projeto: cada foto de perfil
 * trocada é uma peça de campanha circulando de graça, assinada por
 * alguém que a rede da pessoa conhece.
 *
 * A prévia mostra a ARTE DE VERDADE, e não dois quadros cinza com a
 * palavra "Story" dentro. Quem vê a moldura entende o que vai ganhar;
 * quem vê um retângulo vazio não tem por que tocar no botão.
 */
export async function SecaoFiltro() {
  const [{ filtro }, slots, apoios] = await Promise.all([
    lerConteudo(),
    lerSlots(),
    lerApoios(),
  ])

  const molduras = resolverMolduras(slots)
  // Resolvido AQUI, no servidor, porque a vitrine é Client Component e
  // não alcança o Storage — mesma razão de `resolverMolduras`.
  const exemplos = resolverExemplos(slots)

  return (
    // Verde de superfície, amarelo só nos detalhes: o número do passo,
    // o botão e o realce do título. Amarelo ocupando a seção inteira
    // gritava e achatava tudo o que estava por cima dele.
    <Secao id="filtro" fundo="verde" espaco="solto">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
        <div>
          <CabecalhoSecao
            etiqueta={filtro.etiqueta}
            titulo={filtro.titulo}
            intro={filtro.intro}
            tom="escuro"
          />

          <ol className="mt-10 grid gap-5 sm:grid-cols-2">
            {filtro.passos.map((p, i) => (
              <li
                key={p.id}
                data-revelar
                style={{ ['--atraso' as string]: `${i * 70}ms` }}
                className="flex gap-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amarelo text-sm font-bold text-azul-escuro">
                  {p.numero}
                </span>
                <span className="min-w-0">
                  <strong className="block font-semibold"><Texto tom="amarelo">{p.titulo}</Texto></strong>
                  <span className="text-base text-white/75"><Texto tom="amarelo">{p.texto}</Texto></span>
                </span>
              </li>
            ))}
          </ol>

          {/* Prova social só entra depois de passar de um piso — número
              pequeno aqui trabalha contra. Ver lib/apoios.ts. */}
          {apoios ? (
            <p data-revelar className="mt-8 flex items-center gap-2.5 text-base text-white">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-amarelo text-azul-escuro" aria-hidden>
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                  <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-2.7 0-8 1.3-8 4v3h9.5v-2.5c0-1.4.7-2.6 1.8-3.5A14 14 0 0 0 8 13Zm8 0c-.9 0-1.9.1-2.8.3 1.3.9 2.3 2.1 2.3 3.7V20H24v-3c0-2.7-5.3-4-8-4Z" />
                </svg>
              </span>
              <span>
                <strong className="font-[family-name:var(--font-titulo)] text-xl font-bold tabular-nums">
                  {formatarApoios(apoios)}
                </strong>{' '}
                {filtro.apoios}
              </span>
            </p>
          ) : null}

          <div data-revelar className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <BotaoLink href="/filtro" variante="acao" tamanho="lg">
              {filtro.botaoEscolherFoto}
            </BotaoLink>
            <p className="flex items-center gap-2 text-base text-white/85">
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M12 2 4 5.5V11c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5.5L12 2Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z" />
              </svg>
              {filtro.privacidade}
            </p>
          </div>
        </div>

        {/* As duas molduras, na arte que a pessoa vai receber — e, por
            baixo delas, apoiadores de verdade trocando sozinhos.

            A moldura é transparente no miolo: sozinha ela some, e sobre
            o verde da seção o anel do formato de perfil fica invisível.
            Sempre houve algo atrás. Era uma silhueta cinza, que mostra
            ONDE a foto entra; agora são pessoas, que mostram COMO fica.
            Enquanto o painel não tiver nenhum par completo, a silhueta
            volta sozinha — ver `VitrineFiltro`. */}
        <VitrineFiltro
          molduras={molduras}
          exemplos={exemplos}
          rotulos={{
            story: filtro.formatos.story.rotulo,
            perfil: filtro.formatos.perfil.rotulo,
          }}
        />
      </div>
    </Secao>
  )
}

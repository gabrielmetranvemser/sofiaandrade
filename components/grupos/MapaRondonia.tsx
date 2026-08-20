import mapa from '@/data/mapa-ro.json'
import type { MunicipioComGrupo } from '@/lib/tipos'
import { MapaInterativo } from './MapaInterativo'

/**
 * Rondônia em relevo, pintada pelo estado dos grupos.
 *
 * Resolve o problema das 52 cidades melhor que qualquer lista: ninguém
 * precisa saber escrever "Governador Jorge Teixeira". Toca-se no lugar
 * onde se mora. E é a peça mais compartilhável da seção depois do
 * filtro — "olha, minha cidade já tem grupo" vira print.
 *
 * É SERVER COMPONENT, e essa é a decisão que segura o peso. A malha
 * simplificada tem 32 kB de coordenadas. Num Client Component isso
 * viraria 32 kB de JavaScript no bundle da home — mais que tudo o que
 * a página tem hoje. Aqui desce como HTML, que comprime muito melhor e
 * não custa parse nem execução. O único JavaScript é a camada de
 * interação, que trabalha por delegação e não conhece um path sequer.
 *
 * ── COMO O RELEVO É FEITO ────────────────────────────────────────
 * Sem biblioteca 3D, sem canvas. O grupo inteiro leva uma matriz que
 * achata o eixo Y e gira um pouco — é a inclinação da mesa.
 *
 * A parede lateral é uma PILHA: o mesmo contorno repetido nove vezes,
 * subindo um degrau de cada vez, na cor escura. Empilhados, os nove
 * fecham um bloco sólido. A primeira versão desenhava uma cópia só
 * atrás, e não era relevo nenhum — era sombra.
 *
 * Parede de verdade seria um quadrilátero por aresta do contorno:
 * cerca de duas mil formas, dezenas de kB. A pilha chega no mesmo
 * lugar com nove <use> por município, e <use> é barato porque o
 * contorno existe UMA vez, em <defs>.
 *
 * Todos os <use> da parede herdam o fill do <g> em volta, então cada
 * um custa só href e deslocamento.
 *
 * O levantamento é aplicado em coordenadas de ANTES da matriz, então
 * precisa ser pré-distorcido: a constante ELEVACAO desfaz o giro e o
 * achatamento para que o movimento na tela saia exatamente vertical.
 * Levantar direto em Y sairia torto.
 *
 * A ordem dos municípios no arquivo é de trás para a frente (norte
 * para sul), e é ela que faz o bloco da frente cobrir a parede do de
 * trás. SVG não tem z-index — quem chega depois fica por cima.
 */

const ANGULO = -7
const ACHATAMENTO = 0.62

const rad = (ANGULO * Math.PI) / 180
const sen = Math.sin(rad)
const cos = Math.cos(rad)

/** Deslocamento, ANTES da matriz, que vira 1px para cima na tela. */
const ELEVACAO = { x: -sen, y: -cos / ACHATAMENTO }

const [, , LARGURA_BASE, ALTURA_BASE] = mapa.viewBox.split(' ').map(Number)
const CENTRO = { x: LARGURA_BASE / 2, y: ALTURA_BASE / 2 }

const TRANSFORMACAO =
  `translate(${CENTRO.x} ${CENTRO.y}) rotate(${ANGULO}) ` +
  `scale(1 ${ACHATAMENTO}) translate(${-CENTRO.x} ${-CENTRO.y})`

/** Onde um ponto do mapa achatado cai na tela. */
function projetar(x: number, y: number) {
  const px = x - CENTRO.x
  const py = (y - CENTRO.y) * ACHATAMENTO
  return {
    x: px * cos - py * sen + CENTRO.x,
    y: px * sen + py * cos + CENTRO.y,
  }
}

/**
 * Altura de cada degrau da parede, em unidades do desenho.
 *
 * É passo FIXO, e não número fixo de degraus: com nove degraus para
 * qualquer altura, o bloco alto ganhava degraus de quase 2px na tela e
 * a parede saía listrada. Com passo fixo, quem é mais alto ganha mais
 * degraus e todos ficam igualmente lisos.
 */
const PASSO = 1.5

/** Altura do bloco, por estado. Grupo aberto é o mais alto: o relevo
 *  carrega a mesma informação da cor, para quem enxerga mal cor. */
// Três degraus bem separados. Alturas próximas viram um planalto só e
// o relevo deixa de dizer qualquer coisa.
const ALTURA: Record<string, number> = {
  aberto: 46,
  cheio: 27,
  em_breve: 12,
  desativado: 12,
}

/** Quanto o bloco sobe com o ponteiro em cima. */
const ERGUER = 16

/**
 * UMA COR SÓ, EM TRÊS TONS.
 *
 * A primeira versão misturava verde, azul e cinza — três matizes
 * diferentes no mesmo desenho, que é o mesmo erro dos gradientes que
 * saíram da paleta lá atrás: matizes distantes brigam e o mapa vira
 * remendo. Aqui é o verde da marca do claro ao escuro, e a escala
 * carrega o significado sozinha: quanto mais escuro e mais alto, mais
 * perto de ter grupo.
 */
const TOPO: Record<string, string> = {
  aberto: '#3f8836',
  cheio: '#86bd7e',
  em_breve: '#e0ecdb',
  desativado: '#e0ecdb',
}

const PAREDE: Record<string, string> = {
  aberto: '#27591f',
  cheio: '#579150',
  em_breve: '#b3c9ac',
  desativado: '#b3c9ac',
}

// A caixa de recorte sai dos quatro cantos passados pela matriz, mais
// a laje mais alta. Calculada e não chutada: mexer no ângulo ou no
// achatamento continua enquadrando certo.
const CANTOS = [
  projetar(0, 0),
  projetar(LARGURA_BASE, 0),
  projetar(LARGURA_BASE, ALTURA_BASE),
  projetar(0, ALTURA_BASE),
]
const MARGEM = 14
const MAIOR_ALTURA = Math.max(...Object.values(ALTURA))
const minX = Math.min(...CANTOS.map((c) => c.x)) - MARGEM
const maxX = Math.max(...CANTOS.map((c) => c.x)) + MARGEM
const minY = Math.min(...CANTOS.map((c) => c.y)) - MAIOR_ALTURA - ERGUER - MARGEM
const maxY = Math.max(...CANTOS.map((c) => c.y)) + MARGEM
const VIEWBOX = `${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}`

export function MapaRondonia({
  municipios,
  destacado,
}: {
  municipios: MunicipioComGrupo[]
  /** Slug sugerido pelo IP: nasce já escolhido. */
  destacado?: string | null
}) {
  const porSlug = new Map(municipios.map((m) => [m.slug, m]))
  const abertos = municipios.filter((m) => m.disponivel).length

  return (
    <MapaInterativo>
      <svg
        viewBox={VIEWBOX}
        role="img"
        aria-label={`Mapa de Rondônia com os ${municipios.length} municípios. ${abertos} com grupo aberto.`}
        className="mapa-svg h-auto w-full overflow-visible"
        // O erguer do ponteiro também precisa ser pré-distorcido, então
        // desce como variável já convertida para o espaço do desenho.
        style={
          {
            ['--erguer-x']: `${(ELEVACAO.x * ERGUER).toFixed(2)}px`,
            ['--erguer-y']: `${(ELEVACAO.y * ERGUER).toFixed(2)}px`,
          } as React.CSSProperties
        }
      >
        <defs>
          <filter id="borrao-chao" x="-8%" y="-8%" width="116%" height="124%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          {mapa.municipios.map(({ slug, d }) => (
            <path key={slug} id={`ro-${slug}`} d={d} />
          ))}
        </defs>

        <g transform={TRANSFORMACAO}>
          {/* A sombra no chão. É o que separa "desenho achatado" de
              "objeto pousado numa mesa" — sozinha faz mais pelo relevo
              que qualquer altura de parede.

              A opacidade vai no GRUPO, e não em cada forma: os 52
              contornos se tocam nas divisas, e com alfa por forma as
              bordas somariam e apareceriam como uma teia escura. No
              grupo, o conjunto é composto de uma vez.

              Sai da tela no celular: desfoque desta área custa caro em
              GPU de aparelho fraco, e é justamente onde ele menos se
              nota. */}
          <g className="mapa-sombra" filter="url(#borrao-chao)" opacity={0.22}>
            {mapa.municipios.map(({ slug }) => (
              <use
                key={slug}
                href={`#ro-${slug}`}
                x={-ELEVACAO.x * 9}
                y={-ELEVACAO.y * 9}
                fill="#0f3b18"
              />
            ))}
          </g>

          {mapa.municipios.map(({ slug }) => {
            const m = porSlug.get(slug)
            if (!m) return null

            const h = ALTURA[m.status] ?? ALTURA.em_breve
            const escolhida = slug === destacado

            return (
              <g
                key={slug}
                data-slug={slug}
                data-nome={m.nome}
                data-status={m.status}
                data-disponivel={m.disponivel ? '1' : '0'}
                className={`mapa-mun${escolhida ? ' escolhida' : ''}`}
              >
                {/* A parede, em degraus. O fill vem do <g>: cada degrau
                    custa só o href e o deslocamento. */}
                <g fill={PAREDE[m.status] ?? PAREDE.em_breve}>
                  {Array.from({ length: Math.ceil(h / PASSO) }, (_, i) => {
                    const t = i * PASSO
                    return (
                      <use
                        key={i}
                        href={`#ro-${slug}`}
                        x={ELEVACAO.x * t}
                        y={ELEVACAO.y * t}
                      />
                    )
                  })}
                </g>

                {/* O topo do bloco. */}
                <use
                  href={`#ro-${slug}`}
                  x={ELEVACAO.x * h}
                  y={ELEVACAO.y * h}
                  fill={TOPO[m.status] ?? TOPO.em_breve}
                  // A divisa é da cor da PRÓPRIA parede, fina e
                  // apagada. Branco abria sulcos claros no meio do
                  // verde e o mapa virava um quebra-cabeça; sem divisa
                  // nenhuma, vizinhos do mesmo tom viram um borrão só
                  // e ninguém acha a própria cidade. Da cor da parede,
                  // ela lê como vinco e não como corte.
                  stroke={PAREDE[m.status] ?? PAREDE.em_breve}
                  strokeOpacity={0.55}
                  strokeWidth={0.9}
                  strokeLinejoin="round"
                  className="mapa-topo"
                />
              </g>
            )
          })}
        </g>
      </svg>
    </MapaInterativo>
  )
}

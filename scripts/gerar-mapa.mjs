/**
 * Gera data/mapa-ro.json a partir da malha oficial do IBGE.
 *
 *   node scripts/gerar-mapa.mjs
 *
 * Roda à mão, e o resultado é versionado. Não é build step: a malha do
 * IBGE muda a cada década, não a cada deploy, e uma chamada de rede no
 * build é um jeito de o deploy quebrar por causa de um servidor de
 * terceiro fora do ar.
 *
 * O QUE ACONTECE AQUI
 *  1. baixa a malha municipal de Rondônia (UF 11), qualidade mínima
 *  2. casa cada polígono com os nossos 52 slugs, pelo nome normalizado
 *  3. projeta lat/lon num plano, corrigindo a longitude pelo cosseno da
 *     latitude — sem isso Rondônia sai esticada na horizontal
 *  4. simplifica com Douglas-Peucker e arredonda para uma casa
 *  5. escreve os paths prontos para o <svg>
 *
 * ⚠️ A simplificação é POR POLÍGONO, não topológica. Dois vizinhos
 *    dividem a mesma fronteira e cada um a simplifica por conta, então
 *    sobram frestas de fração de pixel entre eles. É por isso que o
 *    componente desenha cada município com traço branco: a fresta cai
 *    dentro do traço e vira a separação que o mapa teria de qualquer
 *    jeito. Resolver de verdade exigiria topojson, que custa uma
 *    dependência e um passo de build para um problema que não aparece.
 */

import { readFile, writeFile } from 'node:fs/promises'

const MALHA =
  'https://servicodados.ibge.gov.br/api/v3/malhas/estados/11' +
  '?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio'
const LISTA = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/11/municipios'

/** A mesma normalização de lib/geo.ts. Repetida porque este script não
 *  passa pelo bundler e não pode importar TypeScript. */
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // acentos
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Douglas-Peucker. Tolerância em unidades do viewBox. */
function simplificar(pontos, tolerancia) {
  if (pontos.length <= 2) return pontos

  let maior = 0
  let indice = 0
  const [ax, ay] = pontos[0]
  const [bx, by] = pontos[pontos.length - 1]
  const dx = bx - ax
  const dy = by - ay
  const norma = dx * dx + dy * dy

  for (let i = 1; i < pontos.length - 1; i++) {
    const [px, py] = pontos[i]
    // distância do ponto ao segmento a–b
    let t = norma === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / norma
    t = Math.max(0, Math.min(1, t))
    const qx = ax + t * dx
    const qy = ay + t * dy
    const d = Math.hypot(px - qx, py - qy)
    if (d > maior) {
      maior = d
      indice = i
    }
  }

  if (maior <= tolerancia) return [pontos[0], pontos[pontos.length - 1]]

  return [
    ...simplificar(pontos.slice(0, indice + 1), tolerancia).slice(0, -1),
    ...simplificar(pontos.slice(indice), tolerancia),
  ]
}

const LARGURA = 1000
const TOLERANCIA = 0.9

/** Centroide e área de um anel fechado, pela fórmula do polígono. */
function centroideDeArea(pontos) {
  let a2 = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pontos.length; i++) {
    const [x1, y1] = pontos[i]
    const [x2, y2] = pontos[(i + 1) % pontos.length]
    const cruz = x1 * y2 - x2 * y1
    a2 += cruz
    cx += (x1 + x2) * cruz
    cy += (y1 + y2) * cruz
  }
  if (a2 === 0) {
    const m = pontos.reduce((s, [x, y]) => [s[0] + x, s[1] + y], [0, 0])
    return { x: m[0] / pontos.length, y: m[1] / pontos.length, area: 0 }
  }
  return { x: cx / (3 * a2), y: cy / (3 * a2), area: Math.abs(a2 / 2) }
}

async function principal() {
  console.log('baixando a malha do IBGE…')
  const [malha, lista, nossos] = await Promise.all([
    fetch(MALHA).then((r) => r.json()),
    fetch(LISTA).then((r) => r.json()),
    readFile(new URL('../data/municipios-ro.json', import.meta.url), 'utf8').then(JSON.parse),
  ])

  const nomePorCodigo = new Map(lista.map((m) => [String(m.id), m.nome]))
  const slugPorNome = new Map(nossos.map((m) => [normalizar(m.nome), m.slug]))

  // ── extremos, para projetar ──
  let latMin = Infinity, latMax = -Infinity, lonMin = Infinity, lonMax = -Infinity
  const aneisPorCodigo = new Map()

  for (const f of malha.features) {
    const codigo = String(f.properties.codarea)
    const geo = f.geometry
    const poligonos = geo.type === 'Polygon' ? [geo.coordinates] : geo.coordinates
    const aneis = []
    for (const poligono of poligonos) {
      for (const anel of poligono) {
        aneis.push(anel)
        for (const [lon, lat] of anel) {
          if (lat < latMin) latMin = lat
          if (lat > latMax) latMax = lat
          if (lon < lonMin) lonMin = lon
          if (lon > lonMax) lonMax = lon
        }
      }
    }
    aneisPorCodigo.set(codigo, aneis)
  }

  const latMedia = ((latMin + latMax) / 2) * (Math.PI / 180)
  const k = Math.cos(latMedia)
  const larguraGraus = (lonMax - lonMin) * k
  const escala = LARGURA / larguraGraus
  const ALTURA = Math.round((latMax - latMin) * escala)

  const projetar = ([lon, lat]) => [
    (lon - lonMin) * k * escala,
    (latMax - lat) * escala,
  ]

  // ── paths ──
  const municipios = []
  const semPar = []

  for (const [codigo, aneis] of aneisPorCodigo) {
    const nome = nomePorCodigo.get(codigo)
    const slug = nome ? slugPorNome.get(normalizar(nome)) : undefined
    if (!slug) {
      semPar.push(`${codigo} ${nome ?? '?'}`)
      continue
    }

    let d = ''
    let maiorArea = 0
    let centroide = [0, 0]

    for (const anel of aneis) {
      const pontos = simplificar(anel.map(projetar), TOLERANCIA)
      if (pontos.length < 3) continue
      d += pontos
        .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
        .join('')
      d += 'Z'

      // Centroide de área do maior anel. Serve para duas coisas: a
      // ordem de pintura da versão em relevo e o ponto de ancorar
      // rótulo. Média simples dos vértices não serve — puxa para onde
      // a fronteira tem mais detalhe, e sai fora do município em
      // formatos alongados.
      const c = centroideDeArea(pontos)
      if (c.area > maiorArea) {
        maiorArea = c.area
        centroide = [Number(c.x.toFixed(1)), Number(c.y.toFixed(1))]
      }
    }
    if (d) municipios.push({ slug, d, centroide })
  }

  if (semPar.length) throw new Error(`sem par nos nossos 52: ${semPar.join(', ')}`)
  if (municipios.length !== nossos.length) {
    throw new Error(`saíram ${municipios.length} paths para ${nossos.length} municípios`)
  }

  // ORDEM DE PINTURA, de trás para a frente. No relevo cada município
  // é uma laje com parede lateral, e a laje da frente precisa cobrir a
  // parede da de trás. Em SVG isso é ordem no documento — não existe
  // z-index. Ordenar por slug deixaria paredes atravessando lajes.
  municipios.sort((a, b) => a.centroide[1] - b.centroide[1])

  const saida = {
    fonte: 'IBGE — malha municipal de Rondônia, qualidade mínima',
    gerado_por: 'scripts/gerar-mapa.mjs',
    viewBox: `0 0 ${LARGURA} ${ALTURA}`,
    municipios,
  }

  const destino = new URL('../data/mapa-ro.json', import.meta.url)
  await writeFile(destino, JSON.stringify(saida))
  const bytes = JSON.stringify(saida).length
  console.log(`${municipios.length} municípios · ${(bytes / 1024).toFixed(1)} kB · viewBox ${saida.viewBox}`)
}

principal().catch((e) => {
  console.error(e)
  process.exit(1)
})

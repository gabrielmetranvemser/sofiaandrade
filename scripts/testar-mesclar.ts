/**
 * Sanidade do merge de conteúdo.
 *
 * `mesclar()` é o único ponto do projeto onde um bug silencioso
 * corrompe o site inteiro, e a regra de array é sutil. Não há
 * framework de teste aqui, então isto roda sozinho:
 *
 *   node --experimental-strip-types scripts/testar-mesclar.ts
 */
import { mesclar } from '../lib/conteudo/mesclar.ts'

let falhas = 0

function conferir(nome: string, obtido: unknown, esperado: unknown) {
  const a = JSON.stringify(obtido)
  const b = JSON.stringify(esperado)
  if (a === b) {
    console.log(`  ✓ ${nome}`)
  } else {
    falhas++
    console.log(`  ✗ ${nome}\n      esperado: ${b}\n      obtido:   ${a}`)
  }
}

console.log('mesclar()')

conferir(
  'override esparso mantém o resto do padrão',
  mesclar({ hero: { etiqueta: 'E', titulo: ['a', 'b'], sub: 'S' } }, { hero: { titulo: ['X', 'Y'] } }),
  { hero: { etiqueta: 'E', titulo: ['X', 'Y'], sub: 'S' } },
)

conferir(
  'array SUBSTITUI — remover item funciona',
  mesclar({ p: ['1', '2', '3'] }, { p: ['1', '2'] }),
  { p: ['1', '2'] },
)

conferir(
  'array SUBSTITUI — acrescentar item funciona',
  mesclar({ p: ['1'] }, { p: ['1', '2', '3'] }),
  { p: ['1', '2', '3'] },
)

conferir(
  'chave que o padrão não conhece é descartada',
  mesclar({ a: 1 }, { a: 2, invasor: 'x' }),
  { a: 2 },
)

conferir('null não sobrescreve', mesclar({ a: 'padrao' }, { a: null }), { a: 'padrao' })
conferir('undefined não sobrescreve', mesclar({ a: 'padrao' }, {}), { a: 'padrao' })

conferir(
  'tipo trocado não sobrescreve',
  mesclar({ a: 'texto' }, { a: 42 }),
  { a: 'texto' },
)

conferir('override vazio devolve o padrão', mesclar({ a: 1, b: { c: 2 } }, {}), { a: 1, b: { c: 2 } })

conferir(
  'aninhamento profundo',
  mesclar({ a: { b: { c: { d: 'padrao', e: 'fica' } } } }, { a: { b: { c: { d: 'novo' } } } }),
  { a: { b: { c: { d: 'novo', e: 'fica' } } } },
)

conferir(
  'lista de objeto substitui inteira, com id',
  mesclar(
    { itens: [{ id: 'i1', t: 'a' }, { id: 'i2', t: 'b' }] },
    { itens: [{ id: 'i2', t: 'b' }, { id: 'i3', t: 'c' }] },
  ),
  { itens: [{ id: 'i2', t: 'b' }, { id: 'i3', t: 'c' }] },
)

console.log(falhas === 0 ? '\ntudo certo.' : `\n${falhas} falha(s).`)
process.exit(falhas === 0 ? 0 : 1)

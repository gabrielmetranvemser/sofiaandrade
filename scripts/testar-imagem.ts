/**
 * Sanidade do pipeline de imagem.
 *
 *   node --experimental-strip-types scripts/testar-imagem.ts <pasta>
 */
import { readFileSync } from 'node:fs'
import { SLOTS_POR_CHAVE } from '../content/slots.ts'
import { ErroImagem, processarImagem } from '../lib/midia/processar.ts'

const pasta = process.argv[2]
if (!pasta) {
  console.error('uso: node --experimental-strip-types scripts/testar-imagem.ts <pasta>')
  process.exit(1)
}

const CASOS: { arquivo: string; slot: string; esperado: 'passa' | 'falha' }[] = [
  { arquivo: 'valida-4x5.png', slot: 'origem.retrato', esperado: 'passa' },
  { arquivo: 'sem-alpha.jpg', slot: 'hero.retrato', esperado: 'falha' },
  { arquivo: 'pequena.png', slot: 'origem.retrato', esperado: 'falha' },
  { arquivo: 'proporcao-errada.png', slot: 'origem.retrato', esperado: 'falha' },
  { arquivo: 'malicioso.png', slot: 'origem.retrato', esperado: 'falha' },
  { arquivo: 'moldura-ok.png', slot: 'moldura.story', esperado: 'passa' },
]

let falhas = 0

for (const caso of CASOS) {
  const bytes = readFileSync(`${pasta}/${caso.arquivo}`)
  const file = new File([bytes], caso.arquivo)
  const slot = SLOTS_POR_CHAVE[caso.slot]

  try {
    const r = await processarImagem(file, slot)
    if (caso.esperado === 'falha') {
      falhas++
      console.log(`  ✗ ${caso.arquivo} → devia falhar, mas passou`)
    } else {
      const kb = (r.bytes / 1024).toFixed(0)
      console.log(
        `  ✓ ${caso.arquivo.padEnd(22)} → ${r.largura}×${r.altura} webp, ${kb} kB, ` +
          `alpha ${r.temAlpha ? 'sim' : 'não'}, blur ${r.blur.length}b`,
      )
    }
  } catch (e) {
    const msg = e instanceof ErroImagem ? e.message : String(e)
    if (caso.esperado === 'passa') {
      falhas++
      console.log(`  ✗ ${caso.arquivo} → devia passar: ${msg}`)
    } else {
      console.log(`  ✓ ${caso.arquivo.padEnd(22)} → recusado: ${msg}`)
    }
  }
}

console.log(falhas === 0 ? '\ntudo certo.' : `\n${falhas} falha(s).`)
process.exit(falhas === 0 ? 0 : 1)

/**
 * De qual anúncio veio esta conversão?
 *
 *   node --experimental-strip-types scripts/testar-utm.ts
 *
 * ⚠️ POR QUE ESTE TESTE EXISTE, e não é por gosto de testar.
 *
 *    A atribuição é o único lugar do projeto onde o erro NÃO APARECE.
 *    Se o merge de conteúdo quebra, a página sai errada e alguém vê. Se
 *    a atribuição quebra, o site continua perfeito, a pessoa entra no
 *    grupo, e o que muda é uma coluna no banco: a conversão vira
 *    "orgânica". O número existe, parece certo, e está errado — e do
 *    outro lado a Meta passa a otimizar a campanha contra um alvo que
 *    ela não consegue atribuir a anúncio nenhum.
 *
 *    Já aconteceu neste projeto duas vezes, pelas duas pontas: a lista
 *    de UTM escrita em dois lugares que divergiram, e a substituição
 *    cega do cookie que apagava o `fbclid` no meio do caminho. As duas
 *    estão cobertas aqui embaixo.
 *
 * O que ele NÃO cobre: o Set-Cookie sair de verdade numa página
 * prerenderizada. Isso é comportamento de servidor e se confere com
 * `curl -I`, não com função pura — ver o README.
 */
import {
  analisarMarcas,
  combinarMarcas,
  COOKIE_CAMPANHA,
  fbcDeMarcas,
  marcasDaUrl,
  marcasDoPedido,
  serializarMarcas,
  utmDeParametros,
} from '../lib/campanha/marcas.ts'

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

/** Um pedido ao servidor: a URL que a pessoa abriu e o cookie que ela já tinha. */
function pedido(url: string, cookie?: string): Request {
  return new Request(url, {
    headers: cookie ? { cookie: `${COOKIE_CAMPANHA}=${encodeURIComponent(cookie)}` } : {},
  })
}

/** Só o rótulo, que é o que vai para a coluna `utm` do banco. */
const utmDe = (req: Request) => marcasDoPedido(req)?.utm ?? null
const fbclidDe = (req: Request) => marcasDoPedido(req)?.fbclid ?? null

const SITE = 'https://sofiaandrade.com.br'

// ─────────────────────────────────────────────────────────────
console.log('\nA chegada — o que a URL diz')

conferir('orgânico: sem parâmetro, sem origem', utmDe(pedido(`${SITE}/bio`)), null)

conferir(
  'bio do Instagram',
  utmDe(pedido(`${SITE}/bio?utm_source=instagram&utm_medium=bio&utm_campaign=link-da-bio`)),
  'instagram|bio|link-da-bio',
)

conferir(
  'anúncio por município: o content leva a cidade',
  utmDe(
    pedido(
      `${SITE}/?cidade=vilhena&utm_source=meta&utm_medium=cpc&utm_campaign=grupos&utm_content=vilhena`,
    ),
  ),
  'meta|cpc|grupos|vilhena',
)

conferir(
  'fbclid sozinho: anúncio da Meta sem UTM ainda é atribuível',
  fbclidDe(pedido(`${SITE}/bio?fbclid=IwAR0abcdef123456`)),
  'IwAR0abcdef123456',
)

// ⚠️ O caso que produziu 50 rótulos para 3 campanhas. A Meta entrega o
//    nome do anúncio JÁ percent-encoded, e o URLSearchParams decodifica
//    uma vez só — sobrava a outra.
conferir(
  'nome de anúncio da Meta, com a codificação dupla desfeita',
  utmDeParametros(
    new URLSearchParams(
      'utm_source=meta&utm_campaign=AN+03+%5BDireto+Instagram%5D&utm_content=N%C3%A3o+devo+nada',
    ),
  ),
  'meta|AN 03 [Direto Instagram]|Não devo nada',
)

// ─────────────────────────────────────────────────────────────
console.log('\nA saída — o que o cookie lembra')

const doAnuncio = serializarMarcas({
  fbclid: 'IwAR0abcdef123456',
  utm: 'meta|cpc|grupos|vilhena',
  cidade: 'vilhena',
  quando: 1_700_000_000,
})

conferir(
  'o clique no grupo, numa URL nossa sem UTM nenhum, ainda sabe do anúncio',
  utmDe(pedido(`${SITE}/g/vilhena?de=lp&s=abc`, doAnuncio)),
  'meta|cpc|grupos|vilhena',
)

const daBio = serializarMarcas({
  fbclid: null,
  utm: 'instagram|bio|link-da-bio',
  cidade: null,
  quando: 1_700_000_000,
})

conferir(
  'quem veio da bio e entrou num grupo conta como bio, e não como orgânico',
  utmDe(pedido(`${SITE}/g/porto-velho?de=bio&s=abc`, daBio)),
  'instagram|bio|link-da-bio',
)

conferir(
  'a página de grupos no meio do caminho não apaga a origem',
  utmDe(pedido(`${SITE}/grupos`, daBio)),
  'instagram|bio|link-da-bio',
)

// ─────────────────────────────────────────────────────────────
console.log('\nO caminho torto — grupo cheio, e a pessoa escolhe outra cidade')

// ⚠️ O PASSO 3 É UMA URL NOSSA COM `cidade=` DENTRO. Com substituição
//    cega ela viraria uma marca sem fbclid e sem utm, e a conversão do
//    passo 4 — que é real, e paga — chegaria órfã à Meta.
const desvio = pedido(`${SITE}/grupos?cidade=vilhena&situacao=cheio`, doAnuncio)

conferir('o desvio do redirecionador preserva o anúncio', utmDe(desvio), 'meta|cpc|grupos|vilhena')
conferir('…e preserva o fbclid junto', fbclidDe(desvio), 'IwAR0abcdef123456')
conferir(
  '…e passa a cidade para a nova',
  marcasDoPedido(desvio)?.cidade,
  'vilhena',
)

// ─────────────────────────────────────────────────────────────
console.log('\nA troca de mídia — último clique manda')

conferir(
  'quem tinha a bio no cookie e clica num anúncio passa a ser do anúncio',
  combinarMarcas(analisarMarcas(daBio), marcasDaUrl(new URL(`${SITE}/?fbclid=NOVO123456&utm_source=meta&utm_medium=cpc`))!)
    .utm,
  'meta|cpc',
)

// ⚠️ APAGA O FBCLID ANTIGO de propósito: manter o id de um clique da
//    Meta sob o rótulo de outra mídia seria creditar à Meta o que não é
//    dela.
conferir(
  'UTM de outra mídia apaga o fbclid antigo',
  combinarMarcas(
    analisarMarcas(doAnuncio),
    marcasDaUrl(new URL(`${SITE}/bio?utm_source=whatsapp&utm_medium=mensagem`))!,
  ).fbclid,
  null,
)

// ─────────────────────────────────────────────────────────────
console.log('\nO fbc, que é o que a Meta amarra ao anúncio')

conferir(
  'formato exigido pela Graph API: versão, subdomínio, instante e id',
  fbcDeMarcas(analisarMarcas(doAnuncio)),
  'fb.1.1700000000000.IwAR0abcdef123456',
)

conferir('sem fbclid não há fbc — e não se inventa um', fbcDeMarcas(analisarMarcas(daBio)), null)

// ─────────────────────────────────────────────────────────────
console.log('\nA peneira — o que entra num Set-Cookie e numa coluna do banco')

conferir(
  'nome de anúncio com acento, colchete e ponto PASSA',
  analisarMarcas(
    serializarMarcas({
      fbclid: null,
      utm: 'meta|cpc|AN 03 [Direto] - Não devo nada a político.',
      cidade: null,
      quando: 1,
    }),
  )?.utm,
  'meta|cpc|AN 03 [Direto] - Não devo nada a político.',
)

conferir(
  'quebra de linha no UTM é descartada — ela cortaria o cabeçalho ao meio',
  analisarMarcas(`u=${encodeURIComponent('meta\ncpc')}&t=1`)?.utm ?? null,
  null,
)

conferir('cidade fora do formato de slug é descartada', analisarMarcas('c=Porto Velho&t=1'), null)

conferir('cookie gigante é ignorado inteiro', analisarMarcas('u=' + 'x'.repeat(500)), null)

conferir('cookie vazio não vira marca', analisarMarcas(''), null)

console.log(falhas === 0 ? '\ntudo certo.' : `\n${falhas} falha(s).`)
process.exit(falhas === 0 ? 0 : 1)

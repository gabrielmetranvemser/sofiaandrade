/**
 * Gera as molduras provisórias em public/molduras.
 *
 *   node scripts/gerar-molduras.mjs
 *
 * Roda à mão; o resultado é versionado. Existe como script, e não como
 * SVG escrito na unha, por causa de uma restrição: a moldura é
 * desenhada num <canvas> na hora de exportar a foto, e um <svg> usado
 * como fonte de imagem NÃO carrega referência externa nenhuma. Logo, a
 * arte da marca precisa estar EMBUTIDA em base64 dentro do arquivo —
 * e embutir na mão não se revisa.
 *
 * O que entra: o número e o logotipo vêm dos PNG oficiais da marca.
 * A versão anterior desenhava "2233" e "Sofia Andrade" em Helvetica,
 * que não é a fonte da campanha e ficava com cara de improviso.
 *
 * ⚠️ EXIGÊNCIA LEGAL: o CNPJ precisa continuar legível em qualquer
 *    arte que substitua estas — a imagem gerada é propaganda eleitoral.
 *
 * ⚠️ "EU APOIO" não é enfeite: faz a peça ler como apoiador, não como
 *    post oficial. É a única mitigação real contra alguém colar a
 *    marca numa foto ofensiva.
 */

import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const CNPJ = 'CNPJ 68.379.640/0001-98'
const FONTE = 'Helvetica Neue, Helvetica, Arial, sans-serif'

/**
 * PNG achatado em paleta e embutido em base64.
 *
 * Paleta porque a arte é de cor chapada: sem isso o logotipo sozinho
 * passa de 30 kB e vira 40 kB de base64 dentro de cada moldura.
 */
async function embutir(caminho, largura) {
  const buf = await sharp(caminho)
    .resize({ width: largura })
    .png({ palette: true, quality: 90, compressionLevel: 9 })
    .toBuffer()
  const meta = await sharp(buf).metadata()
  return {
    uri: `data:image/png;base64,${buf.toString('base64')}`,
    largura: meta.width,
    altura: meta.height,
    kb: buf.length / 1024,
  }
}

const cabecalho = (titulo) => `  <title>${titulo} — arte provisória da campanha</title>

  <!--
    PROVISÓRIA. A arte final entra pelo painel, em Imagens, e passa a
    valer sem deploy. Esta fica como rede de segurança.

    Nada aqui avisa que é provisória, e é de propósito: uma versão
    anterior carimbava "moldura placeholder" dentro da imagem
    EXPORTADA, e quem gerasse uma foto postaria isso no story.

    Gerado por scripts/gerar-molduras.mjs — não editar à mão.
  -->`

async function story(numero, logo) {
  const L = 1080
  const A = 1920
  const logoL = 600
  const logoA = Math.round((logo.altura * logoL) / logo.largura)
  const numL = 470
  const numA = Math.round((numero.altura * numL) / numero.largura)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}" role="img" aria-label="Moldura de story">
${cabecalho('Moldura de story')}

  <defs>
    <linearGradient id="veu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#013a67" stop-opacity="0"/>
      <stop offset="42%"  stop-color="#013a67" stop-opacity="0.82"/>
      <stop offset="100%" stop-color="#013a67" stop-opacity="0.97"/>
    </linearGradient>
  </defs>

  <!-- O véu sobe em degradê em vez de cortar reto: borda dura no meio
       de uma foto lê como tarja, e ninguém posta uma tarja. -->
  <rect x="0" y="1080" width="${L}" height="840" fill="url(#veu)"/>

  <text x="88" y="1476" font-family="${FONTE}" font-size="34" font-weight="700" letter-spacing="10" fill="#fbd83f">EU APOIO</text>
  <image href="${logo.uri}" x="88" y="1500" width="${logoL}" height="${logoA}"/>
  <image href="${numero.uri}" x="88" y="1640" width="${numL}" height="${numA}"/>
  <text x="88" y="1852" font-family="${FONTE}" font-size="22" fill="#ffffff" fill-opacity="0.55">${CNPJ}</text>

  <rect x="0" y="1900" width="${L}" height="20" fill="#fbd83f"/>
</svg>
`
}

async function perfil(numero, logo) {
  const L = 1080
  const logoL = 560
  const logoA = Math.round((logo.altura * logoL) / logo.largura)
  const numL = 330
  const numA = Math.round((numero.altura * numL) / numero.largura)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${L}" viewBox="0 0 ${L} ${L}" role="img" aria-label="Moldura de perfil">
${cabecalho('Moldura de perfil')}

  <!--
    Tudo centrado e dentro do círculo inscrito. O destino principal
    deste formato é foto de perfil do WhatsApp, que corta em círculo:
    conteúdo encostado nas pontas some no corte, e junto com ele iria o
    CNPJ, que é exigência legal. O ponto mais baixo usado aqui é a
    linha do CNPJ, e nela o círculo ainda tem 388px de largura.
  -->

  <defs>
    <linearGradient id="veu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#013a67" stop-opacity="0"/>
      <stop offset="45%"  stop-color="#013a67" stop-opacity="0.84"/>
      <stop offset="100%" stop-color="#013a67" stop-opacity="0.97"/>
    </linearGradient>
  </defs>

  <rect x="0" y="500" width="${L}" height="580" fill="url(#veu)"/>

  <text x="540" y="786" text-anchor="middle" font-family="${FONTE}" font-size="26" font-weight="700" letter-spacing="8" fill="#fbd83f">EU APOIO</text>
  <image href="${logo.uri}" x="${(L - logoL) / 2}" y="806" width="${logoL}" height="${logoA}"/>
  <image href="${numero.uri}" x="${(L - numL) / 2}" y="918" width="${numL}" height="${numA}"/>
  <text x="540" y="1046" text-anchor="middle" font-family="${FONTE}" font-size="18" fill="#ffffff" fill-opacity="0.55">${CNPJ}</text>
</svg>
`
}

const numero = await embutir('public/marca/numero-2233-amarelo.png', 700)
const logo = await embutir('public/marca/logo-horizontal-branco.png', 760)
console.log(`número ${numero.kb.toFixed(1)} kB · logotipo ${logo.kb.toFixed(1)} kB`)

for (const [nome, gerar] of [
  ['story-apoio', story],
  ['perfil-apoio', perfil],
]) {
  const svg = await gerar(numero, logo)
  await writeFile(`public/molduras/${nome}.svg`, svg)
  console.log(`${nome}.svg · ${(svg.length / 1024).toFixed(1)} kB`)
}

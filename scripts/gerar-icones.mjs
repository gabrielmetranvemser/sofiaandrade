/**
 * Gera lib/icones.ts a partir do pacote oficial do Lucide.
 *
 *   node scripts/gerar-icones.mjs
 *
 * Roda à mão; o resultado é versionado. Mesma escolha do
 * gerar-molduras.mjs, e pelo mesmo motivo de fundo: o que a página
 * serve tem de estar EMBUTIDO, não buscado.
 *
 * ⚠️ POR QUE NÃO `lucide-react`. O ícone de um botão da bio é desenho
 *    parado: ele não tem estado, não responde a nada e é idêntico em
 *    toda visita. Uma biblioteca de componentes traria JavaScript para
 *    o celular de quem só quer entrar num grupo — e o orçamento desta
 *    página é 100 no PageSpeed. Aqui o SVG é escrito no HTML pelo
 *    servidor: zero requisição, zero bytes de script, e o desenho já
 *    está na tela no primeiro quadro.
 *
 * ⚠️ POR QUE NÃO ESCREVER OS `path` À MÃO. Porque eu erraria. São
 *    curvas com dezenas de números, e um dígito trocado vira um
 *    desenho torto que ninguém confere olhando o diff. Vindo do pacote
 *    oficial, o traço é o do lucide.dev — que é o que o painel promete
 *    a quem for pedir um ícone novo.
 *
 * Os ícones do Lucide são ISC. A licença permite uso e redistribuição
 * com o aviso de copyright, que este script copia para o cabeçalho do
 * arquivo gerado.
 *
 * ⚠️ O LUCIDE NÃO TEM MAIS LOGOTIPO DE MARCA — tirou todos na v1, por
 *    causa de marca registrada. WhatsApp e Instagram são os dois de
 *    que esta campanha não abre mão, então eles vêm desenhados aqui
 *    embaixo, copiados do que o site já usa (IconeWhatsApp.tsx e o
 *    rodapé). YouTube e Facebook entram pelo mesmo caminho.
 */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const executar = promisify(execFile)

/** Trocar aqui para atualizar o traço. Fixa de propósito: desenho não muda sozinho. */
const VERSAO = '1.47.0'

/**
 * O CATÁLOGO, agrupado como o painel mostra.
 *
 * ⚠️ É UMA LISTA CURTA DE PROPÓSITO, e o Lucide tem 2.100 ícones. Uma
 *    grade com todos eles é uma decisão que ninguém consegue tomar:
 *    quem abre o painel para pôr um botão de grupo não quer escolher
 *    entre quarenta desenhos de seta. Aqui estão os que uma campanha
 *    usa de verdade, com o nome em português ao lado — e quem quiser
 *    outro cola o nome do lucide.dev no campo de busca do seletor.
 *
 * O nome é o do Lucide, sempre: é a chave que liga o que está no banco
 * ao desenho, e é o que a pessoa digita em lucide.dev para achar.
 */
const CATALOGO = [
  ['Gente', [
    ['users', 'Pessoas'],
    ['user-round', 'Uma pessoa'],
    ['handshake', 'Aperto de mão'],
    ['heart-handshake', 'Apoio'],
    ['baby', 'Criança'],
  ]],
  ['Lugar', [
    ['map-pin', 'Alfinete no mapa'],
    ['map', 'Mapa'],
    ['house', 'Casa'],
    ['landmark', 'Prédio público'],
    ['navigation', 'Localização'],
  ]],
  ['Foto e vídeo', [
    ['image', 'Foto'],
    ['camera', 'Câmera'],
    ['sparkles', 'Brilhos'],
    ['circle-play', 'Play'],
    ['video', 'Vídeo'],
  ]],
  ['Falar', [
    ['message-circle', 'Balão de conversa'],
    ['phone', 'Telefone'],
    ['mail', 'E-mail'],
    ['send', 'Enviar'],
    ['at-sign', 'Arroba'],
  ]],
  ['Site e rede', [
    ['globe', 'Globo'],
    ['link', 'Elo'],
    ['external-link', 'Abrir fora'],
    ['monitor', 'Tela'],
    ['qr-code', 'QR code'],
  ]],
  ['Material', [
    ['package', 'Caixa'],
    ['gift', 'Presente'],
    ['shopping-bag', 'Sacola'],
    ['sticker', 'Adesivo'],
    ['printer', 'Impressora'],
    ['file-text', 'Documento'],
    ['newspaper', 'Jornal'],
    ['clipboard-list', 'Prancheta'],
  ]],
  ['Agenda', [
    ['calendar-days', 'Calendário'],
    ['clock', 'Relógio'],
    ['bell', 'Sino'],
    ['ticket', 'Ingresso'],
  ]],
  ['Campanha', [
    ['megaphone', 'Megafone'],
    ['flag', 'Bandeira'],
    ['vote', 'Voto'],
    ['badge-check', 'Selo de conferido'],
    ['award', 'Medalha'],
    ['star', 'Estrela'],
    ['shield', 'Escudo'],
    ['shield-check', 'Escudo com visto'],
    ['siren', 'Sirene'],
  ]],
  ['Fé e valores', [
    ['church', 'Igreja'],
    ['cross', 'Cruz'],
    ['book-open', 'Livro aberto'],
    ['heart', 'Coração'],
    ['hand-heart', 'Mão com coração'],
  ]],
  ['Temas', [
    ['stethoscope', 'Saúde'],
    ['graduation-cap', 'Educação'],
    ['tractor', 'Agro'],
    ['wheat', 'Lavoura'],
    ['briefcase', 'Trabalho'],
    ['truck', 'Caminhão'],
    ['bus', 'Ônibus'],
    ['hard-hat', 'Obra'],
    ['scale', 'Justiça'],
    ['leaf', 'Meio ambiente'],
    ['droplets', 'Água'],
    ['utensils', 'Comida'],
    ['shirt', 'Camiseta'],
  ]],
  ['Dinheiro', [
    ['hand-coins', 'Mão com moedas'],
    ['coins', 'Moedas'],
    ['banknote', 'Nota'],
    ['wallet', 'Carteira'],
  ]],
  ['Ação', [
    ['arrow-right', 'Seta'],
    ['check', 'Visto'],
    ['download', 'Baixar'],
    ['share-2', 'Compartilhar'],
    ['search', 'Lupa'],
    ['pen-line', 'Caneta'],
    ['list-checks', 'Lista'],
    ['info', 'Informação'],
    ['circle-help', 'Dúvida'],
  ]],
  ['Mídia', [
    ['mic', 'Microfone'],
    ['radio', 'Rádio'],
    ['tv', 'TV'],
    ['music', 'Música'],
  ]],
]

/**
 * As marcas, desenhadas aqui porque o Lucide não as tem.
 *
 * ⚠️ VÊM DO QUE O SITE JÁ USA. O do WhatsApp é o mesmo de
 *    components/ui/IconeWhatsApp.tsx e o do Instagram o mesmo do
 *    rodapé — os dois já estão no ar e já foram aprovados. Copiar de
 *    lá em vez de redesenhar é o que garante que o botão da bio e o
 *    botão da página sejam o MESMO símbolo.
 *
 * ⚠️ PREENCHIDAS (`fill`), e o resto do catálogo é de traço. É a
 *    diferença entre logotipo e ícone, e ela é proposital: a marca
 *    precisa ser reconhecida em 20px, o que traço fino não sustenta.
 *    Quem desenha o botão sabe disso pelo campo `solido`.
 */
const MARCAS = [
  ['Marcas', [
    ['whatsapp', 'WhatsApp',
      '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.16-.29.19-.54.06-.25-.12-1.05-.38-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />'],
    ['instagram', 'Instagram',
      '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.3-.5.2-.9.4-1.2.8-.4.3-.6.7-.8 1.2-.1.4-.3 1-.3 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.3 2.1.2.5.4.9.8 1.2.3.4.7.6 1.2.8.4.1 1 .3 2.1.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.3.5-.2.9-.4 1.2-.8.4-.3.6-.7.8-1.2.1-.4.3-1 .3-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.3-2.1a3 3 0 0 0-.8-1.2 3 3 0 0 0-1.2-.8c-.4-.1-1-.3-2.1-.3-1.2-.1-1.6-.1-4.7-.1Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.2a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0Z" />'],
    ['youtube', 'YouTube',
      '<path d="M21.58 7.19a2.77 2.77 0 0 0-1.95-1.96C17.9 4.77 12 4.77 12 4.77s-5.9 0-7.63.46a2.77 2.77 0 0 0-1.95 1.96A29 29 0 0 0 2 12a29 29 0 0 0 .42 4.81 2.77 2.77 0 0 0 1.95 1.96c1.73.46 7.63.46 7.63.46s5.9 0 7.63-.46a2.77 2.77 0 0 0 1.95-1.96A29 29 0 0 0 22 12a29 29 0 0 0-.42-4.81ZM10.07 15.4V8.6L15.93 12l-5.86 3.4Z" />'],
    ['facebook', 'Facebook',
      '<path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />'],
  ]],
]

/** Só letras minúsculas e hífen: é o formato de nome do Lucide. */
const NOME_VALIDO = /^[a-z0-9-]+$/

/**
 * Tira a casca do SVG e devolve só o desenho.
 *
 * O `<svg>` de fora é nosso — viewBox, traço, tamanho — e vem do
 * componente. Guardar dois `<svg>` por ícone dobraria o arquivo e ainda
 * deixaria dois lugares para o traço divergir.
 */
function miolo(svg) {
  const dentro = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '')
  return dentro
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('')
}

async function main() {
  const pasta = await mkdtemp(join(tmpdir(), 'lucide-'))
  console.log(`· baixando lucide-static@${VERSAO}…`)
  await executar('npm', ['pack', `lucide-static@${VERSAO}`], { cwd: pasta })
  await executar('tar', ['-xzf', `lucide-static-${VERSAO}.tgz`], { cwd: pasta })

  const licenca = (await readFile(join(pasta, 'package/LICENSE'), 'utf8'))
    .split('\n')
    .filter((l) => /copyright|permission/i.test(l))
    .slice(0, 2)
    .map((l) => l.trim())
    .join(' ')

  const linhas = []
  let total = 0

  for (const [grupo, itens] of CATALOGO) {
    linhas.push(`\n  // ── ${grupo} ──`)
    for (const [nome, rotulo] of itens) {
      if (!NOME_VALIDO.test(nome)) throw new Error(`Nome fora do formato: ${nome}`)
      const svg = await readFile(join(pasta, 'package/icons', `${nome}.svg`), 'utf8').catch(
        () => {
          throw new Error(
            `O Lucide ${VERSAO} não tem "${nome}". Confira o nome em lucide.dev.`,
          )
        },
      )
      linhas.push(
        `  '${nome}': { rotulo: '${rotulo}', grupo: '${grupo}', desenho: ${JSON.stringify(miolo(svg))} },`,
      )
      total++
    }
  }

  for (const [grupo, itens] of MARCAS) {
    linhas.push(`\n  // ── ${grupo} (desenhadas aqui: o Lucide não tem logotipo) ──`)
    for (const [nome, rotulo, desenho] of itens) {
      linhas.push(
        `  '${nome}': { rotulo: '${rotulo}', grupo: '${grupo}', solido: true, desenho: ${JSON.stringify(desenho)} },`,
      )
      total++
    }
  }

  const saida = `/**
 * O CATÁLOGO DE ÍCONES — ARQUIVO GERADO. NÃO EDITE À MÃO.
 *
 *   node scripts/gerar-icones.mjs
 *
 * O desenho vem do lucide.dev (${VERSAO}, licença ISC). As marcas, que
 * o Lucide não tem, estão no script. O porquê de tudo está lá.
 *
 * ${licenca}
 */

export interface Icone {
  /** Nome em português, para o painel. O nome do Lucide é a chave. */
  rotulo: string
  grupo: string
  /** Preenchido em vez de traçado — é o caso dos logotipos. */
  solido?: boolean
  /** O miolo do SVG, num viewBox de 24×24. */
  desenho: string
}

export const ICONES: Record<string, Icone> = {${linhas.join('\n')}
}

export const NOMES_DE_ICONE = Object.keys(ICONES)

/**
 * Este nome existe no catálogo?
 *
 * ⚠️ É A PENEIRA DE SEGURANÇA, e não um conforto de digitação. O
 *    desenho é escrito no HTML sem escapar (é marcação SVG, não texto),
 *    então o que entra precisa vir daqui — nunca do que alguém gravou.
 *    Nome fora da lista não desenha nada.
 */
export function ehIcone(nome: unknown): nome is string {
  return typeof nome === 'string' && Object.hasOwn(ICONES, nome)
}

/** Agrupados na ordem do catálogo, para a grade do painel. */
export const ICONES_POR_GRUPO: [string, { nome: string; rotulo: string }[]][] = (() => {
  const mapa = new Map<string, { nome: string; rotulo: string }[]>()
  for (const [nome, icone] of Object.entries(ICONES)) {
    if (!mapa.has(icone.grupo)) mapa.set(icone.grupo, [])
    mapa.get(icone.grupo)!.push({ nome, rotulo: icone.rotulo })
  }
  return [...mapa.entries()]
})()
`

  await writeFile(new URL('../lib/icones.ts', import.meta.url), saida)
  await rm(pasta, { recursive: true, force: true })
  console.log(`✓ lib/icones.ts — ${total} ícones`)
}

main().catch((erro) => {
  console.error(`✗ ${erro.message}`)
  process.exit(1)
})

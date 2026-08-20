import 'server-only'

import { createHash } from 'node:crypto'
import sharp, { type Metadata } from 'sharp'
import type { Slot } from '@/content/slots'

/**
 * Recebe o arquivo enviado e devolve WebP pronto para o Storage.
 *
 * ⚠️ A MITIGAÇÃO MAIS FORTE, DITA EM VOZ ALTA: os bytes enviados nunca
 *    são guardados. Só a saída do sharp vai para o disco. Isso mata a
 *    classe inteira de arquivo poliglota — um PNG válido que também é
 *    JavaScript válido — sem precisar detectá-la.
 */

/** Teto de área. Um PNG de 30 kB pode declarar 50000×50000 e estourar a memória. */
const MAX_PIXELS = 40_000_000
const TETO_LADO = 2400

export class ErroImagem extends Error {}

export interface Processada {
  buffer: Buffer
  largura: number
  altura: number
  bytes: number
  temAlpha: boolean
  blur: string
  hash: string
  caminho: string
}

/**
 * Confere os bytes iniciais. `file.type` é o que o cliente DISSE,
 * não o que o arquivo É.
 */
function farejarTipo(buf: Buffer): 'png' | 'jpeg' | 'webp' | 'svg' | null {
  if (buf.length < 12) return null
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png'
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg'
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'webp'
  const inicio = buf.subarray(0, 300).toString('utf8').trimStart().toLowerCase()
  if (inicio.startsWith('<?xml') || inicio.startsWith('<svg')) return 'svg'
  return null
}

export async function processarImagem(arquivo: File, slot: Slot): Promise<Processada> {
  const bruto = Buffer.from(await arquivo.arrayBuffer())

  const tipo = farejarTipo(bruto)
  if (tipo === null) {
    throw new ErroImagem('Não reconheci este arquivo como imagem. Envie PNG, JPG ou WebP.')
  }
  if (tipo === 'svg') {
    // SVG é documento executável. Servido de um balde público, um
    // <script> dentro dele é XSS contra a origem. Não existe
    // sanitização que valha o risco.
    throw new ErroImagem('SVG não é aceito por segurança. Exporte como PNG.')
  }

  let meta: Metadata
  try {
    meta = await sharp(bruto, { limitInputPixels: MAX_PIXELS, failOn: 'error' }).metadata()
  } catch {
    throw new ErroImagem('Esse arquivo está corrompido ou não é uma imagem válida.')
  }

  const larguraOriginal = meta.width ?? 0
  const alturaOriginal = meta.height ?? 0
  if (!larguraOriginal || !alturaOriginal) {
    throw new ErroImagem('Não consegui ler as dimensões dessa imagem.')
  }

  // ── conferências contra o slot, com mensagem específica ────────
  if (slot.exata) {
    if (larguraOriginal !== slot.larguraMin || alturaOriginal !== slot.alturaMin) {
      throw new ErroImagem(
        `Esta moldura precisa ter exatamente ${slot.larguraMin}×${slot.alturaMin} px. ` +
          `A que você enviou tem ${larguraOriginal}×${alturaOriginal}.`,
      )
    }
  } else if (larguraOriginal < slot.larguraMin || alturaOriginal < slot.alturaMin) {
    throw new ErroImagem(
      `Essa imagem tem ${larguraOriginal}×${alturaOriginal}. ` +
        `Este espaço precisa de no mínimo ${slot.larguraMin}×${slot.alturaMin} px.`,
    )
  }

  if (slot.proporcao && !slot.exata) {
    const [pl, pa] = slot.proporcao.split('/').map(Number)
    const esperada = pl / pa
    const real = larguraOriginal / alturaOriginal
    if (Math.abs(real - esperada) / esperada > 0.03) {
      throw new ErroImagem(
        `Este espaço é ${slot.proporcao.replace('/', ':')} e a imagem enviada não está nessa proporção. ` +
          'Recorte antes de enviar.',
      )
    }
  }

  if (slot.alpha) {
    if (!meta.hasAlpha) {
      throw new ErroImagem(
        'Esta imagem precisa ter fundo transparente. Envie um PNG recortado, não JPEG.',
      )
    }

    // ⚠️ `hasAlpha` NÃO BASTA, e essa diferença já custou caro.
    //
    // Todo PNG tem canal alfa, mesmo quando nenhum pixel é
    // transparente. Uma FOTO exportada como PNG passa nesta conferência
    // sem problema — e foi o que aconteceu: subiram um retrato no
    // espaço da moldura, o arquivo foi aceito, e o gerador de filtro
    // passou a cobrir a foto de quem usa com um retângulo opaco. Não
    // dava erro em lugar nenhum. A pessoa escolhia a foto, apertava
    // salvar e recebia uma imagem que não era a dela.
    //
    // `isOpaque` responde a pergunta certa: existe pixel vazado aqui?
    const { isOpaque } = await sharp(bruto, { limitInputPixels: MAX_PIXELS }).stats()
    if (isOpaque) {
      throw new ErroImagem(
        slot.exata
          ? 'Esta é uma MOLDURA e o miolo dela precisa ser vazado — é por ali que aparece a foto de quem usa. ' +
            'A imagem enviada é opaca do começo ao fim (parece uma foto, não uma moldura). ' +
            'Exporte a arte em PNG com o centro transparente.'
          : 'Esta imagem tem canal de transparência, mas nenhum pixel transparente de fato — ' +
            'ou seja, o fundo continua lá. Recorte o fundo num editor e exporte o PNG de novo.',
      )
    }
  }

  // ── conversão ──────────────────────────────────────────────────
  // .rotate() sem argumento aplica a orientação EXIF e, como não
  // chamamos withMetadata(), o bloco EXIF é DESCARTADO — inclusive o
  // GPS. Foto de campanha carregando a coordenada da casa de alguém
  // é vazamento real.
  const base = sharp(bruto, { limitInputPixels: MAX_PIXELS }).rotate()

  const redimensionada = slot.exata
    ? base
    : base.resize({ width: TETO_LADO, height: TETO_LADO, fit: 'inside', withoutEnlargement: true })

  // O WebP preserva o alpha automaticamente. As duas armadilhas são
  // .flatten() e .toFormat('jpeg') — nenhuma aparece aqui.
  const buffer = await redimensionada.webp({ quality: 82, alphaQuality: 90, effort: 4 }).toBuffer()

  const saida = await sharp(buffer).metadata()

  const blurBuf = await sharp(buffer)
    .resize(12, null, { fit: 'inside' })
    .webp({ quality: 20 })
    .toBuffer()

  const hash = createHash('sha256').update(bruto).digest('hex')

  return {
    buffer,
    largura: saida.width ?? 0,
    altura: saida.height ?? 0,
    bytes: buffer.length,
    temAlpha: Boolean(saida.hasAlpha),
    blur: `data:image/webp;base64,${blurBuf.toString('base64')}`,
    hash,
    // Caminho endereçado por conteúdo: reenviar o mesmo arquivo é
    // no-op, e trocar a imagem nunca invalida o cache da antiga.
    caminho: `${slot.chave.replace(/\./g, '/')}/${hash.slice(0, 16)}.webp`,
  }
}

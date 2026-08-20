'use client'

/**
 * Tudo aqui roda no navegador da pessoa. A foto nunca sai do aparelho.
 *
 * Este arquivo existe por causa da seção 5 do plano: as cinco armadilhas
 * que quebram o filtro em produção. Cada função abaixo resolve uma.
 */

/** Safari trava desenhando foto de 12MP. Teto de segurança no maior lado. */
export const LADO_MAXIMO = 2000

/** Abaixo disso a foto sai borrada na moldura de 1080. */
export const LADO_MINIMO_ACEITAVEL = 600

export class ErroFormatoImagem extends Error {
  constructor() {
    super('formato-nao-suportado')
    this.name = 'ErroFormatoImagem'
  }
}

export interface FotoCarregada {
  bitmap: ImageBitmap | HTMLImageElement
  largura: number
  altura: number
  pequena: boolean
}

/**
 * Lê a orientação EXIF de um JPEG sem biblioteca externa.
 * Foto vertical de celular entra deitada se isso não for tratado.
 * Retorna 1 (normal) quando não encontra.
 */
export async function lerOrientacaoExif(arquivo: File): Promise<number> {
  try {
    const buffer = await arquivo.slice(0, 128 * 1024).arrayBuffer()
    const view = new DataView(buffer)
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return 1

    let offset = 2
    while (offset < view.byteLength - 1) {
      const marcador = view.getUint16(offset, false)
      offset += 2
      if (marcador === 0xffe1) {
        if (view.getUint32(offset + 2, false) !== 0x45786966) return 1
        const little = view.getUint16(offset + 8, false) === 0x4949
        const primeiroIfd = view.getUint32(offset + 12, little)
        let dir = offset + 8 + primeiroIfd
        const total = view.getUint16(dir, little)
        dir += 2
        for (let i = 0; i < total; i++) {
          const entrada = dir + i * 12
          if (view.getUint16(entrada, little) === 0x0112) {
            return view.getUint16(entrada + 8, little)
          }
        }
        return 1
      }
      if ((marcador & 0xff00) !== 0xff00) break
      offset += view.getUint16(offset, false)
    }
  } catch {
    // EXIF ilegível não é motivo para falhar o filtro.
  }
  return 1
}

/** As 8 orientações EXIF em transformação de canvas. */
function aplicarOrientacao(
  ctx: CanvasRenderingContext2D,
  orientacao: number,
  w: number,
  h: number,
): void {
  switch (orientacao) {
    case 2: ctx.transform(-1, 0, 0, 1, w, 0); break
    case 3: ctx.transform(-1, 0, 0, -1, w, h); break
    case 4: ctx.transform(1, 0, 0, -1, 0, h); break
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break
    case 6: ctx.transform(0, 1, -1, 0, h, 0); break
    case 7: ctx.transform(0, -1, -1, 0, h, w); break
    case 8: ctx.transform(0, -1, 1, 0, 0, w); break
    default: break
  }
}

/**
 * Carrega o arquivo, corrige orientação e reduz para LADO_MAXIMO.
 * Lança ErroFormatoImagem em HEIC e afins — quem chama mostra a
 * mensagem de "tire um print dela e use o print".
 */
export async function carregarFoto(arquivo: File): Promise<FotoCarregada> {
  const orientacao = await lerOrientacaoExif(arquivo)

  let origem: ImageBitmap | HTMLImageElement
  let lw: number
  let lh: number

  try {
    if ('createImageBitmap' in window) {
      const bmp = await createImageBitmap(arquivo)
      origem = bmp
      lw = bmp.width
      lh = bmp.height
    } else {
      const img = await carregarViaTag(arquivo)
      origem = img
      lw = img.naturalWidth
      lh = img.naturalHeight
    }
  } catch {
    try {
      const img = await carregarViaTag(arquivo)
      origem = img
      lw = img.naturalWidth
      lh = img.naturalHeight
    } catch {
      throw new ErroFormatoImagem()
    }
  }

  if (!lw || !lh) throw new ErroFormatoImagem()

  const girado = orientacao >= 5 && orientacao <= 8
  const larguraFinalBruta = girado ? lh : lw
  const alturaFinalBruta = girado ? lw : lh

  const escala = Math.min(1, LADO_MAXIMO / Math.max(larguraFinalBruta, alturaFinalBruta))
  const largura = Math.round(larguraFinalBruta * escala)
  const altura = Math.round(alturaFinalBruta * escala)

  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ErroFormatoImagem()

  ctx.save()
  ctx.scale(escala, escala)
  aplicarOrientacao(ctx, orientacao, larguraFinalBruta, alturaFinalBruta)
  ctx.drawImage(origem as CanvasImageSource, 0, 0)
  ctx.restore()

  if ('close' in origem && typeof origem.close === 'function') origem.close()

  const bitmap = await createImageBitmapSeguro(canvas)

  return {
    bitmap,
    largura,
    altura,
    pequena: Math.max(larguraFinalBruta, alturaFinalBruta) < LADO_MINIMO_ACEITAVEL,
  }
}

async function createImageBitmapSeguro(
  canvas: HTMLCanvasElement,
): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(canvas)
    } catch {
      /* cai no fallback */
    }
  }
  const img = new Image()
  img.src = canvas.toDataURL('image/png')
  await img.decode()
  return img
}

function carregarViaTag(arquivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ErroFormatoImagem())
    }
    img.src = url
  })
}

export interface Enquadramento {
  /** deslocamento do centro, em fração da menor dimensão do quadro */
  x: number
  y: number
  /** 1 = cobre o quadro exatamente */
  zoom: number
}

export const ENQUADRAMENTO_INICIAL: Enquadramento = { x: 0, y: 0, zoom: 1 }

/** Desenha a foto cobrindo o quadro, respeitando pan e zoom. */
export function desenharFoto(
  ctx: CanvasRenderingContext2D,
  foto: FotoCarregada,
  larguraQuadro: number,
  alturaQuadro: number,
  enq: Enquadramento,
): void {
  const escalaCover = Math.max(larguraQuadro / foto.largura, alturaQuadro / foto.altura)
  const escala = escalaCover * enq.zoom
  const w = foto.largura * escala
  const h = foto.altura * escala
  const menorLado = Math.min(larguraQuadro, alturaQuadro)
  const x = (larguraQuadro - w) / 2 + enq.x * menorLado
  const y = (alturaQuadro - h) / 2 + enq.y * menorLado
  ctx.drawImage(foto.bitmap as CanvasImageSource, x, y, w, h)
}

/** Converte o canvas em Blob. toBlob com fallback para Safari velho. */
export function canvasParaBlob(canvas: HTMLCanvasElement, qualidade = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (canvas.toBlob) {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('canvas-vazio'))),
        'image/jpeg',
        qualidade,
      )
      return
    }
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', qualidade)
      const bin = atob(dataUrl.split(',')[1])
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      resolve(new Blob([bytes], { type: 'image/jpeg' }))
    } catch (e) {
      reject(e as Error)
    }
  })
}

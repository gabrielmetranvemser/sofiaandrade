import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { candidata as CANDIDATA } from '@/content/copy'
import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'

/**
 * O cartão que aparece quando alguém cola o link no WhatsApp.
 *
 * Isso não é enfeite: a página nasceu para circular, e um link sem
 * cartão no WhatsApp parece spam. É a diferença entre ser repassado
 * e ser ignorado.
 *
 * ⚠️ AGORA VEM DO PAINEL, com o desenho em código como reserva. Antes
 *    a única saída era trocar o arquivo no repositório e republicar —
 *    o comentário antigo aqui dizia exatamente isso ("quando a arte
 *    chegar, trocar por um PNG estático"). A arte de campanha muda no
 *    meio da semana, e republicar o site para trocar uma imagem é o
 *    tipo de trabalho que faz a troca não acontecer.
 *
 *    Espaço: Painel ▸ Identidade ▸ Busca e compartilhamento ▸ Imagens.
 *    Vazio, o cartão desenhado abaixo continua valendo — a página
 *    nunca fica sem cartão.
 *
 * ⚠️ A SAÍDA É SEMPRE JPEG, e isto é o detalhe de que tudo depende. O
 *    painel guarda toda imagem em WebP, que é ótimo para o site e mau
 *    para o cartão: a prévia do WhatsApp com WebP é irregular, e o que
 *    o remetente vê é simplesmente um link sem imagem, sem erro
 *    nenhum para investigar. JPEG a 1200×630 também segura o peso
 *    abaixo do teto que o WhatsApp aplica à miniatura — outro jeito
 *    silencioso de o cartão sumir.
 */
export const alt = `${CANDIDATA.nome} — ${CANDIDATA.numero}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/jpeg'

/**
 * Uma hora de teto, e não mais, porque o caminho rápido é outro: ao
 * salvar uma imagem o painel manda revalidar esta rota (ver
 * `app/painel/acoes-midia.ts`). Isto aqui é a rede de segurança para
 * quando a invalidação se perde.
 */
export const revalidate = 3600

/**
 * ⚠️ `flatten` ANTES do JPEG. JPEG não tem transparência: um PNG
 *    recortado viraria uma silhueta sobre preto. O fundo é o azul da
 *    campanha, que é o mesmo do cartão desenhado.
 *
 * `cover` porque a imagem já vem recortada na proporção certa pelo
 * painel — aqui é só garantia contra um arquivo que tenha entrado por
 * outro caminho.
 */
async function paraJpeg(bytes: Buffer): Promise<Buffer> {
  return sharp(bytes)
    .resize(size.width, size.height, { fit: 'cover', position: 'centre' })
    .flatten({ background: '#0d2440' })
    .jpeg({ quality: 82, progressive: true, chromaSubsampling: '4:4:4' })
    .toBuffer()
}

function resposta(corpo: Buffer): Response {
  return new Response(new Uint8Array(corpo), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

export default async function Imagem() {
  const [imagens, conteudo] = await Promise.all([lerSlots(), lerConteudo()])
  const enviado = imagens['marca.cartaoLink']

  if (enviado) {
    try {
      const r = await fetch(enviado.url, { next: { revalidate } })
      if (r.ok) return resposta(await paraJpeg(Buffer.from(await r.arrayBuffer())))
    } catch {
      // ⚠️ ENGOLIR AQUI É DELIBERADO. Storage fora do ar, arquivo
      //    apagado por fora, imagem corrompida: qualquer um desses
      //    lançaria e a página inteira responderia erro na hora em que
      //    alguém colasse o link. Cair no cartão desenhado é sempre
      //    melhor que não ter cartão.
    }
  }

  const { candidata, meta } = conteudo

  const gerado = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0d2440 0%, #12539e 100%)',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#10884f',
            }}
          />
          <div style={{ fontSize: 26, color: '#f2b134', letterSpacing: 2, fontWeight: 600 }}>
            {meta.og.subtitulo.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            {candidata.nome}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginTop: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                color: '#12539e',
                fontSize: 76,
                fontWeight: 800,
                letterSpacing: -4,
                padding: '10px 32px',
                borderRadius: 28,
              }}
            >
              {candidata.numero}
            </div>
            <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.8)' }}>{meta.og.chamada}</div>
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.6)' }}>
          52 municípios de Rondônia · um grupo de WhatsApp para cada
        </div>
      </div>
    ),
    size,
  )

  // O ImageResponse sai em PNG. Reencodar custa alguns milissegundos
  // numa rota cacheada e mantém uma promessa só no `<head>`: o
  // `og:image:type` declara JPEG, e é JPEG que chega nos dois caminhos.
  return resposta(await paraJpeg(Buffer.from(await gerado.arrayBuffer())))
}

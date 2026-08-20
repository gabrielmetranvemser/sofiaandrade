'use client'

import { useEffect, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { evento } from '@/lib/eventos'
import { detectarWebview, podeCompartilharArquivo } from '@/lib/navegador'
import { Botao } from '@/components/ui/Botao'
import { Aviso } from '@/components/ui/Aviso'

/**
 * A tela do resultado.
 *
 * Ordem dos caminhos de salvamento, do que mais funciona para o que
 * menos funciona — exatamente o contrário do que parece intuitivo:
 *
 *   1. IMAGEM GRANDE NA TELA com "segure para salvar".
 *      É o caminho que funciona em QUALQUER navegador, inclusive no
 *      webview do Instagram, e é o que o público mais velho entende.
 *   2. navigator.share com arquivo — melhor que download em celular.
 *   3. Download — plano B, e o que quebra no Instagram.
 */
export function Resultado({
  blob,
  nomeArquivo,
  proporcao,
  onRefazer,
}: {
  blob: Blob
  nomeArquivo: string
  proporcao: string
  onRefazer: () => void
}) {
  const { filtro: copy } = useConteudo()
  const [url, setUrl] = useState<string>('')
  const [podeShare, setPodeShare] = useState(false)
  const [noWebview, setNoWebview] = useState(false)
  const [avisoDownload, setAvisoDownload] = useState(false)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)

    const arquivo = new File([blob], nomeArquivo, { type: blob.type })
    setPodeShare(podeCompartilharArquivo([arquivo]))
    setNoWebview(detectarWebview() !== null)

    return () => URL.revokeObjectURL(objectUrl)
  }, [blob, nomeArquivo])

  async function compartilhar() {
    const arquivo = new File([blob], nomeArquivo, { type: blob.type })
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    try {
      await nav.share?.({ files: [arquivo], title: 'Sofia Andrade 2233' })
      evento('compartilhou_filtro')
    } catch {
      /* pessoa cancelou */
    }
  }

  function baixar() {
    evento('baixou_filtro')
    const a = document.createElement('a')
    a.href = url
    a.download = nomeArquivo
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()

    // No webview o clique acima frequentemente não faz nada e não
    // dispara erro nenhum. Então avisamos preventivamente qual é o
    // caminho que funciona.
    if (noWebview) setTimeout(() => setAvisoDownload(true), 900)
  }

  return (
    <div>
      <p className="text-sm font-semibold tracking-[0.06em] text-verde uppercase">Pronto</p>
      <h2 className="mt-2 titulo-secao">Sua foto está pronta.</h2>

      {/* 1. A imagem grande. O caminho que sempre funciona. */}
      <div className="mt-6 rounded-2xl border border-linha bg-areia overflow-hidden">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Sua foto com a moldura da campanha"
            className="mx-auto w-full max-w-md"
            style={{ aspectRatio: proporcao }}
          />
        ) : null}
      </div>

      <Aviso tom="alerta" className="mt-4">
        <strong className="font-extrabold">{copy.dicaSalvar}</strong>
      </Aviso>

      {/* 2 e 3. Compartilhar nativo e download. */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {podeShare ? (
          <Botao variante="verde" tamanho="lg" onClick={compartilhar}>
            <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
              <path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.1c0-.3.1-.5.1-.8s0-.5-.1-.8L16 7.2c.5.5 1.2.8 2 .8a3 3 0 1 0-3-3c0 .3 0 .5.1.8L8 9.8a3 3 0 1 0 0 4.4l7.1 4.1c0 .2-.1.5-.1.7a3 3 0 1 0 3-2.9Z" />
            </svg>
            {copy.botaoCompartilhar}
          </Botao>
        ) : null}

        <Botao variante="acao" tamanho="lg" onClick={baixar}>
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
            <path d="M12 3v10.2l3.6-3.6L17 11l-5 5-5-5 1.4-1.4L12 13.2V3h0ZM5 19h14v2H5v-2Z" />
          </svg>
          {copy.botaoBaixar}
        </Botao>

        <Botao variante="texto" tamanho="lg" onClick={onRefazer} className="text-azul">
          {copy.botaoRefazer}
        </Botao>
      </div>

      {avisoDownload ? (
        <Aviso tom="erro" className="mt-5">
          <strong className="block font-extrabold">Não baixou?</strong>
          Dentro do Instagram o download costuma não funcionar. Segure o dedo na
          foto acima e escolha “Salvar imagem”, ou abra esta página no navegador.
        </Aviso>
      ) : null}

      <p className="mt-6 flex items-center gap-2 text-base text-verde">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <path d="M12 2 4 5.5V11c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5.5L12 2Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z" />
        </svg>
        {copy.privacidade}
      </p>
    </div>
  )
}

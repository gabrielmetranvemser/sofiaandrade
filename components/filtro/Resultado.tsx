'use client'

import { useEffect, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { evento } from '@/lib/eventos'
import { detectarWebview, ehAndroid, ehIOS, podeCompartilharArquivo } from '@/lib/navegador'
import { Botao } from '@/components/ui/Botao'
import { Aviso } from '@/components/ui/Aviso'

/**
 * O que fazer com a foto pronta.
 *
 * A ordem dos caminhos vai do que mais funciona para o que menos
 * funciona — e é o contrário do que parece intuitivo:
 *
 *   1. A IMAGEM GRANDE NA TELA com "segure para salvar". Funciona em
 *      QUALQUER navegador, inclusive no webview do Instagram, e é o
 *      caminho que o público mais velho já conhece. Ela é o palco,
 *      desenhado pelo fluxo, e é por isso que o aviso vem antes dos
 *      botões aqui embaixo.
 *   2. navigator.share com arquivo — melhor que download no celular, e
 *      é ele que abre a folha do sistema com "Instagram ▸ Stories".
 *   3. Download — plano B, e o que quebra dentro do Instagram.
 *
 * SOBRE O ATALHO DO STORY: não existe, da web, jeito de abrir o editor
 * de stories JÁ COM a imagem. O instagram-stories://share documentado
 * pela Meta depende de a imagem estar no pasteboard (iOS) ou vir por
 * Intent com content URI (Android) — as duas coisas exigem app nativo.
 * Chamar o esquema da web abre a câmera de story VAZIA, que é pior que
 * não ter botão: a pessoa espera ver a foto dela lá.
 *
 * Então o atalho aqui é honesto e em dois tempos: salve, depois abra.
 * Ele só aparece DEPOIS de salvar ou compartilhar, e o texto diz que a
 * foto precisa ser escolhida na galeria.
 */
export function AcoesDoResultado({
  blob,
  url,
  nomeArquivo,
  onRefazer,
}: {
  blob: Blob
  url: string
  nomeArquivo: string
  onRefazer: () => void
}) {
  const { filtro: copy } = useConteudo()
  const [podeShare, setPodeShare] = useState(false)
  const [noWebview, setNoWebview] = useState(false)
  const [temInstagram, setTemInstagram] = useState(false)
  const [avisoDownload, setAvisoDownload] = useState(false)
  const [jaSalvou, setJaSalvou] = useState(false)

  useEffect(() => {
    const arquivo = new File([blob], nomeArquivo, { type: blob.type })
    setPodeShare(podeCompartilharArquivo([arquivo]))
    setNoWebview(detectarWebview() !== null)
    // O esquema instagram:// só resolve onde o app existe.
    setTemInstagram(ehIOS() || ehAndroid())
  }, [blob, nomeArquivo])

  async function compartilhar() {
    const arquivo = new File([blob], nomeArquivo, { type: blob.type })
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    try {
      await nav.share?.({ files: [arquivo], title: 'Sofia Andrade 2233' })
      evento('compartilhou_filtro')
      setJaSalvou(true)
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
    setJaSalvou(true)

    // No webview o clique acima frequentemente não faz nada e não
    // lança erro nenhum. Então avisamos preventivamente qual é o
    // caminho que funciona.
    if (noWebview) setTimeout(() => setAvisoDownload(true), 900)
  }

  return (
    <div>
      <h2 className="titulo-secao">{copy.tituloPronto}</h2>
      <p className="mt-2 text-base text-grafite">{copy.textoPronto}</p>

      <Aviso tom="alerta" className="mt-5">
        <strong className="font-extrabold">{copy.dicaSalvar}</strong>
      </Aviso>

      <div className="mt-6 flex flex-col gap-3">
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

        {jaSalvou && temInstagram ? (
          <div className="rounded-2xl border border-linha bg-white p-4">
            <a
              href="instagram://story-camera"
              onClick={() => evento('clicou_instagram')}
              className="toque inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-azul-escuro px-6 font-semibold text-white"
            >
              {copy.botaoStory}
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M14 3v2h3.6l-8.3 8.3 1.4 1.4L19 6.4V10h2V3h-7ZM5 5h5v2H7v10h10v-3h2v5H5V5Z" />
              </svg>
            </a>
            <p className="mt-3 text-sm text-grafite">{copy.notaStory}</p>
          </div>
        ) : null}

        <Botao variante="texto" tamanho="lg" onClick={onRefazer} className="self-start text-azul">
          {copy.botaoRefazer}
        </Botao>
      </div>

      {avisoDownload ? (
        <Aviso tom="erro" className="mt-5">
          <strong className="block font-extrabold">{copy.naoBaixouTitulo}</strong>
          {copy.naoBaixouTexto}
        </Aviso>
      ) : null}
    </div>
  )
}

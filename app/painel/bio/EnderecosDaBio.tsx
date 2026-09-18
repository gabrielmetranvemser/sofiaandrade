'use client'

import { useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'

/**
 * OS ENDEREÇOS DO LINK DA BIO, PRONTOS PARA COLAR.
 *
 * ⚠️ ESTA TELA EXISTE POR CAUSA DE UMA PERGUNTA QUE O PAINEL NÃO SABIA
 *    RESPONDER: "essa visita veio da bio ou do anúncio?". Um endereço
 *    limpo (`/bio`) chega ao banco sem origem nenhuma e entra na conta
 *    como direto — junto com quem digitou o site à mão. O mesmo
 *    endereço com `utm_source=instagram&utm_medium=bio` chega sabendo
 *    de onde veio, e a partir dali TODA a sessão fica atribuída: o
 *    `proxy.ts` grava as marcas no cookie na chegada, e as rotas de
 *    servidor leem de volta na saída — inclusive a que manda a pessoa
 *    para o WhatsApp, que é a conversão.
 *
 *    Ou seja: a origem entra UMA VEZ, aqui, na porta. É por isso que os
 *    botões da página não carregam UTM nenhum — ver app/bio/page.tsx.
 *
 * ⚠️ OS LUGARES SÃO CARTÕES PRONTOS, e não um formulário com três
 *    campos em branco. Quem vai trocar o link da bio do Instagram está
 *    com o celular na mão, no meio de outra coisa. Escrever
 *    "utm_medium" certo, sem acento e sem espaço, é a etapa onde isso
 *    dá errado — e dá errado em silêncio: o link funciona, e a métrica
 *    é que fica torta. O campo livre continua embaixo, para o caso
 *    novo.
 */

interface Lugar {
  chave: string
  nome: string
  descricao: string
  source: string
  medium: string
}

const LUGARES: Lugar[] = [
  {
    chave: 'ig-bio',
    nome: 'Bio do Instagram',
    descricao: 'O link fixo do perfil. É o principal — e o que mais dura.',
    source: 'instagram',
    medium: 'bio',
  },
  {
    chave: 'ig-story',
    nome: 'Story do Instagram',
    descricao: 'A figurinha de link. Separado da bio para dar para comparar os dois.',
    source: 'instagram',
    medium: 'story',
  },
  {
    chave: 'whatsapp',
    nome: 'WhatsApp',
    descricao: 'Para mandar nos grupos e no status.',
    source: 'whatsapp',
    medium: 'mensagem',
  },
  {
    chave: 'tiktok',
    nome: 'TikTok',
    descricao: 'O link do perfil.',
    source: 'tiktok',
    medium: 'bio',
  },
  {
    chave: 'youtube',
    nome: 'YouTube',
    descricao: 'Descrição do vídeo e link do canal.',
    source: 'youtube',
    medium: 'descricao',
  },
  {
    chave: 'impresso',
    nome: 'Panfleto e adesivo',
    descricao: 'Para virar QR aqui embaixo.',
    source: 'panfleto',
    medium: 'impresso',
  },
]

/** Só letras, números e hífen: é o que a Meta e o painel leem sem ambiguidade. */
const limparUtm = (v: string) => v.replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40)

export function EnderecosDaBio({ siteUrl }: { siteUrl: string }) {
  const base = `${siteUrl.replace(/\/$/, '')}/bio`

  const [campanha, setCampanha] = useState('link-da-bio')
  const [copiado, setCopiado] = useState<string | null>(null)
  const [outroSource, setOutroSource] = useState('')
  const [outroMedium, setOutroMedium] = useState('')
  const [qr, setQr] = useState<string | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  const montar = useMemo(
    () => (source: string, medium: string) => {
      const p = new URLSearchParams()
      if (source) p.set('utm_source', source)
      if (medium) p.set('utm_medium', medium)
      if (campanha) p.set('utm_campaign', campanha)
      const query = p.toString()
      return query ? `${base}?${query}` : base
    },
    [base, campanha],
  )

  async function copiar(texto: string, marca: string) {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Sem permissão de área de transferência (acontece em navegador
      // antigo e dentro de webview): o prompt deixa copiar à mão.
      window.prompt('Copie:', texto)
    }
    setCopiado(marca)
    setTimeout(() => setCopiado(null), 2200)
  }

  async function gerarQr(url: string) {
    setQr(url)
    // Depois do próximo desenho, quando o <canvas> já existe.
    requestAnimationFrame(() => {
      if (!canvas.current) return
      void QRCode.toCanvas(canvas.current, url, {
        width: 1024,
        margin: 2,
        // Sobrevive a impressão e a dobra de papel.
        errorCorrectionLevel: 'M',
        color: { dark: '#0d2440ff', light: '#ffffffff' },
      })
    })
  }

  function baixarQr() {
    if (!canvas.current) return
    const a = document.createElement('a')
    a.href = canvas.current.toDataURL('image/png')
    a.download = 'qr-link-da-bio.png'
    a.click()
  }

  const campo =
    'mt-1.5 min-h-12 w-full rounded-xl border border-linha bg-areia px-3 focus:border-azul/40 focus:bg-white'

  return (
    <div className="mt-8 space-y-6">
      {/* ── O endereço limpo ─────────────────────────────────── */}
      <section className="rounded-2xl border border-linha bg-white p-6">
        <h2 className="text-lg">O endereço da página</h2>
        <p className="mt-1 text-sm leading-relaxed text-grafite">
          Funciona sozinho. Só que, colado assim, a visita chega ao painel sem origem — misturada
          com quem digitou o endereço do site à mão. Use um dos de baixo.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 truncate rounded-xl bg-areia px-3 py-2.5 font-mono text-sm">
            {base}
          </code>
          <BotaoCopiar
            aceso={copiado === 'limpo'}
            onClick={() => copiar(base, 'limpo')}
            rotulo="Copiar o endereço da página"
          />
        </div>
      </section>

      {/* ── Um por lugar ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-linha bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg">Um endereço para cada lugar</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-grafite">
              Todos abrem a mesma página. O que muda é a etiqueta que viaja junto — e é ela que faz
              o painel dizer quantas pessoas vieram da bio, quantas do story e quantas do disparo.
            </p>
          </div>

          <div className="w-full max-w-48">
            <label htmlFor="campanha" className="text-sm font-medium">
              utm_campaign
            </label>
            <input
              id="campanha"
              value={campanha}
              onChange={(e) => setCampanha(limparUtm(e.target.value))}
              placeholder="link-da-bio"
              className={`${campo} font-mono text-sm`}
            />
          </div>
        </div>

        <ul className="mt-5 grid gap-3">
          {LUGARES.map((lugar) => {
            const url = montar(lugar.source, lugar.medium)
            return (
              <li
                key={lugar.chave}
                className="rounded-xl border border-linha p-4 transition-colors hover:border-azul/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{lugar.nome}</p>
                    <p className="mt-0.5 text-sm text-grafite">{lugar.descricao}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => gerarQr(url)}
                      className="inline-flex min-h-10 items-center rounded-full border border-linha px-3 text-sm font-medium text-grafite transition-colors hover:border-azul/30 hover:text-azul"
                    >
                      QR
                    </button>
                    <BotaoCopiar
                      aceso={copiado === lugar.chave}
                      onClick={() => copiar(url, lugar.chave)}
                      rotulo={`Copiar o endereço de ${lugar.nome}`}
                    />
                  </div>
                </div>
                <code className="mt-3 block truncate rounded-lg bg-areia px-3 py-2 font-mono text-xs text-grafite">
                  {url}
                </code>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── Um lugar que não está na lista ───────────────────── */}
      <section className="rounded-2xl border border-linha bg-white p-6">
        <h2 className="text-lg">Outro lugar</h2>
        <p className="mt-1 text-sm leading-relaxed text-grafite">
          Um rádio, um parceiro, um perfil de apoiador. Escreva de onde vem e em que formato — sem
          acento e sem espaço, senão a mesma origem aparece partida em duas linhas no painel.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="outro-source" className="text-sm font-medium">
              De onde vem (utm_source)
            </label>
            <input
              id="outro-source"
              value={outroSource}
              onChange={(e) => setOutroSource(limparUtm(e.target.value))}
              placeholder="radio-caiari, apoiador…"
              className={`${campo} font-mono text-sm`}
            />
          </div>
          <div>
            <label htmlFor="outro-medium" className="text-sm font-medium">
              Em que formato (utm_medium)
            </label>
            <input
              id="outro-medium"
              value={outroMedium}
              onChange={(e) => setOutroMedium(limparUtm(e.target.value))}
              placeholder="bio, post, impresso…"
              className={`${campo} font-mono text-sm`}
            />
          </div>
        </div>

        {outroSource ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 truncate rounded-xl bg-areia px-3 py-2.5 font-mono text-sm">
              {montar(outroSource, outroMedium)}
            </code>
            <BotaoCopiar
              aceso={copiado === 'outro'}
              onClick={() => copiar(montar(outroSource, outroMedium), 'outro')}
              rotulo="Copiar o endereço montado"
            />
          </div>
        ) : null}
      </section>

      {/* ── O QR ─────────────────────────────────────────────── */}
      {qr ? (
        <section className="rounded-2xl border border-linha bg-white p-6">
          <h2 className="text-lg">QR deste endereço</h2>
          <code className="mt-2 block truncate rounded-lg bg-areia px-3 py-2 font-mono text-xs text-grafite">
            {qr}
          </code>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <canvas
              ref={canvas}
              // O canvas é gerado em 1024 e mostrado em 160: quem baixa
              // leva o arquivo grande, que é o que a gráfica pede.
              className="size-40 rounded-xl border border-linha"
              aria-label={`QR code para ${qr}`}
              role="img"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={baixarQr}
                className="inline-flex min-h-11 items-center rounded-full bg-azul px-5 text-sm font-medium text-white transition-colors hover:bg-azul-escuro"
              >
                Baixar PNG 1024px
              </button>
              <button
                type="button"
                onClick={() => setQr(null)}
                className="inline-flex min-h-11 items-center rounded-full border border-linha px-5 text-sm font-medium text-grafite transition-colors hover:text-tinta"
              >
                Fechar
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function BotaoCopiar({
  aceso,
  onClick,
  rotulo,
}: {
  aceso: boolean
  onClick: () => void
  rotulo: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors ${
        aceso ? 'bg-verde text-white' : 'bg-azul text-white hover:bg-azul-escuro'
      }`}
    >
      {/* `aria-live` no texto, e não no botão: quem usa leitor de tela
          precisa ouvir "copiado" no instante em que acontece. */}
      <span aria-live="polite">{aceso ? 'Copiado' : 'Copiar'}</span>
    </button>
  )
}

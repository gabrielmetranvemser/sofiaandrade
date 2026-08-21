'use client'

import { useActionState, useMemo, useState } from 'react'
import type { DestinoVideo } from '@/lib/painel/videos'
import { interpretarVideo } from '@/lib/video'
import { salvarVideos, type EstadoVideos } from '../acoes-video'

/**
 * A TELA DE VÍDEOS.
 *
 * ⚠️ O PEDIDO, LITERAL: "no painel eu não sei onde subir os vídeos, tá
 *    muito confuso — preciso que cada espaço diga EXATAMENTE onde vai o
 *    vídeo na página".
 *
 *    Então o elemento mais visível de cada cartão não é o rótulo do
 *    campo nem o endereço: é a FRASE que diz onde aquele vídeo aparece.
 *    Ela vem do esquema (`onde`), não daqui — a mesma fonte que valida
 *    e que renderiza. Rótulo de campo some da memória; "fecha a seção,
 *    abaixo dos quatro cartões de problema" não.
 *
 * ⚠️ UM SALVAR SÓ, PARA OS DEZESSETE. Os destinos moram em seis seções
 *    diferentes do conteúdo. Obrigar a salvar seção por seção seria
 *    devolver ao usuário um problema de arrumação interna que é nosso —
 *    a ação junta tudo (ver acoes-video.ts).
 *
 * ⚠️ A CONFERÊNCIA É IMEDIATA. O mesmo `interpretarVideo` que valida no
 *    servidor roda aqui a cada tecla: o cartão diz na hora se o
 *    endereço foi reconhecido e por qual caminho (YouTube, Vimeo ou
 *    arquivo próprio). Descobrir que um link está errado só depois de
 *    apertar salvar, com dezessete campos na tela, é procurar agulha.
 */

interface Rascunho {
  url: string
  formato: string
  titulo: string
  opcoes: Record<string, unknown>
}

export function EditorVideos({
  destinos,
  editavel,
}: {
  destinos: DestinoVideo[]
  editavel: boolean
}) {
  const [rascunho, setRascunho] = useState<Record<string, Rascunho>>(() =>
    Object.fromEntries(
      destinos.map((d) => [
        d.id,
        { url: d.url, formato: d.formato, titulo: d.titulo, opcoes: { ...d.opcoes } },
      ]),
    ),
  )
  const [estado, acao, pendente] = useActionState<EstadoVideos, FormData>(salvarVideos, null)

  const preenchidos = destinos.filter((d) => rascunho[d.id]?.url.trim()).length
  const invalidos = destinos.filter((d) => {
    const u = rascunho[d.id]?.url.trim()
    return u && !interpretarVideo(u)
  }).length

  // Agrupado por seção, na ordem em que os destinos chegam — que já é a
  // ordem da página, porque quem monta a lista percorre SECOES_DO_PAINEL.
  const porSecao = useMemo(() => {
    const m = new Map<string, DestinoVideo[]>()
    for (const d of destinos) {
      const lista = m.get(d.secaoRotulo) ?? []
      lista.push(d)
      m.set(d.secaoRotulo, lista)
    }
    return [...m.entries()]
  }, [destinos])

  const envio = JSON.stringify(
    destinos.map((d) => ({
      id: d.id,
      url: rascunho[d.id]?.url ?? '',
      formato: rascunho[d.id]?.formato,
      titulo: rascunho[d.id]?.titulo,
      opcoes: rascunho[d.id]?.opcoes,
    })),
  )

  return (
    <form action={acao}>
      <input type="hidden" name="videos" value={envio} />

      <header>
        <h1 className="titulo-secao">Vídeos</h1>
        <p className="mt-2 max-w-2xl text-grafite">
          Todos os lugares da página que aceitam vídeo, na ordem em que aparecem no site. Cada
          cartão diz exatamente onde aquele vídeo vai entrar.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 ring-1 ring-linha">
            <strong className="tabular-nums">
              {preenchidos} de {destinos.length}
            </strong>
            <span className="text-grafite">preenchidos</span>
          </span>
          {invalidos > 0 ? (
            <span className="rounded-full bg-red-50 px-4 py-1.5 font-medium text-red-700">
              {invalidos} endereço{invalidos === 1 ? '' : 's'} não reconhecido
              {invalidos === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>

        <ComoHospedar />
      </header>

      <div className="mt-8 space-y-10">
        {porSecao.map(([secao, lista]) => (
          <section key={secao}>
            <h2 className="text-sm font-semibold tracking-[0.06em] text-grafite uppercase">
              {secao}
            </h2>
            <div className="mt-3 space-y-3">
              {lista.map((d) => (
                <CartaoVideo
                  key={d.id}
                  destino={d}
                  valor={rascunho[d.id] ?? { url: '', formato: 'deitado', titulo: '', opcoes: {} }}
                  erro={estado?.erros?.[d.id]}
                  editavel={editavel}
                  onMudar={(v) => setRascunho((r) => ({ ...r, [d.id]: v }))}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div
        className="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-linha bg-white/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!editavel || pendente}
            className="inline-flex min-h-11 items-center rounded-full bg-azul px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-azul-escuro disabled:opacity-40"
          >
            {pendente ? 'Salvando…' : 'Salvar todos os vídeos'}
          </button>
          {estado?.ok ? (
            <span className="text-sm font-medium text-verde">
              Salvo. As mudanças já estão no site.
            </span>
          ) : null}
          {estado?.erro ? (
            <span role="alert" className="text-sm font-medium text-red-600">
              {estado.erro}
            </span>
          ) : null}
        </div>
      </div>
    </form>
  )
}

function CartaoVideo({
  destino,
  valor,
  erro,
  editavel,
  onMudar,
}: {
  destino: DestinoVideo
  valor: Rascunho
  erro?: string
  editavel: boolean
  onMudar: (v: Rascunho) => void
}) {
  const limpo = valor.url.trim()
  const video = limpo ? interpretarVideo(limpo) : null
  const naoReconhecido = Boolean(limpo) && !video
  const id = `v-${destino.id.replace(/[.:]/g, '-')}`

  return (
    <div
      className={`rounded-2xl border bg-white p-5 transition-colors ${
        naoReconhecido || erro ? 'border-red-300' : 'border-linha'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium">{destino.rotulo}</h3>
          {destino.ajuda ? (
            <p className="mt-0.5 text-xs text-grafite">{destino.ajuda}</p>
          ) : null}
        </div>
        {video ? (
          <span className="shrink-0 rounded-full bg-verde-suave px-2.5 py-0.5 text-xs font-medium text-verde">
            no ar
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-areia px-2.5 py-0.5 text-xs text-grafite">
            vazio
          </span>
        )}
      </div>

      {/* ── O "onde" é o coração do cartão, e por isso tem cor e ícone
             próprios em vez de virar mais uma linha de texto cinza. */}
      <p className="mt-3 flex gap-2.5 rounded-xl bg-azul-suave px-4 py-3 text-[0.9375rem] leading-relaxed">
        <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-azul" fill="currentColor" aria-hidden>
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
        </svg>
        <span>{destino.onde}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        {/* ⚠️ A MINIATURA É A CONFIRMAÇÃO. Colar um endereço e ver só a
            palavra "YouTube" embaixo não prova nada — pode ser o vídeo
            errado, e com dezessete campos na tela ninguém abre um por
            um para conferir. O quadro mostra QUAL vídeo é.

            Para arquivo próprio não há miniatura de provedor: o
            elemento de vídeo com `preload="metadata"` busca só o
            cabeçalho e um quadro por requisição de intervalo. */}
        {video ? (
          <div className="w-32 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-linha">
            {video.capa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.capa} alt="" className="aspect-video w-full scale-[1.35] object-cover" />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={`${video.embed}#t=0.1`}
                className="aspect-video w-full object-cover"
                preload="metadata"
                muted
                playsInline
                tabIndex={-1}
                aria-hidden
              />
            )}
          </div>
        ) : null}

        <div className="min-w-[16rem] flex-1">
          {/* ⚠️ O TÍTULO FALTAVA. Ele aparece sobre a capa do vídeo na
              página, e não havia onde editá-lo: nos vídeos soltos o
              texto vinha fixo do componente, e nesta tela nem existia
              campo. Quem via a legenda no site procurava e não achava. */}
          {destino.caminhoTitulo ? (
            <div className="mb-3">
              <label htmlFor={`${id}-t`} className="block text-sm font-medium">
                Título sobre o vídeo
              </label>
              <input
                id={`${id}-t`}
                type="text"
                value={valor.titulo}
                disabled={!editavel}
                maxLength={60}
                placeholder="Vazio: nenhuma legenda aparece"
                onChange={(e) => onMudar({ ...valor, titulo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-linha bg-areia px-3 py-2.5 text-sm transition-colors focus:border-azul/40 focus:bg-white"
              />
            </div>
          ) : null}

          <label htmlFor={id} className="block text-sm font-medium">
            Endereço do vídeo
          </label>
          <input
            id={id}
            type="text"
            value={valor.url}
            disabled={!editavel}
            onChange={(e) => onMudar({ ...valor, url: e.target.value })}
            placeholder="https://youtu.be/… ou https://…/video.mp4"
            className={`mt-1 w-full rounded-xl border bg-areia px-3 py-2.5 font-mono text-sm transition-colors focus:bg-white ${
              naoReconhecido || erro ? 'border-red-400' : 'border-linha focus:border-azul/40'
            }`}
            aria-invalid={naoReconhecido || Boolean(erro)}
            aria-describedby={`${id}-estado`}
          />
        </div>

        {destino.caminhoFormato ? (
          <div className="w-full sm:w-44">
            <label htmlFor={`${id}-f`} className="block text-sm font-medium">
              Enquadramento
            </label>
            <select
              id={`${id}-f`}
              value={valor.formato}
              disabled={!editavel}
              onChange={(e) => onMudar({ ...valor, formato: e.target.value })}
              className="mt-1 w-full rounded-xl border border-linha bg-areia px-3 py-2.5 text-sm focus:border-azul/40 focus:bg-white"
            >
              <option value="deitado">Deitado (16:9)</option>
              <option value="em-pe">Em pé (9:16)</option>
            </select>
          </div>
        ) : null}
      </div>

      {destino.caminhoOpcoes ? (
        <AjustesDoPlayer
          id={id}
          valor={valor.opcoes}
          editavel={editavel}
          provedor={video?.provedor}
          onMudar={(opcoes) => onMudar({ ...valor, opcoes })}
        />
      ) : null}

      <p id={`${id}-estado`} className="mt-2 text-xs">
        {erro ? (
          <span role="alert" className="font-medium text-red-700">
            {erro}
          </span>
        ) : naoReconhecido ? (
          <span role="alert" className="font-medium text-red-700">
            Endereço não reconhecido. Use um link do YouTube, do Vimeo, ou o endereço direto de um
            arquivo .mp4 ou .webm.
          </span>
        ) : video ? (
          <span className="text-grafite">
            {video.provedor === 'youtube'
              ? 'YouTube'
              : video.provedor === 'vimeo'
                ? 'Vimeo'
                : 'Arquivo próprio'}{' '}
            · <span className="font-mono">{video.id}</span>
          </span>
        ) : (
          <span className="text-grafite">
            Vazio. Enquanto estiver assim, este bloco não aparece na página.
          </span>
        )}
      </p>
    </div>
  )
}

/**
 * OS AJUSTES DE PLAYER, DOBRADOS.
 *
 * ⚠️ FECHADO POR PADRÃO, e é decisão de leitura. São dezessete cartões
 *    na tela; abrir cinco ajustes em cada um daria oitenta e cinco
 *    controles competindo com a única coisa que importa na primeira
 *    passada — colar o endereço. Quem precisa mexer abre; quem não
 *    precisa nem vê que existe.
 *
 * ⚠️ O AVISO SOBRE O YOUTUBE não é rodapé: aparece só quando o vídeo É
 *    do YouTube, no momento em que a pessoa está mexendo justamente
 *    nesses dois interruptores. Aviso genérico no topo da página
 *    ninguém lê.
 */
function AjustesDoPlayer({
  id,
  valor,
  editavel,
  provedor,
  onMudar,
}: {
  id: string
  valor: Record<string, unknown>
  editavel: boolean
  provedor?: string
  onMudar: (v: Record<string, unknown>) => void
}) {
  const ligado = (k: string) => valor[k] !== false
  const texto = (k: string) => (typeof valor[k] === 'string' ? (valor[k] as string) : '')
  const mudar = (k: string, v: unknown) => onMudar({ ...valor, [k]: v })

  const mexidos =
    !ligado('controles') ||
    !ligado('telaCheia') ||
    valor.inicio === 'automatico' ||
    valor.carregamento === 'com-previa' ||
    Boolean(texto('botaoRotulo'))

  return (
    <details className="mt-3 rounded-xl bg-areia">
      <summary className="cursor-pointer list-none px-4 py-2.5 text-sm font-medium text-grafite">
        Ajustes do player
        {mexidos ? (
          <span className="ml-2 rounded-full bg-azul px-2 py-0.5 text-[0.6875rem] text-white">
            personalizado
          </span>
        ) : null}
      </summary>

      <div className="space-y-3 border-t border-linha/70 px-4 py-3">
        <Interruptor
          id={`${id}-ctr`}
          rotulo="Mostrar os controles do player"
          ligado={ligado('controles')}
          editavel={editavel}
          onMudar={(v) => mudar('controles', v)}
        />
        <Interruptor
          id={`${id}-fs`}
          rotulo="Permitir tela cheia"
          ligado={ligado('telaCheia')}
          editavel={editavel}
          onMudar={(v) => mudar('telaCheia', v)}
        />

        {provedor === 'youtube' && (!ligado('controles') || !ligado('telaCheia')) ? (
          <p className="rounded-lg bg-amarelo-suave px-3 py-2 text-xs">
            O YouTube aceita esconder a barra e a tela cheia, mas continua mostrando o próprio nome
            e o menu ao clicar com o botão direito. Para um vídeo sem nenhuma marca, hospede o
            arquivo você mesmo.
          </p>
        ) : null}

        <div>
          <label htmlFor={`${id}-ini`} className="block text-sm font-medium">
            Como o vídeo começa
          </label>
          <select
            id={`${id}-ini`}
            value={valor.inicio === 'automatico' ? 'automatico' : 'clique'}
            disabled={!editavel}
            onChange={(e) => mudar('inicio', e.target.value)}
            className="mt-1 w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm"
          >
            <option value="clique">Ao clicar no play</option>
            <option value="automatico">Sozinho, quando aparece na tela</option>
          </select>

          {valor.inicio === 'automatico' ? (
            <div className="mt-2 space-y-2">
              <p className="rounded-lg bg-amarelo-suave px-3 py-2 text-xs">
                Começa <strong>mudo</strong>. Não é escolha nossa: desde 2018 todo navegador
                recusa vídeo que começa sozinho com som, e a chamada falha em silêncio — o vídeo
                simplesmente não sairia do lugar.
              </p>
              {provedor === 'arquivo' ? (
                <p className="text-xs text-grafite">
                  Aparece um botão “Ligar o som” no canto do vídeo.
                </p>
              ) : !ligado('controles') ? (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
                  Com os controles desligados, quem assiste <strong>não terá como ligar o som</strong>
                  — no YouTube e no Vimeo quem faz isso é o player deles. Ligue os controles, ou
                  hospede o arquivo você mesmo.
                </p>
              ) : (
                <p className="text-xs text-grafite">
                  Quem assiste liga o som pelos controles do player.
                </p>
              )}
              <p className="text-xs text-grafite">
                Na trilha de vídeos este ajuste é ignorado: lá só um toca por vez.
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${id}-carr`} className="block text-sm font-medium">
            Carregamento
          </label>
          <select
            id={`${id}-carr`}
            value={valor.carregamento === 'com-previa' ? 'com-previa' : 'ao-clicar'}
            disabled={!editavel}
            onChange={(e) => mudar('carregamento', e.target.value)}
            className="mt-1 w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm"
          >
            <option value="ao-clicar">Só ao clicar (mais leve)</option>
            <option value="com-previa">Adiantar a capa (abre mais rápido)</option>
          </select>
          <p className="mt-1 text-xs text-grafite">
            Só ao clicar: nada é pedido ao provedor antes de a pessoa tocar em play.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-btn`} className="block text-sm font-medium">
              Botão sobre o vídeo
            </label>
            <input
              id={`${id}-btn`}
              type="text"
              value={texto('botaoRotulo')}
              disabled={!editavel}
              maxLength={30}
              placeholder="Ex.: Entrar no grupo"
              onChange={(e) => mudar('botaoRotulo', e.target.value)}
              className="mt-1 w-full rounded-xl border border-linha bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`${id}-dst`} className="block text-sm font-medium">
              Destino do botão
            </label>
            <input
              id={`${id}-dst`}
              type="text"
              value={texto('botaoDestino')}
              disabled={!editavel}
              placeholder="/#grupos"
              onChange={(e) => mudar('botaoDestino', e.target.value)}
              className="mt-1 w-full rounded-xl border border-linha bg-white px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-grafite">
          O botão só aparece com os dois campos preenchidos. O destino é sempre dentro do site.
        </p>
      </div>
    </details>
  )
}

function Interruptor({
  id,
  rotulo,
  ligado,
  editavel,
  onMudar,
}: {
  id: string
  rotulo: string
  ligado: boolean
  editavel: boolean
  onMudar: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm">
        {rotulo}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ligado}
        disabled={!editavel}
        onClick={() => onMudar(!ligado)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
          ligado ? 'bg-azul' : 'bg-linha'
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
            ligado ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

/** As duas maneiras de hospedar, explicadas onde a dúvida acontece. */
function ComoHospedar() {
  return (
    <details className="mt-5 rounded-2xl border border-linha bg-white">
      <summary className="cursor-pointer list-none px-5 py-4 text-[0.9375rem] font-medium">
        <span className="inline-flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="size-4 text-azul" fill="currentColor" aria-hidden>
            <path d="M11 7h2v2h-2V7Zm0 4h2v6h-2v-6Zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z" />
          </svg>
          Onde hospedar os vídeos
        </span>
      </summary>
      <div className="space-y-4 border-t border-linha px-5 py-4 text-sm text-grafite">
        <div>
          <p className="font-medium text-tinta">YouTube ou Vimeo — o caminho simples</p>
          <p className="mt-1">
            Suba como <strong>não listado</strong> (não aparece na busca nem no canal, mas abre
            para quem tem o link) e cole o endereço aqui. Não custa nada e aguenta qualquer pico de
            acesso. O player só carrega quando alguém toca no play.
          </p>
        </div>
        <div>
          <p className="font-medium text-tinta">Arquivo próprio — Cloudflare R2 e afins</p>
          <p className="mt-1">
            Se preferir o vídeo sob domínio da campanha, sem YouTube no meio, suba o arquivo num
            balde público e cole o endereço direto dele. O R2 é a escolha certa porque não cobra
            saída de dados — que é justamente o custo que estoura quando a página viraliza.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Só <strong>.mp4</strong> ou <strong>.webm</strong>. O formato .m3u8 é recusado: toca
              no Safari e não toca no Chrome sem biblioteca extra.
            </li>
            <li>
              Exporte o .mp4 com <strong>faststart</strong>, senão o vídeo só começa depois de
              baixar inteiro.
            </li>
            <li>O balde precisa estar público e responder a requisições de intervalo (range).</li>
          </ul>
        </div>
      </div>
    </details>
  )
}

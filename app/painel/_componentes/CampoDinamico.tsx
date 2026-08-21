'use client'

import type { Campo } from '@/content/esquema'
import { CampoDestaque } from './CampoDestaque'

/**
 * UM componente para os 10 tipos de campo. É a resposta a "17 seções não
 * se escreve como 17 telas".
 *
 * O estado é a seção inteira num objeto só, endereçado por caminho.
 * Não é FormData por campo: com repetidor, remover o item 2 obrigaria a
 * renomear `itens[3].titulo` para `itens[2].titulo` em todos os que vêm
 * depois. No submit vai um JSON só, o que preserva a assinatura de
 * Server Action que o projeto já usa.
 */

type Valor = unknown

export interface Props {
  campo: Campo
  valor: Valor
  caminho: string
  erros: Record<string, string>
  onMudar: (caminho: string, valor: Valor) => void
}

const RESTANTE = (texto: string, max?: number) => {
  if (!max) return null
  const visivel = texto.replace(/\[\[(.*?)\]\]/g, '$1').length
  const sobra = max - visivel
  return (
    <span
      className={`text-xs tabular-nums ${sobra < 0 ? 'font-semibold text-red-600' : 'text-grafite'}`}
    >
      {sobra < 0 ? `${-sobra} a mais` : `${sobra}`}
    </span>
  )
}

function Rotulo({
  children,
  para,
  ajuda,
  extra,
}: {
  children: React.ReactNode
  para: string
  ajuda?: string
  extra?: React.ReactNode
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={para} className="text-sm font-medium">
        {children}
      </label>
      {extra}
      {ajuda ? <span className="sr-only">{ajuda}</span> : null}
    </div>
  )
}

const ENTRADA =
  'w-full rounded-xl border border-linha bg-areia px-3 py-2.5 text-[0.9375rem] ' +
  'transition-colors focus:border-azul/40 focus:bg-white'

export function CampoDinamico({ campo, valor, caminho, erros, onMudar }: Props) {
  const erro = erros[caminho]
  const id = `c-${caminho.replace(/\./g, '-')}`

  if (campo.tipo === 'oculto') return null

  // ── interruptor ──────────────────────────────────────────────
  // Rótulo à esquerda e chave à direita, no padrão de uma tela de
  // ajustes — e não caixinha de marcar. É uma escolha de leitura: numa
  // lista de treze seções, o que a pessoa precisa varrer com o olho é
  // O QUE ESTÁ LIGADO, e chave alinhada à direita forma uma coluna que
  // se lê de cima a baixo. Caixinha antes do texto não forma coluna.
  if (campo.tipo === 'booleano') {
    const ligado = valor === true || valor === 'true'
    return (
      <div className="flex items-start justify-between gap-4 border-b border-linha py-3 last:border-b-0">
        <span className="min-w-0">
          <label htmlFor={id} className="block text-sm font-medium">
            {campo.rotulo}
          </label>
          {campo.ajuda ? (
            <span className="mt-0.5 block text-xs text-grafite">{campo.ajuda}</span>
          ) : null}
        </span>

        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={ligado}
          aria-label={campo.rotulo}
          onClick={() => onMudar(caminho, !ligado)}
          className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${
            ligado ? 'bg-verde' : 'bg-linha'
          }`}
        >
          <span
            className={`inline-block size-5 rounded-full bg-white shadow-suave transition-transform duration-200 ${
              ligado ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    )
  }

  // ── texto e parágrafo ────────────────────────────────────────
  if (campo.tipo === 'texto' || campo.tipo === 'longo') {
    const v = typeof valor === 'string' ? valor : ''
    const comum = {
      id,
      value: v,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onMudar(caminho, e.target.value),
      className: `${ENTRADA} ${erro ? 'border-red-400' : ''}`,
      'aria-invalid': Boolean(erro),
      'aria-describedby': campo.ajuda ? `${id}-ajuda` : undefined,
    }
    const temDestaque = 'destaque' in campo && campo.destaque

    return (
      <div>
        <Rotulo para={id} extra={RESTANTE(v, campo.max)}>
          {campo.rotulo}
        </Rotulo>

        {/* Campo com destaque ganha botão e prévia. A marcação
            [[colchetes]] deixa de ser algo que a pessoa precisa saber
            que existe — ela seleciona a palavra e toca em Destacar. */}
        {temDestaque ? (
          <CampoDestaque
            id={id}
            valor={v}
            onMudar={(novo) => onMudar(caminho, novo)}
            invalido={Boolean(erro)}
            descreve={campo.ajuda ? `${id}-ajuda` : undefined}
            className={comum.className}
          />
        ) : campo.tipo === 'longo' ? (
          <textarea {...comum} rows={campo.linhas ?? 3} />
        ) : (
          <input type="text" {...comum} />
        )}

        {campo.ajuda ? (
          <p id={`${id}-ajuda`} className="mt-1 text-xs text-grafite">
            {campo.ajuda}
          </p>
        ) : null}
        {erro ? <p className="mt-1 text-xs font-medium text-red-600">{erro}</p> : null}
      </div>
    )
  }

  // ── url e âncora ─────────────────────────────────────────────
  if (campo.tipo === 'url' || campo.tipo === 'ancora') {
    const v = typeof valor === 'string' ? valor : ''
    return (
      <div>
        <Rotulo para={id}>{campo.rotulo}</Rotulo>
        <input
          id={id}
          type="text"
          value={v}
          onChange={(e) => onMudar(caminho, e.target.value)}
          placeholder={campo.tipo === 'ancora' ? '/pagina ou #secao' : 'https://…'}
          className={`${ENTRADA} font-mono text-sm ${erro ? 'border-red-400' : ''}`}
          aria-invalid={Boolean(erro)}
        />
        {erro ? <p className="mt-1 text-xs font-medium text-red-600">{erro}</p> : null}
      </div>
    )
  }

  // ── vídeo ────────────────────────────────────────────────────
  // Campo de endereço com uma diferença que importa na tela: ele diz,
  // ali mesmo, que ficar vazio é uma opção legítima. Sem essa linha,
  // quem abre o painel e vê oito campos de vídeo em branco acha que a
  // página está quebrada esperando ser preenchida.
  if (campo.tipo === 'video') {
    const v = typeof valor === 'string' ? valor : ''
    return (
      <div>
        <Rotulo para={id}>{campo.rotulo}</Rotulo>
        <input
          id={id}
          type="text"
          value={v}
          onChange={(e) => onMudar(caminho, e.target.value)}
          placeholder="https://youtu.be/…"
          className={`${ENTRADA} font-mono text-sm ${erro ? 'border-red-400' : ''}`}
          aria-invalid={Boolean(erro)}
          aria-describedby={`${id}-ajuda`}
        />
        <p id={`${id}-ajuda`} className="mt-1 text-xs text-grafite">
          {campo.ajuda ??
            'YouTube ou Vimeo. Deixe vazio enquanto o vídeo não existir — o bloco some da página sozinho.'}
        </p>
        {erro ? <p className="mt-1 text-xs font-medium text-red-600">{erro}</p> : null}
      </div>
    )
  }

  // ── escolha entre opções fixas ───────────────────────────────
  if (campo.tipo === 'escolha') {
    const v = typeof valor === 'string' ? valor : ''
    const atual = campo.opcoes.some((o) => o.valor === v) ? v : (campo.opcoes[0]?.valor ?? '')
    return (
      <div>
        <Rotulo para={id}>{campo.rotulo}</Rotulo>
        <select
          id={id}
          value={atual}
          onChange={(e) => onMudar(caminho, e.target.value)}
          className={ENTRADA}
          aria-describedby={campo.ajuda ? `${id}-ajuda` : undefined}
        >
          {campo.opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        {campo.ajuda ? (
          <p id={`${id}-ajuda`} className="mt-1 text-xs text-grafite">
            {campo.ajuda}
          </p>
        ) : null}
      </div>
    )
  }

  // ── lista de strings ─────────────────────────────────────────
  if (campo.tipo === 'listaTexto') {
    const lista = Array.isArray(valor) ? (valor as string[]) : []
    const podeRemover = lista.length > (campo.min ?? 0)
    const podeAdicionar = lista.length < (campo.max ?? 99)

    return (
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">{campo.rotulo}</legend>
        {campo.ajuda ? <p className="mb-2 text-xs text-grafite">{campo.ajuda}</p> : null}

        <div className="space-y-2">
          {lista.map((linha, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                {/* Cada linha ganha o seu próprio Destacar: numa lista
                    de linhas de título, o realce é por linha. */}
                {campo.destaque ? (
                  <CampoDestaque
                    valor={linha}
                    multilinha
                    linhas={linha.length > 90 ? 3 : 1}
                    rotuloAcessivel={`${campo.rotulo} ${i + 1}`}
                    invalido={Boolean(erros[`${caminho}.${i}`])}
                    className={`${ENTRADA} ${erros[`${caminho}.${i}`] ? 'border-red-400' : ''}`}
                    onMudar={(novoTexto) => {
                      const novo = [...lista]
                      novo[i] = novoTexto
                      onMudar(caminho, novo)
                    }}
                  />
                ) : (
                  <textarea
                    value={linha}
                    rows={linha.length > 90 ? 3 : 1}
                    onChange={(e) => {
                      const novo = [...lista]
                      novo[i] = e.target.value
                      onMudar(caminho, novo)
                    }}
                    className={`${ENTRADA} ${erros[`${caminho}.${i}`] ? 'border-red-400' : ''}`}
                    aria-label={`${campo.rotulo} ${i + 1}`}
                  />
                )}
              </div>
              <div className="flex shrink-0 gap-1 pt-1">
                <BotaoIcone
                  titulo="Subir"
                  desabilitado={i === 0}
                  onClick={() => onMudar(caminho, mover(lista, i, -1))}
                  d="M12 5l7 7-1.4 1.4L13 8.8V19h-2V8.8L6.4 13.4 5 12l7-7Z"
                />
                <BotaoIcone
                  titulo="Descer"
                  desabilitado={i === lista.length - 1}
                  onClick={() => onMudar(caminho, mover(lista, i, 1))}
                  d="M12 19l-7-7 1.4-1.4L11 15.2V5h2v10.2l4.6-4.6L19 12l-7 7Z"
                />
                <BotaoIcone
                  titulo="Remover"
                  desabilitado={!podeRemover}
                  onClick={() => onMudar(caminho, lista.filter((_, j) => j !== i))}
                  d="M7 6V4h10v2h4v2H3V6h4Zm1 4h2v9H8v-9Zm6 0h2v9h-2v-9ZM5 8h14l-1 13H6L5 8Z"
                />
              </div>
            </div>
          ))}
        </div>

        {erro ? <p className="mt-1 text-xs font-medium text-red-600">{erro}</p> : null}

        {podeAdicionar ? (
          <button
            type="button"
            onClick={() => onMudar(caminho, [...lista, ''])}
            className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-linha bg-white px-4 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
          >
            + Adicionar
          </button>
        ) : null}
      </fieldset>
    )
  }

  // ── lista de objetos (repetidor) ─────────────────────────────
  if (campo.tipo === 'lista') {
    const lista = Array.isArray(valor) ? (valor as Record<string, unknown>[]) : []
    const podeRemover = lista.length > (campo.min ?? 0)
    const podeAdicionar = lista.length < (campo.max ?? 99)

    return (
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">{campo.rotulo}</legend>
        {campo.ajuda ? <p className="mb-2 text-xs text-grafite">{campo.ajuda}</p> : null}

        <div className="space-y-3">
          {lista.map((item, i) => {
            const nome =
              (campo.titulo && typeof item[campo.titulo] === 'string' && item[campo.titulo]) ||
              `${campo.rotuloItem} ${i + 1}`
            return (
              <div key={String(item.id ?? i)} className="rounded-xl border border-linha bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-grafite">{String(nome)}</span>
                  <div className="flex shrink-0 gap-1">
                    <BotaoIcone
                      titulo="Subir"
                      desabilitado={i === 0}
                      onClick={() => onMudar(caminho, mover(lista, i, -1))}
                      d="M12 5l7 7-1.4 1.4L13 8.8V19h-2V8.8L6.4 13.4 5 12l7-7Z"
                    />
                    <BotaoIcone
                      titulo="Descer"
                      desabilitado={i === lista.length - 1}
                      onClick={() => onMudar(caminho, mover(lista, i, 1))}
                      d="M12 19l-7-7 1.4-1.4L11 15.2V5h2v10.2l4.6-4.6L19 12l-7 7Z"
                    />
                    <BotaoIcone
                      titulo="Remover"
                      desabilitado={!podeRemover}
                      onClick={() => onMudar(caminho, lista.filter((_, j) => j !== i))}
                      d="M7 6V4h10v2h4v2H3V6h4Zm1 4h2v9H8v-9Zm6 0h2v9h-2v-9ZM5 8h14l-1 13H6L5 8Z"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(campo.item).map(([chave, subcampo]) => (
                    <CampoDinamico
                      key={chave}
                      campo={subcampo}
                      valor={item[chave]}
                      caminho={`${caminho}.${i}.${chave}`}
                      erros={erros}
                      onMudar={onMudar}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {erro ? <p className="mt-1 text-xs font-medium text-red-600">{erro}</p> : null}

        {podeAdicionar ? (
          <button
            type="button"
            onClick={() => onMudar(caminho, [...lista, itemVazio(campo.item)])}
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-linha bg-white px-4 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
          >
            + Adicionar {campo.rotuloItem.toLowerCase()}
          </button>
        ) : null}
      </fieldset>
    )
  }

  // ── grupo de chaves fixas ────────────────────────────────────
  if (campo.tipo === 'grupo') {
    const obj = (valor ?? {}) as Record<string, unknown>
    return (
      <fieldset className="rounded-xl border border-linha bg-white p-4">
        <legend className="px-2 text-sm font-medium">{campo.rotulo}</legend>
        <div className="space-y-3">
          {Object.entries(campo.campos).map(([chave, subcampo]) => (
            <CampoDinamico
              key={chave}
              campo={subcampo}
              valor={obj[chave]}
              caminho={`${caminho}.${chave}`}
              erros={erros}
              onMudar={onMudar}
            />
          ))}
        </div>
      </fieldset>
    )
  }

  return null
}

function BotaoIcone({
  titulo,
  d,
  onClick,
  desabilitado,
}: {
  titulo: string
  d: string
  onClick: () => void
  desabilitado?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      title={titulo}
      aria-label={titulo}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-linha bg-white text-grafite transition-colors hover:border-azul/30 hover:text-azul disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d={d} />
      </svg>
    </button>
  )
}

function mover<T>(lista: T[], de: number, delta: number): T[] {
  const para = de + delta
  if (para < 0 || para >= lista.length) return lista
  const novo = [...lista]
  ;[novo[de], novo[para]] = [novo[para], novo[de]]
  return novo
}

/**
 * Item novo do repetidor. Gera `id` — sem ele o React usa o índice e
 * embaralha o estado quando alguém reordena.
 */
function itemVazio(campos: Record<string, Campo>): Record<string, unknown> {
  const saida: Record<string, unknown> = {}
  for (const [chave, campo] of Object.entries(campos)) {
    if (campo.tipo === 'oculto') saida[chave] = crypto.randomUUID().slice(0, 8)
    else if (campo.tipo === 'booleano') saida[chave] = true
    else if (campo.tipo === 'lista') saida[chave] = []
    else if (campo.tipo === 'listaTexto') saida[chave] = ['']
    else if (campo.tipo === 'grupo') saida[chave] = itemVazio(campo.campos)
    // Escolha nasce na primeira opção, nunca em branco: string vazia
    // num <select> mostra um item fantasma que não está na lista.
    else if (campo.tipo === 'escolha') saida[chave] = campo.opcoes[0]?.valor ?? ''
    else saida[chave] = ''
  }
  return saida
}

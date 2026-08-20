'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import type { Slot } from '@/content/slots'
import type { ImagemDoSlot } from '@/lib/midia/ler'
import { enviarImagem, removerImagem, type EstadoMidia } from '../acoes-midia'
import { Recortador } from './Recortador'

/**
 * Um espaço de imagem, com as instruções impressas na tela.
 *
 * As instruções não são texto solto: saem do próprio `content/slots.ts`,
 * o mesmo objeto que o servidor usa para validar e que o recortador
 * obedece. Se a regra mudar, a tela muda junto.
 *
 * O caminho agora é escolher → recortar → enviar. Não existe mais o
 * caminho de mandar o arquivo cru: era ele que produzia a recusa
 * "recorte antes de enviar", que é um pedido impossível de atender
 * para quem está no celular, no meio da rua, com a foto na mão.
 *
 * O envio NÃO usa `action={acao}` no formulário. O arquivo que sobe é
 * um Blob que vive em memória, e não há como colocá-lo num input de
 * arquivo de maneira confiável em todo navegador. Então o FormData é
 * montado à mão e a ação é chamada direto.
 */
export function CartaoSlot({
  slot,
  imagem,
  editavel,
}: {
  slot: Slot
  imagem?: ImagemDoSlot
  editavel: boolean
}) {
  const [estado, acao, pendente] = useActionState<EstadoMidia, FormData>(enviarImagem, null)
  const [, acaoRemover, removendo] = useActionState<EstadoMidia, FormData>(removerImagem, null)
  const entrada = useRef<HTMLInputElement>(null)

  const [aRecortar, setARecortar] = useState<File | null>(null)
  const [pronto, setPronto] = useState<File | null>(null)
  const [previa, setPrevia] = useState<string | null>(null)
  const [alt, setAlt] = useState(imagem?.alt ?? '')

  // A prévia é uma URL de objeto: sem revogar, cada recorte novo deixa
  // um blob pendurado na memória da aba.
  useEffect(() => {
    if (!pronto) {
      setPrevia(null)
      return
    }
    const url = URL.createObjectURL(pronto)
    setPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [pronto])

  // Enviou: limpa o recorte para o card voltar a mostrar o que está no
  // ar, e não uma prévia local que já virou passado.
  useEffect(() => {
    if (estado?.ok) setPronto(null)
  }, [estado?.ok])

  function enviar() {
    if (!pronto) return
    const fd = new FormData()
    fd.set('slot', slot.chave)
    fd.set('arquivo', pronto)
    fd.set('alt', alt)
    startTransition(() => acao(fd))
  }

  function remover() {
    const fd = new FormData()
    fd.set('slot', slot.chave)
    startTransition(() => acaoRemover(fd))
  }

  return (
    <div className="rounded-2xl border border-linha bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium">{slot.rotulo}</h3>
          <p className="text-sm text-grafite">{slot.onde}</p>
        </div>
        {imagem ? (
          <span className="rounded-full bg-verde-suave px-2.5 py-0.5 text-xs font-medium text-verde">
            no ar
          </span>
        ) : (
          <span className="rounded-full bg-areia px-2.5 py-0.5 text-xs text-grafite">vazio</span>
        )}
      </div>

      {/* Instruções — o que o cliente pediu que aparecesse na tela */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-areia p-3 text-xs">
        <div>
          <dt className="text-grafite">Tamanho</dt>
          <dd className="font-medium tabular-nums">
            {slot.exata ? 'exatamente ' : 'mínimo '}
            {slot.larguraMin}×{slot.alturaMin}
          </dd>
        </div>
        <div>
          <dt className="text-grafite">Proporção</dt>
          <dd className="font-medium">
            {slot.proporcao ? slot.proporcao.replace('/', ' : ') : 'livre'}
          </dd>
        </div>
        <div>
          <dt className="text-grafite">Formato</dt>
          <dd className="font-medium">{slot.alpha ? 'PNG com transparência' : 'JPG ou PNG'}</dd>
        </div>
        <div>
          <dt className="text-grafite">Vira</dt>
          <dd className="font-medium">WebP</dd>
        </div>
      </dl>

      {slot.nota ? <p className="mt-3 text-xs text-grafite">{slot.nota}</p> : null}

      {/* O recorte pronto ganha a frente do que está no ar: é o que a
          pessoa acabou de fazer e é o que ela precisa conferir. */}
      {previa ? (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-azul">Recorte pronto, ainda não enviado</p>
          <div className="overflow-hidden rounded-xl border-2 border-azul/30 bg-areia">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previa} alt="Prévia do recorte" className="mx-auto max-h-56 w-auto" />
          </div>
        </div>
      ) : imagem ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-linha bg-areia">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagem.url}
            alt={imagem.alt}
            className="mx-auto max-h-56 w-auto"
            style={{
              background: imagem.temAlpha
                ? 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50%/16px 16px'
                : undefined,
            }}
          />
        </div>
      ) : null}

      <div className="mt-4">
        <input
          ref={entrada}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) setARecortar(f)
            // Zerar permite reescolher o MESMO arquivo depois de
            // cancelar — sem isso o onChange não dispara de novo.
            e.target.value = ''
          }}
        />

        <label className="block text-sm font-medium" htmlFor={`alt-${slot.chave}`}>
          Descrição para quem não enxerga
        </label>
        <input
          id={`alt-${slot.chave}`}
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder={slot.rotulo}
          className="mt-1 w-full rounded-xl border border-linha bg-areia px-3 py-2 text-sm focus:border-azul/40 focus:bg-white"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!editavel}
            onClick={() => entrada.current?.click()}
            className="inline-flex min-h-10 items-center rounded-full border border-linha px-4 text-sm font-medium transition-colors hover:border-azul/30 disabled:opacity-40"
          >
            {pronto ? 'Trocar foto' : 'Escolher e recortar'}
          </button>

          {pronto ? (
            <button
              type="button"
              onClick={() => setARecortar(pronto)}
              className="inline-flex min-h-10 items-center rounded-full border border-linha px-4 text-sm font-medium transition-colors hover:border-azul/30"
            >
              Ajustar
            </button>
          ) : null}

          <button
            type="button"
            onClick={enviar}
            disabled={!editavel || pendente || !pronto}
            className="inline-flex min-h-10 items-center rounded-full bg-azul px-5 text-sm font-semibold text-white transition-colors hover:bg-azul-escuro disabled:opacity-40"
          >
            {pendente ? 'Enviando…' : 'Enviar'}
          </button>

          {imagem ? (
            <button
              type="button"
              onClick={remover}
              disabled={!editavel || removendo}
              className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-medium text-grafite transition-colors hover:text-red-600 disabled:opacity-40"
            >
              Remover
            </button>
          ) : null}
        </div>

        {estado?.erro ? (
          <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-900">
            {estado.erro}
          </p>
        ) : null}
        {estado?.ok ? <p className="mt-2 text-xs font-medium text-verde">Enviada.</p> : null}
      </div>

      {aRecortar ? (
        <Recortador
          slot={slot}
          arquivo={aRecortar}
          aoCancelar={() => setARecortar(null)}
          aoConfirmar={(recortado) => {
            setPronto(recortado)
            setARecortar(null)
          }}
        />
      ) : null}
    </div>
  )
}

'use client'

import { useState } from 'react'

/**
 * O PARÁGRAFO QUE PRECISA ENTRAR NA POLÍTICA DE PRIVACIDADE.
 *
 * ⚠️ POR QUE O TEXTO ESTÁ AQUI E NÃO FOI ESCRITO DIRETO NA POLÍTICA.
 *
 *    Porque a política é peça jurídica assinada pela campanha, e
 *    porque ela só fica errada QUANDO alguém liga o pixel — o que
 *    pode não acontecer nunca. Reescrevê-la por antecipação faria a
 *    página declarar um rastreamento que não existe, que é o mesmo
 *    tipo de erro na direção contrária.
 *
 *    Então o texto fica pronto, do lado do interruptor, para ser
 *    colado por quem tem autoridade para publicá-lo. É a distância
 *    mais curta possível entre ligar o rastreamento e dizer a verdade
 *    sobre ele.
 *
 * ⚠️ OS PARÁGRAFOS MUDAM COM O QUE ESTÁ LIGADO. O do Tag Manager só
 *    aparece se houver contêiner configurado — colar um parágrafo
 *    sobre uma ferramenta que o site não carrega é a mesma falha de
 *    novo, só que ao contrário.
 */
export function TextoPrivacidade({ pixel, gtm }: { pixel: boolean; gtm: boolean }) {
  const [copiado, setCopiado] = useState<number | 'todos' | null>(null)

  const paragrafos = [
    'Quando a campanha está anunciando, esta página carrega o pixel da Meta, a empresa do Facebook e do Instagram. Ele grava cookies no seu navegador e informa à Meta as mesmas ações listadas acima, para medir o resultado dos anúncios e formar públicos de divulgação.',
    'Parte dessas informações também sai do nosso servidor direto para a Meta, pela Conversions API. O que é enviado: o seu endereço de rede, o modelo do seu navegador, os identificadores que o próprio pixel gravou e o identificador aleatório da visita. Não enviamos nome, telefone, e-mail nem qualquer foto — esta página não pede nada disso.',
    ...(gtm
      ? [
          'Esta página também carrega o Google Tag Manager, que é a ferramenta usada para administrar essas medições. Ele não coleta nada por conta própria.',
        ]
      : []),
    'Você pode limitar o uso desses dados quando quiser: nas preferências de anúncios da sua conta na Meta, e nas configurações de cookies do seu navegador. Bloquear esses cookies não muda nada no funcionamento desta página.',
  ]

  async function copiar(texto: string, marca: number | 'todos') {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      window.prompt('Copie o texto:', texto)
    }
    setCopiado(marca)
    setTimeout(() => setCopiado(null), 2600)
  }

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold">O texto para a política de privacidade</h2>

      <p className="mt-1 max-w-3xl text-sm text-grafite">
        {pixel ? (
          <>
            <strong className="font-medium text-tinta">O pixel está ligado</strong>, então a
            política publicada já está desatualizada. Faça a troca abaixo hoje.
          </>
        ) : (
          <>
            Enquanto nada estiver ligado aqui, o texto atual da política continua verdadeiro —{' '}
            <strong className="font-medium text-tinta">não mexa nele ainda</strong>. Deixe esta
            troca para o mesmo dia em que preencher o ID do pixel.
          </>
        )}
      </p>

      <div className="mt-4 rounded-2xl border border-linha bg-white p-6">
        <h3 className="text-sm font-semibold">Onde colar</h3>
        <p className="mt-1 text-sm text-grafite">
          Painel ▸ <strong className="font-medium text-tinta">Seções</strong> ▸{' '}
          <strong className="font-medium text-tinta">Política de privacidade</strong> ▸ seção{' '}
          <em>4. O que medimos</em> ▸ campo <em>Parágrafos</em>.
        </p>

        <ol className="mt-4 space-y-2 text-sm text-grafite">
          <li>
            <strong className="font-medium text-tinta">1.</strong> Apague o último parágrafo, que
            hoje diz{' '}
            <q className="italic">Não usamos cookies de rastreamento e não montamos perfil de
            navegação.</q>{' '}
            — é ele que deixa de ser verdade.
          </li>
          <li>
            <strong className="font-medium text-tinta">2.</strong> Os dois primeiros parágrafos
            continuam certos: não mexa neles.
          </li>
          <li>
            <strong className="font-medium text-tinta">3.</strong> Cole os{' '}
            {paragrafos.length === 3 ? 'três' : 'quatro'} de baixo,{' '}
            <strong className="font-medium text-tinta">cada um no seu próprio campo</strong> — use o
            botão de adicionar da lista para abrir os que faltarem.
          </li>
          <li>
            <strong className="font-medium text-tinta">4.</strong> Atualize a{' '}
            <em>Data de atualização</em>, no topo da mesma tela. A própria política promete isso na
            última seção.
          </li>
        </ol>

        <div className="mt-6 space-y-3">
          {paragrafos.map((p, i) => (
            <div key={i} className="rounded-xl border border-linha bg-areia p-4">
              <p className="text-sm leading-relaxed">{p}</p>
              <button
                type="button"
                onClick={() => copiar(p, i)}
                className="mt-3 inline-flex min-h-9 items-center rounded-full border border-azul px-4 text-sm font-medium text-azul"
              >
                {copiado === i ? 'Copiado' : `Copiar parágrafo ${i + 1}`}
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => copiar(paragrafos.join('\n\n'), 'todos')}
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-azul px-6 font-semibold text-white"
        >
          {copiado === 'todos' ? 'Copiado' : 'Copiar todos'}
        </button>
      </div>
    </section>
  )
}

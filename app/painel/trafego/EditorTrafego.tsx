'use client'

import { useActionState, useState } from 'react'
import { salvarTrafego, testarCapi, type EstadoTrafego } from '../acoes-trafego'

export interface ValoresTrafego {
  metaPixelId: string
  gtmId: string
  metaDominio: string
  capiTeste: string
  apiVersao: string
  capiAtiva: boolean
  /** Só os quatro últimos caracteres. O token nunca chega inteiro aqui. */
  tokenMascara: string
}

export function EditorTrafego({
  inicial,
  editavel,
}: {
  inicial: ValoresTrafego
  editavel: boolean
}) {
  const [estado, salvar, salvando] = useActionState<EstadoTrafego, FormData>(salvarTrafego, null)
  const [teste, testar, testando] = useActionState<EstadoTrafego, FormData>(testarCapi, null)
  const [trocarToken, setTrocarToken] = useState(!inicial.tokenMascara)

  const erros = estado?.erros ?? {}

  return (
    <div className="space-y-6">
      <form action={salvar} className="space-y-6">
        {/* ── META ───────────────────────────────────────────── */}
        <section className="rounded-2xl border border-linha bg-white p-6">
          <h2 className="text-lg font-semibold">Meta — pixel e Conversions API</h2>
          <p className="mt-1 text-sm text-grafite">
            O pixel mede pelo navegador. A Conversions API mede o mesmo pelo servidor, e alcança
            quem usa bloqueador ou iPhone com rastreamento negado — na prática, mais de um terço do
            público. Os dois juntos não contam em dobro: cada evento carrega um identificador único
            que a Meta usa para reconhecer que são o mesmo.
          </p>

          <div className="mt-6 space-y-5">
            <Campo
              nome="metaPixelId"
              rotulo="ID do pixel"
              padrao={inicial.metaPixelId}
              erro={erros.metaPixelId}
              editavel={editavel}
              ajuda="Gerenciador de Eventos ▸ Fontes de dados. São 15 ou 16 números. Vazio = nenhum rastreamento da Meta carrega."
              placeholder="1234567890123456"
            />

            {/* ⚠️ O token não é devolvido pelo servidor. Trocar exige
                pedir a troca — é o que impede que salvar outro campo
                apague a credencial sem querer. */}
            <div>
              <label htmlFor="capiToken" className="block text-sm font-medium">
                Token da Conversions API
              </label>
              {inicial.tokenMascara && !trocarToken ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <span className="rounded-xl border border-linha bg-areia px-3 py-2 font-mono text-sm">
                    ••••••••••••{inicial.tokenMascara}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTrocarToken(true)}
                    className="text-sm font-medium text-azul underline"
                  >
                    Trocar
                  </button>
                  <label className="flex items-center gap-2 text-sm text-grafite">
                    <input type="checkbox" name="removerToken" className="size-4" />
                    Remover
                  </label>
                </div>
              ) : (
                <input
                  id="capiToken"
                  name="capiToken"
                  type="password"
                  autoComplete="off"
                  disabled={!editavel}
                  placeholder="EAA..."
                  className="mt-1.5 w-full rounded-xl border border-linha px-3 py-2 font-mono text-sm"
                />
              )}
              {erros.capiToken ? (
                <p className="mt-1 text-sm text-red-700">{erros.capiToken}</p>
              ) : (
                <p className="mt-1 text-sm text-grafite">
                  Gerenciador de Eventos ▸ Configurações ▸ Conversions API ▸ Gerar token de acesso.
                  Ele é uma senha: quem o tiver pode escrever conversões no pixel da campanha. Depois
                  de salvo, não é mais exibido aqui.
                </p>
              )}
            </div>

            <Campo
              nome="capiTeste"
              rotulo="Código de teste (temporário)"
              padrao={inicial.capiTeste}
              erro={erros.capiTeste}
              editavel={editavel}
              placeholder="TEST12345"
              ajuda="Gerenciador de Eventos ▸ Testar eventos. Com ele preenchido NADA conta como conversão — é só para conferir. Apague quando terminar o teste."
            />

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="capiAtiva"
                defaultChecked={inicial.capiAtiva}
                disabled={!editavel}
                className="mt-1 size-4"
              />
              <span className="text-sm">
                <span className="font-medium">Enviar eventos pelo servidor</span>
                <span className="block text-grafite">
                  Desligue só para diagnosticar. Desligado, sobra o pixel do navegador e a campanha
                  volta a perder a parte do público que bloqueia rastreamento.
                </span>
              </span>
            </label>

            <Campo
              nome="apiVersao"
              rotulo="Versão da Graph API"
              padrao={inicial.apiVersao}
              erro={erros.apiVersao}
              editavel={editavel}
              placeholder="v21.0"
              ajuda="A Meta aposenta versões antigas a cada dois anos, e quando isso acontece o envio pelo servidor para de funcionar em silêncio. Está aqui para poder ser corrigido sem publicar o site de novo."
            />
          </div>

          <div className="mt-6 rounded-xl bg-areia p-4 text-sm text-grafite">
            <strong className="font-medium text-tinta">Verificação de domínio.</strong> Sem ela, no
            iPhone a Meta atribui só a primeira conversão de cada pessoa e o custo por resultado
            aparece inflado. Faça em Gerenciador de Negócios ▸ Segurança da marca ▸ Domínios, escolha
            a opção de meta tag, e cole aqui só o valor do <code>content</code>.
            <div className="mt-3">
              <Campo
                nome="metaDominio"
                rotulo="Código de verificação de domínio"
                padrao={inicial.metaDominio}
                erro={erros.metaDominio}
                editavel={editavel}
                placeholder="a1b2c3d4e5f6g7h8i9j0"
              />
            </div>
          </div>
        </section>

        {/* ── GTM ────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-linha bg-white p-6">
          <h2 className="text-lg font-semibold">Google Tag Manager</h2>
          <p className="mt-1 text-sm text-grafite">
            Cole o ID do contêiner e ele passa a carregar no site inteiro. Daí em diante, quem manda
            é o GTM: qualquer outra tag entra por lá, sem mexer no site.
          </p>

          <div className="mt-5">
            <Campo
              nome="gtmId"
              rotulo="ID do contêiner"
              padrao={inicial.gtmId}
              erro={erros.gtmId}
              editavel={editavel}
              placeholder="GTM-ABC1234"
              ajuda="Fica no topo do painel do GTM, ao lado do nome do contêiner."
            />
          </div>

          {inicial.metaPixelId && inicial.gtmId ? (
            <p className="mt-5 rounded-xl border border-amarelo bg-amarelo/15 p-4 text-sm">
              <strong className="font-semibold">Os dois estão ligados.</strong> Isso é permitido,
              mas o pixel da Meta precisa estar em <em>um lugar só</em>. Se existir uma tag do pixel
              dentro deste contêiner do GTM, ela vai somar com a daqui: dois PageView por visita,
              duas conversões por entrada em grupo, e a otimização do anúncio perseguindo um número
              que é o dobro do real. Use o GTM para as <em>outras</em> ferramentas — Google Ads, GA4,
              TikTok — e deixe a Meta com o campo acima.
            </p>
          ) : null}
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!editavel || salvando}
            className="inline-flex min-h-11 items-center rounded-full bg-azul px-6 font-semibold text-white disabled:opacity-50"
          >
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
          {estado?.ok ? <Recado tom="bom">Salvo.</Recado> : null}
          {estado?.erro ? <Recado tom="ruim">{estado.erro}</Recado> : null}
        </div>

        {estado?.aviso ? (
          <p className="rounded-xl border border-amarelo bg-amarelo/15 p-4 text-sm">
            {estado.aviso}
          </p>
        ) : null}
      </form>

      {/* ── PROVA ──────────────────────────────────────────── */}
      <form
        action={testar}
        className="rounded-2xl border border-linha bg-white p-6"
      >
        <h2 className="text-lg font-semibold">Conferir a Conversions API</h2>
        <p className="mt-1 text-sm text-grafite">
          Manda um evento de teste agora e mostra a resposta da própria Meta. É a única forma de
          saber que o token está certo sem esperar uma conversão real acontecer.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!editavel || testando}
            className="inline-flex min-h-11 items-center rounded-full border border-azul px-6 font-semibold text-azul disabled:opacity-50"
          >
            {testando ? 'Enviando…' : 'Enviar evento de teste'}
          </button>
          {teste?.erro ? <Recado tom="ruim">{teste.erro}</Recado> : null}
        </div>
        {teste?.ok && teste.aviso ? (
          <p className="mt-4 rounded-xl bg-verde-suave p-4 text-sm text-verde">{teste.aviso}</p>
        ) : null}
      </form>
    </div>
  )
}

function Campo({
  nome,
  rotulo,
  padrao,
  erro,
  ajuda,
  placeholder,
  editavel,
}: {
  nome: string
  rotulo: string
  padrao: string
  erro?: string
  ajuda?: string
  placeholder?: string
  editavel: boolean
}) {
  return (
    <div>
      <label htmlFor={nome} className="block text-sm font-medium">
        {rotulo}
      </label>
      <input
        id={nome}
        name={nome}
        defaultValue={padrao}
        placeholder={placeholder}
        disabled={!editavel}
        autoComplete="off"
        spellCheck={false}
        className={`mt-1.5 w-full rounded-xl border px-3 py-2 font-mono text-sm ${
          erro ? 'border-red-400' : 'border-linha'
        }`}
      />
      {erro ? (
        <p className="mt-1 text-sm text-red-700">{erro}</p>
      ) : ajuda ? (
        <p className="mt-1 text-sm text-grafite">{ajuda}</p>
      ) : null}
    </div>
  )
}

function Recado({ tom, children }: { tom: 'bom' | 'ruim'; children: React.ReactNode }) {
  return (
    <p className={`text-sm ${tom === 'bom' ? 'text-verde' : 'text-red-700'}`} role="status">
      {children}
    </p>
  )
}

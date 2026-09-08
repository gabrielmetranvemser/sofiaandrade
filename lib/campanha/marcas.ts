import type { MarcasDeCampanha } from './tipos'

/**
 * O COOKIE DE ORIGEM DO ANÚNCIO.
 *
 * ⚠️ ESTE ARQUIVO É NEUTRO DE PROPÓSITO: sem `'use client'` e sem
 *    `server-only`. Ele é importado pelo `proxy.ts`, que é compilado
 *    num bundle próprio, pelas duas rotas de servidor e — só a parte de
 *    UTM — pelo `lib/eventos.ts`, que é de cliente. Marcar um lado
 *    quebraria o outro, e não há segredo nenhum aqui: são os mesmos
 *    parâmetros que a pessoa vê na barra de endereço.
 *
 * ⚠️ COOKIE DE SESSÃO, SEM `Expires`, e isso é escolha. Ele morre
 *    quando o navegador fecha, igual ao `sessionStorage` que já guarda
 *    o id de sessão — a página mantém a mesma promessa de não seguir
 *    ninguém entre visitas. O caminho anúncio → grupo acontece inteiro
 *    dentro de uma sessão, então não se perde conversão nenhuma por
 *    isso.
 *
 * ⚠️ `httpOnly`, e não por hábito: o valor só é lido pelo servidor —
 *    nas duas rotas que falam com a Meta e na que grava o evento. Fora
 *    do alcance do JavaScript da página, ele deixa de ser alvo para
 *    qualquer script de terceiro que o GTM venha a carregar amanhã.
 */
export const COOKIE_CAMPANHA = 'sofia_campanha'

/** Teto do valor gravado. Cookie gordo viaja em TODO pedido do site. */
const LIMITE = 400

/**
 * As quatro chaves de UTM, na ordem em que entram na coluna `utm`.
 *
 * ⚠️ A LISTA É ÚNICA DE PROPÓSITO. Ela já esteve duplicada: o navegador
 *    montava com quatro chaves e o redirecionador com três. A mesma
 *    visita produzia dois rótulos diferentes, e a tela de tráfego pago
 *    mostrava a campanha partida em duas linhas que ninguém conseguia
 *    somar — sem erro em lugar nenhum, porque as duas linhas eram
 *    verdadeiras separadamente.
 *
 * `utm_content` é a que mais importa neste projeto: é onde o gerador de
 * links põe o município, e é ela que separa o anúncio de Vilhena do de
 * Porto Velho dentro da mesma campanha.
 */
export const CHAVES_UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const

/**
 * ⚠️ UMA CAMADA A MAIS DE CODIFICAÇÃO, E É POR ISSO QUE ESTA FUNÇÃO
 *    EXISTE EM VEZ DE UM `p.get(k)` SECO.
 *
 *    A Meta substitui `{{campaign.name}}` e `{{ad.name}}` na URL do
 *    anúncio por valores JÁ percent-encoded. `URLSearchParams` decodifica
 *    uma vez, e sobra a outra. Resultado medido na base desta campanha:
 *    744 visitas pagas espalhadas por 50 rótulos distintos, para o que
 *    na verdade são três campanhas — a mesma peça aparecendo como
 *    `AN 03 … Não devo nada a político.` e como
 *    `AN+03+%5BDireto+Instagram%5D+-+N%C3%A3o+devo+nada…`, e ainda
 *    cortada em pontos diferentes, porque o texto codificado é muito
 *    mais longo e bate no teto de 200 em lugares diferentes conforme
 *    quanto do caminho já veio decodificado.
 *
 *    Nenhuma dessas linhas soma com a outra. A tela de tráfego pago
 *    mostra cinquenta campanhas onde há três, e não há como olhar para
 *    ela e decidir nada.
 *
 * `+` vira espaço porque é assim que a codificação de formulário
 * escreve espaço — e é a forma que a Meta usa. Um `+` literal num nome
 * de anúncio vira espaço junto; é o preço, e é pequeno perto de somar
 * cinquenta linhas em três.
 */
function decodificarSobra(v: string): string {
  if (!/%[0-9A-Fa-f]{2}|\+/.test(v)) return v
  try {
    return decodeURIComponent(v.replace(/\+/g, ' '))
  } catch {
    // Percentagem solta no nome do anúncio ("50% mais"). Fica como está.
    return v
  }
}

/** O rótulo de campanha no formato que a coluna `utm` guarda. */
export function utmDeParametros(p: URLSearchParams): string | null {
  const partes = CHAVES_UTM.map((k) => {
    const bruto = p.get(k)?.trim()
    return bruto ? decodificarSobra(bruto).trim() : null
  }).filter(Boolean)
  return partes.length ? partes.join('|').slice(0, 200) : null
}

/**
 * Peneiras de formato.
 *
 * ⚠️ O QUE ENTRA AQUI VAI PARAR EM TRÊS LUGARES PERIGOSOS: um cabeçalho
 *    `Set-Cookie`, uma coluna do banco e o corpo de um pedido para a
 *    Graph API. Nenhum dos três aceita lixo em silêncio da mesma forma,
 *    e o pior deles é o cookie: um valor com `;` ou nova linha corta o
 *    cabeçalho ao meio e o resto vira atributo. Descartar o que não
 *    casa com o formato é mais barato que escapar em três gramáticas.
 */
const limpar = (valor: string | null | undefined, formato: RegExp): string | null => {
  if (!valor) return null
  const v = valor.trim()
  return v && formato.test(v) ? v : null
}

const FORMATO_FBCLID = /^[A-Za-z0-9_.-]{6,255}$/

/**
 * ⚠️ O UTM NÃO PASSA POR LISTA BRANCA DE CARACTERES, e a primeira
 *    versão desta linha passava — teria descartado em silêncio o UTM de
 *    TODA campanha que já está no ar.
 *
 *    Nome de anúncio real é frase escrita por gente:
 *    `AN 03 [Direto Instagram] - Não devo nada a político. Devo ao povo.`
 *    Tem colchete, ponto, acento e travessão. Uma lista branca de
 *    `[A-Za-z0-9|_.\- ]` recusaria todos, e o efeito seria o oposto do
 *    que este arquivo existe para fazer: a conversão chegaria sem
 *    origem, exatamente como antes, sem nada dar erro.
 *
 *    O que de fato precisa ser barrado é o que quebra um cabeçalho
 *    `Set-Cookie` — caracteres de controle e nova linha. O resto é
 *    seguro por construção: `serializarMarcas` passa tudo por
 *    `URLSearchParams`, que percent-encoda o que não for seguro, e do
 *    outro lado o valor só entra numa coluna de texto e num corpo JSON.
 */
const FORMATO_UTM = /^[^\u0000-\u001f\u007f]{1,200}$/
const FORMATO_SLUG = /^[a-z0-9-]{2,64}$/

/** Lê as marcas de uma URL de chegada. `null` quando não há anúncio nenhum. */
export function marcasDaUrl(url: URL): MarcasDeCampanha | null {
  const p = url.searchParams

  const marcas: MarcasDeCampanha = {
    fbclid: limpar(p.get('fbclid'), FORMATO_FBCLID),
    utm: limpar(utmDeParametros(p), FORMATO_UTM),
    cidade: limpar(p.get('cidade'), FORMATO_SLUG),
    quando: Math.floor(Date.now() / 1000),
  }

  return marcas.fbclid || marcas.utm || marcas.cidade ? marcas : null
}

export function serializarMarcas(m: MarcasDeCampanha): string {
  const p = new URLSearchParams()
  if (m.fbclid) p.set('f', m.fbclid)
  if (m.utm) p.set('u', m.utm)
  if (m.cidade) p.set('c', m.cidade)
  p.set('t', String(m.quando))
  return p.toString().slice(0, LIMITE)
}

export function analisarMarcas(bruto: string | null | undefined): MarcasDeCampanha | null {
  if (!bruto || bruto.length > LIMITE) return null
  try {
    const p = new URLSearchParams(bruto)
    const quando = Number(p.get('t'))
    const marcas: MarcasDeCampanha = {
      fbclid: limpar(p.get('f'), FORMATO_FBCLID),
      utm: limpar(p.get('u'), FORMATO_UTM),
      cidade: limpar(p.get('c'), FORMATO_SLUG),
      quando: Number.isFinite(quando) && quando > 0 ? quando : Math.floor(Date.now() / 1000),
    }
    return marcas.fbclid || marcas.utm || marcas.cidade ? marcas : null
  } catch {
    return null
  }
}

/** Os cookies de um pedido, sem depender de `next/headers`. */
function analisarCookies(bruto: string | null): Record<string, string> {
  const saida: Record<string, string> = {}
  if (!bruto) return saida
  for (const parte of bruto.split(';')) {
    const i = parte.indexOf('=')
    if (i < 1) continue
    const nome = parte.slice(0, i).trim()
    const valor = parte.slice(i + 1).trim()
    if (nome) saida[nome] = decodeURIComponent(valor)
  }
  return saida
}

/**
 * O QUE FICA GRAVADO quando alguém chega com marcas novas.
 *
 * ⚠️ NÃO É SUBSTITUIÇÃO CEGA, e o caso que obrigou a escrever esta
 *    função é um caminho normalíssimo do site:
 *
 *      1. a pessoa clica no anúncio de Vilhena
 *         → cookie com fbclid + utm + cidade=vilhena
 *      2. toca em "Entrar no grupo de Vilhena"
 *      3. o grupo de Vilhena está CHEIO, e o redirecionador a manda
 *         para `/grupos?cidade=vilhena&situacao=cheio`
 *      4. ela escolhe Ariquemes, que está aberto, e entra
 *
 *    O passo 3 é uma URL nossa que por acaso tem `cidade=` nela. Com
 *    substituição cega, ela sobrescreveria o cookie com uma marca sem
 *    fbclid e sem utm — e a conversão do passo 4, que é uma conversão
 *    REAL daquele anúncio, chegaria à Meta órfã. A campanha veria o
 *    dinheiro sair e a conversão aparecer como orgânica, sem nada no
 *    caminho dando erro.
 *
 * A regra, em ordem:
 *
 *   · `fbclid` novo  → é um clique novo em anúncio da Meta. Troca tudo.
 *   · `utm` novo     → é outra mídia paga. Troca tudo, INCLUSIVE
 *                      apagando o fbclid antigo: manter o id de um
 *                      clique da Meta sob o rótulo de outra campanha
 *                      seria creditar à Meta o que não é dela.
 *   · só `cidade`    → navegação interna, ou link de anúncio sem UTM.
 *                      Preserva a origem que já estava lá e só atualiza
 *                      a cidade.
 */
export function combinarMarcas(
  anteriores: MarcasDeCampanha | null,
  novas: MarcasDeCampanha,
): MarcasDeCampanha {
  if (!anteriores) return novas
  if (novas.fbclid || novas.utm) return novas
  return { ...anteriores, cidade: novas.cidade ?? anteriores.cidade }
}

/**
 * As marcas que valem para este pedido.
 *
 * A URL manda sobre o cookie: quem chega agora por um anúncio novo
 * traz a origem certa na própria barra de endereço, e o cookie da visita
 * anterior seria atribuição velha. É o mesmo critério de último clique
 * que a Meta usa do lado dela.
 *
 * ⚠️ SÓ A URL COMPLETA MANDA. Uma URL com `cidade=` e mais nada não é
 *    clique de anúncio nenhum — é o desvio do redirecionador — e
 *    deixá-la ganhar do cookie apagaria a atribuição no meio do
 *    caminho. Ver `combinarMarcas`.
 */
export function marcasDoPedido(req: Request): MarcasDeCampanha | null {
  const doCookie = analisarMarcas(
    analisarCookies(req.headers.get('cookie'))[COOKIE_CAMPANHA],
  )

  let daUrl: MarcasDeCampanha | null = null
  try {
    daUrl = marcasDaUrl(new URL(req.url))
  } catch {
    /* URL malformada não derruba medição */
  }

  if (!daUrl) return doCookie
  return combinarMarcas(doCookie, daUrl)
}

/**
 * O `fbc` no formato que a Graph API exige: versão, subdomínio,
 * instante do clique e o id. É o campo que amarra a conversão ao
 * anúncio exato — sem ele a Meta sabe que houve Lead, mas não de onde.
 */
export function fbcDeMarcas(m: MarcasDeCampanha | null): string | null {
  if (!m?.fbclid) return null
  return `fb.1.${m.quando * 1000}.${m.fbclid}`
}

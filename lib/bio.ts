import { resolverTokens } from '@/lib/conteudo/tokens'
import type { Conteudo } from '@/lib/conteudo/tipos'

/**
 * O LINK DA BIO — o que cada botão faz e para onde ele vai.
 *
 * ⚠️ ESTE ARQUIVO É NEUTRO: sem `'use client'` e sem `server-only`. A
 *    página monta os botões no servidor e o registro de cliques, que é
 *    de navegador, precisa das mesmas regras para completar o endereço
 *    do grupo com o id de sessão. Marcar um lado quebraria o outro.
 *
 * ⚠️ O PAINEL GRAVA UMA FUNÇÃO, E NÃO UM ENDEREÇO. É a diferença entre
 *    "Entrar no grupo da minha cidade" e "/grupos": quando o caminho
 *    do grupo mudar — já mudou uma vez, de âncora para página própria —
 *    o botão da bio acompanha sozinho, sem ninguém precisar lembrar de
 *    ir lá corrigir um endereço digitado à mão. Endereço escrito na
 *    unha continua existindo, para o que é de fora; ele é a exceção,
 *    não a regra.
 */

export type FuncaoBio =
  /** A busca de grupo de WhatsApp, por cidade ou por localização. */
  | 'grupo'
  /** O gerador de moldura. */
  | 'filtro'
  /** A página completa da campanha. */
  | 'site'
  /** O Instagram da candidata, como está em A candidata. */
  | 'instagram'
  /** Conversa direta: número com DDD, ou um link do wa.me já pronto. */
  | 'whatsapp'
  /** Outra página deste site. */
  | 'pagina'
  /** Endereço de fora. */
  | 'link'

export interface LinkDaBio {
  id: string
  ligado: boolean
  funcao: FuncaoBio
  rotulo: string
  descricao: string
  icone: string
  destino: string
  destaque: boolean
}

/** O que a página precisa para desenhar um botão. */
export interface BotaoDaBio extends LinkDaBio {
  href: string
  /** Abre fora do site: ganha `target` e `rel`. */
  externo: boolean
  /** Sai do ar no silêncio eleitoral — é pedido de voto por outro nome. */
  eleitoral: boolean
}

/**
 * As funções, na ordem em que o painel as oferece.
 *
 * ⚠️ AS QUE PRECISAM DE ENDEREÇO ESTÃO NO FIM, e não é arrumação: quem
 *    abre a lista vê primeiro as que funcionam sozinhas. Escolher
 *    "Grupo de WhatsApp" e não ter mais nada a preencher é o caminho
 *    que noventa por cento dos botões desta página seguem.
 */
export const FUNCOES_BIO: readonly {
  valor: FuncaoBio
  rotulo: string
  /** O ícone que entra quando ninguém escolhe um. */
  icone: string
  /** Precisa do campo "Endereço" preenchido? */
  exigeDestino: boolean
  /** É pedido de voto, e portanto cai no silêncio eleitoral. */
  eleitoral: boolean
}[] = [
  { valor: 'grupo', rotulo: 'Grupo de WhatsApp da cidade', icone: 'whatsapp', exigeDestino: false, eleitoral: true },
  { valor: 'filtro', rotulo: 'O gerador de foto com o 2233', icone: 'sparkles', exigeDestino: false, eleitoral: true },
  { valor: 'site', rotulo: 'A primeira página do site', icone: 'globe', exigeDestino: false, eleitoral: false },
  { valor: 'instagram', rotulo: 'Instagram da candidata', icone: 'instagram', exigeDestino: false, eleitoral: false },
  { valor: 'whatsapp', rotulo: 'Falar no WhatsApp', icone: 'message-circle', exigeDestino: true, eleitoral: true },
  { valor: 'pagina', rotulo: 'Outra página deste site', icone: 'file-text', exigeDestino: true, eleitoral: false },
  { valor: 'link', rotulo: 'Endereço de fora', icone: 'link', exigeDestino: true, eleitoral: false },
]

const POR_VALOR = new Map(FUNCOES_BIO.map((f) => [f.valor, f]))

/** A origem que os eventos desta página carregam. */
export const ORIGEM_BIO = 'bio'

/**
 * Um endereço de fora que o navegador aceita abrir.
 *
 * ⚠️ É LISTA BRANCA DE ESQUEMA, e a razão é `javascript:`. O campo do
 *    painel é texto livre, e um endereço com esse esquema num `href`
 *    executa código na página de quem clicar. A validação do
 *    formulário já recusa, mas quem desenha o botão não pode depender
 *    disso: o dado pode ter entrado no banco por outro caminho.
 */
function externoSeguro(destino: string): string | null {
  const v = destino.trim()
  return /^(https?:\/\/|mailto:|tel:)/i.test(v) ? v : null
}

/** Um caminho dentro do site. Nunca externo — seria redirecionamento aberto. */
function internoSeguro(destino: string): string | null {
  const v = destino.trim()
  // `//outro-site.com` é caminho em protocolo relativo: sai do site
  // parecendo endereço interno. É o caso que a barra sozinha não pega.
  if (v.startsWith('//')) return null
  return v.startsWith('/') || v.startsWith('#') ? v : null
}

/** Só os dígitos, para montar o wa.me. */
function numeroDeWhatsapp(destino: string): string | null {
  const digitos = destino.replace(/\D/g, '')
  // 10 é o menor telefone com DDD; 15 é o teto do padrão E.164.
  return digitos.length >= 10 && digitos.length <= 15 ? digitos : null
}

/**
 * O endereço de um botão, ou `null` quando ele não tem para onde ir.
 *
 * ⚠️ `null` TIRA O BOTÃO DA PÁGINA, e é de propósito. Um botão de bio
 *    que não leva a lugar nenhum é pior que um botão a menos: a pessoa
 *    toca, nada acontece, e o que ela conclui é que a página está
 *    quebrada — sobre uma campanha inteira. Enquanto o endereço não
 *    for preenchido no painel, o botão simplesmente não existe.
 */
function enderecoDe(
  link: LinkDaBio,
  conteudo: Conteudo,
): { href: string; externo: boolean } | null {
  switch (link.funcao) {
    case 'grupo':
      // ⚠️ A BUSCA, E NÃO UM `/g/` DIRETO. Esta página é prerenderizada
      //    (ver app/bio/page.tsx): ela não sabe de qual cidade é quem
      //    está lendo, e adivinhar mandaria a pessoa para o grupo de
      //    outro município. `/grupos` abre com a busca e o botão de
      //    localização, que é a pergunta certa a fazer aqui.
      return { href: '/grupos', externo: false }

    case 'filtro':
      return { href: '/filtro', externo: false }

    case 'site':
      return { href: '/', externo: false }

    case 'instagram': {
      const url = externoSeguro(conteudo.candidata.instagram)
      return url ? { href: url, externo: true } : null
    }

    case 'whatsapp': {
      // Link completo do wa.me passa direto: é assim que se leva uma
      // mensagem já escrita ("Quero material da campanha"), e o próprio
      // WhatsApp entrega esse endereço pronto para copiar.
      const url = externoSeguro(link.destino)
      if (url) return { href: url, externo: true }
      const numero = numeroDeWhatsapp(link.destino)
      return numero ? { href: `https://wa.me/${numero}`, externo: true } : null
    }

    case 'pagina': {
      const caminho = internoSeguro(link.destino)
      return caminho ? { href: caminho, externo: false } : null
    }

    case 'link': {
      const url = externoSeguro(link.destino)
      return url ? { href: url, externo: true } : null
    }

    default:
      return null
  }
}

/**
 * A lista de botões que a página vai desenhar.
 *
 * Fora ficam: os desligados no painel, os sem endereço e — durante o
 * silêncio eleitoral — os que pedem voto. O que sobra é o que pode
 * estar no ar agora.
 */
export function botoesDaBio({
  links,
  conteudo,
  emSilencio,
}: {
  links: LinkDaBio[]
  conteudo: Conteudo
  emSilencio: boolean
}): BotaoDaBio[] {
  const saida: BotaoDaBio[] = []

  for (const link of links) {
    if (!link.ligado) continue

    const funcao = POR_VALOR.get(link.funcao)
    if (!funcao) continue
    if (emSilencio && funcao.eleitoral) continue

    const endereco = enderecoDe(link, conteudo)
    if (!endereco) continue

    saida.push({
      ...link,
      ...endereco,
      eleitoral: funcao.eleitoral,
      // ⚠️ OS TOKENS SÃO RESOLVIDOS AQUI, e não na página. O arroba do
      //    Instagram e o número da urna se repetem por todo o site, e
      //    `{{candidata.instagramHandle}}` num botão que não passa por
      //    esta linha aparece assim mesmo, cru, na bio da campanha —
      //    foi o que aconteceu no primeiro teste.
      //
      //    Aqui em cima, e não lá, porque o `rotulo` também viaja no
      //    evento de clique: o painel precisa mostrar "@sofiaandrade.ro"
      //    na lista de botões mais tocados, não a chave do token.
      rotulo: resolverTokens(link.rotulo, conteudo),
      descricao: resolverTokens(link.descricao, conteudo),
      // Ícone em branco é o estado normal de quem só escreveu o texto
      // do botão: cada função tem o seu, e ele já é o certo.
      icone: link.icone || funcao.icone,
    })
  }

  return saida
}

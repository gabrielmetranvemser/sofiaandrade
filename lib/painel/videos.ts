import type { Campo } from '@/content/esquema'
import { SECOES_DO_PAINEL } from '@/content/mapa'
import type { Conteudo } from '@/lib/conteudo/tipos'

/**
 * TODOS OS DESTINOS DE VÍDEO DA PÁGINA, NUMA LISTA SÓ.
 *
 * ⚠️ O PEDIDO QUE ORIGINOU ISTO foi: "no painel eu não sei onde subir
 *    os vídeos, tá muito confuso". E estava mesmo. Os campos de vídeo
 *    moravam espalhados por seis seções diferentes, alguns no primeiro
 *    nível, outros dentro de listas, outros dentro de listas DENTRO de
 *    listas (os processos). Quem chegava com oito arquivos na mão não
 *    tinha como saber quantos espaços existiam nem onde ficavam.
 *
 *    Este arquivo percorre o esquema junto com o conteúdo e devolve
 *    uma lista plana: um destino por vídeo, com o caminho para gravar
 *    e a frase que diz onde ele aparece na página.
 *
 * ⚠️ PERCORRE O ESQUEMA, NÃO O DADO. É a mesma regra da validação, e
 *    pela mesma razão: chave que o esquema não conhece não entra. Um
 *    override adulterado no banco não consegue inventar destino novo.
 *
 * ⚠️ PRECISA DO CONTEÚDO porque os destinos dentro de listas só
 *    existem na quantidade em que a lista existe. A trilha tem oito
 *    itens porque alguém pôs oito; se amanhã tiver doze, esta lista
 *    tem doze — sem tocar em código.
 */

export interface DestinoVideo {
  /** Estável entre renders: identifica o campo no formulário. */
  id: string
  secao: string
  secaoRotulo: string
  /** Caminho dentro da seção, no formato que o formulário já usa. */
  caminho: string
  /** Caminho do campo irmão de enquadramento, quando existe. */
  caminhoFormato: string | null
  /** Caminho do campo irmão de título, quando existe. */
  caminhoTitulo: string | null
  /** Caminho do grupo de ajustes de player, quando existe. */
  caminhoOpcoes: string | null
  rotulo: string
  /** A frase que diz onde este vídeo aparece na página. */
  onde: string
  ajuda?: string
  url: string
  formato: string
  titulo: string
  /** Os ajustes atuais, como estão no conteúdo. */
  opcoes: Record<string, unknown>
}

function texto(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

interface Contexto {
  secao: string
  secaoRotulo: string
  /** Como chamar o item quando ele não tem título próprio. Ex.: "Vídeo 3". */
  nomeDeReserva: string | null
}

function andar(
  campos: Record<string, Campo>,
  dado: unknown,
  prefixo: string,
  ctx: Contexto,
  saida: DestinoVideo[],
): void {
  const obj = (dado ?? {}) as Record<string, unknown>

  // ⚠️ ESTE OBJETO É UM ITEM DE VÍDEO, ou é a raiz de uma seção?
  //    A pergunta importa porque a resposta muda quem são os campos
  //    irmãos. Um `itemVideo` traz `titulo`, `url` e `formato` lado a
  //    lado; a raiz de uma seção também tem um campo `titulo` — só que
  //    é o TÍTULO DA SEÇÃO, e não o nome de um vídeo.
  //
  //    Sem esta distinção os quatro vídeos soltos apareciam no painel
  //    chamados "Cheguei onde a luz [[acabava às nove.]]" — o título da
  //    seção inteira, com a marcação de destaque e tudo. O sinal certo
  //    é o `formato`: só item de vídeo tem enquadramento.
  const ehItemDeVideo = campos.formato?.tipo === 'escolha'
  const irmao = (nome: string) =>
    ehItemDeVideo && campos[nome] ? (prefixo ? `${prefixo}.${nome}` : nome) : null

  for (const [chave, campo] of Object.entries(campos)) {
    const caminho = prefixo ? `${prefixo}.${chave}` : chave

    if (campo.tipo === 'video') {
      const cTitulo = irmao('titulo')
      const cFormato = irmao('formato')
      const cOpcoes = irmao('opcoes')
      const tituloDoItem = cTitulo ? texto(obj.titulo) : ''

      saida.push({
        id: `${ctx.secao}::${caminho}`,
        secao: ctx.secao,
        secaoRotulo: ctx.secaoRotulo,
        caminho,
        caminhoFormato: cFormato,
        caminhoTitulo: cTitulo,
        caminhoOpcoes: cOpcoes,
        // Três níveis, do mais específico ao mais genérico: o título
        // que a campanha deu ao item; o nome numerado da lista ("Vídeo
        // 3"), para item ainda sem título; e o rótulo do campo, que é o
        // caso dos quatro vídeos soltos.
        rotulo: tituloDoItem || ctx.nomeDeReserva || campo.rotulo || 'Vídeo',
        onde: campo.onde,
        ajuda: campo.ajuda,
        url: texto(obj[chave]),
        formato: texto(obj.formato) || 'deitado',
        titulo: tituloDoItem,
        opcoes: (obj.opcoes ?? {}) as Record<string, unknown>,
      })
      continue
    }

    if (campo.tipo === 'lista') {
      const itens = Array.isArray(obj[chave]) ? (obj[chave] as unknown[]) : []
      itens.forEach((item, i) => {
        andar(campo.item, item, `${caminho}.${i}`, {
          ...ctx,
          nomeDeReserva: `${campo.rotuloItem} ${i + 1}`,
        }, saida)
      })
      continue
    }

    if (campo.tipo === 'grupo') {
      andar(campo.campos, obj[chave], caminho, ctx, saida)
    }
  }
}

export function destinosDeVideo(conteudo: Conteudo): DestinoVideo[] {
  const saida: DestinoVideo[] = []
  for (const secao of SECOES_DO_PAINEL) {
    if (!secao.temVideo) continue
    andar(
      secao.esquema.campos,
      (conteudo as unknown as Record<string, unknown>)[secao.chave],
      '',
      { secao: secao.chave, secaoRotulo: secao.rotulo, nomeDeReserva: null },
      saida,
    )
  }
  return saida
}

/** Os destinos de uma seção só — para o painel dela. */
export function destinosDaSecao(conteudo: Conteudo, secao: string): DestinoVideo[] {
  return destinosDeVideo(conteudo).filter((d) => d.secao === secao)
}

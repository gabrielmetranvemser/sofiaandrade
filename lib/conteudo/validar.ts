import type { Campo } from '@/content/esquema'
import { interpretarVideo } from '@/lib/video'
import { marcacaoQuebrada, tamanhoVisivel } from '@/lib/texto/marcacao'

/**
 * Valida o que veio do formulário contra o descritor.
 *
 * Percorre o DESCRITOR, não o dado recebido. É a diferença que importa:
 * chave que o descritor não conhece simplesmente não é copiada, então
 * payload adulterado não tem por onde entrar. É o modelo de segurança
 * inteiro, no lugar de uma biblioteca de schema.
 *
 * `max` REJEITA com mensagem, nunca trunca em silêncio — truncar perde
 * o trabalho de quem escreveu e ninguém entende por quê.
 */

export type Erros = Record<string, string>

interface Resultado<T> {
  ok?: T
  erros?: Erros
}

function limpo(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

const NOME_DA_MARCA = {
  destaque: 'destaque',
  negrito: 'negrito',
  italico: 'itálico',
} as const

function validarCampo(
  campo: Campo,
  valor: unknown,
  caminho: string,
  erros: Erros,
): unknown {
  switch (campo.tipo) {
    case 'oculto':
      return typeof valor === 'string' ? valor : ''

    // O formulário manda 'true'/'false' como texto (é o que cabe num
    // JSON de campo). Normalizar AQUI é o que garante que o banco nunca
    // receba a string 'false', que em JavaScript é verdadeira e faria a
    // seção desligada continuar no ar.
    case 'booleano':
      return valor === true || valor === 'true'

    case 'texto':
    case 'longo': {
      const t = limpo(valor)
      if (campo.max && tamanhoVisivel(t) > campo.max) {
        erros[caminho] = `Máximo de ${campo.max} caracteres (tem ${tamanhoVisivel(t)}).`
      }
      // ⚠️ Marcação aberta e não fechada deixa os símbolos VISÍVEIS na
      //    página — o defeito que ninguém enxerga no painel e todo
      //    mundo enxerga no site.
      const quebrada = marcacaoQuebrada(t)
      if (quebrada) {
        erros[caminho] =
          `Ficou uma marcação de ${NOME_DA_MARCA[quebrada]} sem fechar. ` +
          'Use os botões de formatação em vez de digitar os símbolos.'
      }
      return t
    }

    case 'url': {
      const t = limpo(valor)
      if (t && !/^https?:\/\/.+\..+/.test(t)) {
        erros[caminho] = 'Precisa ser um endereço completo, começando com https://'
      }
      return t
    }

    /**
     * Vídeo. Vazio passa — é o estado normal enquanto o vídeo não
     * existe, e com o campo em branco o bloco some da página.
     *
     * Preenchido, tem que ser um endereço que o PLAYER toque, não só um
     * endereço bem formado. Validar com a mesma função que o componente
     * usa é o que impede o painel de dizer "salvo" e a página mostrar um
     * quadro preto.
     */
    case 'video': {
      const t = limpo(valor)
      if (t && !interpretarVideo(t)) {
        erros[caminho] =
          'Não reconheci esse endereço. Cole o link de um vídeo do YouTube ou do Vimeo.'
      }
      return t
    }

    /**
     * Número numa faixa.
     *
     * ⚠️ Prende dentro dos limites em vez de recusar. O valor vem de
     *    uma barra que não permite sair da faixa; se chegou fora, ou o
     *    payload foi adulterado ou o esquema mudou — e nos dois casos o
     *    certo é o valor mais próximo que existe, não um erro na cara
     *    de quem só arrastou o controle.
     */
    case 'deslizante': {
      const n = Number(valor)
      if (!Number.isFinite(n)) return campo.min
      return Math.min(campo.max, Math.max(campo.min, Math.round(n)))
    }

    case 'escolha': {
      const t = limpo(valor)
      const permitidos = campo.opcoes.map((o) => o.valor)
      // Fora da lista vira o primeiro, em silêncio: o formulário só
      // oferece as opções válidas, então valor estranho aqui é payload
      // adulterado — e para esse caso a resposta certa é o padrão, não
      // uma mensagem de erro que ensina o formato aceito.
      return permitidos.includes(t) ? t : (permitidos[0] ?? '')
    }

    case 'ancora': {
      const t = limpo(valor)
      // Endereço interno só. Sem isto, um link do menu poderia apontar
      // para fora e virar redirecionamento aberto dentro do site.
      if (t && !t.startsWith('/') && !t.startsWith('#')) {
        erros[caminho] = 'Precisa começar com / ou # (endereço dentro do site).'
      }
      return t
    }

    case 'listaTexto': {
      const bruto = Array.isArray(valor) ? valor : []
      const lista = bruto.map((v) => limpo(v)).filter((v) => v.length > 0)
      if (campo.min !== undefined && lista.length < campo.min) {
        erros[caminho] = `Precisa de pelo menos ${campo.min} ${campo.min === 1 ? 'item' : 'itens'}.`
      }
      if (campo.max !== undefined && lista.length > campo.max) {
        erros[caminho] = `No máximo ${campo.max} itens.`
      }
      lista.forEach((v, i) => {
        if (campo.maxItem && tamanhoVisivel(v) > campo.maxItem) {
          erros[`${caminho}.${i}`] = `Máximo de ${campo.maxItem} caracteres.`
        }
        const quebrada = marcacaoQuebrada(v)
        if (quebrada) {
          erros[`${caminho}.${i}`] =
            `Ficou uma marcação de ${NOME_DA_MARCA[quebrada]} sem fechar.`
        }
      })
      return lista
    }

    case 'lista': {
      const bruto = Array.isArray(valor) ? valor : []
      if (campo.min !== undefined && bruto.length < campo.min) {
        erros[caminho] = `Precisa de pelo menos ${campo.min} ${campo.min === 1 ? 'item' : 'itens'}.`
      }
      if (campo.max !== undefined && bruto.length > campo.max) {
        erros[caminho] = `No máximo ${campo.max} itens.`
      }
      return bruto.map((item, i) =>
        validarObjeto(campo.item, item, `${caminho}.${i}`, erros),
      )
    }

    case 'grupo':
      return validarObjeto(campo.campos, valor, caminho, erros)

    default:
      return undefined
  }
}

function validarObjeto(
  campos: Record<string, Campo>,
  valor: unknown,
  caminho: string,
  erros: Erros,
): Record<string, unknown> {
  const entrada = (valor ?? {}) as Record<string, unknown>
  const saida: Record<string, unknown> = {}
  for (const [chave, campo] of Object.entries(campos)) {
    saida[chave] = validarCampo(campo, entrada[chave], caminho ? `${caminho}.${chave}` : chave, erros)
  }
  return saida
}

export function validarSecao(
  campos: Record<string, Campo>,
  bruto: unknown,
): Resultado<Record<string, unknown>> {
  const erros: Erros = {}
  const ok = validarObjeto(campos, bruto, '', erros)
  return Object.keys(erros).length > 0 ? { erros } : { ok }
}

/**
 * Guarda só o que difere do padrão.
 *
 * Três ganhos concretos: o copy.ts continua vivo para os campos não
 * tocados; "voltar ao original" por campo é apagar a chave; e o
 * histórico fica legível ("mudou 2 campos") em vez de "reescreveu tudo".
 */
export function diferenca(padrao: unknown, novo: unknown): unknown {
  if (Array.isArray(padrao) || Array.isArray(novo)) {
    return JSON.stringify(padrao) === JSON.stringify(novo) ? undefined : novo
  }
  if (
    typeof padrao === 'object' && padrao !== null &&
    typeof novo === 'object' && novo !== null
  ) {
    const saida: Record<string, unknown> = {}
    for (const chave of Object.keys(novo as Record<string, unknown>)) {
      const d = diferenca(
        (padrao as Record<string, unknown>)[chave],
        (novo as Record<string, unknown>)[chave],
      )
      if (d !== undefined) saida[chave] = d
    }
    return Object.keys(saida).length > 0 ? saida : undefined
  }
  return padrao === novo ? undefined : novo
}

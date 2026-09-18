/**
 * DESCRITOR DOS CAMPOS DO PAINEL.
 *
 * Uma fonte só para duas coisas: renderizar o formulário e validar no
 * servidor. Separar as duas é como formulário e validação divergem.
 *
 * 17 seções × N campos não se escreve à mão como 17 telas — existe
 * UM componente recursivo e UMA rota.
 *
 * ⚠️ O `max` não é enfeite: título longo quebra o layout em tela de
 *    360px. É melhor avisar na hora de escrever do que descobrir no ar.
 *    E a validação REJEITA em vez de truncar — truncar em silêncio
 *    perde o trabalho do editor.
 */

import { FUNCOES_BIO } from '@/lib/bio'

export interface Base {
  rotulo: string
  ajuda?: string
}

export type Campo =
  /** Uma linha. `destaque` libera [[colchetes]]; `tokens` libera {{chaves}}. */
  | (Base & { tipo: 'texto'; max?: number; destaque?: boolean; tokens?: boolean })
  /** Várias linhas. `destaque` libera [[colchetes]]; `tokens` libera {{chaves}}. */
  | (Base & { tipo: 'longo'; max?: number; linhas?: number; destaque?: boolean; tokens?: boolean })
  /** Endereço externo (https://). */
  | (Base & { tipo: 'url'; prefixo?: string })
  /**
   * Endereço de vídeo do YouTube ou do Vimeo.
   *
   * Vazio NÃO é erro: é o estado normal enquanto a campanha ainda não
   * subiu o vídeo. Com o campo em branco, o bloco inteiro some da
   * página — ver components/ui/Video.tsx.
   */
  | (Base & {
      tipo: 'video'
      /**
       * ONDE ESTE VÍDEO APARECE NA PÁGINA, em uma frase.
       *
       * ⚠️ Não é ajuda opcional, é o dado central da tela de Vídeos.
       *    O pedido que originou isto foi literal: "cada espaço tem que
       *    dizer EXATAMENTE onde vai o vídeo na página". Quem chega com
       *    oito arquivos na mão precisa saber qual vai em qual campo
       *    sem abrir o site em outra aba para adivinhar.
       */
      onde: string
    })
  /** Uma entre opções fixas. Grava o `valor`, mostra o `rotulo`. */
  | (Base & { tipo: 'escolha'; opcoes: readonly { valor: string; rotulo: string }[] })
  /**
   * Um número numa faixa, com barra deslizante.
   *
   * ⚠️ Existe onde a resposta certa é "um pouco mais" e não um valor
   *    exato. A força da textura era uma escolha de três nomes —
   *    sutil, média, forte — e três nomes não cobrem o espaço entre
   *    "não vejo nada" e "está demais". Arrastar até parecer certo é
   *    a forma natural de decidir isso.
   */
  | (Base & { tipo: 'deslizante'; min: number; max: number; passo?: number; sufixo?: string })
  /** Endereço interno: começa com / ou #. Nunca externo. */
  | (Base & { tipo: 'ancora' })
  /**
   * Endereço que pode ser de dentro OU de fora — o campo do link da bio.
   *
   * ⚠️ NÃO É `url` NEM `ancora`, e precisou ser um terceiro tipo porque
   *    o mesmo campo atende as duas coisas: um botão da bio pode
   *    apontar para `/filtro` e o de baixo para o WhatsApp. Com `url`,
   *    a validação recusaria o caminho interno; com `ancora`, recusaria
   *    o externo. Obrigar a campanha a escolher o tipo certo antes de
   *    digitar é devolver a ela um problema que é nosso.
   *
   * O que ele barra é o esquema que não deveria existir num `href` —
   * `javascript:` à frente de todos. Ver `lib/conteudo/validar.ts`.
   */
  | (Base & { tipo: 'destino' })
  /**
   * Um ícone do catálogo (`lib/icones.ts`), escolhido numa grade.
   *
   * ⚠️ GRAVA O NOME DO LUCIDE, e não o desenho. É o que permite
   *    atualizar o traço de todos os ícones do site rodando um script,
   *    e é o nome que a pessoa digita em lucide.dev para pedir um que
   *    ainda não está na lista.
   */
  | (Base & { tipo: 'icone' })
  /** Existe no dado, não aparece na tela (ids, chaves técnicas). */
  | { tipo: 'oculto' }
  /** Interruptor. Sempre grava true ou false — nunca string vazia. */
  | (Base & { tipo: 'booleano' })
  /** Lista de strings simples — uma por linha do formulário. */
  | (Base & {
      tipo: 'listaTexto'
      min?: number
      max?: number
      maxItem?: number
      destaque?: boolean
    })
  /** Lista de objetos — vira repetidor com adicionar, remover e reordenar. */
  | (Base & {
      tipo: 'lista'
      min?: number
      max?: number
      rotuloItem: string
      /** Campo cujo valor nomeia a linha no acordeão. */
      titulo?: string
      item: Record<string, Campo>
    })
  /** Objeto de chaves fixas. Sem botão de adicionar nem remover. */
  | (Base & { tipo: 'grupo'; campos: Record<string, Campo> })

export interface SecaoEsquema {
  rotulo: string
  nota?: string
  /** Agrupa no menu lateral do painel. */
  grupo: 'Página' | 'Textos gerais' | 'Identidade'
  campos: Record<string, Campo>
}

const ID = { tipo: 'oculto' } as const

/**
 * O enquadramento do vídeo. Dois valores porque o acervo da campanha
 * tem dois de verdade: quase tudo foi gravado deitado, e a decisão do
 * juiz veio em pé, direto do celular. Sem esta escolha, o vídeo em pé
 * apareceria com duas tarjas pretas ocupando metade do cartão.
 */
const FORMATO_VIDEO = {
  tipo: 'escolha',
  rotulo: 'Enquadramento',
  opcoes: [
    { valor: 'deitado', rotulo: 'Deitado (16:9)' },
    { valor: 'em-pe', rotulo: 'Em pé (9:16)' },
  ],
  ajuda: 'Vídeo gravado na vertical, de celular, é "em pé".',
} as const

/**
 * OS AJUSTES DE PLAYER, IGUAIS EM TODO VÍDEO DA PÁGINA.
 *
 * ⚠️ SÃO POUCOS DE PROPÓSITO. A tentação é expor tudo que um player
 *    aceita — velocidade, legenda, marca d'água, tempo inicial. Cada
 *    ajuste desses é uma decisão a mais para quem edita e um caminho a
 *    mais para a página sair errada. Aqui só entrou o que muda o
 *    comportamento de verdade e o que a campanha pediu por nome.
 *
 * ⚠️ NEM TODO AJUSTE VALE PARA TODO PROVEDOR, e a tela diz isso. Um
 *    arquivo do R2 toca no player do navegador e obedece a tudo; o
 *    YouTube atende `controles` e `tela cheia` como pedido, mas nunca
 *    esconde a própria marca. Prometer o contrário seria mentir.
 */
const OPCOES_VIDEO: Record<string, Campo> = {
  controles: {
    tipo: 'booleano',
    rotulo: 'Mostrar os controles do player',
    ajuda: 'Barra de progresso, volume e pausa. Desligado, o vídeo toca do início ao fim sem interface.',
  },
  telaCheia: {
    tipo: 'booleano',
    rotulo: 'Permitir tela cheia',
  },
  inicio: {
    tipo: 'escolha',
    rotulo: 'Como o vídeo começa',
    opcoes: [
      { valor: 'clique', rotulo: 'Ao clicar no play' },
      { valor: 'automatico', rotulo: 'Sozinho, quando aparece na tela' },
    ],
    ajuda:
      'Sozinho: começa MUDO — é regra de todos os navegadores, e não há como contornar. Quem quiser som liga no player. Na trilha de vídeos este ajuste é ignorado: lá só um toca por vez.',
  },
  carregamento: {
    tipo: 'escolha',
    rotulo: 'Carregamento',
    opcoes: [
      { valor: 'ao-clicar', rotulo: 'Só ao clicar (mais leve)' },
      { valor: 'com-previa', rotulo: 'Adiantar a capa (abre mais rápido)' },
    ],
    ajuda:
      'Só ao clicar: nada é pedido ao provedor antes de a pessoa tocar em play. Adiantar a capa: busca a miniatura junto com a página.',
  },
  botaoRotulo: {
    tipo: 'texto',
    rotulo: 'Botão sobre o vídeo',
    max: 30,
    ajuda: 'Opcional. Fica no canto do vídeo. Vazio, não aparece.',
  },
  botaoDestino: {
    tipo: 'ancora',
    rotulo: 'Destino do botão',
    ajuda: 'Um lugar dentro do site. Ex.: /#grupos',
  },
}

/** Um vídeo dentro de uma lista: trilha, comentários, processos. */
const itemVideo = (onde: string): Record<string, Campo> => ({
  id: ID,
  titulo: { tipo: 'texto', rotulo: 'Título', max: 60, ajuda: 'Aparece sobre a capa do vídeo.' },
  url: { tipo: 'video', rotulo: 'Endereço do vídeo', onde },
  formato: FORMATO_VIDEO,
  opcoes: { tipo: 'grupo', rotulo: 'Ajustes do player', campos: OPCOES_VIDEO },
})

/**
 * Um vídeo solto numa seção. Mesmos campos de um item de lista, menos o
 * `id` — que só existe para o repetidor saber reordenar.
 *
 * ⚠️ O TÍTULO ESTAVA FALTANDO e o texto ficava fixo no componente:
 *    "Sofia Andrade conta a própria história" vinha do código, não do
 *    painel. Quem editava via a legenda na página e não achava onde
 *    mudar — porque não havia onde.
 */
const videoSolto = (rotulo: string, onde: string, ajuda?: string): Campo => ({
  tipo: 'grupo',
  rotulo,
  campos: {
    titulo: {
      tipo: 'texto',
      rotulo: 'Título do vídeo',
      max: 60,
      ajuda: 'Aparece sobre a capa, no canto de baixo. Vazio, não aparece.',
    },
    url: { tipo: 'video', rotulo: 'Endereço do vídeo', onde, ajuda },
    formato: FORMATO_VIDEO,
    opcoes: { tipo: 'grupo', rotulo: 'Ajustes do player', campos: OPCOES_VIDEO },
  },
})

/** Item de lista com número, título e texto — o formato mais repetido. */
const itemNumerado = (maxTexto: number): Record<string, Campo> => ({
  id: ID,
  numero: { tipo: 'texto', rotulo: 'Número', max: 3, ajuda: 'Só o algarismo. Ex.: 01' },
  titulo: { tipo: 'texto', rotulo: 'Título', max: 60 },
  texto: { tipo: 'longo', rotulo: 'Descrição', max: maxTexto, linhas: 3 },
})

export const ESQUEMA: Record<string, SecaoEsquema> = {
  // ── Página, na ordem em que aparece ────────────────────────────
  hero: {
    rotulo: 'Primeira dobra',
    grupo: 'Página',
    nota: 'É a parte que mais gente vê, e a única que muita gente vê. Frase curta ganha de frase certa.',
    campos: {
      etiqueta: {
        tipo: 'texto',
        rotulo: 'Etiqueta',
        max: 40,
        ajuda: 'A linha com as três barrinhas acima do título. Vazio = não aparece.',
      },
      titulo: {
        tipo: 'listaTexto',
        rotulo: 'Título',
        min: 1,
        max: 3,
        maxItem: 44,
        destaque: true,
        ajuda: 'Uma linha por entrada — a quebra é decisão de tipografia, não do navegador.',
      },
      subtitulo: { tipo: 'longo', rotulo: 'Subtítulo', max: 260, linhas: 3 },
      numeroLegenda: { tipo: 'texto', rotulo: 'Legenda do número', max: 34 },
      ctaPrimario: {
        tipo: 'texto',
        rotulo: 'Botão do grupo de WhatsApp',
        max: 42,
        ajuda: 'O botão principal, com o ícone do WhatsApp. Acima de 42 caracteres ele quebra em celular de 360px.',
      },
      notaGrupo: {
        tipo: 'texto',
        rotulo: 'Frase embaixo dos botões',
        max: 70,
        ajuda: 'Diz em uma linha o que é o grupo. Vazio = não aparece.',
      },
      ctaSecundario: {
        tipo: 'texto',
        rotulo: 'Botão secundário',
        max: 32,
        ajuda: 'Fica embaixo do botão do grupo no celular, com contorno. Por padrão leva ao filtro de foto.',
      },
      ctaSecundarioHref: {
        tipo: 'ancora',
        rotulo: 'Destino do botão secundário',
        ajuda: 'Começa com / (outra página, como /filtro) ou # (uma seção da home, como #origem).',
      },
      rodapeHero: { tipo: 'texto', rotulo: 'Linha de apoio', max: 60 },
      lema: {
        tipo: 'texto',
        rotulo: 'Lema da campanha',
        max: 40,
        ajuda: 'Fica abaixo da marca com o número, como na arte oficial. Vazio = não aparece.',
      },
    },
  },

  origem: {
    rotulo: 'Quem é Sofia',
    grupo: 'Página',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      paragrafos: {
        tipo: 'listaTexto',
        rotulo: 'Parágrafos',
        min: 1,
        max: 6,
        maxItem: 400,
        ajuda: 'Um parágrafo por entrada.',
      },
      citacao: { tipo: 'longo', rotulo: 'Frase em destaque', max: 180, linhas: 2 },
      video: videoSolto(
        'Vídeo da história dela',
        'Seção "Quem é Sofia" — logo abaixo do título, antes do primeiro parágrafo. É a primeira coisa depois do título.',
        'É o vídeo em que ela conta a própria história.',
      ),
    },
  },

  album: {
    rotulo: 'O álbum',
    grupo: 'Página',
    nota: 'Oito fotos do acervo de família. A legenda é o que dá contexto — sem ela é só foto antiga.',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      fotos: {
        tipo: 'lista',
        rotulo: 'Legendas das fotos',
        rotuloItem: 'Foto',
        titulo: 'legenda',
        min: 3,
        max: 8,
        ajuda: 'A ordem aqui é a ordem na galeria, e casa com os espaços Foto 1 a Foto 8 na aba Imagens.',
        item: {
          id: ID,
          legenda: { tipo: 'texto', rotulo: 'Legenda', max: 60 },
          ano: { tipo: 'texto', rotulo: 'Lugar ou ano', max: 24, ajuda: 'Ex.: Iata · 1995' },
        },
      },
      rodape: { tipo: 'texto', rotulo: 'Crédito', max: 80 },
    },
  },

  rua: {
    rotulo: 'A rua',
    grupo: 'Página',
    nota: '⚠️ As fotos desta seção são de terceiros. Sem autorização de uso, não publique.',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40, ajuda: 'Costuma ser o ano. Ex.: 2020' },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      texto: { tipo: 'longo', rotulo: 'Texto', max: 300, linhas: 3 },
      video: videoSolto(
        'Vídeo da pandemia',
        'Seção "A rua" — logo abaixo do texto de abertura e ANTES das três fotos de 2020.',
        'É o registro do que a seção descreve; as fotos ficam como apoio.',
      ),
      fotos: {
        tipo: 'lista',
        rotulo: 'Legendas das fotos',
        rotuloItem: 'Foto',
        titulo: 'legenda',
        min: 3,
        max: 3,
        item: {
          id: ID,
          legenda: { tipo: 'texto', rotulo: 'Legenda', max: 50 },
          local: { tipo: 'texto', rotulo: 'Local', max: 30 },
        },
      },
      credito: { tipo: 'texto', rotulo: 'Crédito das fotos', max: 80 },
    },
  },

  problema: {
    rotulo: 'O que está errado',
    grupo: 'Página',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      itens: {
        tipo: 'lista',
        rotulo: 'Problemas',
        rotuloItem: 'Problema',
        titulo: 'titulo',
        min: 2,
        max: 8,
        item: itemNumerado(260),
      },
      video: videoSolto(
        'Vídeo',
        'Seção "O que está errado" — fecha a seção, centralizado abaixo dos quatro cartões de problema.',
      ),
    },
  },

  valores: {
    rotulo: 'No que não se negocia',
    grupo: 'Página',
    nota: 'O campo "chave" escolhe o ícone. Trocar por um valor desconhecido deixa o card sem ícone.',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      itens: {
        tipo: 'lista',
        rotulo: 'Valores',
        rotuloItem: 'Valor',
        titulo: 'titulo',
        min: 2,
        max: 9,
        item: {
          id: ID,
          chave: {
            tipo: 'texto',
            rotulo: 'Ícone',
            max: 20,
            ajuda: 'familia · liberdade · segurança · lei · armas · producao · imposto · fe',
          },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 30 },
          texto: { tipo: 'longo', rotulo: 'Descrição', max: 180, linhas: 3 },
        },
      },
      frase: {
        tipo: 'texto',
        rotulo: 'Frase de fecho',
        max: 60,
        ajuda: 'Fica ao lado da foto de apoio, no fim da seção.',
      },
    },
  },

  cena: {
    rotulo: 'Cena da bandeira',
    grupo: 'Página',
    nota:
      'Três telas pintadas conforme a pessoa rola: verde, amarelo, azul. ' +
      'A ordem das cores é a da bandeira e não muda. Frase curta — o texto ' +
      'aparece grande e fica pouco tempo na tela.',
    campos: {
      verde: {
        tipo: 'grupo',
        rotulo: 'Tela 1 — verde',
        campos: {
          etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 30 },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 45, destaque: true },
          texto: { tipo: 'longo', rotulo: 'Texto', max: 140, linhas: 2 },
        },
      },
      amarelo: {
        tipo: 'grupo',
        rotulo: 'Tela 2 — amarelo',
        campos: {
          etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 30 },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 45, destaque: true },
          texto: { tipo: 'longo', rotulo: 'Texto', max: 140, linhas: 2 },
        },
      },
      azul: {
        tipo: 'grupo',
        rotulo: 'Tela 3 — azul',
        campos: {
          etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 30 },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 45, destaque: true },
          texto: { tipo: 'longo', rotulo: 'Texto', max: 140, linhas: 2 },
        },
      },
    },
  },

  provas: {
    rotulo: 'O que já foi feito',
    grupo: 'Página',
    nota: '⚠️ Só publique número auditável, com fonte. Esta é a seção que vira direito de resposta.',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      video: videoSolto(
        'Vídeo da prestação de contas',
        'Seção "O que já foi feito" — ao lado direito da introdução, no lugar onde ficava a faixa de números.',
      ),
      entregas: {
        tipo: 'lista',
        rotulo: 'Entregas',
        rotuloItem: 'Entrega',
        titulo: 'titulo',
        min: 0,
        max: 6,
        item: {
          id: ID,
          titulo: { tipo: 'texto', rotulo: 'Título', max: 60 },
          municipio: { tipo: 'texto', rotulo: 'Município', max: 30 },
          texto: { tipo: 'longo', rotulo: 'Descrição', max: 200, linhas: 3 },
          valor: { tipo: 'texto', rotulo: 'Valor', max: 18, ajuda: 'Formato "R$ 1,2 mi".' },
        },
      },
      aviso: { tipo: 'longo', rotulo: 'Aviso de seção incompleta', max: 220, linhas: 2 },
      documento: {
        tipo: 'grupo',
        rotulo: 'Registro público',
        ajuda: 'O bloco do print do SAPL. É a prova documental — o leitor pode conferir sozinho.',
        campos: {
          titulo: { tipo: 'texto', rotulo: 'Título', max: 60 },
          texto: { tipo: 'longo', rotulo: 'Texto', max: 220, linhas: 3 },
          rotuloLink: { tipo: 'texto', rotulo: 'Texto do link', max: 40 },
          link: { tipo: 'url', rotulo: 'Endereço do registro' },
        },
      },
    },
  },

  social: {
    rotulo: 'Prova social',
    grupo: 'Página',
    nota: '⚠️ Prints de comentário exigem cuidado com imagem de terceiros. Nos ataques, borre nome E foto. Ver PLANO-FOTOS.md.',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      legendas: {
        tipo: 'lista',
        rotulo: 'Legenda de cada comentário',
        rotuloItem: 'Comentário',
        titulo: 'texto',
        min: 6,
        max: 6,
        ajuda: 'Opcional. Deixe em branco para o print falar sozinho. Casa com Comentário 1 a 6 na aba Imagens.',
        item: {
          id: ID,
          texto: { tipo: 'texto', rotulo: 'Legenda', max: 40 },
        },
      },
      videos: {
        tipo: 'lista',
        rotulo: 'Vídeos de comentário',
        rotuloItem: 'Vídeo',
        titulo: 'titulo',
        min: 0,
        max: 2,
        ajuda: 'Aparecem logo abaixo dos prints. Sem endereço, não aparecem.',
        item: itemVideo(
          'Seção "Aqui não sou eu falando de mim" — em dois, logo abaixo da grade de prints de comentário.',
        ),
      },
      ataques: {
        tipo: 'grupo',
        rotulo: 'O outro lado',
        campos: {
          etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
          intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
          fecho: { tipo: 'longo', rotulo: 'Frase de fecho', max: 260, linhas: 3 },
        },
      },
      processos: {
        tipo: 'lista',
        rotulo: 'Processos vencidos',
        rotuloItem: 'Processo',
        titulo: 'titulo',
        min: 0,
        max: 4,
        ajuda: '⚠️ Confirme com o jurídico antes de citar processo e nome de autoridade.',
        item: {
          id: ID,
          titulo: { tipo: 'texto', rotulo: 'Título', max: 60 },
          texto: { tipo: 'longo', rotulo: 'O que aconteceu', max: 260, linhas: 3 },
          resultado: { tipo: 'texto', rotulo: 'Resultado', max: 60, ajuda: 'A frase curta que fecha. Ex.: A Justiça rejeitou a ação.' },
          videos: {
            tipo: 'lista',
            rotulo: 'Vídeos deste processo',
            rotuloItem: 'Vídeo',
            titulo: 'titulo',
            min: 0,
            max: 2,
            item: itemVideo(
              'Seção "E o que a esquerda diz de mim?" — DENTRO do cartão deste processo, abaixo da pílula amarela de resultado.',
            ),
          },
        },
      },
      nota: { tipo: 'longo', rotulo: 'Nota de rodapé da seção', max: 200, linhas: 2 },
    },
  },

  trilha: {
    rotulo: 'Trilha de vídeos',
    grupo: 'Página',
    nota:
      'Mesma mecânica dos Compromissos: a tela prende e a fita de vídeos anda de lado conforme a página desce. ' +
      'Um vídeo toca por vez. A seção some sozinha enquanto nenhum item tiver endereço.',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      itens: {
        tipo: 'lista',
        rotulo: 'Vídeos',
        rotuloItem: 'Vídeo',
        titulo: 'titulo',
        min: 0,
        max: 12,
        ajuda: 'A ordem aqui é a ordem da fita.',
        item: itemVideo(
          'Seção "A trilha" — na fita que corre de lado, logo acima de "O que eu levo pra Brasília".',
        ),
      },
    },
  },

  futuro: {
    rotulo: 'Compromissos',
    grupo: 'Página',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      itens: {
        tipo: 'lista',
        rotulo: 'Compromissos',
        rotuloItem: 'Compromisso',
        titulo: 'titulo',
        min: 3,
        max: 8,
        item: itemNumerado(260),
      },
    },
  },

  grupos: {
    rotulo: 'Grupos de WhatsApp',
    grupo: 'Página',
    nota: 'Os links dos grupos ficam na aba Grupos. Aqui são só os textos da seção.',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      botaoGeo: { tipo: 'texto', rotulo: 'Botão de localização', max: 30 },
      botaoGeoCarregando: { tipo: 'texto', rotulo: '…enquanto localiza', max: 30 },
      geoNegado: { tipo: 'longo', rotulo: 'Se a localização não funcionar', max: 160, linhas: 2 },
      rotuloBusca: { tipo: 'texto', rotulo: 'Rótulo do campo de cidade', max: 50 },
      placeholderBusca: {
        tipo: 'texto',
        rotulo: 'Exemplo dentro do campo',
        max: 30,
        ajuda: 'Curto: acima de uns 25 caracteres o exemplo sai cortado no celular.',
      },
      vazio: { tipo: 'longo', rotulo: 'Nenhuma cidade encontrada', max: 140, linhas: 2 },
      cidadeTitulo: {
        tipo: 'texto',
        rotulo: 'Cidade escolhida: etiqueta',
        max: 30,
        ajuda: 'Aparece acima do nome da cidade. O botão usa "Entrar no grupo de", em Botões do site.',
      },
      trocarCidade: { tipo: 'texto', rotulo: 'Cidade escolhida: trocar', max: 30 },
      aberto: { tipo: 'texto', rotulo: 'Situação: aberto', max: 20 },
      cheio: { tipo: 'texto', rotulo: 'Situação: cheio', max: 20 },
      emBreve: { tipo: 'texto', rotulo: 'Situação: em breve', max: 20 },
      avisoCheio: { tipo: 'longo', rotulo: 'Explicação do "cheio"', max: 200, linhas: 2 },
      avisoEmBreve: { tipo: 'longo', rotulo: 'Explicação do "em breve"', max: 200, linhas: 2 },
    },
  },

  entrada: {
    rotulo: 'Página de entrada do anúncio',
    grupo: 'Página',
    nota:
      'É a página que abre quando alguém toca no anúncio de uma cidade. Onde estiver {cidade}, entra o nome da cidade — a do anúncio, ou a que a pessoa escolher. As mensagens de grupo cheio e em breve vêm de Grupos de WhatsApp. ⚠️ Na primeira tela cabem só o selo, o título, a frase de apoio e o botão: tudo que crescer aqui empurra o botão para fora da tela de quem chega pelo anúncio.',
    campos: {
      contagem: {
        tipo: 'texto',
        rotulo: 'Contagem regressiva',
        max: 40,
        ajuda:
          'O selo amarelo do topo. {dias} é calculado sozinho até o dia da eleição. Vazio, ou faltando um dia ou menos, entra a etiqueta no lugar.',
      },
      etiqueta: {
        tipo: 'texto',
        rotulo: 'Etiqueta (sem a contagem)',
        max: 40,
        ajuda: 'Ocupa o mesmo selo amarelo quando não há contagem. Pode usar {cidade}.',
      },
      titulo: {
        tipo: 'texto',
        rotulo: 'Título',
        max: 80,
        destaque: true,
        ajuda: 'Use {cidade} onde entra o nome da cidade. O trecho destacado fica verde.',
      },
      apoio: {
        tipo: 'longo',
        rotulo: 'Texto de apoio',
        max: 200,
        linhas: 3,
        destaque: true,
        ajuda: 'Uma frase, no máximo duas. O trecho destacado fica verde.',
      },
      botao: {
        tipo: 'texto',
        rotulo: 'Botão verde',
        max: 40,
        ajuda:
          'Só desta página. Pode usar {cidade} — com nome comprido, como Alta Floresta d\'Oeste, o texto quebra em duas linhas dentro do botão.',
      },
      notaBotao: { tipo: 'texto', rotulo: 'Frase embaixo do botão', max: 90 },
      itens: {
        tipo: 'lista',
        rotulo: 'Marcadores',
        rotuloItem: 'Marcador',
        titulo: 'texto',
        min: 0,
        max: 6,
        ajuda: 'Frases curtas com o sinal de visto, depois do botão. Pode usar {cidade} e [[destaque]].',
        item: {
          id: ID,
          texto: { tipo: 'texto', rotulo: 'Texto', max: 80, destaque: true },
        },
      },
      trocarCidade: {
        tipo: 'texto',
        rotulo: 'Link para trocar de cidade',
        max: 60,
        ajuda: 'Abre a busca. A cidade escolhida passa a valer para o título e para o botão.',
      },
      botaoAbrindo: { tipo: 'texto', rotulo: 'Botão, enquanto abre o WhatsApp', max: 40 },
      naoAbriuTitulo: { tipo: 'texto', rotulo: 'Se o WhatsApp não abrir: título', max: 50 },
      naoAbriuBotao: { tipo: 'texto', rotulo: 'Se o WhatsApp não abrir: link', max: 40 },
      naoAbriuDica: {
        tipo: 'longo',
        rotulo: 'Se o WhatsApp não abrir: dica',
        max: 200,
        linhas: 2,
        ajuda: 'Aparece seis segundos depois do toque, se a página continuar na tela.',
      },
      quemEtiqueta: { tipo: 'texto', rotulo: 'Segunda dobra: etiqueta', max: 40 },
      quemTitulo: {
        tipo: 'texto',
        rotulo: 'Segunda dobra: título',
        max: 60,
        destaque: true,
        ajuda: 'Fica ao lado da foto, no fundo azul. O trecho destacado fica amarelo.',
      },
      quem: {
        tipo: 'listaTexto',
        rotulo: 'Segunda dobra: frases',
        min: 1,
        max: 5,
        maxItem: 260,
        destaque: true,
      },
      quemCitacao: {
        tipo: 'longo',
        rotulo: 'Segunda dobra: frase em destaque',
        max: 220,
        linhas: 3,
        destaque: true,
        ajuda: 'O bloco de convicção, no quadro claro. Vazio, o quadro some.',
      },
      conhecer: {
        tipo: 'texto',
        rotulo: 'Link para a página completa',
        max: 50,
        ajuda: 'Leva à home, com a história inteira.',
      },
    },
  },

  bio: {
    rotulo: 'Link da bio',
    grupo: 'Página',
    nota:
      'A página curta que fica na bio do Instagram (/bio). Cada botão é uma linha da lista abaixo: escolha a função, escreva o texto e, se quiser, um ícone. ⚠️ Botão demais é botão nenhum — a pessoa vem da bio com um assunto na cabeça, e cinco opções já fazem ela parar para escolher. Os endereços prontos para colar no Instagram estão em Link da bio, no menu.',
    campos: {
      etiqueta: {
        tipo: 'texto',
        rotulo: 'Selo do topo',
        max: 40,
        ajuda:
          'O selo amarelo. Entra no lugar da contagem regressiva quando ela está desligada ou quando falta um dia ou menos.',
      },
      contagem: {
        tipo: 'texto',
        rotulo: 'Contagem regressiva',
        max: 40,
        ajuda: '{dias} é calculado sozinho até o dia da eleição. Vazio, entra o selo acima.',
      },
      titulo: {
        tipo: 'texto',
        rotulo: 'Título',
        max: 70,
        destaque: true,
        ajuda: 'Curto: é a primeira coisa embaixo da tarja. O trecho destacado fica verde.',
      },
      apoio: {
        tipo: 'longo',
        rotulo: 'Frase de apoio',
        max: 180,
        linhas: 2,
        destaque: true,
        ajuda: 'Uma linha, no máximo duas. Vazia, o bloco some e os botões sobem.',
      },
      links: {
        tipo: 'lista',
        rotulo: 'Botões',
        rotuloItem: 'Botão',
        titulo: 'rotulo',
        min: 1,
        max: 12,
        ajuda:
          'Na ordem em que aparecem. O primeiro é o que mais gente toca — deixe o pedido principal em cima.',
        item: {
          id: ID,
          ligado: {
            tipo: 'booleano',
            rotulo: 'No ar',
            ajuda: 'Desligado, o botão some da página sem perder o que está escrito aqui.',
          },
          funcao: {
            tipo: 'escolha',
            rotulo: 'O que este botão faz',
            // ⚠️ A LISTA VEM DE `lib/bio.ts`, e não está escrita aqui.
            //    Ela é lida em três lugares — o formulário, quem monta
            //    o endereço e quem decide o que sai do ar no silêncio
            //    eleitoral — e a cópia escrita à mão já divergiu neste
            //    projeto: foi assim que `mapa` sumiu da lista de
            //    origens e a tela "qual botão trabalha" passou meses
            //    jurando que ninguém tocava no mapa de Rondônia.
            opcoes: FUNCOES_BIO.map((f) => ({ valor: f.valor, rotulo: f.rotulo })),
            ajuda:
              'As quatro primeiras já sabem para onde ir. As três últimas usam o campo Endereço.',
          },
          rotulo: {
            tipo: 'texto',
            rotulo: 'Texto do botão',
            max: 42,
            ajuda:
              'Acima de 42 caracteres ele quebra em celular de 360px. É este texto que aparece no painel de métricas dizendo qual botão a pessoa usou.',
          },
          descricao: {
            tipo: 'texto',
            rotulo: 'Linha de baixo',
            max: 60,
            ajuda: 'Opcional, em letra menor. Serve para tirar a dúvida de quem hesita.',
          },
          icone: {
            tipo: 'icone',
            rotulo: 'Ícone',
            ajuda:
              'Os desenhos são do lucide.dev. Não achou o que queria? Procure lá, copie o nome (ex.: "tractor") e peça para incluirmos — ou deixe em branco, que cada função já traz o ícone dela.',
          },
          destino: {
            tipo: 'destino',
            rotulo: 'Endereço',
            ajuda:
              'Só para as três últimas funções. Falar no WhatsApp: o número com DDD (ou um link do wa.me com a mensagem já escrita). Outra página: /filtro, /grupos. Endereço de fora: começando com https:// — e se quiser medir do outro lado, cole-o já com o UTM (…/?utm_source=bio&utm_medium=link), porque esta página não acrescenta parâmetro em link de fora.',
          },
          destaque: {
            tipo: 'booleano',
            rotulo: 'Botão principal',
            ajuda:
              'Verde e cheio, como o botão de entrar no grupo. ⚠️ Um só: dois botões principais é nenhum.',
          },
        },
      },
      nota: {
        tipo: 'texto',
        rotulo: 'Frase abaixo dos botões',
        max: 90,
        ajuda: 'Opcional. Vazia, some.',
      },
      instagramRotulo: {
        tipo: 'texto',
        rotulo: 'Rodapé: link do Instagram',
        max: 40,
        ajuda: 'Fica no pé do cartão, no azul, ao lado do número. Vazio, some.',
      },
    },
  },

  filtro: {
    rotulo: 'Coloque o 2233 na foto',
    grupo: 'Página',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      passos: {
        tipo: 'lista',
        rotulo: 'Passos',
        rotuloItem: 'Passo',
        titulo: 'titulo',
        // Quatro, fixos: são as quatro telas do fluxo, não uma lista
        // decorativa. As palavras mudam, a quantidade não — o quinto
        // passo não teria tela para onde apontar.
        min: 4,
        max: 4,
        item: {
          id: ID,
          numero: { tipo: 'texto', rotulo: 'Número', max: 2 },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 40 },
          texto: { tipo: 'longo', rotulo: 'Descrição', max: 120, linhas: 2 },
        },
      },
      privacidade: { tipo: 'texto', rotulo: 'Frase de privacidade', max: 60 },
      apoios: {
        tipo: 'texto',
        rotulo: 'Contador de apoio',
        max: 70,
        tokens: true,
        ajuda: 'O número entra sozinho na frente. Só aparece depois de passar de 50.',
      },

      formatos: {
        tipo: 'grupo',
        rotulo: 'Os dois formatos',
        campos: {
          story: {
            tipo: 'grupo',
            rotulo: 'Story',
            campos: {
              rotulo: { tipo: 'texto', rotulo: 'Nome', max: 16 },
              descricao: { tipo: 'texto', rotulo: 'Para que serve', max: 60 },
            },
          },
          perfil: {
            tipo: 'grupo',
            rotulo: 'Perfil',
            campos: {
              rotulo: { tipo: 'texto', rotulo: 'Nome', max: 16 },
              descricao: { tipo: 'texto', rotulo: 'Para que serve', max: 60 },
            },
          },
        },
      },

      botaoEscolherFoto: { tipo: 'texto', rotulo: 'Botão: escolher foto', max: 30 },
      botaoTrocarFoto: { tipo: 'texto', rotulo: 'Botão: trocar foto', max: 30 },
      botaoGerar: { tipo: 'texto', rotulo: 'Botão: gerar', max: 30 },
      botaoGerando: { tipo: 'texto', rotulo: 'Botão: gerando', max: 30 },
      botaoBaixar: { tipo: 'texto', rotulo: 'Botão: baixar', max: 30 },
      botaoCompartilhar: { tipo: 'texto', rotulo: 'Botão: compartilhar', max: 30 },
      botaoStory: { tipo: 'texto', rotulo: 'Botão: abrir o Instagram', max: 30 },
      notaStory: { tipo: 'longo', rotulo: 'Nota do botão do Instagram', max: 160, linhas: 2 },
      botaoRefazer: { tipo: 'texto', rotulo: 'Botão: fazer outra', max: 30 },
      botaoVoltar: { tipo: 'texto', rotulo: 'Botão: voltar', max: 20 },
      botaoAvancar: { tipo: 'texto', rotulo: 'Botão: continuar', max: 20 },
      botaoCentralizar: { tipo: 'texto', rotulo: 'Botão: centralizar', max: 20 },
      rotuloZoom: { tipo: 'texto', rotulo: 'Rótulo do zoom', max: 16 },

      vazioPrevia: { tipo: 'texto', rotulo: 'Prévia vazia', max: 40 },
      avisoZonaSegura: { tipo: 'texto', rotulo: 'Guia da zona segura', max: 40 },
      dicaAjuste: { tipo: 'longo', rotulo: 'Como ajustar', max: 140, linhas: 2 },
      tituloPronto: { tipo: 'texto', rotulo: 'Título do resultado', max: 40 },
      textoPronto: { tipo: 'longo', rotulo: 'Texto do resultado', max: 160, linhas: 2 },
      dicaSalvar: { tipo: 'longo', rotulo: 'Como salvar no celular', max: 140, linhas: 2 },

      avisoInstagram: { tipo: 'longo', rotulo: 'Aviso do navegador do Instagram', max: 160, linhas: 2 },
      avisoInstagramBotao: { tipo: 'texto', rotulo: 'Botão: abrir no navegador', max: 30 },
      naoBaixouTitulo: { tipo: 'texto', rotulo: 'Não baixou: título', max: 30 },
      naoBaixouTexto: { tipo: 'longo', rotulo: 'Não baixou: explicação', max: 220, linhas: 3 },

      erroFormato: { tipo: 'longo', rotulo: 'Erro: formato não suportado', max: 200, linhas: 2 },
      erroPequena: { tipo: 'longo', rotulo: 'Aviso: foto pequena', max: 140, linhas: 2 },
      erroGerar: { tipo: 'longo', rotulo: 'Erro: não deu para gerar', max: 160, linhas: 2 },
    },
  },

  compartilhar: {
    rotulo: 'Compartilhar',
    grupo: 'Página',
    campos: {
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40 },
      titulo: { tipo: 'texto', rotulo: 'Título', max: 70, destaque: true },
      intro: { tipo: 'longo', rotulo: 'Introdução', max: 300, linhas: 3 },
      textoWhatsapp: {
        tipo: 'longo',
        rotulo: 'Mensagem pronta do WhatsApp',
        max: 280,
        linhas: 3,
        ajuda: 'O link da página é acrescentado no fim, automaticamente.',
      },
      botaoWhatsapp: { tipo: 'texto', rotulo: 'Botão do WhatsApp', max: 30 },
      botaoCopiar: { tipo: 'texto', rotulo: 'Botão de copiar', max: 30 },
      copiado: { tipo: 'texto', rotulo: 'Confirmação de cópia', max: 30 },
    },
  },

  ctaFinal: {
    rotulo: 'Chamada final',
    grupo: 'Página',
    campos: {
      titulo: {
        tipo: 'listaTexto',
        rotulo: 'Título',
        min: 1,
        max: 3,
        maxItem: 40,
        destaque: true,
      },
      texto: { tipo: 'longo', rotulo: 'Texto', max: 240, linhas: 3 },
      ctaPrimario: { tipo: 'texto', rotulo: 'Botão principal', max: 42 },
      ctaSecundario: { tipo: 'texto', rotulo: 'Botão secundário', max: 42 },
    },
  },

  faixa: {
    rotulo: 'Faixa corrida',
    grupo: 'Página',
    nota: 'A tarja que passa entre a primeira dobra e o resto da página. Frases curtas: elas correm de lado e ninguém lê frase longa em movimento.',
    campos: {
      itens: {
        tipo: 'lista',
        rotulo: 'O que passa na faixa',
        rotuloItem: 'Item',
        titulo: 'texto',
        min: 2,
        max: 8,
        item: {
          id: ID,
          texto: { tipo: 'texto', rotulo: 'Texto', max: 40 },
        },
      },
    },
  },

  exibir: {
    rotulo: 'Seções no ar',
    grupo: 'Página',
    nota: '⚠️ Desligar uma seção tira ela da página inteira, inclusive do menu do topo. A primeira dobra, a chamada final e o rodapé não podem ser desligados — o rodapé carrega a identificação exigida pela lei eleitoral.',
    campos: {
      faixa: { tipo: 'booleano', rotulo: 'Faixa corrida', ajuda: 'A tarja amarela logo abaixo da primeira dobra.' },
      origem: { tipo: 'booleano', rotulo: 'Quem é Sofia', ajuda: 'A história de origem e a linha do tempo.' },
      album: { tipo: 'booleano', rotulo: 'O álbum', ajuda: 'As fotos do acervo de família.' },
      rua: { tipo: 'booleano', rotulo: 'A rua', ajuda: 'As três fotos de 2020. Desligue enquanto não houver autorização de uso.' },
      problema: { tipo: 'booleano', rotulo: 'O que está errado' },
      valores: { tipo: 'booleano', rotulo: 'Minhas bandeiras' },
      cena: { tipo: 'booleano', rotulo: 'Cena da bandeira', ajuda: 'A animação de rolagem entre bandeiras e provas.' },
      provas: { tipo: 'booleano', rotulo: 'O que já foi feito' },
      social: { tipo: 'booleano', rotulo: 'Prova social', ajuda: 'Comentários e processos. Desligue enquanto o jurídico não liberar os prints.' },
      trilha: { tipo: 'booleano', rotulo: 'Trilha de vídeos', ajuda: 'A fita de vídeos acima dos compromissos.' },
      futuro: { tipo: 'booleano', rotulo: 'Compromissos' },
      grupos: {
        tipo: 'booleano',
        rotulo: 'Grupos de WhatsApp',
        ajuda: '⚠️ Pense duas vezes: é para cá que apontam os botões principais da página. Desligada, os botões de grupo somem junto.',
      },
      filtro: { tipo: 'booleano', rotulo: 'Gerador de filtro' },
      compartilhar: { tipo: 'booleano', rotulo: 'Compartilhar' },
    },
  },

  rodape: {
    rotulo: 'Rodapé',
    // ⚠️ Fica em Identidade, e não em Página, porque o que ele carrega
    //    é identificação — assinatura, CNPJ, coligação, o bloco legal
    //    exigido por lei. É o mesmo tipo de dado do nome e do número,
    //    não um bloco de conteúdo editorial.
    grupo: 'Identidade',
    nota: 'O bloco legal é obrigatório por lei e a peça não pode ir ao ar sem ele. Confira com quem cuida da parte jurídica antes de mexer — e lembre que toda alteração fica no histórico.',
    campos: {
      assinatura: { tipo: 'texto', rotulo: 'Assinatura', max: 40 },
      legalRotulo: { tipo: 'texto', rotulo: 'Título do bloco legal', max: 40 },
      aviso: { tipo: 'longo', rotulo: 'Aviso legal', max: 200, linhas: 2 },
      links: {
        tipo: 'lista',
        rotulo: 'Links',
        rotuloItem: 'Link',
        titulo: 'rotulo',
        min: 1,
        max: 6,
        item: {
          id: ID,
          rotulo: { tipo: 'texto', rotulo: 'Texto', max: 40 },
          href: { tipo: 'ancora', rotulo: 'Destino' },
        },
      },
      legal: {
        tipo: 'grupo',
        rotulo: 'Identificação eleitoral (obrigatória)',
        campos: {
          eleicao: { tipo: 'texto', rotulo: 'Eleição', max: 30 },
          candidato: { tipo: 'texto', rotulo: 'Nome completo na urna', max: 80 },
          cargo: { tipo: 'texto', rotulo: 'Cargo', max: 40 },
          partido: { tipo: 'texto', rotulo: 'Partido e número', max: 40 },
          cnpj: { tipo: 'texto', rotulo: 'CNPJ da campanha', max: 40 },
          coligacao: { tipo: 'longo', rotulo: 'Coligação', max: 200, linhas: 2 },
          comite: {
            tipo: 'texto',
            rotulo: 'Endereço do comitê',
            max: 140,
            ajuda: 'Deixe vazio se não houver comitê com endereço fixo.',
          },
        },
      },
    },
  },

  // ── Textos gerais ──────────────────────────────────────────────
  ctas: {
    rotulo: 'Botões do site',
    grupo: 'Textos gerais',
    nota: 'Aparecem em vários lugares. Mudar aqui muda em todos.',
    campos: {
      grupo: { tipo: 'texto', rotulo: 'Entrar no grupo (completo)', max: 42 },
      grupoCurto: { tipo: 'texto', rotulo: 'Entrar no grupo (curto)', max: 22 },
      grupoDe: {
        tipo: 'texto',
        rotulo: 'Entrar no grupo de…',
        max: 24,
        ajuda: 'O nome da cidade entra sozinho no fim. Só aparece em quem chegou pelo link de um anúncio de município.',
      },
      filtro: { tipo: 'texto', rotulo: 'Filtro (completo)', max: 42 },
      filtroCurto: { tipo: 'texto', rotulo: 'Filtro (curto)', max: 22 },
      compartilhar: { tipo: 'texto', rotulo: 'Compartilhar', max: 30 },
      instagram: { tipo: 'texto', rotulo: 'Instagram', max: 30 },
      silencio: {
        tipo: 'longo',
        rotulo: 'Texto do silêncio eleitoral',
        max: 200,
        linhas: 2,
        ajuda: 'Substitui os botões a partir da data configurada. A data em si fica em variável de ambiente.',
      },
    },
  },

  navegacao: {
    rotulo: 'Menu',
    grupo: 'Textos gerais',
    campos: {
      itens: {
        tipo: 'lista',
        rotulo: 'Itens do menu',
        rotuloItem: 'Item',
        titulo: 'rotulo',
        min: 1,
        max: 6,
        item: {
          id: ID,
          rotulo: { tipo: 'texto', rotulo: 'Texto', max: 30 },
          href: { tipo: 'ancora', rotulo: 'Destino' },
        },
      },
    },
  },

  privacidade: {
    rotulo: 'Política de privacidade',
    grupo: 'Textos gerais',
    nota: 'Aceita {{candidata.nome}}, {{legal.cnpj}} e outros. A lista completa aparece na ajuda de cada campo.',
    campos: {
      titulo: { tipo: 'texto', rotulo: 'Título da página', max: 60 },
      atualizadoEm: { tipo: 'texto', rotulo: 'Data de atualização', max: 40 },
      resumo: { tipo: 'longo', rotulo: 'Resumo em destaque', max: 260, linhas: 3 },
      secoes: {
        tipo: 'lista',
        rotulo: 'Seções',
        rotuloItem: 'Seção',
        titulo: 'titulo',
        min: 1,
        max: 15,
        item: {
          id: ID,
          titulo: { tipo: 'texto', rotulo: 'Título', max: 70 },
          conteudo: {
            tipo: 'listaTexto',
            rotulo: 'Parágrafos',
            min: 1,
            max: 8,
            maxItem: 700,
          },
        },
      },
    },
  },

  // ── Identidade ─────────────────────────────────────────────────
  cookies: {
    rotulo: 'Aviso de cookies',
    grupo: 'Textos gerais',
    nota:
      'O cartão que aparece no pé da tela na primeira visita. As categorias ligam e desligam ferramentas de verdade: desempenho carrega o Google Tag Manager (GA4 e Clarity) e publicidade carrega o pixel e a API de Conversões da Meta. Se uma ferramenta nova entrar numa delas, diga aqui.',
    campos: {
      titulo: { tipo: 'texto', rotulo: 'Título', max: 50 },
      texto: {
        tipo: 'longo',
        rotulo: 'Texto',
        max: 120,
        linhas: 2,
        ajuda: 'Até uns 90 caracteres cabe em duas linhas no celular. Mais que isso, o cartão cresce e cobre mais da página.',
      },
      aceitar: { tipo: 'texto', rotulo: 'Botão aceitar', max: 22 },
      rejeitar: { tipo: 'texto', rotulo: 'Botão rejeitar', max: 22 },
      personalizar: { tipo: 'texto', rotulo: 'Link personalizar', max: 22 },
      politica: { tipo: 'texto', rotulo: 'Link da política', max: 30 },
      escolhasTitulo: { tipo: 'texto', rotulo: 'Personalizar: título', max: 40 },
      escolhasTexto: { tipo: 'longo', rotulo: 'Personalizar: texto', max: 160, linhas: 2 },
      sempreAtivos: { tipo: 'texto', rotulo: 'Selo dos necessários', max: 20 },
      salvar: { tipo: 'texto', rotulo: 'Botão salvar escolhas', max: 22 },
      gerenciar: {
        tipo: 'texto',
        rotulo: 'Link "Gerenciar cookies"',
        max: 30,
        ajuda: 'No rodapé de todas as páginas e na política de privacidade.',
      },
      necessarios: {
        tipo: 'grupo',
        rotulo: 'Categoria: necessários',
        campos: {
          titulo: { tipo: 'texto', rotulo: 'Nome', max: 30 },
          texto: { tipo: 'texto', rotulo: 'Descrição', max: 110 },
        },
      },
      desempenho: {
        tipo: 'grupo',
        rotulo: 'Categoria: desempenho',
        campos: {
          titulo: { tipo: 'texto', rotulo: 'Nome', max: 30 },
          texto: { tipo: 'texto', rotulo: 'Descrição', max: 110 },
        },
      },
      publicidade: {
        tipo: 'grupo',
        rotulo: 'Categoria: publicidade',
        campos: {
          titulo: { tipo: 'texto', rotulo: 'Nome', max: 30 },
          texto: { tipo: 'texto', rotulo: 'Descrição', max: 110 },
        },
      },
    },
  },

  candidata: {
    rotulo: 'A candidata',
    grupo: 'Identidade',
    campos: {
      nome: { tipo: 'texto', rotulo: 'Nome', max: 40 },
      numero: { tipo: 'texto', rotulo: 'Número', max: 6 },
      cargo: { tipo: 'texto', rotulo: 'Cargo', max: 40 },
      estado: { tipo: 'texto', rotulo: 'Estado', max: 30 },
      uf: { tipo: 'texto', rotulo: 'UF', max: 2 },
      partido: { tipo: 'texto', rotulo: 'Sigla do partido', max: 10 },
      partidoExtenso: { tipo: 'texto', rotulo: 'Nome do partido', max: 50 },
      instagram: { tipo: 'url', rotulo: 'Instagram', prefixo: 'https://' },
      instagramHandle: { tipo: 'texto', rotulo: '@ do Instagram', max: 40 },
      whatsapp: { tipo: 'url', rotulo: 'WhatsApp', prefixo: 'https://' },
    },
  },

  aparencia: {
    rotulo: 'Aparência',
    grupo: 'Identidade',
    nota:
      'Ajustes visuais que valem para a página inteira. Mudar aqui vale na hora, sem publicar de novo.',
    campos: {
      heroCor: {
        tipo: 'escolha',
        rotulo: 'Cores da primeira dobra',
        opcoes: [
          { valor: 'azul', rotulo: 'Azul' },
          { valor: 'verde', rotulo: 'Verde' },
          { valor: 'amarelo', rotulo: 'Amarelo' },
          { valor: 'verde-amarelo', rotulo: 'Verde e amarelo (a capa oficial)' },
          { valor: 'azul-verde', rotulo: 'Azul e verde' },
          { valor: 'amarelo-azul', rotulo: 'Amarelo e azul' },
        ],
        ajuda:
          'Em todos, o lado escuro fica sob o texto e o claro atrás das fotos — é o que mantém o título legível. A cor do destaque e a do botão mudam sozinhas para continuar saltando do fundo.',
      },
      textura: {
        tipo: 'escolha',
        rotulo: 'Textura de fundo',
        opcoes: [
          { valor: 'nenhuma', rotulo: 'Nenhuma' },
          { valor: 'halftone', rotulo: 'Halftone — trama de pontos' },
          { valor: 'ruido', rotulo: 'Ruído — grão de papel' },
          { valor: 'tracejado', rotulo: 'Tracejado — linhas diagonais' },
        ],
        ajuda:
          'Cobre a página inteira e serve para tirar o ar de gradiente digital liso. O halftone lembra impressão; o ruído, papel; o tracejado, serigrafia.',
      },
      texturaForca: {
        tipo: 'deslizante',
        rotulo: 'Força da textura',
        min: 0,
        max: 100,
        passo: 5,
        sufixo: '%',
        ajuda:
          'Comece baixo. A régua: se der para contar os pontos, está alto — ela deve ser sentida, não vista.',
      },
    },
  },

  meta: {
    rotulo: 'Busca e compartilhamento',
    grupo: 'Identidade',
    nota: 'O WhatsApp guarda o cartão de um link por semanas. Mudar aqui NÃO muda os links já compartilhados.',
    campos: {
      titulo: { tipo: 'texto', rotulo: 'Título da aba', max: 70 },
      tituloCurto: { tipo: 'texto', rotulo: 'Título curto', max: 30 },
      descricao: { tipo: 'longo', rotulo: 'Descrição', max: 200, linhas: 3 },
      palavrasChave: {
        tipo: 'listaTexto',
        rotulo: 'Palavras-chave',
        min: 0,
        max: 15,
        maxItem: 60,
      },
      og: {
        tipo: 'grupo',
        rotulo: 'Cartão do WhatsApp',
        campos: {
          titulo: { tipo: 'texto', rotulo: 'Título', max: 60 },
          subtitulo: { tipo: 'texto', rotulo: 'Subtítulo', max: 60 },
          chamada: { tipo: 'texto', rotulo: 'Chamada', max: 60 },
        },
      },
      // ⚠️ OCULTO DE PROPÓSITO, e não por ser secreto — ele aparece no
      //    HTML de toda visita. É que este campo não se escreve: se
      //    cola, uma vez, exatamente como o Google entregou. Num
      //    formulário de redação, entre título e descrição, ele seria
      //    o único campo em que digitar bem é digitar nada — e um
      //    caractere trocado quebra a verificação sem dar erro em
      //    lugar nenhum.
      //
      //    Quem o preenche é a tela de Buscas, que aceita a linha
      //    inteira da meta tag e extrai o código sozinha. Aqui ele
      //    continua declarado porque o valor precisa sobreviver a um
      //    salvamento desta seção: campo fora do esquema é campo que a
      //    validação descarta.
      verificacaoGoogle: { tipo: 'oculto' },
    },
  },

  paginas: {
    rotulo: 'Páginas internas',
    grupo: 'Identidade',
    nota: 'Título da aba e cartão de compartilhamento de cada página.',
    campos: {
      filtro: {
        tipo: 'grupo',
        rotulo: 'Página do filtro',
        campos: {
          tituloAba: { tipo: 'texto', rotulo: 'Título da aba', max: 60 },
          descricao: { tipo: 'longo', rotulo: 'Descrição', max: 200, linhas: 2 },
          ogTitulo: { tipo: 'texto', rotulo: 'Título do cartão', max: 60 },
          ogDescricao: { tipo: 'longo', rotulo: 'Descrição do cartão', max: 160, linhas: 2 },
        },
      },
      grupos: {
        tipo: 'grupo',
        rotulo: 'Página de grupos',
        campos: {
          tituloAba: { tipo: 'texto', rotulo: 'Título da aba', max: 60 },
          descricao: { tipo: 'longo', rotulo: 'Descrição', max: 200, linhas: 2 },
          ogTitulo: { tipo: 'texto', rotulo: 'Título do cartão', max: 60 },
          ogDescricao: { tipo: 'longo', rotulo: 'Descrição do cartão', max: 160, linhas: 2 },
        },
      },
      bio: {
        tipo: 'grupo',
        rotulo: 'Link da bio',
        campos: {
          tituloAba: { tipo: 'texto', rotulo: 'Título da aba', max: 60 },
          descricao: { tipo: 'longo', rotulo: 'Descrição', max: 200, linhas: 2 },
          ogTitulo: { tipo: 'texto', rotulo: 'Título do cartão', max: 60 },
          ogDescricao: { tipo: 'longo', rotulo: 'Descrição do cartão', max: 160, linhas: 2 },
        },
      },
      privacidade: {
        tipo: 'grupo',
        rotulo: 'Página de privacidade',
        campos: {
          tituloAba: { tipo: 'texto', rotulo: 'Título da aba', max: 60 },
          descricao: { tipo: 'longo', rotulo: 'Descrição', max: 200, linhas: 2 },
          ogTitulo: { tipo: 'texto', rotulo: 'Título do cartão', max: 60 },
          ogDescricao: { tipo: 'longo', rotulo: 'Descrição do cartão', max: 160, linhas: 2 },
        },
      },
    },
  },
}

export type ChaveEsquema = keyof typeof ESQUEMA

/** As seções na ordem do menu, agrupadas. */
export const GRUPOS_MENU = ['Página', 'Textos gerais', 'Identidade'] as const

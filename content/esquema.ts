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

export interface Base {
  rotulo: string
  ajuda?: string
}

export type Campo =
  /** Uma linha. `destaque` libera [[colchetes]]; `tokens` libera {{chaves}}. */
  | (Base & { tipo: 'texto'; max?: number; destaque?: boolean; tokens?: boolean })
  /** Várias linhas. */
  | (Base & { tipo: 'longo'; max?: number; linhas?: number; tokens?: boolean })
  /** Endereço externo (https://). */
  | (Base & { tipo: 'url'; prefixo?: string })
  /** Endereço interno: começa com / ou #. Nunca externo. */
  | (Base & { tipo: 'ancora' })
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
      etiqueta: { tipo: 'texto', rotulo: 'Etiqueta', max: 40, ajuda: 'A pílula acima do título.' },
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
        rotulo: 'Botão principal',
        max: 42,
        ajuda: 'Acima de 42 caracteres o botão quebra em celular de 360px.',
      },
      ctaSecundario: { tipo: 'texto', rotulo: 'Botão secundário', max: 32 },
      ctaSecundarioHref: { tipo: 'ancora', rotulo: 'Destino do botão secundário' },
      rodapeHero: { tipo: 'texto', rotulo: 'Linha de apoio', max: 60 },
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
      linhaDoTempo: {
        tipo: 'lista',
        rotulo: 'Linha do tempo',
        rotuloItem: 'Momento',
        titulo: 'ano',
        min: 2,
        max: 8,
        item: {
          id: ID,
          ano: { tipo: 'texto', rotulo: 'Ano', max: 4 },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 40 },
          texto: { tipo: 'longo', rotulo: 'Descrição', max: 120, linhas: 2 },
        },
      },
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
      numeros: {
        tipo: 'lista',
        rotulo: 'Números',
        rotuloItem: 'Número',
        titulo: 'valor',
        min: 2,
        max: 4,
        item: {
          id: ID,
          valor: { tipo: 'texto', rotulo: 'Número', max: 8, ajuda: 'Só o algarismo. Ex.: 52, 1,2' },
          unidade: { tipo: 'texto', rotulo: 'Unidade', max: 18 },
          texto: { tipo: 'longo', rotulo: 'Explicação', max: 120, linhas: 2 },
        },
      },
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
        },
      },
      nota: { tipo: 'longo', rotulo: 'Nota de rodapé da seção', max: 200, linhas: 2 },
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
      rotuloBusca: { tipo: 'texto', rotulo: 'Rótulo da busca', max: 50 },
      placeholderBusca: { tipo: 'texto', rotulo: 'Exemplo dentro do campo', max: 60 },
      botaoGeo: { tipo: 'texto', rotulo: 'Botão de localização', max: 30 },
      botaoGeoCarregando: { tipo: 'texto', rotulo: '…enquanto localiza', max: 30 },
      geoNegado: { tipo: 'longo', rotulo: 'Se a pessoa negar a localização', max: 160, linhas: 2 },
      sugestaoTitulo: { tipo: 'texto', rotulo: 'Título do card de sugestão', max: 30 },
      sugestaoPergunta: { tipo: 'texto', rotulo: 'Pergunta do card', max: 80 },
      sugestaoNao: { tipo: 'texto', rotulo: 'Recusar a sugestão', max: 30 },
      sugestaoSim: { tipo: 'texto', rotulo: 'Confirmar a sugestão', max: 30 },
      sugestaoLonge: { tipo: 'longo', rotulo: 'Quando a cidade está longe', max: 140, linhas: 2 },
      dicaBusca: { tipo: 'longo', rotulo: 'Dica embaixo da busca', max: 120, linhas: 2 },
      vazio: { tipo: 'longo', rotulo: 'Busca sem resultado', max: 140, linhas: 2 },
      proximasTitulo: { tipo: 'texto', rotulo: 'Título das cidades próximas', max: 40 },
      abertosTitulo: { tipo: 'texto', rotulo: 'Título dos grupos abertos', max: 40 },
      mapaTitulo: { tipo: 'texto', rotulo: 'Título do mapa', max: 40 },
      mapaDica: { tipo: 'longo', rotulo: 'Dica do mapa', max: 100, linhas: 2 },
      mapaLegendaAberto: { tipo: 'texto', rotulo: 'Legenda: grupo aberto', max: 24 },
      verTodos: { tipo: 'texto', rotulo: 'Botão: ver todos', max: 40 },
      abertos: { tipo: 'texto', rotulo: 'Sufixo do contador', max: 30, ajuda: 'O número entra sozinho na frente.' },
      folhaTitulo: { tipo: 'texto', rotulo: 'Título da folha de busca', max: 40 },
      folhaFechar: { tipo: 'texto', rotulo: 'Botão: fechar a folha', max: 20 },
      listaTitulo: { tipo: 'texto', rotulo: 'Título da lista', max: 40 },
      emBreve: { tipo: 'texto', rotulo: 'Selo: em breve', max: 20 },
      cheio: { tipo: 'texto', rotulo: 'Selo: cheio', max: 20 },
      aberto: { tipo: 'texto', rotulo: 'Selo: aberto', max: 20 },
      avisoEmBreve: { tipo: 'longo', rotulo: 'Explicação do "em breve"', max: 200, linhas: 2 },
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
    grupo: 'Página',
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

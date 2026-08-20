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
            ajuda: 'familia · liberdade · segurança · producao · imposto · fe',
          },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 30 },
          texto: { tipo: 'longo', rotulo: 'Descrição', max: 180, linhas: 3 },
        },
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
      vazio: { tipo: 'longo', rotulo: 'Busca sem resultado', max: 140, linhas: 2 },
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
        min: 2,
        max: 6,
        item: {
          id: ID,
          numero: { tipo: 'texto', rotulo: 'Número', max: 2 },
          titulo: { tipo: 'texto', rotulo: 'Título', max: 40 },
          texto: { tipo: 'longo', rotulo: 'Descrição', max: 120, linhas: 2 },
        },
      },
      privacidade: { tipo: 'texto', rotulo: 'Frase de privacidade', max: 60 },
      botaoEscolherFoto: { tipo: 'texto', rotulo: 'Botão: escolher foto', max: 30 },
      dicaSalvar: { tipo: 'longo', rotulo: 'Como salvar no celular', max: 140, linhas: 2 },
      avisoInstagram: { tipo: 'longo', rotulo: 'Aviso do navegador do Instagram', max: 160, linhas: 2 },
      erroFormato: { tipo: 'longo', rotulo: 'Erro: formato não suportado', max: 200, linhas: 2 },
      erroPequena: { tipo: 'longo', rotulo: 'Aviso: foto pequena', max: 140, linhas: 2 },
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

  rodape: {
    rotulo: 'Rodapé',
    grupo: 'Página',
    nota: 'Os dados legais (CNPJ, responsável, comitê) ficam em variável de ambiente, e mudá-los exige deploy. É de propósito: CNPJ errado em propaganda eleitoral é exposição jurídica.',
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

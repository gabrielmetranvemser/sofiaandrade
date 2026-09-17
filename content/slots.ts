/**
 * OS ESPAÇOS DE IMAGEM DA PÁGINA.
 *
 * Um slot é um lugar que aceita imagem, com chave estável. Vive em
 * código, não no banco: um slot só existe se algum componente o
 * renderiza. Adicionar slot é mudança de layout; trocar a imagem do
 * slot é ação do admin.
 *
 * Os requisitos declarados aqui são exatamente o que o painel imprime
 * na tela — "instruções de tamanho e formato" não é texto solto, é
 * este objeto. E agora são também o que o RECORTADOR obedece: a
 * proporção vira a janela de corte e o mínimo vira o tamanho de saída.
 * Por isso toda imagem que sai do painel já nasce válida.
 *
 * A ORDEM DA LISTA É A ORDEM DA PÁGINA. `SLOTS_POR_ONDE` preserva a
 * ordem de inserção, então quem abre o painel percorre os espaços na
 * mesma sequência em que o visitante percorre o site.
 */

export interface Slot {
  chave: string
  rotulo: string
  onde: string
  /** Proporção esperada. `null` = livre (recorte sem fundo, print). */
  proporcao: string | null
  larguraMin: number
  alturaMin: number
  /** Exige canal alpha — foto recortada, logo, moldura. */
  alpha?: boolean
  /** Dimensão EXATA, não mínima. Só molduras. */
  exata?: boolean
  balde?: 'midia' | 'molduras'
  nota?: string
  /** Arquivo em /public usado enquanto o slot não tem imagem. */
  padrao?: string
}

export const SLOTS: Slot[] = [
  // ── Marca ──────────────────────────────────────────────────────
  // O símbolo e o ícone do navegador. Ficam PRIMEIRO na lista porque
  // são os únicos espaços que aparecem em toda página do site, e não
  // numa seção só.
  {
    chave: 'marca.simbolo',
    rotulo: 'Símbolo da marca',
    onde: 'Marca',
    proporcao: null,
    larguraMin: 256,
    alturaMin: 190,
    alpha: true,
    nota: 'O ícone ao lado do nome, no topo de toda página. PNG com fundo transparente — ele fica sobre o azul e sobre o branco. Sem imagem aqui, o site usa o símbolo desenhado em código, que nunca corta.',
  },
  {
    chave: 'marca.favicon',
    rotulo: 'Ícone do navegador',
    onde: 'Marca',
    proporcao: '1/1',
    larguraMin: 512,
    alturaMin: 512,
    nota: 'Quadrado. É o ícone da aba do navegador e o do atalho na tela inicial do celular. Desenho simples: ele será visto com 16 pixels de lado.',
  },
  // ⚠️ A PROPORÇÃO NÃO É 16:9, e quem chega com uma arte de story ou
  //    de post vai estranhar. 1200×630 é o formato que o WhatsApp, o
  //    Facebook e o Telegram recortam para mostrar; mandar 16:9 faz o
  //    aplicativo aparar por conta própria, quase sempre cortando
  //    justamente o número. O recortador do painel resolve isso: ele
  //    abre a imagem nesta janela e deixa escolher o que fica.
  {
    chave: 'marca.cartaoLink',
    rotulo: 'Cartão do link (WhatsApp)',
    onde: 'Marca',
    proporcao: '1200/630',
    larguraMin: 1200,
    alturaMin: 630,
    nota: 'A imagem que aparece quando alguém cola o link do site no WhatsApp, no Facebook ou no Telegram. Deitada, com o rosto e o número no meio — as bordas são aparadas em telas pequenas. Sem imagem aqui, o site desenha o cartão sozinho, com o nome e o número. O WhatsApp guarda o cartão de um link por semanas: trocar aqui não muda os links já enviados.',
  },

  // ── Página de entrada ──────────────────────────────────────────
  // A página que abre para quem toca no anúncio de uma cidade. As duas
  // fotos têm substituta: enquanto ninguém subir nada aqui, a página usa
  // o Retrato de fechamento e o Retrato de "Quem é Sofia".
  {
    chave: 'entrada.foto',
    rotulo: 'Foto redonda do topo',
    onde: 'Página de entrada',
    proporcao: '1/1',
    larguraMin: 400,
    alturaMin: 400,
    nota: 'O rosto dela bem de perto, olhando para a câmera. Aparece num círculo pequeno ao lado de "Grupo oficial da campanha" — é o rosto que a pessoa acabou de ver no anúncio. Sem imagem aqui, a página usa o Retrato de fechamento.',
  },
  {
    chave: 'entrada.retrato',
    rotulo: 'Foto de "Quem é a Sofia"',
    onde: 'Página de entrada',
    proporcao: '4/5',
    larguraMin: 800,
    alturaMin: 1000,
    nota: 'Vertical, sobre o fundo azul da segunda dobra, com uma borda amarela deslocada atrás. Sem imagem aqui, a página usa o Retrato de "Quem é Sofia" — a foto do espetinho.',
  },

  // ── Primeira dobra ─────────────────────────────────────────────
  {
    chave: 'hero.retrato',
    rotulo: 'Foto da candidata',
    onde: 'Primeira dobra',
    proporcao: null,
    larguraMin: 1200,
    alturaMin: 1500,
    alpha: true,
    nota: 'PNG recortado, sem fundo. É a única imagem em que o recorte importa: ela fica sobre o azul. O recortador aqui só enquadra — quem tira o fundo é o editor de imagem, antes.',
  },

  // ── Quem é Sofia ───────────────────────────────────────────────
  {
    chave: 'origem.retrato',
    rotulo: 'Retrato',
    onde: 'Quem é Sofia',
    proporcao: '4/5',
    larguraMin: 1000,
    alturaMin: 1250,
    nota: 'Vertical. A foto do espetinho com a bandeira é a indicada: é a história de origem numa imagem.',
  },
  {
    chave: 'origem.detalhe.1',
    rotulo: 'Detalhe 1',
    onde: 'Quem é Sofia',
    proporcao: '1/1',
    larguraMin: 800,
    alturaMin: 800,
    nota: 'A cozinha de Iata — filtro de barro e parede de tábua. Prova "a luz acabava às nove" sem legenda.',
  },
  {
    chave: 'origem.detalhe.2',
    rotulo: 'Detalhe 2',
    onde: 'Quem é Sofia',
    proporcao: '1/1',
    larguraMin: 800,
    alturaMin: 800,
    nota: 'A selfie na churrasqueira. O rosto e o ofício no mesmo quadro.',
  },

  // ── O álbum ────────────────────────────────────────────────────
  // Oito fotos de papel. O mínimo é baixo de propósito: o acervo de
  // família é analógico, fotografado de celular, e algumas não passam
  // de 500px. Elas aparecem pequenas na galeria — exigir 1200 aqui
  // seria barrar justamente o material que o documento chama de ouro.
  ...Array.from({ length: 8 }, (_, i) => ({
    chave: `album.${i + 1}`,
    rotulo: `Foto ${i + 1}`,
    onde: 'O álbum',
    proporcao: '3/4',
    larguraMin: 600,
    alturaMin: 800,
    nota:
      i === 0
        ? 'Fotos de papel. Recorte na borda do papel e endireite antes de subir — várias do acervo estão giradas 90°.'
        : undefined,
  })),

  // ── A rua ──────────────────────────────────────────────────────
  {
    chave: 'rua.1',
    rotulo: 'Foto 1 — a mais forte',
    onde: 'A rua',
    proporcao: '4/3',
    larguraMin: 1000,
    alturaMin: 750,
    nota: 'Sofia no carro de som. É a prova visual da manchete da página.',
  },
  {
    chave: 'rua.2',
    rotulo: 'Foto 2',
    onde: 'A rua',
    proporcao: '4/3',
    larguraMin: 1000,
    alturaMin: 750,
    nota: 'A bandeira na pista, todos de máscara. Data a cena na pandemia sem precisar escrever a data.',
  },
  {
    chave: 'rua.3',
    rotulo: 'Foto 3',
    onde: 'A rua',
    proporcao: '4/3',
    larguraMin: 1000,
    alturaMin: 750,
    nota: '⚠️ Confira a marca d’água: as melhores fotos da rua são de terceiros e precisam de autorização.',
  },

  // ── Minhas bandeiras ───────────────────────────────────────────
  {
    chave: 'valores.imagem',
    rotulo: 'Foto de apoio',
    onde: 'Minhas bandeiras',
    proporcao: '3/4',
    larguraMin: 800,
    alturaMin: 1066,
    nota: '⚠️ Decisão de campanha. Foto com arma pesa em classificador de rede social e o custo cai no alcance orgânico — que é o motor desta página. A camiseta PRO ARMAS entrega o mesmo posicionamento sem o risco.',
  },

  // ── O que já foi feito ─────────────────────────────────────────
  // Os três espaços de foto de entrega saíram. As entregas são LEIS, e
  // não existe foto de uma lei — foto ilustrativa ao lado de "Lei
  // 3.285/2025" enfraquece o único bloco documental da página. No lugar
  // entra o registro público, que é o que o documento de campanha pede.
  {
    chave: 'provas.documento',
    rotulo: 'Print do registro público',
    onde: 'O que já foi feito',
    proporcao: null,
    larguraMin: 900,
    alturaMin: 500,
    nota: 'Captura de tela do SAPL com as leis sancionadas. É prova documental: separa candidata de influencer. Fica clicável para o portal da Câmara.',
  },

  // ── Prova social ───────────────────────────────────────────────
  // Proporção livre porque print de comentário não tem proporção: os
  // do acervo variam de 1179×335 a 1179×1074. O recortador deixa
  // escolher a proporção, que é o que serve para aparar o "Responder"
  // do rodapé do print.
  ...Array.from({ length: 6 }, (_, i) => ({
    chave: `social.comentario.${i + 1}`,
    rotulo: `Comentário ${i + 1}`,
    onde: 'Prova social',
    proporcao: null,
    larguraMin: 600,
    alturaMin: 160,
    nota:
      i === 0
        ? '⚠️ Jurídico: borre a foto de perfil. Mantenha o @ só de quem autorizou o uso.'
        : undefined,
  })),
  {
    chave: 'social.ataque.1',
    rotulo: 'Ataque 1',
    onde: 'Prova social',
    proporcao: null,
    larguraMin: 600,
    alturaMin: 160,
    nota: '⚠️ Aqui borre NOME e foto. Não se dá palanque a quem ataca, e o risco de ação por uso de imagem é maior justamente neste par.',
  },
  {
    chave: 'social.ataque.2',
    rotulo: 'Ataque 2',
    onde: 'Prova social',
    proporcao: null,
    larguraMin: 600,
    alturaMin: 160,
  },

  // ── Chamada final ──────────────────────────────────────────────
  {
    chave: 'cta.retrato',
    rotulo: 'Retrato de fechamento',
    onde: 'Chamada final',
    proporcao: '4/5',
    larguraMin: 1000,
    alturaMin: 1250,
    nota: 'Olhando para a câmera, luz natural. É a última imagem da página — o rosto que fica associado ao número.',
  },

  // ── Gerador de filtro ──────────────────────────────────────────
  {
    chave: 'moldura.story',
    rotulo: 'Moldura de story',
    onde: 'Gerador de filtro',
    proporcao: '9/16',
    larguraMin: 1080,
    alturaMin: 1920,
    alpha: true,
    exata: true,
    balde: 'molduras',
    nota: 'PNG 1080×1920 com transparência no miolo. ⚠️ Exigência legal: o CNPJ da campanha precisa estar legível na arte.',
    padrao: '/molduras/story-apoio.svg',
  },
  {
    chave: 'moldura.perfil',
    rotulo: 'Moldura de perfil',
    onde: 'Gerador de filtro',
    proporcao: '1/1',
    larguraMin: 1080,
    alturaMin: 1080,
    alpha: true,
    exata: true,
    balde: 'molduras',
    nota: 'PNG 1080×1080 com transparência no miolo. ⚠️ CNPJ obrigatório na arte.',
    padrao: '/molduras/perfil-apoio.svg',
  },

  // ── Os apoiadores de exemplo ───────────────────────────────────
  // As fotos que giram DENTRO das duas molduras, na seção do site que
  // convida a usar o filtro. Substituem a silhueta cinza desenhada em
  // código — que mostra onde a foto entra, mas não mostra o resultado.
  //
  // ⚠️ SÃO PARES, E O PAR É A UNIDADE. Cada apoiador tem as duas fotos,
  //    story e perfil, e as duas molduras trocam JUNTAS: quem olha vê a
  //    mesma pessoa nos dois formatos, que é o que faz o exemplo
  //    funcionar como exemplo. Par incompleto simplesmente não entra na
  //    roda — ver `resolverExemplos` em lib/molduras.ts. Não é um
  //    erro a corrigir: é o que permite subir o apoiador 1 hoje e o 2
  //    na semana que vem sem a seção quebrar no meio do caminho.
  //
  // ⚠️ MÍNIMOS BAIXOS DE PROPÓSITO. Estas fotos aparecem com menos de
  //    300px de largura na tela, e a origem delas é o rolo da câmera de
  //    um apoiador — muitas chegam por WhatsApp, já comprimidas. Exigir
  //    1080 aqui barraria exatamente o material que a seção quer.
  ...Array.from({ length: 6 }, (_, i) => [
    {
      chave: `filtro.exemplo.${i + 1}.story`,
      rotulo: `Apoiador ${i + 1} · story`,
      onde: 'Gerador de filtro',
      proporcao: '9/16',
      larguraMin: 540,
      alturaMin: 960,
      nota:
        i === 0
          ? 'De três a seis apoiadores, cada um com as DUAS fotos. Rosto no terço de cima: a moldura escurece a metade de baixo. Peça autorização antes de subir a foto de alguém.'
          : undefined,
    },
    {
      chave: `filtro.exemplo.${i + 1}.perfil`,
      rotulo: `Apoiador ${i + 1} · perfil`,
      onde: 'Gerador de filtro',
      proporcao: '1/1',
      larguraMin: 540,
      alturaMin: 540,
      nota:
        i === 0
          ? 'A mesma pessoa da foto de story ao lado, enquadrada em quadrado. Sem as duas, o apoiador não entra na roda.'
          : undefined,
    },
  ]).flat(),
]

export const SLOTS_POR_CHAVE: Record<string, Slot> = Object.fromEntries(
  SLOTS.map((s) => [s.chave, s]),
)

/**
 * DE QUAL SEÇÃO DO PAINEL CADA ESPAÇO FAZ PARTE.
 *
 * O painel deixou de ser organizado por TIPO (uma aba de textos, outra
 * de imagens) e passou a ser organizado por SEÇÃO — porque é assim que
 * quem edita pensa: "quero mexer em Quem é Sofia", e não "quero mexer
 * numa imagem". Para juntar texto, imagem e vídeo na mesma tela, cada
 * espaço precisa dizer a que seção pertence.
 *
 * ⚠️ POR PREFIXO, e não um campo em cada objeto. A chave do espaço já
 *    carrega a informação (`origem.retrato` é de `origem`), e repetir
 *    isso 25 vezes seria 25 oportunidades de divergir. As três exceções
 *    estão declaradas primeiro, pela chave inteira: a marca e o ícone
 *    não pertencem a nenhuma seção da página — aparecem em todas — e
 *    por isso moram nas telas de Identidade.
 */
const SECAO_DO_ESPACO: Record<string, string> = {
  'marca.simbolo': 'candidata',
  'marca.favicon': 'meta',
  'marca.cartaoLink': 'meta',
  entrada: 'entrada',
  hero: 'hero',
  origem: 'origem',
  album: 'album',
  rua: 'rua',
  valores: 'valores',
  provas: 'provas',
  social: 'social',
  cta: 'ctaFinal',
  moldura: 'filtro',
  filtro: 'filtro',
}

export function secaoDoEspaco(chave: string): string | null {
  return SECAO_DO_ESPACO[chave] ?? SECAO_DO_ESPACO[chave.split('.')[0]] ?? null
}

/** Agrupados pela seção do painel a que pertencem. */
export const SLOTS_POR_SECAO = SLOTS.reduce<Record<string, Slot[]>>((acc, s) => {
  const secao = secaoDoEspaco(s.chave)
  if (secao) (acc[secao] ??= []).push(s)
  return acc
}, {})

/** Agrupados por seção da página, para a galeria do painel. */
export const SLOTS_POR_ONDE = SLOTS.reduce<Record<string, Slot[]>>((acc, s) => {
  ;(acc[s.onde] ??= []).push(s)
  return acc
}, {})

/**
 * O tamanho que o recortador deve produzir para um slot.
 *
 * Regra: nunca abaixo do mínimo (senão o servidor recusa) e nunca
 * acima de 2400 (o servidor reduz para lá de qualquer jeito, e subir
 * pixel que será jogado fora só custa dados do celular de quem edita).
 * Entre os dois, manda a resolução real da área escolhida.
 */
export const TETO_RECORTE = 2400

export function tamanhoDeSaida(
  slot: Slot,
  larguraDaArea: number,
  alturaDaArea: number,
): { largura: number; altura: number; ampliando: boolean } {
  if (slot.exata) {
    return {
      largura: slot.larguraMin,
      altura: slot.alturaMin,
      ampliando: larguraDaArea < slot.larguraMin,
    }
  }

  const escalaMinima = Math.max(
    slot.larguraMin / larguraDaArea,
    slot.alturaMin / alturaDaArea,
    // Área menor que o mínimo: amplia até caber. Ampliar é ruim, e a
    // tela avisa — mas é melhor que barrar a única foto que existe.
  )
  const escalaTeto = TETO_RECORTE / Math.max(larguraDaArea, alturaDaArea)
  const escala = escalaMinima > 1 ? escalaMinima : Math.min(1, escalaTeto)

  return {
    largura: Math.max(slot.larguraMin, Math.round(larguraDaArea * escala)),
    altura: Math.max(slot.alturaMin, Math.round(alturaDaArea * escala)),
    ampliando: escalaMinima > 1,
  }
}

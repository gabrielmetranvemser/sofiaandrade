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
]

export const SLOTS_POR_CHAVE: Record<string, Slot> = Object.fromEntries(
  SLOTS.map((s) => [s.chave, s]),
)

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

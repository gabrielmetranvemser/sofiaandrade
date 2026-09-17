/**
 * COPY DA CAMPANHA — arquivo único.
 *
 * Tudo que é texto vive aqui. Nenhum componente escreve frase solta.
 * Isso é o que o plano chama de separar "motor" de "maquiagem":
 * em 2028 troca-se este arquivo e o site é de outra pessoa.
 *
 * ⚠️  SOBRE OS CAMPOS `id`
 *     Toda lista de OBJETO carrega um `id` estável. Não é enfeite:
 *     as chaves de React vinham do próprio conteúdo (`key={item.ano}`,
 *     `key={item.numero}`, `key={n.texto}`). No dia em que o painel
 *     deixar alguém digitar "01" duas vezes ou repetir um ano, o React
 *     embaralha ou some com itens. O `id` nunca é exibido; existe só
 *     para dar identidade ao item.
 *
 *     Listas de STRING não têm `id` de propósito — string não tem
 *     identidade, e ali a chave por índice é a correta.
 *
 * ⚠️  MARCADORES
 *     Toda linha marcada com  // ⚠️ CONFIRMAR  depende de dado que a
 *     campanha ainda não entregou. Ver PENDENCIAS.md.
 *     NÃO PUBLICAR com marcador pendente em número, CNPJ ou endereço.
 */

export const candidata = {
  nome: 'Sofia Andrade',
  numero: '2233',
  cargo: 'Deputada Federal',
  estado: 'Rondônia',
  uf: 'RO',
  partido: 'PL',
  partidoExtenso: 'Partido Liberal',
  instagram: 'https://instagram.com/sofiaandrade.ro',
  instagramHandle: '@sofiaandrade.ro',
  whatsapp: 'https://wa.me/5569900000000', // ⚠️ CONFIRMAR
} as const

export const meta = {
  titulo: 'Sofia Andrade 2233 — Deputada Federal por Rondônia',
  tituloCurto: 'Sofia Andrade 2233',
  descricao:
    'Sofia Andrade, 2233, candidata a Deputada Federal por Rondônia pelo PL. ' +
    'Vereadora de Porto Velho, preside a Comissão de Segurança Pública. ' +
    'Entre no grupo de WhatsApp da sua cidade e coloque o 2233 na sua foto.',
  palavrasChave: [
    'Sofia Andrade',
    'Sofia Andrade 2233',
    '2233',
    'deputada federal Rondônia',
    'PL Rondônia',
    'eleições 2026 Rondônia',
    'candidata deputada federal RO',
  ],
  og: {
    titulo: 'SOFIA ANDRADE · 2233',
    subtitulo: 'Deputada Federal por Rondônia',
    chamada: 'Mandaram fechar. Eu fui pra rua.',
  },
  /**
   * O código do Google Search Console.
   *
   * ⚠️ VAZIO É O ESTADO NORMAL. Ele só é preenchido se a verificação
   *    de propriedade for feita pela meta tag; quem verificar pelo DNS
   *    (o caminho recomendado, porque vale para o domínio inteiro e
   *    não se perde numa republicação) deixa isto em branco para
   *    sempre — e o site não emite tag nenhuma.
   *
   * Não é segredo: a tag fica visível no HTML de qualquer visitante.
   * Ela não dá acesso a nada — só prova ao Google que quem a colocou
   * ali manda no site.
   *
   * Preenchido em Painel ▸ Buscas, e não no editor de "Busca e
   * compartilhamento", porque lá é texto de campanha e aqui é um
   * código que se cola uma vez e não se lê nunca mais.
   */
  verificacaoGoogle: '',
} as const

/**
 * Metadata por página. Antes estava hardcoded em cada `export const
 * metadata`, então mudar o título da aba exigia deploy.
 */
export const paginas = {
  filtro: {
    tituloAba: 'Coloque o 2233 na sua foto',
    descricao:
      'Gere sua foto de perfil e seu story com a moldura da campanha. ' +
      'Sem cadastro. Sua foto não sai do seu aparelho.',
    ogTitulo: 'Coloque o 2233 na sua foto · Sofia Andrade',
    ogDescricao: 'Sem cadastro. Sua foto não sai do seu aparelho.',
  },
  grupos: {
    tituloAba: 'Grupos de WhatsApp por município',
    descricao:
      'Encontre o grupo de WhatsApp da campanha na sua cidade. ' +
      '52 municípios de Rondônia, um grupo para cada.',
    ogTitulo: 'Grupos de WhatsApp · Sofia Andrade 2233',
    ogDescricao: 'Um grupo para cada um dos 52 municípios de Rondônia.',
  },
  privacidade: {
    tituloAba: 'Política de Privacidade',
    descricao:
      'Como esta página trata (e não trata) seus dados: a foto do filtro não sai do seu aparelho ' +
      'e a localização é usada no aparelho e descartada.',
    ogTitulo: 'Política de Privacidade · Sofia Andrade 2233',
    ogDescricao: 'A foto do filtro não sai do seu aparelho.',
  },
} as const

// Objeto, e não array solto: toda seção do CMS precisa ser objeto
// (a constraint `jsonb_typeof(dados) = 'object'` existe para impedir
// que uma ação forjada grave um tipo inesperado).
export const navegacao = {
  itens: [
    { id: 'nav-01', rotulo: 'Quem é Sofia', href: '/#origem' },
    { id: 'nav-02', rotulo: 'Compromissos', href: '/#futuro' },
    { id: 'nav-03', rotulo: 'Grupos de WhatsApp', href: '/#grupos' },
    { id: 'nav-04', rotulo: 'Coloque o 2233', href: '/filtro' },
  ],
} as const

export const ctas = {
  grupo: 'Entrar no grupo da minha cidade',
  grupoCurto: 'Entrar no grupo',
  // Usado só quando a cidade veio no link do anúncio: o nome dela entra
  // logo depois, sozinho. "Entrar no grupo de" + "Porto Velho".
  grupoDe: 'Entrar no grupo de',
  filtro: 'Colocar o 2233 na minha foto',
  filtroCurto: 'Colocar o 2233',
  compartilhar: 'Compartilhar esta página',
  instagram: 'Seguir no Instagram',
  // Texto exibido no lugar dos CTAs a partir do silêncio eleitoral.
  silencio:
    'Período de silêncio eleitoral. Os canais de campanha estão suspensos até o fim da votação.',
} as const

// ─────────────────────────────────────────────────────────────
// 1. HERO
// ─────────────────────────────────────────────────────────────
export const hero = {
  etiqueta: 'Candidata a Deputada Federal',
  titulo: ['Mandaram fechar.', '[[Eu fui pra rua.]]'],
  subtitulo:
    'Quando o decreto mandou fechar o comércio, eu tinha um carrinho de espetinho na calçada da ' +
    'Avenida Rio Madeira. Fui pra rua e falei o que pensava. Hoje sou vereadora de Porto Velho.',
  numeroLegenda: 'Escreva 2233 na urna',
  // A assinatura que está na arte oficial da campanha, abaixo do
  // número. Veio da capa que a campanha mandou junto com os ajustes.
  // Apagar aqui tira ela da página — não quebra nada.
  lema: 'Fé, coragem e liberdade.',
  // O botão do grupo de WhatsApp. Com cidade no link, vira "Entrar no
  // grupo de <cidade>" (Botões do site ▸ grupoDe).
  ctaPrimario: ctas.grupo,
  // ⚠️ ERA "Conhecer minha história" → #origem e NÃO APARECIA em lugar
  //    nenhum: a primeira dobra desenhava o botão do filtro com texto
  //    fixo. Agora o campo manda de verdade, e o padrão é o que a página
  //    já mostrava — o filtro de foto.
  ctaSecundario: ctas.filtro,
  ctaSecundarioHref: '/filtro',
  // Uma linha embaixo dos botões dizendo o que é o grupo. Vazio = some.
  notaGrupo: 'Agenda, carreatas e avisos da campanha no seu WhatsApp.',
  rodapeHero: 'Vereadora em Porto Velho. Candidata por Rondônia.',
} as const

// ─────────────────────────────────────────────────────────────
// 2. ORIGEM
// ─────────────────────────────────────────────────────────────
export const origem = {
  etiqueta: 'De onde eu vim',
  titulo: 'Cheguei onde a luz [[acabava às nove.]]',
  paragrafos: [
    'Nasci em Cacoal. Mas fui criada em Iata, um distrito de Guajará-Mirim que a maioria dos ' +
      'brasileiros nunca ouviu falar. Cheguei lá numa época em que a luz só funcionava das seis da ' +
      'manhã às nove da noite. Depois das nove, era lamparina, vela e escuridão.',
    'De Iata fui pra Guajará-Mirim. De Guajará-Mirim, pra Porto Velho. Lá eu tinha um carrinho de ' +
      'espetinho na calçada da Avenida Rio Madeira, na frente da casa dos meus pais.',
    'Aí veio a pandemia. O decreto mandou fechar o comércio, e eu me vi tendo que mandar pra rua ' +
      'pais e mães de família que trabalhavam comigo. Fiz o que achei certo: fui pra rua também. ' +
      'Fiz vídeo, falei o que pensava. Sem script, sem assessor, sem partido na frente.',
    'Tinha 200, 300 seguidores. De repente eram milhares compartilhando. E não foi o meu vídeo que ' +
      'viralizou: foi a história de cada um deles. Cada mãe que ficou sem renda, cada pai que não ' +
      'sabia como pagar a conta. Essa gente me encontrou, e eu encontrei o que tinha pra fazer.',
  ],
  citacao: 'Ninguém tem o direito de proibir uma pessoa de trabalhar.',

  /**
   * O vídeo em que ela conta a própria história.
   *
   * ⚠️ Vazio de propósito: a gravação não estava finalizada quando esta
   *    seção foi montada. Com o campo em branco a coluna de fotos fica
   *    exatamente como está — o bloco de vídeo não reserva espaço nem
   *    aparece como "em breve". Colar o endereço no painel liga tudo.
   *
   * A LINHA DO TEMPO SAIU DAQUI. Eram quatro cartões (2020, 2022, 2024,
   * 2026) repetindo, em tópico, os mesmos fatos que os parágrafos acima
   * já contam em primeira pessoa — e um deles carregava o número de
   * votos de 2022, que era o dado não confirmado da página. A campanha
   * pediu a remoção; o que ficou no lugar é o vídeo.
   */
  video: { titulo: '', url: '', formato: 'deitado', opcoes: {
    controles: true,
    inicio: 'clique',
    telaCheia: true,
    carregamento: 'ao-clicar',
    botaoRotulo: '',
    botaoDestino: '',
  } },
} as const

// ─────────────────────────────────────────────────────────────
// 3. PROBLEMA
// ─────────────────────────────────────────────────────────────
export const problema = {
  etiqueta: 'O que está errado',
  titulo: 'Você vive isso [[todo dia.]]',
  intro:
    'Você sabe do que eu estou falando. Enquanto Brasília discute o que não resolve a sua vida, ' +
    'o povo que trabalha e paga a conta fica esperando.',
  itens: [
    {
      id: 'item-01',
      numero: '01',
      titulo: 'A conta de luz que não para de subir',
      texto:
        'A Energisa cobra, o serviço falha, e ninguém responde. Rondônia paga uma das energias mais ' +
        'caras do país e continua no escuro quando chove.',
    },
    {
      id: 'item-02',
      numero: '02',
      titulo: 'A violência que bate na sua porta',
      texto:
        'Rondônia tem índice de violência acima da média nacional. O Estado promete, não entrega, ' +
        'e o cidadão fica sem proteção.',
    },
    {
      id: 'item-03',
      numero: '03',
      titulo: 'O custo de tudo',
      texto:
        'A gasolina, o gás, o rancho do mês. Você trabalha mais e leva menos pra casa. E quem ' +
        'deveria defender o seu dinheiro gasta com show de artista que faz apologia ao crime.',
    },
    {
      id: 'item-04',
      numero: '04',
      titulo: 'O pedágio que não entrega asfalto',
      texto:
        'A BR-364 tem sete pontos de cobrança. O produtor paga, o caminhoneiro paga, o preço do ' +
        'alimento sobe — e quem fica com a conta é você.',
    },
  ],
  video: { titulo: '', url: '', formato: 'deitado', opcoes: {
    controles: true,
    inicio: 'clique',
    telaCheia: true,
    carregamento: 'ao-clicar',
    botaoRotulo: '',
    botaoDestino: '',
  } },
} as const

// ─────────────────────────────────────────────────────────────
// 4. VALORES
// ─────────────────────────────────────────────────────────────
export const valores = {
  etiqueta: 'Minhas bandeiras',
  titulo: 'Cristã. Patriota. [[Armamentista.]]',
  intro:
    'Não escondo o que penso, e escrevo antes da eleição para você poder cobrar depois dela. ' +
    'Cada bandeira aqui tem uma lei, um projeto ou uma ação real por trás.',
  itens: [
    {
      id: 'item-05',
      chave: 'liberdade',
      titulo: 'Liberdade de trabalhar',
      texto:
        'Contra qualquer governo que proíba o cidadão de trabalhar e empreender. O Estado existe ' +
        'pra servir quem produz, não pra atrapalhar.',
    },
    {
      id: 'item-06',
      chave: 'lei',
      titulo: 'Leis mais rígidas',
      texto:
        'Castração química para estuprador, pena mais dura para crime violento e redução da ' +
        'maioridade penal. Quem comete crime grave paga na altura do que fez.',
    },
    {
      id: 'item-07',
      chave: 'armas',
      titulo: 'Armas para quem é de bem',
      texto:
        'Quem trabalha, sustenta família e não tem ficha criminal tem o direito de se armar e ' +
        'proteger os seus. Segurança não pode depender só do Estado.',
    },
    {
      id: 'item-08',
      chave: 'familia',
      titulo: 'Fé e família',
      texto:
        'Defesa da vida desde a concepção e do direito dos pais de educar os filhos nos valores ' +
        'que escolheram. Contra ideologia de gênero nas escolas.',
    },
    {
      id: 'item-09',
      chave: 'producao',
      titulo: 'Defesa do agro',
      texto:
        'Menos burocracia e menos imposto pra quem alimenta o Brasil. O agro sustenta Rondônia e ' +
        'precisa de representante em Brasília.',
    },
    {
      id: 'item-10',
      chave: 'imposto',
      titulo: 'Fiscalização de verdade',
      texto:
        'Cada real que sai do seu bolso tem que virar serviço, não mordomia. Transparência nas ' +
        'contratações, nos gastos e nas decisões de quem governa.',
    },
  ],
  // A frase que fecha a seção, ao lado da foto de apoio. É a linha do
  // documento de campanha, inteira — as quatro palavras que o público
  // já repete sozinho.
  frase: 'Cristã. Patriota. Armamentista. Anticomunista.',
} as const

// ─────────────────────────────────────────────────────────────
// 4b. CENA DA BANDEIRA
//     Três telas pintadas pela rolagem, na ordem da bandeira.
//     A ordem das cores é fixa — verde, amarelo, azul — porque é a
//     bandeira. Por isso são três campos fixos e não uma lista: não
//     existe uma quarta cor para acrescentar.
//     Fica entre Valores (verde) e Provas (azul): a cena começa na
//     cor em que a seção anterior termina e acaba na cor em que a
//     seguinte começa. A emenda some.
// ─────────────────────────────────────────────────────────────
export const cena = {
  verde: {
    etiqueta: 'Rondônia trabalha',
    titulo: 'Aqui a porta abre [[às cinco.]]',
    texto: 'Agro, comércio, gente de carrinho na calçada. É esse povo que sustenta o estado.',
  },
  amarelo: {
    etiqueta: 'Aí mandaram parar',
    titulo: 'E eu [[fui pra rua.]]',
    texto: 'Peguei o celular na calçada e falei o que milhares de pessoas estavam sentindo e não tinham onde dizer.',
  },
  azul: {
    etiqueta: 'Por isso o 2233',
    titulo: 'Agora é [[Brasília.]]',
    texto: 'Com a mesma convicção de quando eu estava atrás da churrasqueira: ninguém proíbe uma pessoa de trabalhar.',
  },
} as const

// ─────────────────────────────────────────────────────────────
// 5. PROVAS
// Os números e as leis vêm do registro público da Câmara Municipal
// de Porto Velho. O único item ainda por confirmar está marcado.
// ─────────────────────────────────────────────────────────────
export const provas = {
  etiqueta: 'O que eu fiz',
  titulo: 'Pesquisa [[o que eu fiz.]]',
  intro:
    'Qualquer um sobe num palanque e fala bonito. O que separa candidato sério de vendedor de ' +
    'promessa é uma coisa só: o que já está feito e pode ser conferido no registro público.',
  /**
   * A FAIXA DE NÚMEROS SAIU DAQUI, a pedido da campanha.
   *
   * Eram quatro cartões grandes — 9 leis, 1 comissão, 7 projetos,
   * 14.634 votos — ocupando a primeira tela da seção. Dois deles já
   * viviam em outro lugar da página (a faixa corrida diz "9 leis
   * sancionadas"; a intro diz o que é a comissão), e o quarto era o
   * único dado da página que ninguém tinha confirmado.
   *
   * No lugar entra o vídeo: prestação de contas dita por ela pesa mais
   * que quatro algarismos grandes, e o registro público lá embaixo
   * continua sendo a prova que o leitor confere sozinho.
   */
  video: { titulo: '', url: '', formato: 'deitado', opcoes: {
    controles: true,
    inicio: 'clique',
    telaCheia: true,
    carregamento: 'ao-clicar',
    botaoRotulo: '',
    botaoDestino: '',
  } },
  entregas: [
    {
      id: 'entrega-01',
      titulo: 'Chega de apologia ao crime com o seu dinheiro',
      municipio: 'Porto Velho',
      texto:
        'Proíbe shows e eventos com apologia ao crime, à violência e às drogas custeados com ' +
        'recurso público. Seu imposto não financia mais quem faz apologia ao que destrói a sua família.',
      valor: 'Lei 3.250/2025',
    },
    {
      id: 'entrega-02',
      titulo: 'Conscientização contra o aborto',
      municipio: 'Porto Velho',
      texto:
        'Criou a Política Municipal de Conscientização contra o Aborto. Defesa da vida com lei ' +
        'aprovada, não só com discurso.',
      valor: 'Lei 3.285/2025',
    },
    {
      id: 'entrega-03',
      titulo: 'Direito dos pais nas escolas',
      municipio: 'Porto Velho',
      texto:
        'Garante aos pais informação prévia sobre atividades religiosas nas escolas municipais. ' +
        'Você tem o direito de saber o que ensinam pro seu filho.',
      valor: 'Lei 3.256/2025',
    },
  ],
  aviso:
    'E tem mais: combate à ludopatia, proteção à infância, furto de fios e cabos, incentivo aos ' +
    'eSports, cidade limpa e o programa De Volta à Minha Terra.',
  // O print do registro público. É o que separa "eu fiz" de "eu digo
  // que fiz" — e é a única coisa nesta seção que o leitor pode ir
  // conferir sozinho, agora, sem confiar em nós.
  documento: {
    titulo: 'Pesquisa o que eu fiz.',
    texto:
      'O histórico está no registro público da Câmara Municipal de Porto Velho. Não precisa ' +
      'acreditar em mim: confere.',
    rotuloLink: 'Abrir o registro da Câmara',
    link: 'https://sapl.portovelho.ro.leg.br/', // ⚠️ CONFIRMAR a URL exata da busca por autoria
  },
} as const

// ─────────────────────────────────────────────────────────────
// 5.8 TRILHA DE VÍDEOS
//
// A campanha pediu, com estas palavras: "ela quer igual na parte que
// tá escrito 'o que eu levo pra Brasília', que tem uma trilha com as
// propostas dela". Então é o MESMO mecanismo — a tela prende e a fita
// anda de lado conforme a página desce — com vídeo no lugar de texto.
//
// Fica logo acima de Compromissos de propósito: é o último bloco de
// prova antes de a página parar de olhar para trás e começar a
// prometer. Quem chegou até aqui já viu tudo; o que falta é o que ela
// vai fazer.
//
// Todos os itens nascem sem endereço. A seção inteira some enquanto
// nenhum deles tiver link — não é preciso desligar nada no painel.
// ─────────────────────────────────────────────────────────────
export const trilha = {
  // ⚠️ COPY PROVISÓRIA. Foi escrita a partir do NOME DA PASTA de onde
  //    os vídeos vieram ("trilha de vídeos da Sofia x PT") — ninguém
  //    aqui assistiu aos oito. Quem conhece o material reescreve estes
  //    três campos no painel antes de publicar.
  etiqueta: 'A trilha',
  titulo: 'Um por um, [[sem edição.]]',
  intro:
    'Cada vídeo é um enfrentamento que aconteceu de verdade, na hora em que aconteceu. ' +
    'Estão aqui na ordem em que foram ao ar.',
  itens: [
    { id: 'trilha-01', titulo: '', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
    { id: 'trilha-02', titulo: '', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
    { id: 'trilha-03', titulo: '', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
    { id: 'trilha-04', titulo: '', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
    { id: 'trilha-05', titulo: '', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
    { id: 'trilha-06', titulo: '', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
    { id: 'trilha-07', titulo: '', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
    { id: 'trilha-08', titulo: '', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 6. FUTURO
// ─────────────────────────────────────────────────────────────
export const futuro = {
  etiqueta: 'O que eu vou fazer',
  titulo: 'O que eu levo [[pra Brasília.]]',
  intro:
    'Vou fazer na Câmara Federal o que fiz na Câmara Municipal: trabalhar. Essas são as pautas ' +
    'que eu levo, escritas de um jeito que dá para cobrar em quatro anos.',
  itens: [
    {
      id: 'item-11',
      numero: '01',
      titulo: 'Segurança que pune de verdade',
      texto:
        'Castração química para estuprador, redução da maioridade penal, fim da progressão de ' +
        'regime para crime hediondo e excludente de ilicitude para policial em serviço.',
    },
    {
      id: 'item-12',
      numero: '02',
      titulo: 'Armas para o cidadão de bem',
      texto:
        'Ampliação da posse e do porte para quem trabalha, não tem ficha criminal e quer proteger ' +
        'a família. O bandido já está armado; o cidadão de bem não pode ficar indefeso.',
    },
    {
      id: 'item-13',
      numero: '03',
      titulo: 'Defesa do agro',
      texto:
        'Menos burocracia e menos imposto para o produtor rural, e proteção contra regulação que ' +
        'trava a produção. Rondônia alimenta o Brasil e precisa de quem defenda isso.',
    },
    {
      id: 'item-14',
      numero: '04',
      titulo: 'Fim do pedágio que sufoca a BR-364',
      texto:
        'Sete pontos de cobrança encarecem tudo em Rondônia. Vou lutar pela revisão dos contratos ' +
        'e pela redução das tarifas.',
    },
    {
      id: 'item-15',
      numero: '05',
      titulo: 'Menos Estado, menos imposto',
      texto:
        'Contra aumento de carga tributária e contra inchaço da máquina pública. Desburocratizar a ' +
        'vida de quem abre negócio. O dinheiro do imposto é seu, não do governo.',
    },
    {
      id: 'item-16',
      numero: '06',
      titulo: 'Vida, família e liberdade religiosa',
      texto:
        'Contra o aborto e contra ideologia de gênero nas escolas. O Estado é laico, mas eu sou ' +
        'cristã — e vou defender o direito de todo cidadão de viver a sua fé sem ser perseguido.',
    },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 7. GRUPOS
// ─────────────────────────────────────────────────────────────
export const grupos = {
  etiqueta: 'Entre no grupo',
  titulo: 'Tem um grupo da Sofia [[na sua cidade.]]',
  intro:
    'São 52 grupos de WhatsApp, um para cada município de Rondônia. ' +
    'É por ali que a campanha avisa de carreata, agenda e o que estiver acontecendo perto de você.',
  botaoGeo: 'Usar minha localização',
  botaoGeoCarregando: 'Localizando…',
  geoNegado: 'Sem problema. Digite o nome da sua cidade aqui embaixo.',
  rotuloBusca: 'Ou digite o nome da sua cidade',
  // Curto de propósito: com três cidades o exemplo passa de 280px e sai
  // cortado no meio de "Porto Velho" num celular de 375px.
  placeholderBusca: 'Ex.: Ji-Paraná, Vilhena…',
  vazio: 'Nenhuma cidade com esse nome. Confira como está escrito.',
  // O painel da cidade escolhida — pela busca, pela localização ou pelo
  // link do anúncio. O botão usa o "Entrar no grupo de" dos Botões do site.
  cidadeTitulo: 'Sua cidade',
  trocarCidade: 'Escolher outra cidade',
  aberto: 'Grupo aberto',
  cheio: 'Grupo cheio',
  emBreve: 'Em breve',
  avisoCheio:
    'O grupo desta cidade lotou e estamos abrindo o próximo. Volte daqui a algumas horas.',
  avisoEmBreve:
    'O grupo desta cidade ainda não abriu. Siga o Instagram da campanha que avisamos assim que abrir.',
} as const

// ─────────────────────────────────────────────────────────────
// 7b. PÁGINA DE ENTRADA — quem chega pelo anúncio de uma cidade
//
// Nasceu em 17/09, com a campanha na reta final. Os números de antes:
// quem vinha do anúncio não rolava a home (1,5% chegava à metade), e só
// 6,5% tocavam para entrar no grupo com o botão dela.
//
// `{cidade}` é trocado pelo nome da cidade — a do link do anúncio, ou a
// que a pessoa escolher em "Não é de…?". Vale no título, no apoio, nos
// marcadores e no link de trocar cidade.
//
// O botão verde usa "Entrar no grupo de", de Botões do site, e as
// situações de grupo cheio e em breve vêm da seção Grupos de WhatsApp.
// ─────────────────────────────────────────────────────────────
export const entrada = {
  etiqueta: 'Grupo oficial da campanha',
  // A cidade vai no título porque o anúncio prometeu ela: "grupo de
  // WhatsApp de Cabixi" chega numa página que diz Cabixi logo de cara.
  titulo: 'Entre no grupo da Sofia em [[{cidade}.]]',
  apoio:
    'É por ali que a campanha avisa de carreata, agenda e o que estiver acontecendo perto de você.',
  notaBotao: 'Abre no seu WhatsApp. Lá, é só tocar em "Entrar no grupo".',
  itens: [
    { id: 'entrada-01', texto: 'Agenda e carreatas em {cidade} e região' },
    { id: 'entrada-02', texto: 'Avisos da campanha direto no seu WhatsApp' },
    { id: 'entrada-03', texto: 'É de graça, e você sai quando quiser' },
  ],
  trocarCidade: 'Não é de {cidade}? Escolher outra cidade',
  botaoAbrindo: 'Abrindo o WhatsApp…',
  naoAbriuTitulo: 'O WhatsApp não abriu?',
  naoAbriuBotao: 'Tocar aqui de novo',
  naoAbriuDica:
    'Se aparecer uma página do WhatsApp, toque no botão verde dela. No aplicativo, toque em "Entrar no grupo".',
  // A segunda dobra, no azul.
  quemEtiqueta: 'Quem é a Sofia',
  quemTitulo: 'Da calçada da Rio Madeira [[para Brasília.]]',
  quem: [
    'Vereadora em Porto Velho, candidata a Deputada Federal por Rondônia pelo PL. Número 2233.',
    'Nasceu em Cacoal, cresceu no Iata e vendia espetinho na calçada da Avenida Rio Madeira.',
    'Na pandemia, quando mandaram fechar o comércio, foi pra rua defender quem trabalha.',
  ],
  conhecer: 'Conhecer a história da Sofia',
} as const

// ─────────────────────────────────────────────────────────────
// 8. FILTRO
// ─────────────────────────────────────────────────────────────
export const filtro = {
  etiqueta: 'Mostre seu apoio',
  titulo: 'Coloque o [[2233]] na sua foto.',
  intro:
    'Sua foto não sai do seu aparelho. Nada é enviado, nada é guardado, não precisa cadastro. ' +
    'É tudo feito aqui dentro do seu celular.',
  passos: [
    { id: 'passo-01', numero: '1', titulo: 'Escolha a moldura', texto: 'Story para postar ou quadrado para foto de perfil.' },
    { id: 'passo-02', numero: '2', titulo: 'Escolha sua foto', texto: 'Do rolo da câmera mesmo. Ela não sai daqui.' },
    { id: 'passo-03', numero: '3', titulo: 'Ajuste', texto: 'Arraste e dê zoom até o rosto ficar bem enquadrado.' },
    { id: 'passo-04', numero: '4', titulo: 'Salve e poste', texto: 'Baixe, compartilhe ou segure na foto para salvar.' },
  ],
  formatos: {
    story: { rotulo: 'Story', descricao: '1080 × 1920 — para postar no Instagram e no status' },
    perfil: { rotulo: 'Perfil', descricao: '1080 × 1080 — para foto de perfil do WhatsApp' },
  },
  botaoEscolherFoto: 'Escolher minha foto',
  botaoTrocarFoto: 'Trocar foto',
  botaoGerar: 'Gerar minha foto',
  botaoGerando: 'Gerando…',
  botaoBaixar: 'Baixar foto',
  botaoCompartilhar: 'Compartilhar',
  botaoStory: 'Abrir o Instagram',
  notaStory:
    'Salve a foto primeiro. O Instagram abre na câmera de story — aí é só escolher a foto salva.',
  botaoRefazer: 'Fazer outra',
  botaoVoltar: 'Voltar',
  botaoAvancar: 'Continuar',
  dicaSalvar: 'No celular: segure o dedo na foto acima e escolha "Salvar imagem".',
  vazioPrevia: 'Sua foto entra aqui.',
  rotuloZoom: 'Zoom',
  botaoCentralizar: 'Centralizar',
  dicaAjuste: 'Arraste a foto para posicionar. No celular, use dois dedos para aproximar.',
  tituloPronto: 'Sua foto está pronta.',
  textoPronto: 'Agora é postar. Story, perfil, status do WhatsApp — onde a sua gente vê.',
  avisoInstagram:
    'Você abriu pelo Instagram. Aqui o download costuma falhar — toque para abrir no navegador.',
  avisoInstagramBotao: 'Abrir no navegador',
  naoBaixouTitulo: 'Não baixou?',
  naoBaixouTexto:
    'Dentro do Instagram o download costuma não funcionar. Segure o dedo na foto acima e ' +
    'escolha "Salvar imagem", ou abra esta página no navegador.',
  erroFormato:
    'Essa foto está num formato que o navegador não abre (comum em fotos de iPhone). ' +
    'Tire um print dela e use o print.',
  erroPequena: 'Essa foto é pequena e vai sair borrada. Sugerimos escolher outra.',
  erroGerar: 'Não foi possível gerar a imagem neste aparelho. Tente uma foto menor.',
  avisoZonaSegura: 'Deixe o rosto aqui dentro',
  privacidade: 'Sua foto nunca sai do seu aparelho.',
  // O número entra na frente, vindo do banco. Só aparece depois de
  // passar de um piso que não constranja — ver lib/apoios.ts.
  apoios: 'pessoas já colocaram o {{candidata.numero}} na foto.',
} as const

// ─────────────────────────────────────────────────────────────
// 9. COMPARTILHAR
// ─────────────────────────────────────────────────────────────
export const compartilhar = {
  etiqueta: 'Espalhe',
  titulo: 'Campanha boa é a que [[anda sozinha.]]',
  intro:
    'Não tem verba que compre o que a sua indicação faz. Mande esta página para três pessoas que confiam em você.',
  textoWhatsapp:
    'Olha a página da Sofia Andrade 2233, deputada federal por Rondônia. ' +
    'Mandaram fechar e ela foi pra rua. Tem grupo da nossa cidade e dá pra colocar o 2233 na sua foto:',
  botaoWhatsapp: 'Enviar no WhatsApp',
  botaoCopiar: 'Copiar o link',
  copiado: 'Link copiado.',
} as const

// ─────────────────────────────────────────────────────────────
// 10. CTA FINAL
// ─────────────────────────────────────────────────────────────
export const ctaFinal = {
  titulo: ['4 de outubro de 2026.', '[[O próximo passo é seu.]]'],
  texto:
    'Você já sabe quem eu sou. Você já sabe de onde eu vim. Você já sabe o que eu fiz. ' +
    'Agora falta a parte que só você pode fazer.',
  ctaPrimario: ctas.grupo,
  ctaSecundario: ctas.filtro,
} as const

// ─────────────────────────────────────────────────────────────
// 11. RODAPÉ LEGAL
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// FAIXA — a tarja que corre entre a primeira dobra e o resto.
// Serve para o que precisa ser lembrado sem ocupar seção: número,
// nome de urna, partido, o que a campanha quiser martelar.
// ─────────────────────────────────────────────────────────────
export const faixa = {
  itens: [
    { id: 'faixa-01', texto: 'Sofia Andrade 2233' },
    { id: 'faixa-02', texto: 'Deputada Federal · PL' },
    { id: 'faixa-03', texto: 'Mandaram fechar. Eu fui pra rua.' },
    { id: 'faixa-04', texto: 'Vereadora de Porto Velho' },
    { id: 'faixa-05', texto: '9 leis sancionadas' },
    { id: 'faixa-06', texto: 'Pesquisa o que eu fiz' },
  ],
} as const

export const rodape = {
  assinatura: 'Feito em Rondônia.',
  links: [
    { id: 'link-01', rotulo: 'Grupos de WhatsApp', href: '/grupos' },
    { id: 'link-02', rotulo: 'Coloque o 2233 na sua foto', href: '/filtro' },
    { id: 'link-03', rotulo: 'Política de privacidade', href: '/politica-de-privacidade' },
  ],
  legalRotulo: 'Propaganda eleitoral',
  // ⚠️ ERA "não coleta dados pessoais dos visitantes", e deixou de ser
  //    verdade quando o pixel e a Conversions API foram ligados. Desde
  //    17/09 eles só funcionam com autorização, e é isso que se diz.
  aviso:
    'Esta página é propaganda eleitoral. Cookies de medição e de anúncio só funcionam com a sua autorização.',

  /**
   * ⚠️ IDENTIFICAÇÃO ELEITORAL OBRIGATÓRIA.
   *
   * Estes campos saíram de variável de ambiente e passaram para o
   * painel, a pedido da campanha. A troca tem um lado e outro, e vale
   * dizer os dois: pelo painel, corrigir um dado errado leva trinta
   * segundos em vez de um deploy — e é isso que importa numa campanha.
   * Em compensação, quem tem a senha do painel passa a poder mudar o
   * CNPJ da peça, que é exposição jurídica. O histórico de versões
   * cobre parte disso: toda alteração fica registrada e dá para
   * restaurar.
   *
   * NÃO PUBLICAR com qualquer um destes em branco.
   */
  legal: {
    eleicao: 'ELEIÇÃO 2026',
    candidato: 'SOFIA ANDRADE DE AGUIAR GOMES',
    cargo: 'DEPUTADO FEDERAL',
    partido: 'PARTIDO PL 22',
    cnpj: 'CNPJ 68.379.640/0001-98',
    coligacao: 'COLIGAÇÃO: Juntos por Rondônia — PL, PODEMOS, DC, NOVO, MOBILIZA',
    comite: '',
  },
} as const

// ─────────────────────────────────────────────────────────────
// AVISO DE COOKIES
//
// O cartão no pé da tela na primeira visita, e as categorias de
// "Personalizar". O que cada categoria liga de verdade está em
// lib/consentimento.ts — se uma ferramenta nova entrar no GTM ou no
// pixel, o texto da categoria dela precisa dizer.
// ─────────────────────────────────────────────────────────────
export const cookies = {
  titulo: 'Privacidade sob seu controle',
  // ⚠️ ATÉ UNS 90 CARACTERES: é o que cabe em duas linhas num telefone
  //    de 360 px. Cada linha a mais é o cartão subindo sobre a página.
  texto: 'Usamos cookies necessários e, só com a sua autorização, de desempenho e de publicidade.',
  aceitar: 'Aceitar todos',
  rejeitar: 'Rejeitar opcionais',
  personalizar: 'Personalizar',
  politica: 'Política de privacidade',
  escolhasTitulo: 'Suas escolhas',
  escolhasTexto:
    'Os cookies necessários ficam sempre ativos. Os outros só funcionam com a sua autorização.',
  sempreAtivos: 'Sempre ativos',
  salvar: 'Salvar escolhas',
  gerenciar: 'Gerenciar cookies',
  necessarios: {
    titulo: 'Necessários',
    texto: 'Fazem o site funcionar e guardam esta sua escolha.',
  },
  desempenho: {
    titulo: 'Desempenho e análise',
    texto: 'Google Analytics e Microsoft Clarity: medem como a página é usada, para melhorá-la.',
  },
  publicidade: {
    titulo: 'Publicidade',
    texto: 'Pixel e API de Conversões da Meta: medem os anúncios da campanha no Facebook e no Instagram.',
  },
} as const

export const privacidade = {
  titulo: 'Política de Privacidade',
  atualizadoEm: '17 de setembro de 2026',
  resumo:
    'Resumo em uma frase: esta página não pede seu nome, não pede seu telefone, ' +
    'não guarda sua foto, não guarda sua localização e só usa cookies de medição e de anúncio se você autorizar.',

  // Os textos aceitam {{candidata.nome}} e afins. A lista de tokens
  // permitidos está em lib/conteudo/tokens.ts — é uma whitelist, não
  // um acesso livre ao objeto: sem ela, um token conseguiria
  // desreferenciar conteúdo arbitrário ou entrar em recursão.
  secoes:  [
    {
      id: 'priv-01',
      titulo: '1. Quem é o responsável',
      conteudo: [
        'Esta página é mantida pela campanha de {{candidata.nome}}, candidata a {{candidata.cargo}} ' +
          'por {{candidata.estado}} pelo {{candidata.partidoExtenso}}, número {{candidata.numero}}. ' +
          'Os dados de identificação da campanha, incluindo CNPJ e endereço do comitê, estão no rodapé de todas as páginas.',
      ],
    },
    {
      id: 'priv-02',
      titulo: '2. A sua foto no gerador de moldura',
      conteudo: [
        'O gerador de moldura funciona inteiramente dentro do seu aparelho. A foto que você escolhe ' +
          'é lida pelo próprio navegador, desenhada numa tela interna junto com a moldura e salva por você.',
        'Em nenhum momento a foto é enviada para um servidor, para a campanha ou para terceiros. ' +
          'Não guardamos, não vemos e não temos como recuperar nenhuma imagem gerada aqui. ' +
          'Por isso o gerador não pede cadastro nem login.',
      ],
    },
    {
      id: 'priv-03',
      titulo: '3. A sua localização',
      conteudo: [
        'Ao tocar em "Usar minha localização", o navegador pede a sua permissão e informa a coordenada ' +
          'apenas para o código que roda no seu próprio aparelho. Essa coordenada é usada para calcular ' +
          'qual das 52 sedes municipais está mais perto e é descartada em seguida.',
        'A coordenada não é enviada para nenhum servidor nem armazenada. Se você recusar a permissão, ' +
          'a página continua funcionando normalmente: basta buscar sua cidade pelo nome.',
        'Independentemente disso, a hospedagem pode inferir a cidade aproximada a partir do endereço de rede, ' +
          'como qualquer site faz. Usamos essa informação apenas para sugerir uma cidade na tela, ' +
          'no momento em que a página carrega. Ela não é gravada.',
      ],
    },
    {
      id: 'priv-04',
      titulo: '4. O que medimos',
      conteudo: [
        'Registramos eventos de uso sem identificar pessoas: página vista, rolagem, busca por cidade, ' +
          'clique no botão do grupo, uso do gerador de moldura e compartilhamento.',
        'A cada visita é gerado um identificador aleatório, guardado apenas enquanto a aba estiver aberta, ' +
          'cuja única função é evitar que a mesma visita seja contada várias vezes. ' +
          'Ele não contém nome, telefone, e-mail nem endereço de rede, e desaparece quando você fecha a aba.',
        'Esses eventos não usam cookies e não identificam você. As ferramentas de medição e de anúncio, ' +
          'descritas na seção seguinte, só funcionam com a sua autorização.',
      ],
    },
    {
      id: 'priv-10',
      titulo: '5. Cookies e a sua autorização',
      conteudo: [
        'Na primeira visita, um aviso pergunta quais cookies você autoriza. Os necessários ficam sempre ativos: ' +
          'guardam a sua escolha e evitam contar duas vezes o mesmo toque no botão do grupo.',
        'Desempenho e análise: com a sua autorização, a página carrega o Google Tag Manager, e com ele o ' +
          'Google Analytics e o Microsoft Clarity, que medem como a página é usada para melhorá-la.',
        'Publicidade: com a sua autorização, a página carrega o pixel da Meta, a empresa do Facebook e do ' +
          'Instagram. Parte dessas informações também sai do nosso servidor direto para a Meta, pela API de ' +
          'Conversões: o seu endereço de rede, o modelo do seu navegador, os identificadores que o pixel gravou e ' +
          'o identificador aleatório da visita. Isso serve para medir o resultado dos anúncios da campanha. ' +
          'Não enviamos nome, telefone, e-mail nem qualquer foto.',
        'Quando você chega por um anúncio, guardamos num cookie de sessão de qual anúncio foi — o identificador ' +
          'do clique e o nome da peça, que já vinham no endereço que você abriu. Ele só é repassado à Meta se ' +
          'você autorizar publicidade, e apaga sozinho quando você fecha o navegador.',
        'Você pode mudar a sua escolha quando quiser em "Gerenciar cookies", no rodapé de todas as páginas. ' +
          'Sem autorização, a página funciona igual.',
      ],
    },
    {
      id: 'priv-09',
      titulo: '6. Os vídeos da página',
      conteudo: [
        'Os vídeos desta página são hospedados no YouTube e no Vimeo, e não neste site. ' +
          'Enquanto você não toca no botão de play, nada é pedido a esses serviços: o que aparece na tela ' +
          'é apenas uma imagem de capa e um botão, servidos por nós.',
        'Ao tocar em play, o player do serviço é carregado e, a partir daí, o tratamento dos seus dados ' +
          'dentro dele segue a política de privacidade do próprio serviço. ' +
          'Usamos os endereços que não gravam cookie de publicidade, mas não temos como falar pelo que eles fazem.',
      ],
    },
    {
      id: 'priv-05',
      titulo: '7. Grupos de WhatsApp',
      conteudo: [
        'Ao entrar num grupo de WhatsApp da campanha, o tratamento dos seus dados dentro do aplicativo ' +
          'passa a seguir a política de privacidade do próprio WhatsApp e as regras do grupo. ' +
          'Você pode sair do grupo a qualquer momento pelo próprio aplicativo.',
      ],
    },
    {
      id: 'priv-06',
      titulo: '8. Compartilhamento com terceiros',
      conteudo: [
        'Não vendemos, alugamos nem cedemos dados de visitantes. ' +
          'Os serviços de hospedagem e de banco de dados utilizados pelo site processam dados ' +
          'exclusivamente para manter a página no ar e gerar as métricas agregadas descritas acima.',
        'Só com a sua autorização, e apenas nos termos da seção 5, dados de navegação são enviados ao Google ' +
          'e à Microsoft (desempenho) e à Meta (publicidade).',
      ],
    },
    {
      id: 'priv-07',
      titulo: '9. Seus direitos',
      conteudo: [
        'Você pode retirar a autorização de cookies a qualquer momento em "Gerenciar cookies", no rodapé. ' +
          'Como não pedimos nome, telefone nem e-mail, não há cadastro para consultar, corrigir ou apagar. ' +
          'Ainda assim, se tiver qualquer dúvida sobre esta política ou sobre o tratamento de dados, ' +
          'a campanha responde pelos canais indicados no rodapé.',
      ],
    },
    {
      id: 'priv-08',
      titulo: '10. Mudanças nesta política',
      conteudo: [
        'Se esta política mudar, a data de atualização no topo desta página muda junto. ' +
          'Recomendamos conferir esta página caso tenha alguma dúvida.',
      ],
    },
  ],
} as const

// ═══════════════════════════════════════════════════════════════
// PADRÃO DE FÁBRICA
//
// Este objeto é a VERDADE PADRÃO do site. O banco guarda apenas o
// que a campanha editou, e `lib/conteudo` mescla um sobre o outro.
//
// Consequência que vale dizer em voz alta: com o banco vazio, ou com
// a linha de uma seção apagada, o site volta exatamente para o que
// está escrito aqui. É por isso que nada disto é semeado por
// migration — semear congelaria a copy no dia do deploy.
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// 2.5 ÁLBUM
// O acervo de família é analógico: fotos de papel fotografadas de
// celular. É o material mais difícil de forjar que existe numa
// campanha, e por isso ele aparece COMO papel — com a borda, o
// amarelado e a data impressa quando ela existe.
// ─────────────────────────────────────────────────────────────
export const album = {
  etiqueta: 'O álbum',
  titulo: 'Não dá pra [[inventar isso.]]',
  intro:
    'Não tenho foto de campanha da infância. Tenho o que a minha família guardou numa caixa: ' +
    'papel amarelado, borda gasta, data escrita no canto.',
  fotos: [
    { id: 'album-01', legenda: 'No colo do pai, com a vó do lado', ano: 'Cacoal' },
    { id: 'album-02', legenda: 'Com a minha mãe, no terreiro de casa', ano: 'Iata' },
    { id: 'album-03', legenda: 'Fanfarra da escola. Chão de terra e uniforme lavado', ano: 'Iata' },
    { id: 'album-04', legenda: 'Quadrilha de festa junina', ano: 'Iata' },
    { id: 'album-05', legenda: 'Enchei-vos do Espírito — Efésios 5.18', ano: 'A igreja' },
    { id: 'album-06', legenda: 'Vó Chiquinha', ano: 'Retrato de estúdio' },
    { id: 'album-07', legenda: 'A bicicleta era de todo mundo', ano: 'Anos 90' },
    { id: 'album-08', legenda: 'Festa de aniversário, parede descascada', ano: 'Anos 90' },
  ],
  rodape: 'Fotos do arquivo da família Andrade.',
} as const

// ─────────────────────────────────────────────────────────────
// 2.6 A RUA
// A manchete da página é "Mandaram fechar. Eu fui pra rua." Esta
// seção é a prova de que a frase é literal. Sem ela a página afirma
// e não mostra — que é exatamente o que a página acusa os outros de
// fazer duas seções abaixo.
// ─────────────────────────────────────────────────────────────
export const rua = {
  etiqueta: '2020',
  titulo: 'A rua não era [[figura de linguagem.]]',
  texto:
    'Peguei o celular na calçada e falei o que milhares de pessoas estavam sentindo e não tinham ' +
    'onde dizer. Depois saí de casa. Essas fotos são de quem estava junto.',
  // O vídeo da pandemia. É o registro do que a seção descreve — vem
  // antes das fotos porque as fotos são o apoio, não a prova.
  video: { titulo: '', url: '', formato: 'deitado', opcoes: {
    controles: true,
    inicio: 'clique',
    telaCheia: true,
    carregamento: 'ao-clicar',
    botaoRotulo: '',
    botaoDestino: '',
  } },
  fotos: [
    { id: 'rua-01', legenda: 'Carreata em Porto Velho', local: 'Av. Rio Madeira' },
    { id: 'rua-02', legenda: 'Ainda no tempo da máscara', local: 'Porto Velho' },
    { id: 'rua-03', legenda: 'Manifestação', local: 'Rondônia' },
  ],
  // ⚠️ As melhores fotos da rua são de fotógrafo e de veículo de
  //    imprensa. Este crédito não é enfeite: é a condição de uso.
  credito: 'Fotos cedidas. Crédito no rodapé da página.',
} as const

// ─────────────────────────────────────────────────────────────
// 5.5 PROVA SOCIAL
// Vem DEPOIS de Provas de propósito: primeiro eu provo com lei,
// depois outro fala por mim. Invertido, os elogios chegam antes de
// haver motivo para eles.
// ─────────────────────────────────────────────────────────────
export const social = {
  etiqueta: 'O que dizem',
  titulo: 'Aqui não sou eu [[falando de mim.]]',
  intro:
    'São comentários que as pessoas escreveram por conta própria, nos posts, sem eu pedir. ' +
    'Deixei do jeito que chegaram.',
  legendas: [
    { id: 'leg-01', texto: 'Eleitor de Porto Velho' },
    { id: 'leg-02', texto: '' },
    { id: 'leg-03', texto: 'Médico, sobre a pandemia' },
    { id: 'leg-04', texto: '' },
    { id: 'leg-05', texto: '' },
    { id: 'leg-06', texto: '' },
  ],
  /**
   * Os dois vídeos de comentário. Ficam depois dos prints, na mesma
   * lógica da seção: primeiro o que as pessoas escreveram, depois o que
   * elas disseram falando.
   */
  videos: [
    { id: 'svid-01', titulo: 'Comentário 1', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
    { id: 'svid-02', titulo: 'Comentário 2', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
  ],
  ataques: {
    etiqueta: 'O outro lado',
    titulo: 'E o que a esquerda [[diz de mim?]]',
    intro:
      'Atacam. Xingam. Denunciam. Criam portal falso. Entram na Justiça. Deixo aqui do mesmo ' +
      'jeito que deixei os elogios — sem editar.',
    fecho:
      'Se me atacam com processo e perdem, é porque o que eu falo incomoda quem precisa ser ' +
      'incomodado. Quem tenta me calar só confirma uma coisa: estou no caminho certo.',
  },
  processos: [
    {
      id: 'proc-01',
      titulo: 'Me processaram por dizer o que penso',
      texto:
        'Levaram ao TRE-RO um vídeo em que eu disse o que penso sobre quem vota na esquerda. ' +
        'Queriam me calar.',
      resultado: 'A Justiça rejeitou a ação.',
      // Dois: o relato do processo e a leitura da decisão. O segundo
      // foi gravado de celular, na vertical — daí o `formato`.
      videos: [
        { id: 'pvid-01', titulo: 'O processo', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
        { id: 'pvid-02', titulo: 'A decisão do juiz', url: '', formato: 'em-pe', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
      ],
    },
    {
      id: 'proc-02',
      titulo: 'O Governador se sentiu ofendido',
      texto:
        'Durante a luta contra o aumento de impostos em Rondônia, me posicionei publicamente ' +
        'contra o Governador Marcos Rocha. Ele não gostou e me processou.',
      resultado: 'A Justiça decidiu a meu favor.',
      videos: [
        { id: 'pvid-03', titulo: 'Ela explica o processo', url: '', formato: 'deitado', opcoes: {
      controles: true,
      inicio: 'clique',
      telaCheia: true,
      carregamento: 'ao-clicar',
      botaoRotulo: '',
      botaoDestino: '',
    } },
      ],
    },
  ],
  // ⚠️ Sem validação do jurídico este bloco não sobe. Ver PLANO-FOTOS.md.
  nota: 'Comentários públicos, reproduzidos com identificação preservada apenas onde houve autorização.',
} as const



// ─────────────────────────────────────────────────────────────
// EXIBIR — quais seções vão ao ar
//
// Um interruptor por seção. Serve para duas coisas reais de campanha:
// tirar do ar um bloco cuja prova ainda não chegou (a Prova social sem
// autorização de imagem, por exemplo), e encurtar a página quando o
// tráfego pago pedir caminho mais curto até o grupo.
//
// ⚠️ Hero, chamada final e rodapé NÃO estão aqui de propósito. O rodapé
//    carrega a identificação exigida pela lei eleitoral, e uma página
//    de campanha sem primeira dobra nem pedido de voto não é uma página
//    mais curta: é outra coisa.
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// APARÊNCIA
//
// Os poucos ajustes visuais que a campanha decide sem chamar
// ninguém. Não é um editor de tema: são três chaves, e cada uma
// existe porque alguém já quis mexer nela.
// ─────────────────────────────────────────────────────────────
export const aparencia = {
  /**
   * As cores da primeira dobra.
   *
   * Seis: azul · verde · amarelo · verde-amarelo · azul-verde ·
   * amarelo-azul. Ver .capa em globals.css — cada um define a própria
   * cor de realce e de botão, para os dois continuarem saltando do
   * fundo em vez de afundar nele.
   *
   * A escolha existe porque a primeira versão desta dobra foi reprovada
   * na hora, e trocar uma palavra no painel é caminho de volta melhor
   * do que abrir um chamado.
   */
  heroCor: 'verde-amarelo',

  /** nenhuma · halftone · ruido · tracejado */
  textura: 'halftone',
  /** De 0 a 100. Ver .textura em globals.css: 100 é o teto do tipo. */
  texturaForca: 20,
} as const

export const exibir = {
  faixa: true,
  origem: true,
  album: true,
  rua: true,
  problema: true,
  valores: true,
  cena: true,
  provas: true,
  social: true,
  trilha: true,
  futuro: true,
  grupos: true,
  filtro: true,
  compartilhar: true,
} as const

export const PADRAO = {
  candidata,
  aparencia,
  meta,
  paginas,
  navegacao,
  ctas,
  hero,
  origem,
  album,
  rua,
  problema,
  valores,
  faixa,
  cena,
  provas,
  social,
  trilha,
  futuro,
  grupos,
  entrada,
  filtro,
  compartilhar,
  ctaFinal,
  rodape,
  privacidade,
  cookies,
  exibir,
} as const

/** As chaves de seção que o banco aceita. */
export const SECOES = Object.keys(PADRAO) as (keyof typeof PADRAO)[]

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
  instagram: 'https://instagram.com/sofiaandrade', // ⚠️ CONFIRMAR
  instagramHandle: '@sofiaandrade', // ⚠️ CONFIRMAR
  whatsapp: 'https://wa.me/5569900000000', // ⚠️ CONFIRMAR
} as const

export const meta = {
  titulo: 'Sofia Andrade 2233 — Deputada Federal por Rondônia',
  tituloCurto: 'Sofia Andrade 2233',
  descricao:
    'Sofia Andrade, 2233, candidata a Deputada Federal por Rondônia pelo PL. ' +
    'Entre no grupo de WhatsApp da sua cidade e coloque o 2233 na sua foto de perfil.',
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
    chamada: 'Entre no grupo da sua cidade',
  },
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
  etiqueta: 'Deputada Federal · Rondônia',
  titulo: ['Eu sou Sofia Andrade.', '[[E eu não peço licença.]]'],
  subtitulo:
    'Nasci em Rondônia, cresci vendo o povo daqui trabalhar dobrado para receber metade. ' +
    'Não vim a Brasília aprender a falar bonito. Vim brigar.',
  numeroLegenda: 'Escreva 2233 na urna',
  ctaPrimario: ctas.grupo,
  ctaSecundario: 'Conhecer minha história',
  ctaSecundarioHref: '#origem',
  rodapeHero: '52 municípios. 52 grupos. Um por cidade.',
} as const

// ─────────────────────────────────────────────────────────────
// 2. ORIGEM
// ─────────────────────────────────────────────────────────────
export const origem = {
  etiqueta: 'De onde eu venho',
  titulo: 'Ninguém me deu nada.',
  paragrafos: [
    'Minha família chegou em Rondônia com uma mala e uma promessa de terra. ' + // ⚠️ CONFIRMAR
      'A terra veio. A estrada, a escola e o posto de saúde não vieram junto.',
    'Cresci entendendo cedo uma coisa que muita gente em Brasília nunca vai entender: ' +
      'aqui, tudo que existe alguém levantou com a própria mão.',
    'Trabalhei, estudei, criei meus filhos e nunca precisei de padrinho político. ' + // ⚠️ CONFIRMAR
      'É por isso que hoje eu não devo favor a ninguém — só ao povo de Rondônia.',
  ],
  citacao: 'Quem nunca dependeu de ninguém para chegar não precisa obedecer a ninguém para ficar.',
  linhaDoTempo: [
    { id: 'tempo-01', ano: '1998', titulo: 'A infância no interior', texto: 'A vida começa em Rondônia, longe do asfalto.' }, // ⚠️ CONFIRMAR
    { id: 'tempo-02', ano: '2010', titulo: 'O primeiro trabalho', texto: 'Aprende cedo que aqui nada cai do céu.' }, // ⚠️ CONFIRMAR
    { id: 'tempo-03', ano: '2018', titulo: 'A virada', texto: 'Entra na vida pública para resolver o que ninguém resolvia.' }, // ⚠️ CONFIRMAR
    { id: 'tempo-04', ano: '2026', titulo: 'Brasília', texto: 'Candidata a Deputada Federal pelo PL. Número 2233.' },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 3. PROBLEMA
// ─────────────────────────────────────────────────────────────
export const problema = {
  etiqueta: 'O que está errado',
  titulo: 'Rondônia produz. [[Brasília consome.]]',
  intro:
    'Nosso estado alimenta o Brasil e sustenta a balança comercial do país. ' +
    'Em troca recebe estrada esburacada, hospital cheio e imposto novo.',
  itens: [
    {
      id: 'item-01',
      numero: '01',
      titulo: 'O produtor vira réu',
      texto:
        'Quem planta e quem cria é tratado como suspeito por quem nunca pisou numa lavoura. ' +
        'Multa ambiental de gabinete não recupera nada. Só quebra família.',
    },
    {
      id: 'item-02',
      numero: '02',
      titulo: 'A saúde vira fila',
      texto:
        'Consulta marcada para daqui a oito meses não é atendimento, é adiamento. ' +
        'Gente de Rondônia morre esperando vaga em outro estado.',
    },
    {
      id: 'item-03',
      numero: '03',
      titulo: 'A segurança vira sorte',
      texto:
        'Bandido solto e cidadão de bem com medo de sair de casa. ' +
        'Quem defende a própria família ainda corre risco de virar processo.',
    },
    {
      id: 'item-04',
      numero: '04',
      titulo: 'O imposto vira hábito',
      texto:
        'Cada ano uma sigla nova para tirar mais de quem já paga. ' +
        'Ninguém em Brasília perde o sono com a conta que chega na sua casa.',
    },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 4. VALORES
// ─────────────────────────────────────────────────────────────
export const valores = {
  etiqueta: 'No que eu não negocio',
  titulo: 'Tem coisa que [[não entra em acordo.]]',
  intro:
    'Política é negociação em quase tudo. Mas existe um chão que não se vende. ' +
    'Este é o meu, escrito antes da eleição para você poder cobrar depois dela.',
  itens: [
    {
      id: 'item-05',
      chave: 'familia',
      titulo: 'Família',
      texto: 'Pai e mãe decidem a educação dos próprios filhos. Não o Estado, não a moda, não Brasília.',
    },
    {
      id: 'item-06',
      chave: 'liberdade',
      titulo: 'Liberdade',
      texto: 'Trabalhar, empreender, falar e crer sem pedir autorização para funcionário público nenhum.',
    },
    {
      id: 'item-07',
      chave: 'segurança',
      titulo: 'Segurança',
      texto: 'Lei dura com quem faz o mal e respaldo total para quem defende a própria vida e a dos seus.',
    },
    {
      id: 'item-08',
      chave: 'producao',
      titulo: 'Produção',
      texto: 'Quem produz é herói, não vilão. Regularização fundiária e fim da perseguição ao homem do campo.',
    },
    {
      id: 'item-09',
      chave: 'imposto',
      titulo: 'Menos imposto',
      texto: 'Cada real que sai do seu bolso tem que voltar em serviço. Se não volta, é confisco.',
    },
    {
      id: 'item-10',
      chave: 'fe',
      titulo: 'Fé',
      texto: 'Respeito e defesa da liberdade religiosa de cada família de Rondônia.',
    },
  ],
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
    etiqueta: 'Rondônia',
    titulo: 'Aqui a terra [[trabalha.]]',
    texto: 'Soja, boi, café, peixe, madeira legal. O que sai deste estado alimenta o Brasil inteiro.',
  },
  amarelo: {
    etiqueta: 'E o que volta',
    titulo: 'O que volta [[é conta.]]',
    texto: 'O imposto sobe todo ano. A estrada não vem, o hospital não abre, a energia é a mais cara do país.',
  },
  azul: {
    etiqueta: 'Por isso o 2233',
    titulo: 'Brasília precisa [[ouvir daqui.]]',
    texto: 'Não adianta mandar recado. Tem que ter gente de Rondônia sentada lá dentro, com voto na mão.',
  },
} as const

// ─────────────────────────────────────────────────────────────
// 5. PROVAS
// ⚠️ TODOS OS NÚMEROS DESTA SEÇÃO SÃO PLACEHOLDER.
//    Substituir por dados auditáveis antes de publicar.
// ─────────────────────────────────────────────────────────────
export const provas = {
  etiqueta: 'O que já foi feito',
  titulo: 'Eu não faço promessa. [[Eu presto conta.]]',
  intro:
    'Promessa qualquer um faz na véspera. O que separa candidato de gente séria é o que já está pronto e pode ser conferido.',
  numeros: [
    { id: 'num-01', valor: '52', unidade: 'municípios', texto: 'percorridos ouvindo quem mora e trabalha em cada um' }, // ⚠️ CONFIRMAR
    { id: 'num-02', valor: '00', unidade: 'milhões', texto: 'em recursos destinados a Rondônia' }, // ⚠️ CONFIRMAR
    { id: 'num-03', valor: '00', unidade: 'entidades', texto: 'sociais atendidas com apoio direto' }, // ⚠️ CONFIRMAR
    { id: 'num-04', valor: '00', unidade: 'famílias', texto: 'beneficiadas pelos programas apoiados' }, // ⚠️ CONFIRMAR
  ],
  entregas: [
    {
      id: 'entrega-01',
      titulo: 'Título de entrega 1', // ⚠️ CONFIRMAR
      municipio: 'Município', // ⚠️ CONFIRMAR
      texto: 'Descrição curta e verificável do que foi entregue, com valor e data.',
      valor: 'R$ 0,0 mi', // ⚠️ CONFIRMAR
    },
    {
      id: 'entrega-02',
      titulo: 'Título de entrega 2', // ⚠️ CONFIRMAR
      municipio: 'Município', // ⚠️ CONFIRMAR
      texto: 'Descrição curta e verificável do que foi entregue, com valor e data.',
      valor: 'R$ 0,0 mi', // ⚠️ CONFIRMAR
    },
    {
      id: 'entrega-03',
      titulo: 'Título de entrega 3', // ⚠️ CONFIRMAR
      municipio: 'Município', // ⚠️ CONFIRMAR
      texto: 'Descrição curta e verificável do que foi entregue, com valor e data.',
      valor: 'R$ 0,0 mi', // ⚠️ CONFIRMAR
    },
  ],
  aviso:
    'Seção aguardando os dados oficiais da campanha. Números e entregas serão publicados com fonte.',
} as const

// ─────────────────────────────────────────────────────────────
// 6. FUTURO
// ─────────────────────────────────────────────────────────────
export const futuro = {
  etiqueta: 'O que eu vou fazer',
  titulo: 'Cinco compromissos. [[Assinados.]]',
  intro:
    'Não são vinte bandeiras para não caber nenhuma. São cinco, escritas de um jeito que dá para cobrar em quatro anos.',
  itens: [
    {
      id: 'item-11',
      numero: '01',
      titulo: 'Regularização fundiária de verdade',
      texto:
        'Título na mão do produtor. Quem trabalha a terra há décadas não pode continuar ' +
        'sendo tratado como invasor da própria vida.',
    },
    {
      id: 'item-12',
      numero: '02',
      titulo: 'Saúde que não faz esperar',
      texto:
        'Emendas carimbadas para cirurgia eletiva, exame e leito em Rondônia. ' +
        'Ninguém deveria precisar sair do estado para ser atendido.',
    },
    {
      id: 'item-13',
      numero: '03',
      titulo: 'Segurança com respaldo',
      texto:
        'Apoio à polícia, endurecimento de pena para crime violento e defesa de quem protege a própria família.',
    },
    {
      id: 'item-14',
      numero: '04',
      titulo: 'Menos imposto para quem produz',
      texto:
        'Voto contra qualquer aumento de carga tributária sobre o pequeno produtor, o comerciante e o autônomo.',
    },
    {
      id: 'item-15',
      numero: '05',
      titulo: 'Estrada e energia',
      texto:
        'Infraestrutura é o que transforma safra em renda. Sem estrada, produção vira prejuízo no meio do caminho.',
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
  rotuloBusca: 'Digite o nome da sua cidade',
  placeholderBusca: 'Ex.: Ji-Paraná, Vilhena, Porto Velho…',
  botaoGeo: 'Usar minha localização',
  botaoGeoCarregando: 'Localizando…',
  geoNegado: 'Sem problema. Procure sua cidade na lista abaixo.',
  sugestaoTitulo: 'Você está em',
  sugestaoPergunta: 'Confirma para entrar no grupo daqui.',
  sugestaoNao: 'Não é minha cidade',
  dicaBusca: 'Pode digitar sem acento. Ex.: "ji parana", "sao miguel".',
  vazio: 'Nenhuma cidade com esse nome. Veja a lista completa.',
  listaTitulo: 'Todos os 52 municípios',
  verTodos: 'Ver todos os municípios',
  abertos: 'grupos abertos',
  folhaTitulo: 'Encontre sua cidade',
  folhaFechar: 'Fechar',
  proximasTitulo: 'As mais perto de você',
  abertosTitulo: 'Grupos abertos agora',
  mapaTitulo: 'Onde você mora?',
  mapaDica: 'Toque na sua cidade. Verde é grupo aberto.',
  mapaLegendaAberto: 'Grupo aberto',
  sugestaoSim: 'Sim, entrar no grupo',
  sugestaoLonge: 'Confira se é mesmo a sua cidade — a sede mais próxima está longe.',
  emBreve: 'Em breve',
  cheio: 'Grupo cheio',
  aberto: 'Entrar',
  avisoEmBreve:
    'O grupo desta cidade ainda não abriu. Siga o Instagram da campanha que avisamos assim que abrir.',
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
    'Olha essa página da Sofia Andrade 2233, deputada federal por Rondônia. ' +
    'Tem grupo da nossa cidade e dá pra colocar o 2233 na sua foto:',
  botaoWhatsapp: 'Enviar no WhatsApp',
  botaoCopiar: 'Copiar o link',
  copiado: 'Link copiado.',
} as const

// ─────────────────────────────────────────────────────────────
// 10. CTA FINAL
// ─────────────────────────────────────────────────────────────
export const ctaFinal = {
  titulo: ['No dia da eleição,', '[[escreva 2233.]]'],
  texto:
    'Se você chegou até aqui, já sabe o que eu penso. Agora falta a parte que só você pode fazer.',
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
    { id: 'faixa-02', texto: 'Deputada Federal' },
    { id: 'faixa-03', texto: 'PL · Partido Liberal' },
    { id: 'faixa-04', texto: '52 municípios, 52 grupos' },
    { id: 'faixa-05', texto: 'Rondônia' },
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
  aviso:
    'Esta página é propaganda eleitoral e não coleta dados pessoais dos visitantes.',

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

export const privacidade = {
  titulo: 'Política de Privacidade',
  atualizadoEm: '19 de agosto de 2026',
  resumo:
    'Resumo em uma frase: esta página não pede seu nome, não pede seu telefone, ' +
    'não guarda sua foto e não guarda sua localização.',

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
        'Não usamos cookies de rastreamento e não montamos perfil de navegação.',
      ],
    },
    {
      id: 'priv-05',
      titulo: '5. Grupos de WhatsApp',
      conteudo: [
        'Ao entrar num grupo de WhatsApp da campanha, o tratamento dos seus dados dentro do aplicativo ' +
          'passa a seguir a política de privacidade do próprio WhatsApp e as regras do grupo. ' +
          'Você pode sair do grupo a qualquer momento pelo próprio aplicativo.',
      ],
    },
    {
      id: 'priv-06',
      titulo: '6. Compartilhamento com terceiros',
      conteudo: [
        'Não vendemos, alugamos nem cedemos dados de visitantes. ' +
          'Os serviços de hospedagem e de banco de dados utilizados pelo site processam dados ' +
          'exclusivamente para manter a página no ar e gerar as métricas agregadas descritas acima.',
      ],
    },
    {
      id: 'priv-07',
      titulo: '7. Seus direitos',
      conteudo: [
        'Como não coletamos dados que identifiquem você, não há cadastro para consultar, corrigir ou apagar. ' +
          'Ainda assim, se tiver qualquer dúvida sobre esta política ou sobre o tratamento de dados, ' +
          'a campanha responde pelos canais indicados no rodapé.',
      ],
    },
    {
      id: 'priv-08',
      titulo: '8. Mudanças nesta política',
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

export const PADRAO = {
  candidata,
  meta,
  paginas,
  navegacao,
  ctas,
  hero,
  origem,
  problema,
  valores,
  faixa,
  cena,
  provas,
  futuro,
  grupos,
  filtro,
  compartilhar,
  ctaFinal,
  rodape,
  privacidade,
} as const

/** As chaves de seção que o banco aceita. */
export const SECOES = Object.keys(PADRAO) as (keyof typeof PADRAO)[]

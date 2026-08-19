/**
 * COPY DA CAMPANHA — arquivo único.
 *
 * Tudo que é texto vive aqui. Nenhum componente escreve frase solta.
 * Isso é o que o plano chama de separar "motor" de "maquiagem":
 * em 2028 troca-se este arquivo e o site é de outra pessoa.
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

export const navegacao = [
  { rotulo: 'Quem é Sofia', href: '/#origem' },
  { rotulo: 'Compromissos', href: '/#futuro' },
  { rotulo: 'Grupos de WhatsApp', href: '/#grupos' },
  { rotulo: 'Coloque o 2233', href: '/filtro' },
] as const

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
  titulo: ['Eu sou Sofia Andrade.', 'E eu não peço licença.'],
  destaque: 1, // índice da linha que recebe a cor de marca
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
    { ano: '1998', titulo: 'A infância no interior', texto: 'A vida começa em Rondônia, longe do asfalto.' }, // ⚠️ CONFIRMAR
    { ano: '2010', titulo: 'O primeiro trabalho', texto: 'Aprende cedo que aqui nada cai do céu.' }, // ⚠️ CONFIRMAR
    { ano: '2018', titulo: 'A virada', texto: 'Entra na vida pública para resolver o que ninguém resolvia.' }, // ⚠️ CONFIRMAR
    { ano: '2026', titulo: 'Brasília', texto: 'Candidata a Deputada Federal pelo PL. Número 2233.' },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 3. PROBLEMA
// ─────────────────────────────────────────────────────────────
export const problema = {
  etiqueta: 'O que está errado',
  titulo: 'Rondônia produz. Brasília consome.',
  intro:
    'Nosso estado alimenta o Brasil e sustenta a balança comercial do país. ' +
    'Em troca recebe estrada esburacada, hospital cheio e imposto novo.',
  itens: [
    {
      numero: '01',
      titulo: 'O produtor vira réu',
      texto:
        'Quem planta e quem cria é tratado como suspeito por quem nunca pisou numa lavoura. ' +
        'Multa ambiental de gabinete não recupera nada. Só quebra família.',
    },
    {
      numero: '02',
      titulo: 'A saúde vira fila',
      texto:
        'Consulta marcada para daqui a oito meses não é atendimento, é adiamento. ' +
        'Gente de Rondônia morre esperando vaga em outro estado.',
    },
    {
      numero: '03',
      titulo: 'A segurança vira sorte',
      texto:
        'Bandido solto e cidadão de bem com medo de sair de casa. ' +
        'Quem defende a própria família ainda corre risco de virar processo.',
    },
    {
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
  titulo: 'Tem coisa que não entra em acordo.',
  intro:
    'Política é negociação em quase tudo. Mas existe um chão que não se vende. ' +
    'Este é o meu, escrito antes da eleição para você poder cobrar depois dela.',
  itens: [
    {
      chave: 'familia',
      titulo: 'Família',
      texto: 'Pai e mãe decidem a educação dos próprios filhos. Não o Estado, não a moda, não Brasília.',
    },
    {
      chave: 'liberdade',
      titulo: 'Liberdade',
      texto: 'Trabalhar, empreender, falar e crer sem pedir autorização para funcionário público nenhum.',
    },
    {
      chave: 'segurança',
      titulo: 'Segurança',
      texto: 'Lei dura com quem faz o mal e respaldo total para quem defende a própria vida e a dos seus.',
    },
    {
      chave: 'producao',
      titulo: 'Produção',
      texto: 'Quem produz é herói, não vilão. Regularização fundiária e fim da perseguição ao homem do campo.',
    },
    {
      chave: 'imposto',
      titulo: 'Menos imposto',
      texto: 'Cada real que sai do seu bolso tem que voltar em serviço. Se não volta, é confisco.',
    },
    {
      chave: 'fe',
      titulo: 'Fé',
      texto: 'Respeito e defesa da liberdade religiosa de cada família de Rondônia.',
    },
  ],
} as const

// ─────────────────────────────────────────────────────────────
// 5. PROVAS
// ⚠️ TODOS OS NÚMEROS DESTA SEÇÃO SÃO PLACEHOLDER.
//    Substituir por dados auditáveis antes de publicar.
// ─────────────────────────────────────────────────────────────
export const provas = {
  etiqueta: 'O que já foi feito',
  titulo: 'Eu não faço promessa. Eu presto conta.',
  intro:
    'Promessa qualquer um faz na véspera. O que separa candidato de gente séria é o que já está pronto e pode ser conferido.',
  numeros: [
    { valor: '52', unidade: 'municípios', texto: 'percorridos ouvindo quem mora e trabalha em cada um' }, // ⚠️ CONFIRMAR
    { valor: '00', unidade: 'milhões', texto: 'em recursos destinados a Rondônia' }, // ⚠️ CONFIRMAR
    { valor: '00', unidade: 'entidades', texto: 'sociais atendidas com apoio direto' }, // ⚠️ CONFIRMAR
    { valor: '00', unidade: 'famílias', texto: 'beneficiadas pelos programas apoiados' }, // ⚠️ CONFIRMAR
  ],
  entregas: [
    {
      titulo: 'Título de entrega 1', // ⚠️ CONFIRMAR
      municipio: 'Município', // ⚠️ CONFIRMAR
      texto: 'Descrição curta e verificável do que foi entregue, com valor e data.',
      valor: 'R$ 0,0 mi', // ⚠️ CONFIRMAR
    },
    {
      titulo: 'Título de entrega 2', // ⚠️ CONFIRMAR
      municipio: 'Município', // ⚠️ CONFIRMAR
      texto: 'Descrição curta e verificável do que foi entregue, com valor e data.',
      valor: 'R$ 0,0 mi', // ⚠️ CONFIRMAR
    },
    {
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
  titulo: 'Cinco compromissos. Assinados.',
  intro:
    'Não são vinte bandeiras para não caber nenhuma. São cinco, escritas de um jeito que dá para cobrar em quatro anos.',
  itens: [
    {
      numero: '01',
      titulo: 'Regularização fundiária de verdade',
      texto:
        'Título na mão do produtor. Quem trabalha a terra há décadas não pode continuar ' +
        'sendo tratado como invasor da própria vida.',
    },
    {
      numero: '02',
      titulo: 'Saúde que não faz esperar',
      texto:
        'Emendas carimbadas para cirurgia eletiva, exame e leito em Rondônia. ' +
        'Ninguém deveria precisar sair do estado para ser atendido.',
    },
    {
      numero: '03',
      titulo: 'Segurança com respaldo',
      texto:
        'Apoio à polícia, endurecimento de pena para crime violento e defesa de quem protege a própria família.',
    },
    {
      numero: '04',
      titulo: 'Menos imposto para quem produz',
      texto:
        'Voto contra qualquer aumento de carga tributária sobre o pequeno produtor, o comerciante e o autônomo.',
    },
    {
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
  titulo: 'Tem um grupo da Sofia na sua cidade.',
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
  vazio: 'Nenhuma cidade com esse nome. Confira a lista completa abaixo.',
  listaTitulo: 'Todos os 52 municípios',
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
  titulo: 'Coloque o 2233 na sua foto.',
  intro:
    'Sua foto não sai do seu aparelho. Nada é enviado, nada é guardado, não precisa cadastro. ' +
    'É tudo feito aqui dentro do seu celular.',
  passos: [
    { numero: '1', titulo: 'Escolha a moldura', texto: 'Story para postar ou quadrado para foto de perfil.' },
    { numero: '2', titulo: 'Escolha sua foto', texto: 'Do rolo da câmera mesmo. Ela não sai daqui.' },
    { numero: '3', titulo: 'Ajuste', texto: 'Arraste e dê zoom até o rosto ficar bem enquadrado.' },
    { numero: '4', titulo: 'Salve e poste', texto: 'Baixe, compartilhe ou segure na foto para salvar.' },
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
  botaoRefazer: 'Fazer outra',
  dicaSalvar: 'No celular: segure o dedo na foto acima e escolha "Salvar imagem".',
  avisoInstagram:
    'Você abriu pelo Instagram. Aqui o download costuma falhar — toque para abrir no navegador.',
  avisoInstagramBotao: 'Abrir no navegador',
  erroFormato:
    'Essa foto está num formato que o navegador não abre (comum em fotos de iPhone). ' +
    'Tire um print dela e use o print.',
  erroPequena: 'Essa foto é pequena e vai sair borrada. Sugerimos escolher outra.',
  avisoZonaSegura: 'Mantenha o rosto dentro da área clara.',
  privacidade: 'Sua foto nunca sai do seu aparelho.',
} as const

// ─────────────────────────────────────────────────────────────
// 9. COMPARTILHAR
// ─────────────────────────────────────────────────────────────
export const compartilhar = {
  etiqueta: 'Espalhe',
  titulo: 'Campanha boa é a que anda sozinha.',
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
  titulo: ['No dia da eleição,', 'escreva 2233.'],
  texto:
    'Se você chegou até aqui, já sabe o que eu penso. Agora falta a parte que só você pode fazer.',
  ctaPrimario: ctas.grupo,
  ctaSecundario: ctas.filtro,
} as const

// ─────────────────────────────────────────────────────────────
// 11. RODAPÉ LEGAL
// ─────────────────────────────────────────────────────────────
export const rodape = {
  assinatura: 'Feito em Rondônia.',
  links: [
    { rotulo: 'Grupos de WhatsApp', href: '/grupos' },
    { rotulo: 'Coloque o 2233 na sua foto', href: '/filtro' },
    { rotulo: 'Política de privacidade', href: '/politica-de-privacidade' },
  ],
  legalRotulo: 'Propaganda eleitoral',
  aviso:
    'Esta página é propaganda eleitoral e não coleta dados pessoais dos visitantes.',
} as const

export const privacidade = {
  titulo: 'Política de Privacidade',
  atualizadoEm: '19 de agosto de 2026',
  resumo:
    'Resumo em uma frase: esta página não pede seu nome, não pede seu telefone, ' +
    'não guarda sua foto e não guarda sua localização.',
} as const

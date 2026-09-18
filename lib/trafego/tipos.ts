import type { TipoEvento } from '@/lib/tipos'

/** O que o navegador pode ver. NUNCA inclui o token. */
export interface TrafegoPublico {
  metaPixelId: string
  gtmId: string
  metaDominio: string
}

/** O que só o servidor vê. */
export interface Trafego extends TrafegoPublico {
  capiToken: string
  capiTeste: string
  apiVersao: string
  capiAtiva: boolean
  atualizadoEm: string | null
  atualizadoPor: string | null
}

export const TRAFEGO_VAZIO: Trafego = {
  metaPixelId: '',
  gtmId: '',
  metaDominio: '',
  capiToken: '',
  capiTeste: '',
  apiVersao: 'v21.0',
  capiAtiva: true,
  atualizadoEm: null,
  atualizadoPor: null,
}

/**
 * O MAPA DE EVENTOS — do vocabulário do site para o da Meta.
 *
 * ⚠️ SÓ DOIS EVENTOS PADRÃO, e é uma decisão, não uma limitação.
 *
 *    A Meta tem uma lista de nomes reservados (Purchase, AddToCart,
 *    Subscribe…) que existem para e-commerce. É tentador pendurar o
 *    que temos nos nomes deles porque a interface de anúncios os
 *    trata melhor — e é assim que se produz um Gerenciador de Eventos
 *    que mente: "InitiateCheckout" numa página que não vende nada.
 *
 *    Aqui só dois são honestos:
 *
 *    · `PageView` — é literalmente isso.
 *    · `Lead` — a entrada no grupo de WhatsApp. É A conversão desta
 *      página: a pessoa saiu do site e entrou num canal onde a
 *      campanha fala com ela de novo. É este que o gestor usa para
 *      otimizar campanha.
 *
 *    O resto vira evento personalizado com nome em português. Não
 *    perde nada: Conversão Personalizada, público e otimização
 *    funcionam igual sobre evento personalizado — só exige criar a
 *    conversão no Gerenciador uma vez, e a tela de Tráfego no painel
 *    lista exatamente estes nomes para isso.
 *
 * ⚠️ `pagina_vista` NÃO está aqui. O PageView é disparado pelo código
 *    base do pixel, no navegador, e pela rota de eventos, no servidor,
 *    com o mesmo `event_id` — ver `components/trafego/Pixel.tsx`.
 *    Repeti-lo neste mapa produziria dois PageView por visita.
 */
export const EVENTO_META: Partial<Record<TipoEvento, string>> = {
  clicou_grupo: 'Lead',
  clicou_cta: 'ClicouCTA',
  clicou_bio: 'ClicouBio',
  entrou_grupo_indisponivel: 'GrupoIndisponivel',
  buscou_cidade: 'BuscouCidade',
  usou_localizacao: 'UsouLocalizacao',
  abriu_filtro: 'AbriuFiltro',
  subiu_foto: 'SubiuFoto',
  gerou_filtro: 'GerouFiltro',
  baixou_filtro: 'BaixouFiltro',
  compartilhou_filtro: 'CompartilhouFiltro',
  compartilhou_pagina: 'CompartilhouPagina',
  clicou_instagram: 'ClicouInstagram',
  rolou_50: 'Rolou50',
  rolou_90: 'Rolou90',
}

/**
 * Os nomes que a Meta reserva. Só estes vão em `fbq('track', …)`.
 *
 * ⚠️ Um nome fora desta lista mandado em `track` é DESCARTADO em
 *    silêncio pela Meta — não dá erro no console, não aparece no
 *    Gerenciador, simplesmente some. Foi por isso que virou um
 *    conjunto explícito em vez de uma convenção de nomenclatura.
 */
export const EVENTOS_PADRAO_META = new Set(['PageView', 'Lead'])

/** Para a tabela de referência na tela de Tráfego. */
export const EXPLICACAO_EVENTO: Partial<Record<TipoEvento, string>> = {
  clicou_grupo: 'Entrou de fato num grupo de WhatsApp. É a conversão da página.',
  clicou_cta: 'Apertou um botão que leva à lista de grupos.',
  clicou_bio: 'Tocou num botão do link da bio. O nome do botão vem junto.',
  entrou_grupo_indisponivel: 'Tentou entrar num grupo cheio ou que ainda não abriu.',
  buscou_cidade: 'Digitou o nome de uma cidade na busca.',
  usou_localizacao: 'Deixou o site achar a cidade dela pelo GPS.',
  abriu_filtro: 'Abriu o gerador de moldura.',
  subiu_foto: 'Escolheu uma foto no gerador.',
  gerou_filtro: 'Gerou a imagem com a moldura.',
  baixou_filtro: 'Baixou a imagem pronta.',
  compartilhou_filtro: 'Compartilhou a imagem pronta.',
  compartilhou_pagina: 'Compartilhou o link do site.',
  clicou_instagram: 'Foi para o Instagram da candidata.',
  rolou_50: 'Leu metade da página.',
  rolou_90: 'Leu a página quase inteira.',
}

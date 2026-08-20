export type StatusGrupo = 'aberto' | 'em_breve' | 'cheio' | 'desativado'

export interface Municipio {
  slug: string
  nome: string
  latitude: number
  longitude: number
}

export interface Grupo {
  id: string
  municipio_slug: string
  ordem: number
  /** NUNCA exposto ao navegador. Só existe no servidor. */
  link: string | null
  status: StatusGrupo
  fixado: boolean
  limite_cliques: number | null
  cliques: number
  observacao: string | null
}

/** O que o navegador pode ver. Sem `link`. */
export interface GrupoPublico {
  municipio_slug: string
  ordem: number
  status: StatusGrupo
  fixado: boolean
}

/** Município + estado do seu grupo fixado, pronto para a lista. */
export interface MunicipioComGrupo extends Municipio {
  status: StatusGrupo
  disponivel: boolean
}

export type TipoEvento =
  | 'pagina_vista'
  | 'rolou_50'
  | 'rolou_90'
  | 'buscou_cidade'
  | 'usou_localizacao'
  /** apertou um botão que leva à lista de grupos — NÃO é entrada em grupo */
  | 'clicou_cta'
  /** saiu de fato para o WhatsApp. Só a rota /g/[slug] grava este. */
  | 'clicou_grupo'
  | 'entrou_grupo_indisponivel'
  | 'abriu_filtro'
  | 'subiu_foto'
  | 'gerou_filtro'
  | 'baixou_filtro'
  | 'compartilhou_filtro'
  | 'compartilhou_pagina'
  | 'clicou_instagram'

/** De onde no layout partiu o clique. Responde "qual botão trabalha". */
export type OrigemClique =
  | 'hero'
  | 'topo'
  | 'flutuante'
  | 'lista'
  | 'busca'
  | 'geo'
  | 'cta_final'
  | 'rodape'
  | 'grupos_pagina'
  | 'qr'
  | 'direto'

export interface Evento {
  tipo: TipoEvento
  municipio_slug?: string | null
  grupo_id?: string | null
  origem?: OrigemClique | null
  utm?: string | null
  sessao?: string | null
  dispositivo?: 'celular' | 'desktop' | null
}

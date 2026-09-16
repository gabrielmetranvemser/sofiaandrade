import type { Municipio } from './tipos'

/**
 * Normaliza nome de cidade para busca: sem acento, sem apóstrofo,
 * sem hífen, minúsculo. "Alta Floresta d'Oeste" → "alta floresta doeste".
 * Usado na busca por digitação e no casamento da cidade do anúncio.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Distância de Levenshtein com corte. Tolera erro de digitação. */
export function distanciaTexto(a: string, b: string): number {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  let anterior = Array.from({ length: n + 1 }, (_, i) => i)
  let atual = new Array<number>(n + 1)

  for (let i = 1; i <= m; i++) {
    atual[0] = i
    for (let j = 1; j <= n; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1
      atual[j] = Math.min(atual[j - 1] + 1, anterior[j] + 1, anterior[j - 1] + custo)
    }
    ;[anterior, atual] = [atual, anterior]
  }
  return anterior[n]
}

/**
 * Busca tolerante. Ordem de prioridade:
 * 1. começa com o termo   2. contém o termo   3. erro de digitação pequeno
 *
 * Pede só um `nome`, e não um município inteiro: o buscador de grupo
 * procura numa lista que tem distrito no meio, e distrito não tem
 * coordenada de sede.
 */
export function buscarMunicipios<T extends { nome: string }>(
  lista: T[],
  termo: string,
  limite = 8,
): T[] {
  const t = normalizar(termo)
  if (t.length < 2) return []

  const pontuados = lista
    .map((m) => {
      const nome = normalizar(m.nome)
      if (nome.startsWith(t)) return { m, p: 0 }
      if (nome.includes(t)) return { m, p: 1 }
      const partes = nome.split(' ')
      if (partes.some((parte) => parte.startsWith(t))) return { m, p: 2 }
      const d = distanciaTexto(t, nome.slice(0, Math.max(t.length, 3)))
      const tolerancia = t.length <= 4 ? 1 : 2
      if (d <= tolerancia) return { m, p: 3 + d }
      return null
    })
    .filter((x): x is { m: T; p: number } => x !== null)
    .sort((a, b) => a.p - b.p || a.m.nome.localeCompare(b.m.nome, 'pt-BR'))

  return pontuados.slice(0, limite).map((x) => x.m)
}

const RAIO_TERRA_KM = 6371

/** Haversine. Retorna km. */
export function distanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(a))
}

/**
 * Município mais próximo de uma coordenada.
 * Roda no aparelho da pessoa. A posição é descartada logo depois.
 */
export function municipioMaisProximo<T extends Municipio>(
  lista: T[],
  latitude: number,
  longitude: number,
): { municipio: T; km: number } | null {
  return municipiosMaisProximos(lista, latitude, longitude, 1)[0] ?? null
}

/**
 * As N sedes mais próximas de uma coordenada, da mais perto para a
 * mais longe.
 *
 * Roda inteiro no aparelho: a lista dos 52 já está no bundle e a
 * coordenada nunca sai daqui. Nenhuma requisição, nenhum dado de
 * localização trafegando — que é o que permite pedir a permissão sem
 * precisar de banner de consentimento.
 */
export function municipiosMaisProximos<T extends Municipio>(
  lista: T[],
  latitude: number,
  longitude: number,
  quantos = 6,
): { municipio: T; km: number }[] {
  return lista
    .map((municipio) => ({
      municipio,
      km: distanciaKm(latitude, longitude, municipio.latitude, municipio.longitude),
    }))
    .sort((a, b) => a.km - b.km)
    .slice(0, quantos)
}

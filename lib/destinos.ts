import type { Destino, MunicipioComGrupo } from './tipos'

/**
 * A lista que a pessoa lê: os municípios na ordem alfabética e, logo
 * abaixo de cada um, os distritos que têm grupo próprio.
 *
 * Distrito colado na sede, e não no fim da lista em ordem alfabética:
 * quem procura Iata procura perto de Guajará-Mirim, e quem rola até
 * Guajará-Mirim precisa ver que existe Iata. Separados, cada um dos
 * dois some para metade das pessoas.
 *
 * A contagem dos 52 continua saindo da lista de municípios, nunca
 * desta — distrito não vira município por aparecer na mesma lista.
 */
export function achatarDestinos(municipios: MunicipioComGrupo[]): {
  destino: Destino
  dentroDe?: string
}[] {
  return municipios.flatMap((m) => [
    { destino: m },
    ...m.localidades.map((l) => ({ destino: l, dentroDe: m.nome })),
  ])
}

import { normalizar } from '@/lib/geo'
import { achatarDestinos } from '@/lib/destinos'
import type { Destino, MunicipioComGrupo } from '@/lib/tipos'

/**
 * A CIDADE QUE O ANÚNCIO PROMETEU.
 *
 * O anúncio de Porto Velho aponta para `…/?cidade=porto-velho`. Este é
 * o único lugar que traduz aquele pedaço de URL num destino de verdade.
 *
 * ⚠️ POR QUE PARÂMETRO E NÃO `#porto-velho`, que foi a ideia original.
 *
 *    Porque o fragmento (`#`) NÃO É ENVIADO ao servidor — ele existe só
 *    dentro do navegador. Com ele, a cidade só poderia ser escolhida
 *    depois que a página inteira já tivesse carregado e hidratado: a
 *    pessoa veria a página genérica, e o cartão da cidade apareceria
 *    piscando alguns instantes depois, num público que abre o link
 *    dentro do WhatsApp em 4G. Pior, `#` já é usado nesta página para
 *    as âncoras de seção (`#grupos`), e o pixel da Meta chegou a contar
 *    troca de âncora como visita nova — está registrado em
 *    `components/trafego/Trafego.tsx`.
 *
 *    Com `?cidade=`, o servidor já sabe a cidade no primeiro byte de
 *    HTML: o cartão vem pronto, sem piscada e sem depender de
 *    JavaScript. É o mesmo "final do link" que a conversa pedia, num
 *    lugar onde o servidor enxerga.
 *
 * ⚠️ CASAMENTO EXATO, SEM TOLERÂNCIA A ERRO DE DIGITAÇÃO, e é o oposto
 *    da regra que vale na busca (`buscarMunicipios`). Lá quem digita é
 *    uma pessoa e errar para o lado certo ajuda. Aqui quem escreveu a
 *    URL foi o gerador do painel: um valor que não casa é erro de
 *    cadastro do anúncio, e adivinhar mandaria a pessoa para o grupo de
 *    outra cidade sem ninguém perceber. Não casou, não pré-seleciona —
 *    a página cai no comportamento normal, que já funciona.
 */
export function resolverCidadeAlvo(
  bruto: string | string[] | undefined,
  municipios: MunicipioComGrupo[],
): Destino | null {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto
  if (!valor || typeof valor !== 'string') return null

  const termo = valor.trim().slice(0, 64)
  if (!termo) return null

  // Distrito entra igual: o anúncio do Iata leva ao grupo do Iata.
  const destinos = achatarDestinos(municipios).map((l) => l.destino)

  const porSlug = destinos.find((d) => d.slug === termo.toLowerCase())
  if (porSlug) return porSlug

  // "Porto Velho", "porto+velho" e "PORTO VELHO" também resolvem: quem
  // monta anúncio copia o nome da cidade com mais frequência do que o
  // slug, e recusar por causa de um espaço seria perder a conversão
  // inteira daquela peça.
  const alvo = normalizar(termo)
  return destinos.find((d) => normalizar(d.nome) === alvo) ?? null
}

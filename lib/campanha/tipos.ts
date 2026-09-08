/**
 * AS MARCAS QUE O ANÚNCIO DEIXA NA URL.
 *
 * Uma pessoa que chega pelo anúncio traz três coisas na primeira URL:
 * o id do clique (`fbclid`), a identificação da peça (`utm_*`) e, no
 * desenho novo, a cidade que o anúncio prometeu (`cidade`).
 *
 * ⚠️ AS TRÊS SOMEM NO PRIMEIRO TOQUE. O botão do grupo aponta para
 *    `/g/porto-velho?de=hero&s=…` — uma URL nossa, montada por nós, que
 *    não carrega nada disso. Quando o servidor grava `clicou_grupo`,
 *    que é A CONVERSÃO desta página, ele não tem mais como saber de
 *    qual anúncio aquela pessoa veio.
 *
 *    O prejuízo tem dois tamanhos. No painel, a coluna `utm` da
 *    conversão fica nula e a tela de tráfego pago mostra as entradas
 *    todas em "orgânico" — o número existe, está errado, e parece
 *    certo. Na Meta é pior: sem `fbc`, o Lead chega sem o clique de
 *    origem, e a otimização do anúncio passa a perseguir um alvo que
 *    ela não consegue atribuir a campanha nenhuma.
 *
 * Por isso as marcas são guardadas num cookie de primeira parte na
 * chegada e lidas de novo na saída. Ver `lib/campanha/marcas.ts`.
 */
export interface MarcasDeCampanha {
  /** Id do clique no anúncio da Meta. Vira `fbc` na Conversions API. */
  fbclid: string | null
  /** `utm_source|utm_medium|utm_campaign|utm_content`, no formato da coluna `utm`. */
  utm: string | null
  /** O slug do município que o anúncio prometeu. */
  cidade: string | null
  /** Segundos desde a época. A Meta exige o instante do clique dentro do `fbc`. */
  quando: number
}

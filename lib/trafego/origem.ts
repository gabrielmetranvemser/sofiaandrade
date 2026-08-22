import 'server-only'

/**
 * O PEDIDO VEIO DE UMA PÁGINA NOSSA?
 *
 * ⚠️ AS DUAS ROTAS PÚBLICAS NÃO PODEM TER AUTENTICAÇÃO. Elas são
 *    chamadas por `sendBeacon`, que não carrega cabeçalho nenhum além
 *    do padrão — é o que faz o evento sobreviver ao descarregamento da
 *    página no clique que leva para o WhatsApp. Trocar isso por um
 *    token seria perder justamente a conversão mais importante.
 *
 *    Antes, o pior que se conseguia com elas era inflar a métrica
 *    interna da campanha. Com a Conversions API ligada, o estrago
 *    mudou de natureza: evento falso agora entra no pixel e envenena a
 *    otimização do anúncio — quem paga a conta é a verba.
 *
 * `Sec-Fetch-Site` é enviado PELO NAVEGADOR e não pode ser forjado por
 * JavaScript de outra página: o próprio navegador escreve, e a
 * especificação proíbe o script de alterá-lo. Isso fecha o caso fácil,
 * que é a página de outra pessoa disparando evento em nome do site.
 *
 * ⚠️ FALHA ABERTO QUANDO O CABEÇALHO NÃO EXISTE, e isto é escolha. Um
 *    navegador antigo demais para mandar `Sec-Fetch-*` é o mesmo perfil
 *    de aparelho que esta campanha alcança em cidade pequena. Preferir
 *    perder a conversão dessa pessoa a perder um evento falso seria
 *    otimizar contra o próprio eleitor.
 *
 * ⚠️ O QUE ISTO NÃO RESOLVE: `curl` num laço. Nenhum cabeçalho resolve,
 *    porque não há nada a verificar num cliente que escreve o próprio
 *    pedido. Contra volume, o controle certo é limite de taxa na borda
 *    (Firewall da Vercel), que não custa código nem arrisca derrubar
 *    conversão legítima de gente atrás do mesmo IP de operadora — que
 *    é o caso comum no interior de Rondônia.
 */
export function veioDeOutroSite(req: Request): boolean {
  const sitio = req.headers.get('sec-fetch-site')
  if (!sitio) return false
  return sitio !== 'same-origin' && sitio !== 'none'
}

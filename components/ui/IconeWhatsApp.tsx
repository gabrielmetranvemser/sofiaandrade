/**
 * O LOGO DO WHATSAPP, inteiro — o balão com o telefone.
 *
 * ⚠️ TODO BOTÃO QUE LEVA A UM GRUPO USA ESTE, e é regra, não enfeite.
 *    Até 17/09 os botões de grupo da home tinham quatro caras: azul na
 *    primeira dobra, amarelo no cabeçalho e na chamada final, verde no
 *    flutuante — e só dois tinham o ícone. A pessoa não tinha como saber
 *    que "Entrar no grupo" abria o WhatsApp, e o botão amarelo do grupo
 *    era igual ao do filtro de foto.
 *
 *    O ícone é o que diz "WhatsApp" antes de qualquer palavra. A cor do
 *    botão segue o fundo (verde onde o fundo deixa o verde saltar; na
 *    capa, a cor de botão do esquema), mas o ícone é sempre este.
 */
export function IconeWhatsApp({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

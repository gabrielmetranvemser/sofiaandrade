import { redirect } from 'next/navigation'

/**
 * A aba "Imagens" deixou de existir: cada espaço de imagem passou a
 * viver dentro da seção a que pertence. Quem tinha o endereço salvo
 * cai na lista de seções em vez de num 404.
 */
export default function ImagensMudaramDeLugar() {
  redirect('/painel/secoes')
}

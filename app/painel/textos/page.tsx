import { redirect } from 'next/navigation'

/**
 * A aba "Textos" virou "Seções".
 *
 * O redirecionamento fica porque o painel é usado com links salvos e
 * abas abertas há dias: derrubar o endereço antigo em 404 seria punir
 * quem já tinha o caminho na memória do navegador.
 */
export default function TextosMudouDeLugar() {
  redirect('/painel/secoes')
}

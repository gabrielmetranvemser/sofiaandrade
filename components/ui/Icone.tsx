import { ehIcone, ICONES } from '@/lib/icones'

/**
 * UM ÍCONE DO CATÁLOGO, ESCRITO NO HTML.
 *
 * ⚠️ `dangerouslySetInnerHTML` COM CARA FEIA E MOTIVO BOM. O que entra
 *    ali é marcação SVG — `<path>`, `<circle>` —, e marcação precisa
 *    chegar como marcação: escapada, ela viraria texto visível no meio
 *    do desenho. O React não tem outra porta para isso.
 *
 *    O que torna seguro é a origem: o desenho NUNCA vem do banco nem
 *    do formulário. O painel grava um NOME, e o nome é procurado em
 *    `ICONES`, que é um arquivo gerado do pacote do Lucide e commitado.
 *    Nome que não está lá não desenha nada — ver `ehIcone`.
 *
 * ⚠️ NÃO É CLIENT COMPONENT, e é o ponto todo. O ícone é desenho
 *    parado: sai pronto no HTML do servidor, aparece no primeiro
 *    quadro e não custa um byte de JavaScript ao celular de quem abriu
 *    o link no 4G do interior.
 *
 * Traço e preenchimento mudam conforme o tipo: os do Lucide são
 * desenhados a traço de 2px, e os logotipos (WhatsApp, Instagram) são
 * silhuetas preenchidas — em 20px, traço fino some e a marca deixa de
 * ser reconhecida.
 */
export function Icone({
  nome,
  className = 'size-6',
}: {
  nome: string
  className?: string
}) {
  if (!ehIcone(nome)) return null
  const icone = ICONES[nome]

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...(icone.solido
        ? { fill: 'currentColor' }
        : {
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 2,
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const,
          })}
      dangerouslySetInnerHTML={{ __html: icone.desenho }}
    />
  )
}

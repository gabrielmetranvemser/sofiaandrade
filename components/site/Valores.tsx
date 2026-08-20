import { lerConteudo } from '@/lib/conteudo/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'

const ICONES: Record<string, React.ReactNode> = {
  familia: (
    <path d="M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-6 4a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm12 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM12 11c3 0 5 1.8 5 4.5V21H7v-5.5C7 12.8 9 11 12 11ZM5 13c.7 0 1.4.1 2 .4A6.6 6.6 0 0 0 5.2 18H2v-2.6C2 13.9 3.3 13 5 13Zm14 0c1.7 0 3 .9 3 2.4V18h-3.2a6.6 6.6 0 0 0-1.8-4.6c.6-.3 1.3-.4 2-.4Z" />
  ),
  liberdade: (
    <path d="M12 2 4 6v6c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V6l-8-4Zm-1 13-3-3 1.4-1.4L11 12.2l4.6-4.6L17 9l-6 6Z" />
  ),
  segurança: (
    <path d="M12 2 4 5.5V11c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5.5L12 2Zm0 4a2.5 2.5 0 0 1 2.5 2.5V10H16v6H8v-6h1.5V8.5A2.5 2.5 0 0 1 12 6Zm0 1.5c-.6 0-1 .4-1 1V10h2V8.5c0-.6-.4-1-1-1Z" />
  ),
  producao: (
    <path d="M3 20V9l6-4 6 4v2h6v9H3Zm2-2h4v-4H5v4Zm6 0h2v-6h-2v6Zm4 0h4v-5h-4v5ZM9 7.3 6.5 9H11L9 7.3Z" />
  ),
  imposto: (
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15.9V19h-2v-1.1c-1.6-.3-2.8-1.3-3-3h2c.1.8.9 1.4 2 1.4 1.1 0 1.8-.5 1.8-1.2 0-.7-.5-1-2.2-1.4-2.1-.5-3.4-1.2-3.4-3 0-1.5 1.1-2.5 2.8-2.8V6h2v1c1.5.3 2.6 1.2 2.8 2.8h-2c-.1-.7-.7-1.2-1.7-1.2s-1.7.4-1.7 1.1c0 .6.5.9 2.2 1.3 2.2.5 3.4 1.3 3.4 3.1 0 1.6-1.2 2.6-3 2.8Z" />
  ),
  fe: <path d="M10 2h4v5h5v4h-5v11h-4V11H5V7h5V2Z" />,
}

export async function Valores() {
  const { valores } = await lerConteudo()

  return (
    <Secao id="valores" fundo="verde" espaco="solto">
      <CabecalhoSecao
        etiqueta={valores.etiqueta}
        titulo={
          <>
            Tem coisa que <span className="text-amarelo">não entra em acordo.</span>
          </>
        }
        intro={valores.intro}
        tom="escuro"
      />

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {valores.itens.map((item, i) => (
          <li
            key={item.id}
            data-revelar
            style={{ ['--atraso' as string]: `${i * 70}ms` }}
            className="group rounded-2xl bg-white p-7 shadow-suave transition-transform duration-300 hover:-translate-y-1 hover:shadow-alta"
          >
            <span
              className="inline-flex size-12 items-center justify-center rounded-2xl bg-verde-escuro text-white"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
                {ICONES[item.chave]}
              </svg>
            </span>
            <h3 className="mt-5 text-xl text-tinta">{item.titulo}</h3>
            <p className="mt-2 text-base text-grafite">{item.texto}</p>
          </li>
        ))}
      </ul>
    </Secao>
  )
}

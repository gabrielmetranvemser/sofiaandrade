import Link from 'next/link'
import { candidata, rodape } from '@/content/copy'
import { config } from '@/lib/config'

/**
 * RODAPÉ DE IDENTIFICAÇÃO ELEITORAL.
 *
 * Sem isto a página não sobe. Nome do responsável, CNPJ da campanha,
 * partido/coligação e endereço do comitê são obrigatórios.
 *
 * ⚠️ CNPJ de candidato e de coligação são coisas diferentes.
 *    Confirmar com a campanha antes de publicar.
 */
export function RodapeLegal() {
  const anoAtual = new Date().getFullYear()
  const pendente = config.legal.responsavel === 'A confirmar'

  return (
    <footer className="border-t border-linha bg-areia">
      {/* pb extra no celular: o botão flutuante é uma barra fixa no rodapé */}
      <div className="container-lp pt-16 pb-28 md:pb-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-3">
              {/* LOGO OFICIAL: substituir por <Image> quando a arte chegar */}
              <span className="flex size-12 items-center justify-center rounded-2xl bg-azul text-[0.9375rem] font-bold text-white">
                2233
              </span>
              <span className="leading-tight">
                <span className="block font-[family-name:var(--font-titulo)] text-lg font-bold tracking-[-0.02em]">
                  {candidata.nome}
                </span>
                <span className="block text-sm text-grafite">
                  {candidata.cargo} · {candidata.estado}
                </span>
              </span>
            </div>

            <p className="mt-6 max-w-xs text-base text-grafite">{rodape.aviso}</p>
          </div>

          <nav aria-label="Rodapé">
            <h2 className="text-sm font-semibold tracking-[0.08em] text-grafite uppercase">Navegar</h2>
            <ul className="mt-4 space-y-1">
              {rodape.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-base text-marinho transition-colors hover:text-azul"
                  >
                    {l.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.08em] text-grafite uppercase">Acompanhe</h2>
            <a
              href={candidata.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-linha bg-white px-5 text-base font-medium shadow-suave transition-colors hover:border-azul/30 hover:text-azul"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.3-.5.2-.9.4-1.2.8-.4.3-.6.7-.8 1.2-.1.4-.3 1-.3 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.3 2.1.2.5.4.9.8 1.2.3.4.7.6 1.2.8.4.1 1 .3 2.1.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.3.5-.2.9-.4 1.2-.8.4-.3.6-.7.8-1.2.1-.4.3-1 .3-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.3-2.1a3 3 0 0 0-.8-1.2 3 3 0 0 0-1.2-.8c-.4-.1-1-.3-2.1-.3-1.2-.1-1.6-.1-4.7-.1Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.2a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0Z" />
              </svg>
              {candidata.instagramHandle}
            </a>

            <p className="mt-6 text-base text-grafite">{rodape.assinatura}</p>
          </div>
        </div>

        {/* ── Bloco legal obrigatório ── */}
        <div className="mt-14 rounded-2xl border border-linha bg-white p-7 md:p-8">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-grafite uppercase">
            {rodape.legalRotulo}
          </h2>

          <dl className="mt-5 grid gap-x-10 gap-y-4 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-medium tracking-[0.06em] text-grafite uppercase">Candidata</dt>
              <dd className="mt-0.5">
                {candidata.nome} — {candidata.numero}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-[0.06em] text-grafite uppercase">Partido</dt>
              <dd className="mt-0.5">{config.legal.partido}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-[0.06em] text-grafite uppercase">CNPJ da campanha</dt>
              <dd className="mt-0.5 tabular-nums">{config.legal.cnpj}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-[0.06em] text-grafite uppercase">Responsável</dt>
              <dd className="mt-0.5">{config.legal.responsavel}</dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="text-xs font-medium tracking-[0.06em] text-grafite uppercase">Comitê</dt>
              <dd className="mt-0.5">{config.legal.endereco}</dd>
            </div>
          </dl>

          {pendente ? (
            <p className="mt-6 rounded-lg bg-amarelo-suave px-4 py-3 text-sm ring-1 ring-amarelo/40">
              <strong className="font-semibold">Dados legais ainda não confirmados.</strong>{' '}
              Preencha NEXT_PUBLIC_CNPJ_CAMPANHA, NEXT_PUBLIC_RESPONSAVEL_CAMPANHA e
              NEXT_PUBLIC_ENDERECO_COMITE antes de publicar em domínio próprio.
            </p>
          ) : null}
        </div>

        <p className="mt-8 text-sm text-grafite">
          © {anoAtual} {candidata.nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}

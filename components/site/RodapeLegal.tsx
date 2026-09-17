import Link from 'next/link'
import { lerConteudo } from '@/lib/conteudo/ler'
import { LogoHorizontal } from '@/components/ui/Marca'
import { Texto } from '@/components/ui/TextoComDestaque'

/**
 * RODAPÉ DE IDENTIFICAÇÃO ELEITORAL.
 *
 * Sem isto a página não sobe. Nome do responsável, CNPJ da campanha,
 * partido/coligação e endereço do comitê são obrigatórios.
 *
 * ⚠️ CNPJ de candidato e de coligação são coisas diferentes.
 *    Confirmar com a campanha antes de publicar.
 */
export async function RodapeLegal() {
  const { candidata, rodape } = await lerConteudo()
  const anoAtual = new Date().getFullYear()
  const legal = rodape.legal

  // A peça sobe sem um dos obrigatórios? O aviso é para a campanha ver,
  // não para o visitante — mas fica visível de propósito: escondido no
  // painel, ninguém olha.
  const faltando = (
    [
      ['eleição', legal.eleicao],
      ['nome na urna', legal.candidato],
      ['cargo', legal.cargo],
      ['partido', legal.partido],
      ['CNPJ', legal.cnpj],
    ] as const
  )
    .filter(([, v]) => !v.trim())
    .map(([nome]) => nome)

  return (
    <footer className="relative isolate overflow-hidden bg-azul-noite text-white">
      {/* pb extra no celular: o botão flutuante é uma barra fixa no rodapé */}
      <div className="container-lp relative pt-16 pb-28 md:pb-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          {/* Marca — versão branca, que é a que existe para fundo escuro */}
          <div>
            <LogoHorizontal className="h-auto w-56 md:w-64" />
            <p className="mt-6 max-w-xs text-base text-white/60"><Texto tom="amarelo">{rodape.aviso}</Texto></p>
          </div>

          <nav aria-label="Rodapé">
            <h2 className="text-sm font-semibold tracking-[0.08em] text-amarelo uppercase">Navegar</h2>
            <ul className="mt-4 space-y-1">
              {rodape.links.map((l) => (
                <li key={l.id}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-base text-white/80 transition-colors hover:text-amarelo"
                  >
                    {l.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.08em] text-amarelo uppercase">Acompanhe</h2>
            <a
              href={candidata.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/25 px-5 text-base font-medium transition-colors hover:border-amarelo hover:text-amarelo"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.8-.1Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.3-.5.2-.9.4-1.2.8-.4.3-.6.7-.8 1.2-.1.4-.3 1-.3 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.3 2.1.2.5.4.9.8 1.2.3.4.7.6 1.2.8.4.1 1 .3 2.1.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.3.5-.2.9-.4 1.2-.8.4-.3.6-.7.8-1.2.1-.4.3-1 .3-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.3-2.1a3 3 0 0 0-.8-1.2 3 3 0 0 0-1.2-.8c-.4-.1-1-.3-2.1-.3-1.2-.1-1.6-.1-4.7-.1Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.2a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0Z" />
              </svg>
              {candidata.instagramHandle}
            </a>

            <p className="mt-6 text-base text-white/60">{rodape.assinatura}</p>
          </div>
        </div>

        {/* ── Bloco legal obrigatório ──
            A linha corrida é a forma que a peça precisa ter: é assim
            que a identificação aparece em material eleitoral, tudo
            junto, separado por barras. A grade de rótulos que existia
            aqui era mais bonita e menos parecida com o que a lei pede. */}
        <div className="mt-14 rounded-2xl border border-white/12 bg-white/[0.06] p-7 md:p-8">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-amarelo uppercase">
            {rodape.legalRotulo}
          </h2>

          <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/85">
            {[legal.eleicao, legal.candidato, legal.cargo].filter(Boolean).join(' ')}
            {[legal.partido, legal.cnpj, legal.coligacao, legal.comite]
              .filter((t) => t && t.trim())
              .map((t) => (
                <span key={t}>
                  {' '}
                  <span className="text-white/35" aria-hidden>
                    /
                  </span>{' '}
                  {t}
                </span>
              ))}
          </p>

          {faltando.length > 0 ? (
            <p className="mt-6 rounded-lg bg-amarelo/12 px-4 py-3 text-sm text-amarelo ring-1 ring-amarelo/35">
              <strong className="font-semibold">Identificação incompleta.</strong> Falta{' '}
              {faltando.join(', ')}. Preencha no painel, em Rodapé, antes de publicar.
            </p>
          ) : null}
        </div>

        <p className="mt-8 text-sm text-white/70">
          © {anoAtual} {candidata.nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}

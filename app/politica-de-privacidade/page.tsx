import type { Metadata } from 'next'
import Link from 'next/link'
import { candidata, privacidade } from '@/content/copy'
import { config, emSilencioEleitoral } from '@/lib/config'
import { Header } from '@/components/site/Header'
import { RodapeLegal } from '@/components/site/RodapeLegal'
import { Aviso } from '@/components/ui/Aviso'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como esta página trata (e não trata) seus dados: a foto do filtro não sai do seu aparelho ' +
    'e a localização é usada no aparelho e descartada.',
  alternates: { canonical: '/politica-de-privacidade' },
  robots: { index: true, follow: true },
}

const SECOES = [
  {
    titulo: '1. Quem é o responsável',
    conteudo: [
      `Esta página é mantida pela campanha de ${candidata.nome}, candidata a ${candidata.cargo} ` +
        `por ${candidata.estado} pelo ${candidata.partidoExtenso}, número ${candidata.numero}. ` +
        'Os dados de identificação da campanha, incluindo CNPJ e endereço do comitê, estão no rodapé de todas as páginas.',
    ],
  },
  {
    titulo: '2. A sua foto no gerador de moldura',
    conteudo: [
      'O gerador de moldura funciona inteiramente dentro do seu aparelho. A foto que você escolhe ' +
        'é lida pelo próprio navegador, desenhada numa tela interna junto com a moldura e salva por você.',
      'Em nenhum momento a foto é enviada para um servidor, para a campanha ou para terceiros. ' +
        'Não guardamos, não vemos e não temos como recuperar nenhuma imagem gerada aqui. ' +
        'Por isso o gerador não pede cadastro nem login.',
    ],
  },
  {
    titulo: '3. A sua localização',
    conteudo: [
      'Ao tocar em "Usar minha localização", o navegador pede a sua permissão e informa a coordenada ' +
        'apenas para o código que roda no seu próprio aparelho. Essa coordenada é usada para calcular ' +
        'qual das 52 sedes municipais está mais perto e é descartada em seguida.',
      'A coordenada não é enviada para nenhum servidor nem armazenada. Se você recusar a permissão, ' +
        'a página continua funcionando normalmente: basta buscar sua cidade pelo nome.',
      'Independentemente disso, a hospedagem pode inferir a cidade aproximada a partir do endereço de rede, ' +
        'como qualquer site faz. Usamos essa informação apenas para sugerir uma cidade na tela, ' +
        'no momento em que a página carrega. Ela não é gravada.',
    ],
  },
  {
    titulo: '4. O que medimos',
    conteudo: [
      'Registramos eventos de uso sem identificar pessoas: página vista, rolagem, busca por cidade, ' +
        'clique no botão do grupo, uso do gerador de moldura e compartilhamento.',
      'A cada visita é gerado um identificador aleatório, guardado apenas enquanto a aba estiver aberta, ' +
        'cuja única função é evitar que a mesma visita seja contada várias vezes. ' +
        'Ele não contém nome, telefone, e-mail nem endereço de rede, e desaparece quando você fecha a aba.',
      'Não usamos cookies de rastreamento e não montamos perfil de navegação.',
    ],
  },
  {
    titulo: '5. Grupos de WhatsApp',
    conteudo: [
      'Ao entrar num grupo de WhatsApp da campanha, o tratamento dos seus dados dentro do aplicativo ' +
        'passa a seguir a política de privacidade do próprio WhatsApp e as regras do grupo. ' +
        'Você pode sair do grupo a qualquer momento pelo próprio aplicativo.',
    ],
  },
  {
    titulo: '6. Compartilhamento com terceiros',
    conteudo: [
      'Não vendemos, alugamos nem cedemos dados de visitantes. ' +
        'Os serviços de hospedagem e de banco de dados utilizados pelo site processam dados ' +
        'exclusivamente para manter a página no ar e gerar as métricas agregadas descritas acima.',
    ],
  },
  {
    titulo: '7. Seus direitos',
    conteudo: [
      'Como não coletamos dados que identifiquem você, não há cadastro para consultar, corrigir ou apagar. ' +
        'Ainda assim, se tiver qualquer dúvida sobre esta política ou sobre o tratamento de dados, ' +
        'a campanha responde pelos canais indicados no rodapé.',
    ],
  },
  {
    titulo: '8. Mudanças nesta política',
    conteudo: [
      'Se esta política mudar, a data de atualização no topo desta página muda junto. ' +
        'Recomendamos conferir esta página caso tenha alguma dúvida.',
    ],
  },
]

export default function PaginaPrivacidade() {
  return (
    <>
      <Header silencio={emSilencioEleitoral()} />

      <main id="conteudo" className="pt-24 md:pt-28">
        <section className="relative isolate overflow-hidden bg-white pb-12 pt-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 brilho-claro" />

          <div className="container-lp">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 6l-6 6 6 6" />
              </svg>
              Voltar para a página
            </Link>

            <h1 className="mt-6 titulo-secao">{privacidade.titulo}</h1>
            <p className="mt-3 text-sm text-grafite">
              Atualizada em {privacidade.atualizadoEm}
            </p>

            <Aviso tom="sucesso" className="mt-8 max-w-3xl">
              <strong className="font-semibold">{privacidade.resumo}</strong>
            </Aviso>
          </div>
        </section>

        <section className="bg-white pb-24">
          <div className="container-lp">
            <div className="max-w-3xl space-y-10">
              {SECOES.map((s) => (
                <article key={s.titulo}>
                  <h2 className="text-xl md:text-2xl">{s.titulo}</h2>
                  <div className="mt-3 space-y-4">
                    {s.conteudo.map((p, i) => (
                      <p key={i} className="text-lg text-grafite">
                        {p}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-14 max-w-3xl text-sm text-grafite">
              Endereço desta página: {config.siteUrl}/politica-de-privacidade
            </p>
          </div>
        </section>
      </main>

      <RodapeLegal />
    </>
  )
}

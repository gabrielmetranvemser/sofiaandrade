import { formatoValido } from '@/lib/video'
import { lerConteudo } from '@/lib/conteudo/ler'
import { lerSlots } from '@/lib/midia/ler'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Imagem } from '@/components/ui/Imagem'
import { TextoComDestaque, Texto } from '@/components/ui/TextoComDestaque'
import { Video } from '@/components/ui/Video'

/**
 * O que os outros dizem — e o que a esquerda diz.
 *
 * Vem DEPOIS de Provas de propósito: primeiro a lei, depois o elogio.
 * Invertido, os elogios chegam antes de existir motivo para eles e a
 * seção lê como depoimento comprado.
 *
 * Os prints entram como IMAGEM, não como texto transcrito. Transcrever
 * mataria a prova: o valor de um comentário é ele ter cara de
 * comentário — o avatar, o "Responder", a contagem de curtida. Texto
 * dentro de aspas numa página de campanha é indistinguível de texto
 * que a campanha escreveu.
 *
 * O custo disso é acessibilidade: leitor de tela não lê pixel. Por
 * isso o `alt` de cada print é obrigatório no painel e a seção inteira
 * é redundante — nada aqui é informação que não exista em outro lugar
 * da página.
 *
 * ⚠️ Duas coisas travam a publicação deste bloco, e as duas são
 *    jurídicas, não técnicas: autorização de uso de imagem dos
 *    comentaristas, e conferência da citação dos dois processos. Estão
 *    escritas no painel, no card de cada espaço.
 */
export async function ProvaSocial() {
  const [{ social }, slots] = await Promise.all([lerConteudo(), lerSlots()])

  return (
    <Secao id="prova-social" fundo="branco" espaco="solto">
      <CabecalhoSecao etiqueta={social.etiqueta} titulo={social.titulo} intro={social.intro} />

      {/* GRADE, e não mosaico em colunas.
          Já foi mosaico (`columns-2` / `columns-3`) porque print de
          comentário não tem altura padrão: os do acervo vão de 335px a
          1074px, e em colunas CSS cada um ocupa só o que precisa.

          A campanha olhou o resultado e pediu os comentários "um do
          lado do outro". Tem razão, e a razão é de leitura: em colunas,
          o segundo comentário fica ABAIXO do primeiro, não ao lado —
          quem lê da esquerda para a direita atravessa três conversas
          diferentes em vez de ler uma. A grade devolve a linha.

          O `items-start` é o que impede o efeito que o mosaico existia
          para evitar: sem ele, todos os cartões da linha esticam até a
          altura do mais alto e sobra branco embaixo dos menores. Com
          ele, cada um mantém a própria altura e a linha fica alinhada
          pelo topo — que é onde o olho entra. */}
      <div className="mt-12 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {social.legendas.map((legenda, i) => (
          <figure
            key={legenda.id}
            data-revelar
            style={{ ['--atraso' as string]: `${i * 60}ms` }}
            className="overflow-hidden rounded-2xl border border-linha bg-white shadow-suave"
          >
            <Imagem
              slot={`social.comentario.${i + 1}`}
              slots={slots}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full object-cover"
            />
            {legenda.texto ? (
              <figcaption className="border-t border-linha px-4 py-2.5 text-xs text-grafite">
                <Texto>{legenda.texto}</Texto>
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {/* Os vídeos de comentário. Mesma prova, em outro formato: o
          print mostra o que escreveram, o vídeo mostra o que falaram.
          Some inteiro enquanto nenhum dos dois tiver endereço. */}
      {social.videos.some((v) => v.url) ? (
        <div className="mt-5 grid items-start gap-5 sm:grid-cols-2">
          {social.videos.map((v) => (
            <Video
              key={v.id}
              url={v.url}
              formato={formatoValido(v.formato)}
              opcoes={v.opcoes}
              titulo={v.titulo}
            />
          ))}
        </div>
      ) : null}

      {/* ── O outro lado ─────────────────────────────────────────── */}
      <div className="mt-20 rounded-3xl bg-azul-escuro p-7 text-white md:mt-24 md:p-12">
        <div className="max-w-2xl">
          <p data-revelar className="etiqueta text-white">
            <span className="inline-block h-px w-8 bg-amarelo" aria-hidden />
            {social.ataques.etiqueta}
          </p>
          <h3
            data-revelar
            style={{ ['--atraso' as string]: '70ms' }}
            className="mt-4 titulo-secao text-white"
          >
            <TextoComDestaque texto={social.ataques.titulo} tom="amarelo" />
          </h3>
          <p
            data-revelar
            style={{ ['--atraso' as string]: '140ms' }}
            className="mt-5 text-lg text-white/80"
          >
            {social.ataques.intro}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <figure
              key={n}
              data-revelar
              style={{ ['--atraso' as string]: `${n * 80}ms` }}
              className="overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15"
            >
              <Imagem
                slot={`social.ataque.${n}`}
                slots={slots}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="w-full object-cover"
              />
            </figure>
          ))}
        </div>

        {/* Os processos. Cada um é uma acusação seguida do resultado —
            e o resultado é o que a seção inteira existe para dizer. */}
        {social.processos.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {social.processos.map((p, i) => (
              <li
                key={p.id}
                data-revelar
                style={{ ['--atraso' as string]: `${i * 80}ms` }}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6"
              >
                <h4 className="text-lg text-white"><Texto tom="amarelo">{p.titulo}</Texto></h4>
                <p className="mt-2 text-base text-white/65"><Texto tom="amarelo">{p.texto}</Texto></p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-amarelo px-4 py-1.5 text-sm font-semibold text-azul-escuro">
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                    <path d="M9.6 16.2 5.4 12l-1.4 1.4 5.6 5.6L20.4 8.2 19 6.8 9.6 16.2Z" />
                  </svg>
                  <Texto tom="azul">{p.resultado}</Texto>
                </p>

                {/* Os vídeos do processo, dentro do cartão dele.
                    O do TRE tem dois — o relato e a leitura da decisão,
                    esta gravada de celular na vertical. É o único lugar
                    da página onde os dois enquadramentos convivem, e por
                    isso o formato é escolhido POR VÍDEO no painel: numa
                    proporção fixa, o vertical apareceria com metade do
                    cartão em tarja preta.

                    `items-start` de novo, e pela mesma razão de sempre:
                    um vídeo deitado ao lado de um em pé, esticados para
                    a mesma altura, distorcem os dois. */}
                {p.videos.some((v) => v.url) ? (
                  <div
                    className={`mt-5 grid items-start gap-4 ${
                      p.videos.filter((v) => v.url).length > 1 ? 'sm:grid-cols-2' : ''
                    }`}
                  >
                    {p.videos.map((v) => (
                      <Video
                        key={v.id}
                        url={v.url}
                        formato={formatoValido(v.formato)}
                        opcoes={v.opcoes}
                        titulo={v.titulo}
                      />
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <p
          data-revelar
          className="mt-10 max-w-3xl font-[family-name:var(--font-titulo)] text-xl leading-snug font-semibold tracking-[-0.02em] text-white md:text-2xl"
        >
          {social.ataques.fecho}
        </p>
      </div>

      {social.nota ? <p className="mt-6 text-xs text-grafite"><Texto>{social.nota}</Texto></p> : null}
    </Secao>
  )
}

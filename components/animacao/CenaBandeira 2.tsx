import { lerConteudo } from '@/lib/conteudo/ler'
import { TextoComDestaque } from '@/components/ui/TextoComDestaque'
import { PalcoMotor } from './PalcoMotor'

/**
 * A cena da bandeira: a tela fica presa e vai sendo pintada conforme a
 * pessoa rola. Verde, depois a cunha amarela entrando pela direita,
 * depois o azul fechando em círculo. Cada cor traz o próprio texto,
 * recortado pela forma que o revela. Rolar para cima desfaz.
 *
 * Fica entre Valores e Provas de propósito: a seção de cima termina
 * verde e a de baixo começa azul, então a cena não é um bloco colado
 * no meio da página — é a emenda entre as duas.
 *
 * A animação inteira mora em globals.css e pende de uma variável só.
 * Aqui não há estado, não há efeito, não há JavaScript — PalcoMotor é
 * um plano B que na maioria dos navegadores devolve sem registrar nada.
 */
export async function CenaBandeira() {
  const { cena } = await lerConteudo()

  const paineis = [
    { chave: 'verde', ...cena.verde, tom: 'amarelo' as const },
    // Amarelo sobre amarelo desapareceria: no painel do meio quem
    // destaca é o verde-escuro, que é a única das cinco cores da marca
    // que passa em contraste sobre o amarelo.
    { chave: 'amarelo', ...cena.amarelo, tom: 'verde' as const },
    { chave: 'azul', ...cena.azul, tom: 'amarelo' as const },
  ]

  return (
    <section data-palco aria-label={cena.verde.etiqueta}>
      <div className="palco-trilho">
        <div className="palco-fixa">
          <PalcoMotor />

          {paineis.map((painel) => (
            <div key={painel.chave} className={`cena-camada cena-${painel.chave}`}>
              <div className="w-full container-lp">
                <div className="cena-texto max-w-2xl py-16">
                  <p className="etiqueta opacity-80">{painel.etiqueta}</p>

                  <h2 className="mt-4 titulo-cartaz">
                    <TextoComDestaque texto={painel.titulo} tom={painel.tom} />
                  </h2>

                  <p className="mt-6 max-w-lg text-lg opacity-85 md:text-xl">{painel.texto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

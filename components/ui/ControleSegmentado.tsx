'use client'

/**
 * Controle segmentado — o padrão iOS de escolher entre poucas opções
 * mutuamente exclusivas.
 *
 * Existe porque a grade de miniaturas não servia: eram DUAS molduras
 * numa grade de até três colunas, então sobrava coluna vazia, e os
 * cartões tinham proporções diferentes (9:16 ao lado de 1:1), o que
 * deixava um altíssimo e o outro baixinho. Duas opções não são uma
 * galeria; são um interruptor.
 *
 * Acessibilidade: é um grupo de rádio de verdade, não botões com
 * aria-pressed. Assim as setas do teclado andam entre as opções e o
 * leitor de tela anuncia "2 de 2", que é a informação que falta quando
 * as opções são visuais.
 */
export function ControleSegmentado<T extends string>({
  nome,
  rotulo,
  opcoes,
  valor,
  onMudar,
}: {
  nome: string
  rotulo: string
  opcoes: { valor: T; rotulo: string; descricao?: string }[]
  valor: T
  onMudar: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="sr-only">{rotulo}</legend>

      <div className="flex gap-1 rounded-full bg-azul-suave p-1">
        {opcoes.map((o) => {
          const ativo = o.valor === valor
          return (
            <label
              key={o.valor}
              className={`toque relative flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-full px-4 text-center text-base font-semibold transition-colors duration-200 ${
                ativo ? 'bg-white text-azul-escuro shadow-suave' : 'text-grafite hover:text-azul-escuro'
              }`}
            >
              <input
                type="radio"
                name={nome}
                value={o.valor}
                checked={ativo}
                onChange={() => onMudar(o.valor)}
                className="sr-only"
              />
              {o.rotulo}
            </label>
          )
        })}
      </div>

      {opcoes.find((o) => o.valor === valor)?.descricao ? (
        <p className="mt-3 text-base text-grafite">
          {opcoes.find((o) => o.valor === valor)?.descricao}
        </p>
      ) : null}
    </fieldset>
  )
}

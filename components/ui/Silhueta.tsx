/**
 * PLACEHOLDER DE FOTO RECORTADA (PNG sem fundo).
 *
 * Marca exatamente onde entra a foto da candidata recortada.
 * Desenhada em SVG: zero requisição, zero layout shift, e a página
 * fica de pé mesmo se nenhuma foto chegar — o risco "fotos não
 * chegarem" está classificado como alto no plano.
 *
 * Quando a foto chegar: trocar por <Image> com as MESMAS proporções.
 */

interface Props {
  variante?: 'corpo-inteiro' | 'meio-corpo' | 'rosto'
  tom?: 'claro' | 'escuro'
  className?: string
  rotulo?: string
}

export function Silhueta({
  variante = 'meio-corpo',
  tom = 'claro',
  className = '',
  rotulo = 'Foto PNG recortada',
}: Props) {
  const cor = tom === 'escuro' ? 'text-white/35' : 'text-azul/25'

  return (
    <div
      className={`relative isolate flex items-end justify-center overflow-hidden ${className}`}
      role="img"
      aria-label={`Espaço reservado para foto: ${variante.replace('-', ' ')}`}
    >
      <svg
        viewBox="0 0 300 400"
        className={`h-full w-full ${cor}`}
        preserveAspectRatio={variante === 'corpo-inteiro' ? 'xMidYMax meet' : 'xMidYMax slice'}
        aria-hidden
      >
        <defs>
          <linearGradient id="grad-silhueta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        <g fill="url(#grad-silhueta)">
          {variante === 'rosto' ? (
            <>
              <circle cx="150" cy="158" r="84" />
              <path d="M150 258c-64 0-115 43-126 94a12 12 0 0 0 12 14h228a12 12 0 0 0 12-14c-11-51-62-94-126-94z" />
            </>
          ) : variante === 'corpo-inteiro' ? (
            <>
              <circle cx="150" cy="54" r="33" />
              <path d="M150 96c-32 0-54 20-60 51l-12 72a10 10 0 0 0 10 12h18l6 158a8 8 0 0 0 8 8h14a8 8 0 0 0 8-8l7-108h4l7 108a8 8 0 0 0 8 8h14a8 8 0 0 0 8-8l6-158h18a10 10 0 0 0 10-12l-12-72c-6-31-28-51-60-51z" />
            </>
          ) : (
            <>
              <circle cx="150" cy="116" r="60" />
              <path d="M150 192c-55 0-96 33-108 80-4 16-6 39-7 120a8 8 0 0 0 8 8h214a8 8 0 0 0 8-8c-1-81-3-104-7-120-12-47-53-80-108-80z" />
            </>
          )}
        </g>
      </svg>

      {rotulo ? (
        <span
          className={`absolute left-4 top-4 z-10 inline-block rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] backdrop-blur ${
            tom === 'escuro' ? 'bg-white/12 text-white/80' : 'bg-marinho/8 text-marinho/60'
          }`}
        >
          {rotulo}
        </span>
      ) : null}
    </div>
  )
}

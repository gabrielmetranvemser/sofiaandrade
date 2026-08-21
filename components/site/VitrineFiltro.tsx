'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Silhueta } from '@/components/ui/Silhueta'
import type { ApoiadorExemplo, Moldura } from '@/lib/molduras'

/**
 * AS DUAS MOLDURAS DA SEÇÃO, COM APOIADORES DE VERDADE ATRÁS.
 *
 * A moldura é transparente no miolo: sozinha, sobre o verde da seção,
 * ela some — e o anel do formato de perfil fica invisível. Por isso
 * sempre houve alguma coisa atrás dela. Era uma silhueta cinza
 * desenhada em SVG, que mostra ONDE a foto entra mas não mostra o que
 * a pessoa vai receber.
 *
 * Agora entram fotos de apoiadores, e elas giram sozinhas. Duas
 * decisões sustentam o componente:
 *
 * ⚠️ 1. UM ÍNDICE SÓ PARA AS DUAS MOLDURAS. Story e perfil trocam no
 *       mesmo instante e mostram a MESMA pessoa. Dois relógios
 *       independentes exibiriam duas pessoas diferentes lado a lado, e
 *       a seção passaria a dizer "olha uns apoiadores" em vez de "a
 *       sua foto fica assim nos dois formatos".
 *
 * ⚠️ 2. AS FOTOS FICAM TODAS MONTADAS, e o que muda é a opacidade.
 *       Trocar o `src` de uma <img> só faria a foto seguinte chegar
 *       DEPOIS da troca — a moldura piscaria vazia a cada volta, em
 *       toda conexão lenta, que é justamente a conexão de quem a
 *       campanha quer alcançar. São no máximo seis pares; o custo de
 *       tê-los todos em memória é menor que o de um piscar.
 *
 * Sem nenhum par completo no painel, o componente cai na silhueta de
 * sempre e a seção fica exatamente como estava.
 */

/** Quanto tempo cada apoiador fica em cena. */
const PERMANENCIA = 3800

export function VitrineFiltro({
  molduras,
  exemplos,
  rotulos,
}: {
  molduras: Moldura[]
  exemplos: ApoiadorExemplo[]
  rotulos: Record<string, string>
}) {
  const [atual, setAtual] = useState(0)
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (exemplos.length < 2) return
    // Movimento reduzido é uma preferência declarada do sistema, e uma
    // troca automática é movimento. Fica o primeiro apoiador, parado.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = caixa.current
    if (!el) return

    // ⚠️ SÓ GIRA ENQUANTO ESTÁ NA TELA. A seção fica no fim de uma
    //    página longa: sem isto, o relógio roda desde o carregamento e
    //    quem chega aqui pega a roda no meio, além de gastar bateria
    //    animando o que ninguém vê.
    let relogio: ReturnType<typeof setInterval> | null = null
    const parar = () => {
      if (relogio) clearInterval(relogio)
      relogio = null
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !relogio) {
          relogio = setInterval(() => setAtual((i) => (i + 1) % exemplos.length), PERMANENCIA)
        } else if (!entrada.isIntersecting) {
          parar()
        }
      },
      { threshold: 0.25 },
    )
    observador.observe(el)
    return () => {
      parar()
      observador.disconnect()
    }
  }, [exemplos.length])

  return (
    <div ref={caixa} data-revelar className="grid grid-cols-2 items-start gap-4">
      {molduras.map((m, i) => (
        <div
          key={m.id}
          className={`relative overflow-hidden rounded-2xl bg-azul-suave shadow-alta ring-1 ring-white/25 ${
            i === 1 ? 'mt-10' : ''
          }`}
          style={{ aspectRatio: `${m.largura} / ${m.altura}` }}
        >
          {exemplos.length === 0 ? (
            <Silhueta
              variante={m.formato === 'perfil' ? 'rosto' : 'meio-corpo'}
              className="absolute inset-0 size-full"
              rotulo=""
            />
          ) : (
            exemplos.map((apoiador, j) => {
              const foto = apoiador[m.formato]
              return (
                <Image
                  key={apoiador.id}
                  src={foto.url}
                  alt=""
                  width={foto.largura}
                  height={foto.altura}
                  sizes="(max-width: 1024px) 45vw, 22vw"
                  placeholder={foto.blur ? 'blur' : 'empty'}
                  blurDataURL={foto.blur ?? undefined}
                  // `aria-hidden` porque são ilustração: quem usa leitor
                  // de tela já recebeu, em texto, o que a seção oferece —
                  // anunciar seis apoiadores girando só atrapalharia.
                  aria-hidden
                  className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out ${
                    j === atual ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )
            })
          )}

          {/* A moldura POR CIMA, sempre. É ela o assunto da seção. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.arquivo}
            alt={rotulos[m.formato] ?? m.nome}
            loading="lazy"
            className="absolute inset-0 size-full object-contain"
          />
        </div>
      ))}
    </div>
  )
}

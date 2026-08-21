import { redirect } from 'next/navigation'

export default async function TextoDaSecaoMudouDeLugar({
  params,
}: {
  params: Promise<{ secao: string }>
}) {
  const { secao } = await params
  redirect(`/painel/secoes/${secao}`)
}

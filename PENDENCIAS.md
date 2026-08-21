# Pendências

O que falta chegar da campanha para esta base virar site publicável.
Ordenado por **o que bloqueia a publicação** primeiro.

---

## ⛔ Bloqueia a publicação

| # | Item | Onde entra |
|---|---|---|
| 1 | **CNPJ correto da campanha** — CNPJ de candidato e de coligação são coisas diferentes | Painel ▸ Textos ▸ Rodapé + `scripts/gerar-molduras.mjs` |
| 2 | **Nome completo na urna** | Painel ▸ Textos ▸ Rodapé |
| 3 | **Endereço do comitê**, se houver | Painel ▸ Textos ▸ Rodapé |
| 4 | **Coligação / nome exato do partido** | Painel ▸ Textos ▸ Rodapé |
| 5 | **Domínio da campanha** | `NEXT_PUBLIC_SITE_URL` |
| 6 | **Data exata do silêncio eleitoral** — hoje está em 03/10 00h (UTC-4) | `NEXT_PUBLIC_SILENCIO_ELEITORAL_EM` |

Enquanto 1–5 estiverem pendentes, `app/robots.ts` bloqueia a indexação
sozinho e o rodapé mostra um aviso visível. É proposital.

---

## 🔴 Conteúdo — a copy está escrita e tem um fato a confirmar

A copy foi reescrita a partir do documento de campanha
`pagina-sofia-v2` (09/08/2026). Origem, problema, valores, provas e
futuro seguem aquele texto, adaptados ao tamanho de cada campo.

Todo ponto marcado com `// ⚠️ CONFIRMAR` em [`content/copy.ts`](./content/copy.ts).

| Seção | O que falta |
|---|---|
| ~~`origem` · `provas`~~ | ~~**os 14.634 votos de 2022**~~ — **RESOLVIDO por remoção.** A campanha pediu para tirar a linha do tempo de "Quem é Sofia" e a faixa de números de "O que já foi feito", e o dado morava só nesses dois lugares. Não é mais preciso confirmar o cargo disputado |
| `candidata` | número de WhatsApp da campanha |

O que **entrou** do documento e não estava aqui antes: a história do
espetinho na Avenida Rio Madeira, Iata e Guajará-Mirim, o mandato de
vereadora, a presidência da Comissão de Segurança Pública e as nove
leis sancionadas com número e ano.

O que **ficou de fora** de propósito: a Parte 3 do documento (vídeos,
prints de comentários, depoimentos) depende de mídia que a campanha
ainda não entregou, e o Bloco 8 inteiro — prova social e os processos
— está fora pelo motivo abaixo.

---

## 🟡 Os vídeos

A página tem **oito lugares que aceitam vídeo**, todos com o campo
vazio. Vazio não é erro: com o campo em branco o bloco não existe na
página. Colar o endereço no painel liga cada um.

Onde ficam, e o que a campanha indicou para cada um:

| Painel | Onde aparece | Arquivo indicado |
|---|---|---|
| Quem é Sofia → *Vídeo da história dela* | topo da coluna de fotos | o "vídeo diamante" — **ainda em edição** |
| A rua → *Vídeo da pandemia* | antes das três fotos de 2020 | `VIDEO COVID.mp4` |
| O que está errado → *Vídeo* | fecha a seção | "BLOCO 8 - OK" — **⚠️ ver abaixo** |
| O que já foi feito → *Vídeo da prestação de contas* | ao lado da introdução | `bloco 6.mp4` |
| Prova social → *Vídeos de comentário* (2) | abaixo dos prints | `bloco 8 - comentários_.mp4` e `bloco 8 - comentário parte 2.mp4` |
| Prova social → processo do TRE → *Vídeos* (2) | dentro do cartão | `perdeu processo.mp4` e `decisão juiz_.mov` |
| Prova social → processo do Governador → *Vídeos* | dentro do cartão | `processo governador .mp4` |
| Trilha de vídeos → *Vídeos* (8 espaços) | fita acima dos Compromissos | pasta `BLOCO 8 - FINAL TRILHA DE VIDEOS DA SOFIA X PT` |

O que **falta resolver**:

1. **"BLOCO 8 - OK" não existe** na pasta de vídeos. Os candidatos são
   `BLOCO 4 - OK.mp4` (1:01) ou `BLOCO 8 - SOFIA ESCLARECE SITUAÇÃO_.mp4`
   (4:09). Precisa de confirmação de quem escreveu o pedido.
2. **Subir os vídeos** para YouTube ou Vimeo, como **não listados**, e
   colar os endereços no painel. A página não hospeda vídeo.
3. `VIDEO COVID.mp4` tem **172 MB em 3928×2160**. Reencodar para 1080p
   antes de subir.
4. Sem destino definido: `bloco 4.mp4`, `snapinsta-1787183675084.mp4`,
   `BLOCO 8 - CONTINUE ESCLARECIMENTO_.mp4`.
5. **Direito de uso.** Os arquivos da trilha têm nome `snapinsta-*` — foram
   baixados de posts do Instagram. Se algum for de terceiro, vale a mesma
   checagem que [`PLANO-FOTOS.md`](./PLANO-FOTOS.md) já exige para as fotos.
6. **Copy da trilha.** A etiqueta, o título e a introdução da seção foram
   escritos a partir do NOME DA PASTA — ninguém aqui assistiu aos oito
   vídeos. Reescrever no painel antes de publicar.

---

**Nada nesta base menciona processos judiciais** (TRE-RO, governador
Marcos Rocha ou qualquer outro). Isso fica fora até o jurídico da
campanha assinar — não é excesso de zelo, é o que vira direito de resposta.

---

## 🟡 Identidade visual

| Item | Substituir |
|---|---|
| Logo da campanha | `components/site/Header.tsx` e `RodapeLegal.tsx` — hoje é um bloco com "2233" |
| Ícones do app | `public/icone-192.png` e `public/icone-512.png` (referenciados em `app/manifest.ts`, ainda não existem) |
| **Molduras do filtro** | `public/molduras/story-apoio.svg` e `perfil-apoio.svg` — placeholders. Trocar por PNG com transparência, **mantendo 1080×1920 e 1080×1080** |
| Cores exatas | `app/globals.css`, bloco `@theme` |
| Fontes | `app/layout.tsx` — hoje Plus Jakarta Sans + Instrument Sans |
| Cartão do WhatsApp | `app/opengraph-image.tsx` é gerado por código. Para usar arte, colocar `app/opengraph-image.png` (o Next prioriza o arquivo) |

### Sobre a moldura — decisão de design, não de engenharia

Qualquer pessoa pode colocar a marca da campanha em qualquer foto. Não
dá para impedir do lado do navegador, e impedir do lado do servidor
significaria hospedar as fotos, o que é pior.

A mitigação real é de design: **a moldura precisa ler como "eu apoio",
não como "post oficial da campanha".** Aí uma foto ofensiva com a
moldura lê como um apoiador esquisito, não como material da candidata.
O placeholder já está construído assim.

---

## 🟡 Fotos

Todos os espaços de foto estão marcados na tela com placeholder que
reserva a proporção exata. Quando a foto chegar, trocar por `<Image>`
com a mesma proporção e o layout não se mexe.

| Onde | O quê | Proporção |
|---|---|---|
| Hero | **PNG recortado sem fundo**, meio corpo | livre, ocupa 24–34rem de altura |
| Origem | retrato principal | 4:5 |
| Origem | dois detalhes | 1:1 |
| Provas | três fotos de entrega | 3:2 |

A página está construída para **ficar de pé sem imagem nenhuma**. Se as
fotos não chegarem, nada quebra.

---

## 🟢 Operação

| Item | Observação |
|---|---|
| **Links dos 52 grupos** | Sobem pelo painel. Enquanto não chegam, todos ficam "em breve" e a página funciona |
| Projeto Supabase | Criar e rodar as 4 migrations. Ver README |
| `PAINEL_SENHA` e `PAINEL_SESSION_SECRET` | Trocar antes de subir |
| Confirmação de que a página substitui o beacons.ai da bio | Define se vale investir no OG e no compartilhamento |
| Meta Pixel | Só se houver tráfego pago. Exige banner de consentimento e pesa a página. Vazio = não carrega |

### Sobre o limite de cliques

Está em **700** por grupo no seed. **Clique não é entrada**: parte das
pessoas clica e não entra, outra clica duas vezes. Com 1024 o grupo
chega vazio na virada.

Depois da primeira semana, comparar o número de cliques do painel com o
número real de membros do grupo e recalibrar. É um número que só se
descobre medindo.

---

## Checklist de publicação

- [ ] CNPJ, responsável, endereço e partido confirmados e no `.env`
- [ ] Domínio apontado e `NEXT_PUBLIC_SITE_URL` preenchido
- [ ] Copy revisada e assinada pela campanha
- [ ] Números da seção "Provas" substituídos ou a seção removida
- [ ] Molduras finais no lugar, com CNPJ legível
- [ ] Supabase conectado e migrations rodadas
- [ ] Pelo menos um grupo aberto e testado no celular
- [ ] Filtro testado **dentro do Instagram**, iPhone e Android
- [ ] `PAINEL_SENHA` trocada
- [ ] Data do silêncio eleitoral conferida

---

## Fotos — o que trava a publicação

Detalhe completo em [PLANO-FOTOS.md](./PLANO-FOTOS.md). Aqui só o que
depende de alguém de fora do código.

| # | O quê | Quem resolve |
|---|---|---|
| F0 | 🔴 **As molduras no ar não são molduras — são fotos opacas.** Conferido: 0% de pixels transparentes, alpha 255 no centro. O gerador de filtro está tapando a foto de quem usa com um retângulo sólido. Precisa da arte real: PNG 1080×1920 e 1080×1080 com o miolo vazado e o CNPJ legível. Enquanto não houver, é melhor remover as duas do painel — o site volta às molduras padrão, que funcionam | Design da campanha |
| F2 | **Recorte PNG do hero.** Nenhuma das 38 fotos é recorte, e as candidatas estão abaixo de 1200×1500. Sessão de foto com fundo liso | Fotógrafo |
| F3 | **Retrato de fechamento.** Não existe no acervo. Mesma sessão do F2 | Fotógrafo |
| F4 | **Zero fotos de Sofia como vereadora** — Câmara, tribuna, Comissão de Segurança. É o único bloco em que a página afirma sem mostrar. Enquanto não houver, o print do SAPL cobre | Equipe de campo |
| F5 | **Print do SAPL** com as leis sancionadas, e a URL exata da busca por autoria (hoje há um link genérico marcado com ⚠️ em `content/copy.ts`) | Assessoria |
| F6 | **Autorização de uso de imagem** dos 6 comentaristas. Nos 2 prints de ataque, borrar nome E foto | Jurídico |
| F7 | **Conferir a citação dos dois processos** (TRE-RO e Governador Marcos Rocha) antes de publicar a Prova social | Jurídico |
| F8 | **Marca d'água** em 3 fotos: *COALA produções* nas duas melhores da rua, *Rondoniaovivo* na Pro Armas. Pedir versão limpa ou autorização | Produção |
| F9 | **7 fotos do acervo estão giradas 90°.** O recortador do painel já gira — mas vale endireitar e recortar na borda do papel antes | Produção |
| F10 | **Decisão de campanha: a foto do estande de tiro.** É a única que prova um pilar sozinha, mas foto com arma pesa em classificador de rede social e o custo cai no alcance orgânico. A alternativa (camiseta PRO ARMAS, sem arma no quadro) entrega o mesmo posicionamento | Campanha |

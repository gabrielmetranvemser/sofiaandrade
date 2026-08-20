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

## 🔴 Conteúdo — a copy está escrita mas tem fatos a confirmar

Todo ponto marcado com `// ⚠️ CONFIRMAR` em [`content/copy.ts`](./content/copy.ts).

| Seção | O que falta |
|---|---|
| `candidata` | @ do Instagram, número de WhatsApp |
| `origem` | biografia real: onde nasceu, família, primeiro trabalho, entrada na vida pública. **Os parágrafos e a linha do tempo hoje são rascunho estrutural, não fatos verificados** |
| `provas` | **todos os números e as três entregas são placeholder.** Precisam de dado auditável com fonte. A seção já mostra aviso de "em preenchimento" na tela |
| `futuro` | os cinco compromissos foram escritos a partir do posicionamento do PL. Revisar com a campanha |
| `valores` | idem |

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

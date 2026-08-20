# Estado do projeto — Sofia Andrade 2233

*Atualizado em 20/08/2026, ao fim da Fase 7.*

Este documento é o mapa de onde o projeto está e o que falta. Para as
pendências que dependem do cliente, ver [PENDENCIAS.md](./PENDENCIAS.md).
Para rodar o projeto, ver [README.md](./README.md).

---

## Em uma frase

**A estrutura está pronta e a campanha já opera o site sozinha** — todo
texto e toda imagem são editáveis pelo painel, sem deploy. O que falta é
quase todo visual: animação, o filtro refeito e o mapa.

---

## O que está pronto

### Site público

| | |
|---|---|
| Landing page | 10 seções, copy completa, identidade visual da campanha aplicada |
| Buscador de grupo | sugestão silenciosa por IP, GPS calculado no aparelho, busca tolerante a acento e erro de digitação, lista dos 52 |
| Redirecionador `/g/[slug]` | conta o clique, aplica a virada por limite, respeita o silêncio eleitoral |
| Gerador de filtro | EXIF, teto de 2000px, zona segura, e todo o tratamento do webview do Instagram |
| Política de privacidade | escrita, com tokens resolvidos do conteúdo |
| SEO | metadata, OG image gerada por código, sitemap, robots, dados estruturados |
| Conformidade eleitoral | rodapé de identificação, silêncio automático por variável de ambiente |

### Painel

| | |
|---|---|
| **Início** | o que bloqueia a publicação, funil do dia, quais seções ainda estão no texto de fábrica |
| **Textos** | 17 seções editáveis, formulário gerado por descritor, repetidores com adicionar/remover/reordenar |
| **Histórico** | por seção, com quais campos mudaram, quem salvou e quando. Restaurar não é destrutivo |
| **Imagens** | 9 espaços com instruções na tela, upload com conversão para WebP preservando transparência |
| **Grupos** | link, situação, fixar, limite de cliques, exportar CSV, gerar QR por município |
| **Métricas** | funil, qual botão trabalha, cliques por município, UTM, celular vs desktop |

### Banco

12 migrations aplicadas em `fcmssebykjxcmgmyvvra`. Tabelas: `municipios`,
`grupos`, `eventos`, `administradores`, `conteudo`, `conteudo_versoes`,
`midia`, `midia_slots`. Dois baldes de Storage. Advisors de segurança e
desempenho: **zero alertas**.

### Segurança fechada no caminho

- Guarda de sessão em toda Server Action (o `middleware` não cobre POST de outra rota)
- Segredo da sessão falha fechado — antes caía num literal do repositório
- Limite de tentativas no login
- Silêncio eleitoral cobrindo o redirecionador, não só os botões
- Contagem de clique atômica (12 cliques simultâneos contavam 4)
- Proteção de `grupos.link` em três camadas, verificada com o papel `anon`
- Upload: recusa SVG, fareja magic bytes, descarta EXIF/GPS, nunca guarda os bytes originais

---

## O que falta

Em ordem de execução. As fases 1 a 7 estão feitas.

### Fase 8 — Animações

O que o cliente pediu e ainda não existe. Hoje o site tem **duas**
animações CSS no total.

- **Revelação em bandeira**: a geometria do símbolo (losango, círculo) usada como máscara `clip-path` para revelar o conteúdo das seções
- **Scroll horizontal** com `scroll-snap` nativo em Compromissos (5 cards, hoje uma pilha de 1.444px) e nas entregas de Provas
- **Parallax de cursor** só em `@media (pointer: fine)`, via variável CSS atualizada com `requestAnimationFrame`
- **Scroll-driven** (`animation-timeline: view()`) para o parallax do retrato e a barra de progresso de leitura
- **iOS style**: bottom sheet na busca de cidade, segmented control, `active:scale`, curvas de mola

Orçamento: **CSS primeiro**. O teto do projeto continua sendo 3 segundos
até o botão principal ficar clicável num celular mediano em 4G.
Biblioteca só onde física de mola importar, carregada sob demanda e
nunca no hero.

### Fase 9 — O filtro refeito

O cliente disse que está feio, e está. Além do visual, tem defeitos reais:

- no mobile a ordem de leitura é **1, 2, 4, 3** — o passo 3 vive na outra coluna
- a grade de molduras é `grid-cols-2 sm:grid-cols-3` para **2 itens**: sobra coluna vazia e o card do Story (9:16) fica altíssimo ao lado de um quadrado
- o rótulo da zona segura está em `-top-7` dentro de um contêiner com `overflow-hidden` — é cortado
- a prévia é `max-w-md` numa coluna de 1.1fr

Refazer como **fluxo de tela cheia** no padrão de app iOS: formato →
moldura (carrossel) → foto → ajuste → pronto. As molduras passam a vir
do painel (os slots já existem).

Junto entram: **os ~40 microcopys hardcoded do filtro** (`Zoom`,
`Centralizar`, `1 ·` a `4 ·`), que deixei de fora de propósito porque a
tela vai ser refeita; o **deep link de story** (`instagram-stories://share`);
e o **contador de apoio** ("1.284 pessoas já colocaram o 2233 na foto" —
o dado já está no banco, é `count` de `gerou_filtro`).

**O que NÃO pode se perder na reforma:** detecção do webview do
Instagram, faixa "abrir no navegador", `navigator.share` com arquivo, e
a imagem grande com "segure para salvar" como caminho principal. Isso é
o que separa o filtro que funciona do que morre calado.

### Fase 10 — As cidades encolhidas

Busca grande + card da cidade por IP + as 6 mais próximas + "ver todos
os 52". No celular a busca abre como bottom sheet.

**A ressalva que eu mantenho:** o plano original fixou lista aberta
porque o público é de 35 a 64 anos e não caça botão escondido. O desenho
acima protege isso mantendo a cidade certa visível **sem clique** nos
dois caminhos mais prováveis. Vale medir depois: `buscou_cidade` contra
`clicou_grupo` por origem diz em duas semanas se atrapalhou.

### Fase 11 — O mapa de Rondônia

Os 52 municípios em SVG, pintados pelo estado do grupo. A pessoa toca
onde mora. Resolve o encolhimento da lista melhor que qualquer accordion
— ninguém precisa saber escrever "Governador Jorge Teixeira" — e vira
material de campanha sozinho: o print do mapa ficando verde ao longo das
semanas.

**É a peça mais cara da lista.** A malha do IBGE precisa ser baixada,
simplificada e conferida município a município (alguns são pequenos no
Cone Sul), e o SVG tem que caber abaixo de ~40 kB.

### Fase 12 — Fechamento

- **Supabase Auth com identidade.** Hoje o cookie guarda só o timestamp assinado; não há usuário. Com três pessoas editando propaganda eleitoral, "quem reescreveu a home às 3h" precisa ter resposta. A tabela `administradores` e a função `private.eh_admin()` **já existem** e não são usadas.
- **Rascunho e prévia.** O CMS grava direto no ar. A coluna `publicado` já nasceu na tabela para não exigir migration nova.
- **Limite em `/api/evento`.** Endpoint público sem trava. Alguém inflar a sua métrica e você decidir em cima disso é pior que inflar a do adversário.
- **Código morto.** `LogoVertical` (3 arquivos, 113 kB) nunca renderizado; `marca-numero.png` órfão; `moldurasDoFormato` e `molduraPorId` nunca chamados; `criarClienteNavegador` e `criarClienteServidor` sem uso; a tabela `municipios` e três views existem no banco e nenhuma é lida pelo app. Também: `public/.DS_Store` versionado e `MARCA/` com 13 MB de PNGs de até 32.508 px no repositório.

---

## Decisões que valem lembrar

Coisas que parecem estranhas até se saber o porquê.

**`content/copy.ts` é o padrão de fábrica, não legado.** O banco guarda
só o que foi editado. Apagar a linha de uma seção devolve o texto do
arquivo. Nada é semeado por migration de propósito — semear congelaria a
copy no dia do deploy.

**Array do banco substitui o array inteiro, nunca item a item.** Merge
por índice ressuscitaria o item que o admin removeu. Está coberto por
teste em `scripts/testar-mesclar.ts`.

**Toda lista tem `id` estável.** As chaves de React vinham do próprio
conteúdo (`key={item.ano}`). No dia em que alguém digitasse "01" duas
vezes, o React embaralharia os itens.

**`lib/conteudo/recorte.ts` é neutro de propósito** — sem `'use client'`,
sem `server-only`. Módulo de servidor não pode importar valor de um
módulo `'use client'`: recebe a referência de cliente. Isso quebrou o
build uma vez.

**Nenhum nome de saída pode repetir nome de coluna** dentro de uma função
plpgsql. Custou uma migration de correção em `contar_clique`.

**`updateTag` e não `revalidateTag`.** O primeiro faz a próxima
requisição esperar o dado novo; o segundo serve o antigo. E no Next 16 o
`revalidateTag` passou a exigir um perfil de cache.

**Recusar SVG é segurança, não gosto.** SVG é documento executável.
Vem em par com `dangerouslyAllowSVG: false`.

**`sharp` precisa acompanhar a versão que o Next embute.** Duas cópias
do libvips no mesmo processo geram, nas palavras do próprio runtime,
"mysterious crashes".

---

## Como verificar que nada quebrou

```bash
npm run build
npm run typecheck
npm audit --audit-level=high
node --experimental-strip-types scripts/testar-mesclar.ts
node --conditions=react-server --experimental-strip-types scripts/testar-imagem.ts <pasta-com-imagens>
supabase db advisors --linked --type security
supabase db advisors --linked --type performance
```

E o roteiro manual que importa:

- [ ] editar um texto no painel e ver a home mudar sem redeploy
- [ ] subir um PNG com transparência e conferir que o WebP manteve o alpha
- [ ] `/g/ji-parana` no celular cai no grupo certo
- [ ] **abrir o site DENTRO do Instagram, iPhone e Android, e fazer o filtro até salvar** — é o teste que mais vai falhar
- [ ] colar o link no WhatsApp: cartão com imagem e título
- [ ] cronometrar num celular antigo em 4G

---

## Histórico de entregas

| PR | O que entrou |
|---|---|
| [#1](https://github.com/gabrielmetranvemser/sofiaandrade/pull/1) | Estrutura base da LP |
| [#2](https://github.com/gabrielmetranvemser/sofiaandrade/pull/2) | Next.js 16, desbloqueia o deploy |
| [#3](https://github.com/gabrielmetranvemser/sofiaandrade/pull/3) | Separa "clicou no CTA" de "entrou no grupo" |
| [#4](https://github.com/gabrielmetranvemser/sofiaandrade/pull/4) | Identidade visual da campanha |
| [#5](https://github.com/gabrielmetranvemser/sofiaandrade/pull/5) | Fase 1 — tranca o painel |
| [#7](https://github.com/gabrielmetranvemser/sofiaandrade/pull/7) | Fase 2 — conteúdo vem do banco |
| [#8](https://github.com/gabrielmetranvemser/sofiaandrade/pull/8) | Fase 3 — componentes cliente |
| [#9](https://github.com/gabrielmetranvemser/sofiaandrade/pull/9) | Fase 4 — resto da copy no CMS |
| [#10](https://github.com/gabrielmetranvemser/sofiaandrade/pull/10) | Fase 5 — o painel de conteúdo |
| [#11](https://github.com/gabrielmetranvemser/sofiaandrade/pull/11) | Fases 6 e 7 — histórico e imagens |

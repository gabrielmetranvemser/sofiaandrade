# Plano de projeto — Sofia Andrade 2233

*LP de campanha + gerador de filtro + painel de grupos e métricas*
*Versão 2 · 19/08/2026 · substitui a v1*

---

## Resposta curta à sua pergunta

Sim, a estrutura está certa, e o filtro não muda nada nela.

O motivo é que o filtro roda **inteiro no navegador da pessoa**. A foto nunca sobe pro servidor. Ela é lida pelo aparelho, desenhada num canvas com a moldura por cima, e baixada. Zero backend, zero armazenamento, zero custo por uso, zero problema de LGPD. É por isso que o site da Silvia consegue dizer "sem cadastro, a foto fica no seu aparelho".

Então continua: **Next.js + Supabase + Vercel**. O que muda é dentro do painel e da camada de métricas, que eu redesenhei aqui embaixo, e um punhado de armadilhas do filtro que quebram em produção e que quase ninguém prevê.

Uma coisa que os prints mudaram no meu entendimento e vale explicitar: o link da bio dela é um beacons.ai e ela tem 99 mil seguidores. **A principal fonte de tráfego dessa página é o Instagram dela, não o Google.** Isso reordena prioridades. SEO importa pouco. Velocidade de abertura e CTA na primeira dobra importam muito. E tem uma consequência técnica pesada, que é a seção 4.

---

## 1. O que a página é

Três trabalhos, nessa ordem de importância:

1. **Colocar a pessoa num grupo de WhatsApp.** É a métrica que decide se o projeto valeu.
2. **Ser compartilhada.** A página nasceu como substituta de um PDF. Se ela não circula, falhou.
3. **Convencer.** A copy faz esse trabalho e já está pronta.

O filtro serve aos três ao mesmo tempo, e é a peça mais subestimada do projeto. Cada foto de perfil trocada é uma peça de campanha gratuita circulando com o número 2233, assinada por alguém que a rede da pessoa conhece. Vale mais que anúncio.

---

## 2. Stack e estrutura

```
/
├─ app/
│  ├─ layout.tsx                    fontes, metadata, analytics
│  ├─ page.tsx                      landing page
│  ├─ opengraph-image.tsx           cartão de compartilhamento
│  │
│  ├─ g/[slug]/route.ts             redireciona pro grupo + registra evento
│  ├─ grupos/page.tsx               lista dos 52 (fallback)
│  ├─ filtro/page.tsx               gerador de moldura
│  ├─ politica-de-privacidade/page.tsx
│  │
│  ├─ painel/
│  │  ├─ login/page.tsx
│  │  ├─ page.tsx                   grupos: editar, adicionar, fixar, regra de abertura
│  │  ├─ metricas/page.tsx          funil, cliques por município, origens
│  │  └─ qr/page.tsx                gerador de QR por município
│  │
│  └─ api/evento/route.ts           recebe eventos do navegador
│
├─ components/
│  ├─ site/          Header, BotaoFlutuante, Hero, Origem, Problema,
│  │                 Valores, Provas, Futuro, CtaFinal, Compartilhar, RodapeLegal
│  ├─ grupos/        BuscadorDeGrupo, CardCidadeSugerida, ListaMunicipios
│  ├─ filtro/        Uploader, EditorCanvas, SeletorDeMoldura, Resultado
│  └─ ui/
│
├─ lib/
│  ├─ supabase/      client.ts · server.ts · admin.ts (server-only)
│  ├─ geo.ts         haversine, normalização de nome de cidade
│  ├─ eventos.ts     disparo de eventos do lado do cliente
│  └─ imagem.ts      EXIF, downscale, exportação do canvas
│
├─ data/municipios-ro.json
├─ supabase/migrations/
├─ middleware.ts
└─ public/molduras/ · fotos/ · figurinhas/
```

---

## 3. Banco

Mudança principal em relação à v1: saiu a tabela `cliques`, entrou **`eventos`**, genérica. Você pediu "cliques e qualquer outra métrica que puder inserir junto". Uma tabela só, com um campo de tipo, aguenta tudo que vier depois sem migration nova.

```sql
create table municipios (
  slug       text primary key,
  nome       text not null,
  latitude   numeric(9,6),
  longitude  numeric(9,6)
);

create table grupos (
  id             uuid primary key default gen_random_uuid(),
  municipio_slug text not null references municipios(slug) on delete cascade,
  ordem          smallint not null default 1,
  link           text,
  status         text not null default 'em_breve'
                 check (status in ('aberto','em_breve','cheio','desativado')),
  fixado         boolean not null default false,
  limite_cliques int,
  cliques        int not null default 0,
  observacao     text,
  atualizado_em  timestamptz not null default now(),
  unique (municipio_slug, ordem)
);

create table eventos (
  id             bigint generated always as identity primary key,
  tipo           text not null,
  municipio_slug text,
  grupo_id       uuid,
  origem         text,
  utm            text,
  sessao         text,
  dispositivo    text,
  criado_em      timestamptz not null default now()
);

create index eventos_tipo_data on eventos (tipo, criado_em desc);
create index eventos_municipio on eventos (municipio_slug, criado_em desc);
```

**Tipos de evento** (o funil inteiro):

`pagina_vista` · `rolou_50` · `rolou_90` · `buscou_cidade` · `usou_localizacao` · `clicou_grupo` · `entrou_grupo_indisponivel` · `abriu_filtro` · `subiu_foto` · `gerou_filtro` · `baixou_filtro` · `compartilhou_filtro` · `compartilhou_pagina` · `clicou_instagram`

Com isso o painel te dá o funil real: *de cada 100 que abrem a página, X buscam cidade, Y clicam no grupo, Z fazem o filtro*. Esse número é o que diz se o problema é a copy, o botão ou o grupo.

`sessao` é um identificador aleatório gerado no navegador, sem nome, sem telefone, sem IP guardado. Serve só pra não contar a mesma pessoa cinco vezes. Isso mantém você fora de consentimento de cookie.

### Segurança

O link do grupo não pode ser lido pelo navegador, ou raspam os 52. Público lê uma view sem o campo `link`:

```sql
create view grupos_publicos as
  select municipio_slug, ordem, status, fixado from grupos;
```

A leitura do link real e a gravação de evento de clique acontecem só dentro de `/g/[slug]`, no servidor, com a chave `service_role` isolada em `lib/supabase/admin.ts` com `import 'server-only'` no topo.

---

## 4. A armadilha do Instagram (leia esta parte)

O tráfego vem da bio do Instagram. Quem clica ali **não abre o Chrome nem o Safari**. Abre o navegador interno do Instagram, que é um ambiente capado. Três coisas quebram lá dentro:

**O download do filtro falha ou some.** O `<a download>` no webview do Instagram frequentemente não faz nada, ou salva num lugar que a pessoa não acha. A pessoa faz o filtro, aperta baixar, não acontece nada, e desiste. Esse é o bug que mata a funcionalidade sem ninguém reportar.

**A permissão de localização se comporta diferente**, às vezes nem aparece.

**O compartilhamento nativo** pode não estar disponível.

Como resolver, e isso precisa estar no código desde o primeiro dia:

- Detectar o webview do Instagram pelo user-agent e mostrar, no topo da página do filtro, um aviso claro com botão: **"Abrir no navegador para baixar a foto"**. Sem drama, sem modal gigante, uma faixa.
- Usar `navigator.share` com arquivo quando existir (`navigator.canShare({ files })`), que funciona melhor que download em celular. Download vira o plano B.
- Sempre mostrar a imagem gerada grande na tela, com a instrução "segure na foto para salvar". É o caminho que sempre funciona, em qualquer navegador, e que o público mais velho entende.

Isso vale mais que qualquer animação bonita da página.

---

## 5. O filtro

### Fluxo
```
Escolher moldura  →  Subir foto  →  Ajustar (arrastar, zoom)  →  Gerar  →  Compartilhar ou baixar
```

Repare que eu inverti a ordem em relação à Silvia: **moldura primeiro, foto depois**. Motivo: a pessoa vê o resultado possível antes de gastar esforço. Sobe a foto já sabendo o que vai sair. Reduz abandono.

### Formatos
- **Story 1080×1920** — o principal, é o que a campanha quer circulando
- **Perfil 1080×1080** — foto de perfil de WhatsApp e Instagram, que é o de maior permanência
- Gerar os dois de uma vez e deixar a pessoa escolher qual salva

### As armadilhas técnicas que quebram em produção

| Problema | O que acontece | Solução |
|---|---|---|
| Foto de iPhone em HEIC | Não abre em Android/Chrome | Aceitar, e se falhar, mensagem clara: "Essa foto está num formato que o navegador não abre. Tire um print dela e use o print." |
| EXIF de orientação | Foto vertical entra deitada | Ler orientação e rotacionar antes de desenhar |
| Foto de 12MP no canvas | Safari trava ou dá tela branca | Reduzir para no máximo 2000px no maior lado **antes** de desenhar |
| Foto muito pequena | Sai borrada e a pessoa não usa | Avisar antes de gerar, não depois |
| Rosto cortado pela moldura | Resultado ruim, ninguém compartilha | Guias de zona segura visíveis no editor |

### Exigência legal
A moldura precisa carregar o **CNPJ do candidato**, igual à da Silvia. A imagem gerada circula como propaganda eleitoral, e ela vai circular muito.

### Risco que você precisa saber
Qualquer pessoa pode colocar a marca da campanha em qualquer foto. Não dá pra impedir do lado do navegador, e impedir do lado do servidor significaria hospedar as fotos, o que é pior. A mitigação real é de design: a moldura precisa parecer **"eu apoio"**, não **"post oficial da campanha"**. Aí uma foto ofensiva com a moldura lê como um apoiador esquisito, não como material da candidata. Isso é decisão sua de designer, e é a mitigação certa.

---

## 6. O buscador de grupo

Ordem na tela:

1. **Sugestão silenciosa por IP.** Servidor lê o cabeçalho de cidade da Vercel. Bateu com um dos 52 em RO, abre um card: "Você está em Ji-Paraná?". Sem pop-up nenhum.
2. **"Usar minha localização exata"**, secundário. Aí sim pede permissão, calcula a sede mais próxima no próprio aparelho, descarta a posição.
3. **Busca por nome**, sempre visível, tolerante a acento e erro de digitação. É o caminho que mais gente usa.
4. **Lista dos 52 aberta**, sem accordion. Público mais velho não caça botão escondido.

Município sem grupo aparece com selo "em breve", desabilitado. Melhor ver a cidade e entender que ainda não abriu do que não achar e concluir que o site quebrou.

---

## 7. O painel

### Grupos

Uma tela, 52 linhas. Por linha: município, link, status, e um botão pra adicionar o próximo grupo.

A regra que você pediu, traduzida:

- Cada município pode ter vários grupos, numerados por ordem.
- Um deles é o **fixado**: é pra onde todo mundo vai.
- Cada grupo tem um **limite de cliques** opcional. Quando o fixado bate o limite, ele passa a `cheio` e o próximo assume sozinho.
- Sempre existe um **botão de virar na mão**, que ignora o limite. A regra automática é conveniência, não algema.

**Um aviso importante sobre esse limite:** clique não é entrada. Uma parte das pessoas clica e não entra, e outra clica duas vezes. Se você colocar 1024 como limite, o grupo vai estar bem vazio quando virar. Sugiro começar em torno de 700 e, depois da primeira semana, comparar o número de cliques com o número real de membros do grupo pra calibrar. É um número que você só descobre medindo.

Duas coisas de usabilidade que evitam suporte de madrugada:
- **Validar o link ao colar.** Não começa com `https://chat.whatsapp.com/`, avisa na hora.
- **Botão "testar"** em cada linha, que abre numa aba nova.

E uma que você agradece depois: **exportar CSV**. Se o Supabase cair ou alguém apagar algo, a campanha ainda tem os links.

### Métricas

- Funil do dia e dos últimos 30 dias
- Cliques em grupo por município, ordenado
- Origem do clique: hero, topo, flutuante, lista, busca, geo, CTA final. Em duas semanas isso diz qual botão trabalha e qual é enfeite.
- Uso do filtro: abriu → gerou → baixou/compartilhou
- Visitas por origem de UTM, pra medir o tráfego pago
- Celular vs desktop

### QR por município

Não está no seu pedido e eu acho que deveria estar. Campanha tem adesivo, panfleto, carro de som, evento. Uma tela no painel que gera o QR de `/g/nome-da-cidade` pra baixar em PNG resolve o material impresso, e como o QR aponta pro seu domínio, **o clique de rua entra na mesma métrica do clique digital**. Você passa a saber que o panfleto de Vilhena funcionou. É meia hora de trabalho.

---

## 8. Análise e pixel

Três camadas, com papéis distintos:

- **Eventos próprios no Supabase** — o funil de verdade, o que você olha pra decidir
- **Vercel Analytics** — visitas e páginas, sem cookie, sem banner de consentimento
- **Meta Pixel** — só se houver tráfego pago. Ele exige banner de consentimento e pesa na página. Se não vai ter anúncio, não coloca.

---

## 9. Identidade visual

Aqui é seu território, então só o que impacta a engenharia.

Ela é do PL: azul, verde e amarelo. O cliente pediu "identidade mais agressiva, com formas, não tão tecnológica", em oposição direta ao clean da Silvia. E o feed dela já mostra o que funciona: caixa alta pesada, blocos de cor chapada, contraste duro, faixas diagonais, texto grande.

O que a engenharia precisa saber:

- **Corpo de texto a partir de 18px, alvo de toque a partir de 48px.** Público de 35 a 64 anos, muito no celular.
- **Contraste alto de verdade.** Amarelo sobre branco não passa. Amarelo sobre azul escuro passa.
- **Animação com moderação e respeitando `prefers-reduced-motion`.** Você pediu animações bonitas e elas cabem, mas cada uma custa desempenho, e o público está em 4G de Rondônia. Sugiro concentrar em dois momentos: a entrada do hero e a revelação dos blocos de lei conforme rola. Um momento orquestrado ganha de dez efeitos espalhados.
- **A página tem que ficar em pé sem imagem nenhuma.** As fotos ainda não chegaram e podem não chegar hoje.
- **Menos de 3 segundos até o botão principal ficar clicável**, num celular mediano em 4G. Toda decisão de mídia passa por esse teto.

---

## 10. Conformidade eleitoral

- **Rodapé de identificação** com nome do responsável, CNPJ da campanha, coligação e endereço do comitê. Sem isso a página não sobe. O CNPJ aparece nas artes do Instagram dela (`68.379.640/0001-98`), mas **confirme com a campanha antes de publicar**, porque CNPJ de candidato e de coligação são coisas diferentes.
- **CNPJ na moldura do filtro** também.
- **Política de privacidade**, dizendo que a localização é usada no aparelho e descartada, e que a foto do filtro nunca sai do celular.
- **Silêncio eleitoral:** CTA sai do ar a partir de 00h de 03/10. Deixa como variável de ambiente com data, não como algo pra alguém lembrar.
- **As menções a processos judiciais** da copy (TRE-RO, governador Marcos Rocha) ficam fora até o jurídico da campanha assinar. Não é excesso de zelo, é o que vira direito de resposta.

---

## 11. Ordem de execução

Fases pensadas pra você parar em qualquer ponto e ainda ter algo no ar.

| Fase | O que entrega | Tempo |
|---|---|---|
| **1** | Projeto, deploy, tokens visuais, LP completa com a copy, header, botão flutuante, rodapé legal | ~1h30 |
| **2** | Migrations, seed dos 52, rota `/g/[slug]`, buscador com busca por nome e lista | ~1h30 |
| **3** | Filtro: moldura, upload, editor, exportação, tratamento do webview do Instagram | ~2h |
| **4** | Painel: login, grupos, fixar, limite de cliques, exportar CSV | ~1h30 |
| **5** | Métricas, eventos, localização por IP e por GPS | ~1h |
| **6** | OG image, QR por município, ajuste fino de mobile, fotos quando chegarem | ~1h |

Ordem de corte se a madrugada render menos: **6, depois 5, depois 4.** Fases 1, 2 e 3 são o produto. Painel e métrica são conforto, dá pra editar os links direto na tabela do Supabase por alguns dias.

---

## 12. Como testar

- `/g/ji-parana` no celular cai no grupo certo
- Trocar o link no painel e reabrir a mesma URL: vai pro novo destino sem republicar nada
- Marcar o fixado como cheio com um grupo 2 cadastrado: passa a cair no 2 sozinho
- Bater o limite de cliques: vira automático
- Município sem grupo: mensagem tratada, nunca erro
- **Abrir o link do site dentro do Instagram, no iPhone e no Android, e fazer o filtro inteiro até salvar a foto.** Este é o teste que mais vai falhar. Faça primeiro.
- Foto vertical de iPhone: entra na orientação certa
- Colar o link no WhatsApp: cartão com foto e título
- Cronometrar num celular antigo em 4G

---

## 13. Riscos

| Risco | Chance | O que fazer |
|---|---|---|
| Download do filtro falhar no webview do Instagram | **Alta** | Seção 4. Aviso de abrir no navegador + share nativo + imagem grande pra segurar e salvar. |
| Links dos grupos não chegarem hoje | Alta | Sobe com status "em breve". A página funciona, o cliente preenche. |
| Fotos e vídeos não chegarem | Alta | Layout tem que ficar de pé sem imagem. Nada de espaço reservado quebrado. |
| Sem CNPJ e domínio confirmados | Média | **Bloqueia a publicação.** Segura em URL de preview. |
| Coordenadas erradas no seed | Média | Testar 5 municípios distantes antes de subir. Erro silencioso: ninguém reclama, a pessoa só não entra. |
| Cache da Vercel na rota `/g/` | Média | `force-dynamic`. Sintoma: clique não conta e link antigo persiste. |
| Limite de cliques calibrado errado | Média | Começa em 700, ajusta depois de medir cliques contra membros reais. |
| Moldura usada em foto ofensiva | Baixa, impacto reputacional | Design de moldura como "eu apoio", não como post oficial. |
| `service_role` vazar pro navegador | Baixa, impacto alto | `import 'server-only'` em `lib/supabase/admin.ts`. |

---

## 14. Pendências do cliente

1. Links dos grupos que já existem
2. Identidade: logo, cores exatas, fontes, artes das molduras
3. Fotos e os links de Instagram no drive
4. **CNPJ correto, coligação e endereço do comitê**
5. **Domínio da campanha**
6. Aval jurídico sobre as menções a processos
7. Confirmação de que a página vai substituir o beacons.ai da bio

---

## 15. Depois da eleição

Você já tem a Silvia. Agora a Sofia. O print da Flavinha 5510 sugere que tem uma terceira.

Três campanhas com a mesma engenharia é padrão, não coincidência. O que se repete é exatamente a parte cara: buscador de município, redirecionador com métrica, painel de grupos, gerador de filtro, rodapé legal, silêncio eleitoral automático. O que muda é a pele e o conteúdo.

Não é pra fazer nada disso hoje. Mas se você construir a Sofia já separando o que é motor do que é maquiagem, em 2028 você monta uma campanha em dois dias em vez de duas semanas. E o dado acumulado de cliques por município, campanha após campanha, é uma coisa que nenhum concorrente seu vai ter.

Isso é decisão sua, não minha. Só não deixa de ser uma escolha por não ter percebido que é uma.

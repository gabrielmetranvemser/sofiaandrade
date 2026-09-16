# Sofia Andrade 2233 | Candidata

LP de campanha + gerador de filtro + painel de edição, grupos e métricas.
Deputada Federal por Rondônia · PL · número **2233**.

> Estado atual: **site completo, Supabase conectado, painel no ar.**
> Quase tudo que aparece na página é editável sem republicar: textos,
> imagens, vídeos, cores, os links dos grupos, o rastreamento de
> anúncio e o cartão que o WhatsApp mostra.
>
> O que ainda trava a publicação em domínio próprio está em
> [PENDENCIAS.md](./PENDENCIAS.md) — são dados da campanha, não código.

---

## Rodar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre em `http://localhost:3000`.
Painel em `http://localhost:3000/painel` (senha em `PAINEL_SENHA`).

```bash
npm run build      # build de produção
npm run typecheck  # tsc --noEmit
```

Sem `NEXT_PUBLIC_SUPABASE_URL` o site continua de pé: cai nos dados de
`data/` e nos textos de `content/copy.ts`, e o painel abre em modo de
leitura. Nada quebra sem banco.

---

## O que a página faz, em ordem de importância

1. **Colocar a pessoa num grupo de WhatsApp.** É a métrica que decide se o projeto valeu.
2. **Ser compartilhada.** A página substitui um PDF. Se não circula, falhou.
3. **Convencer.** É o trabalho da copy.

O filtro serve aos três ao mesmo tempo: cada foto de perfil trocada é
uma peça de campanha circulando de graça, assinada por alguém que a
rede da pessoa conhece.

---

## O painel

`/painel`, senha única. Oito telas, cada uma com um dono:

| Tela | O que resolve |
|---|---|
| **Início** | o que bloqueia a publicação, funil do dia, quais seções ainda estão no texto de fábrica |
| **Seções** | a página inteira, na ordem em que ela aparece. Dentro de cada seção: textos, imagens e vídeos dela, com prévia ao vivo e histórico de versões |
| **Vídeos** | todos os espaços de vídeo num lugar só — trabalho de produção, com os arquivos na mão |
| **Identidade** | nome, número, marca, ícone, cores, textura, cartão de compartilhamento e a identificação eleitoral do rodapé |
| **Grupos** | link, situação, fixar, limite de cliques, exportar CSV, gerar QR por município |
| **Métricas** | funil, qual botão trabalha, cliques por município, UTM, celular vs desktop |
| **Tráfego** | pixel da Meta, Conversions API pelo servidor e Google Tag Manager — com o texto de privacidade pronto para colar quando o pixel for ligado |
| **Tráfego ▸ Links** | um link de anúncio por município, com a cidade já escolhida e o UTM certo. Copiar um, copiar os 52, baixar CSV |
| **Buscas** | os endereços de `sitemap.xml`, `robots.txt` e `llms.txt` com botão de copiar, o estado da indexação e a verificação do Search Console |

Toda escrita passa por Server Action com sessão conferida. O conteúdo é
versionado: cada salvamento guarda uma cópia integral em
`conteudo_versoes`, e restaurar nunca é destrutivo.

---

## Estrutura

```
app/
├─ layout.tsx                   fontes, metadata (vinda do painel), verificações
├─ page.tsx                     landing page
├─ opengraph-image.tsx          cartão do WhatsApp — imagem do painel, ou desenho em código
├─ sitemap.ts · robots.ts · manifest.ts · llms.txt/route.ts
│
├─ g/[slug]/route.ts            REDIRECIONADOR — conta o clique e vira o grupo
├─ grupos/page.tsx              o buscador de grupo em página própria (fallback e destino de erro)
├─ filtro/page.tsx              gerador de moldura
├─ politica-de-privacidade/
│
├─ painel/
│  ├─ login/                    senha única (vira Supabase Auth depois)
│  ├─ page.tsx                  início
│  ├─ secoes/[secao]/           editor por seção + histórico
│  ├─ videos/ · identidade/     produção de vídeo · marca e SEO
│  ├─ grupos/ · metricas/       operação e números
│  ├─ trafego/ · buscas/        anúncio e busca
│  └─ acoes*.ts                 Server Actions (toda escrita passa aqui)
│
└─ api/evento · api/trafego/pv  eventos do navegador e PageView pelo servidor

components/
├─ site/       as seções da página, uma por arquivo
├─ grupos/     o buscador: localização do aparelho ou nome da cidade
├─ filtro/     webview do Instagram, canvas, resultado
├─ animacao/   palco de rolagem e cena da bandeira
├─ trafego/    pixel e GTM (só carregam se o painel preencher)
└─ ui/         Botao · Secao · Imagem · Video · TextoComDestaque · Revelar …

lib/
├─ config.ts       env, silêncio eleitoral e "o site pode ser indexado?"
├─ campanha/       a cidade do anúncio na URL e a origem guardada no cookie
├─ conteudo/       leitura, merge, validação, versões e o recorte que vai ao cliente
├─ midia/          slots de imagem: leitura e processamento (sharp → WebP)
├─ trafego/        pixel, Conversions API e origem do clique
├─ video.ts        interpretação de link, enquadramento e medidas
├─ dados.ts        grupos e municípios, com fallback local ↔ Supabase
├─ geo.ts          busca tolerante a acento e erro de digitação, haversine
├─ imagem.ts       EXIF, downscale, desenho e exportação do canvas
├─ painel/         sessão, limite de tentativas, destinos de vídeo
└─ supabase/       client · server · admin (server-only)

content/
├─ copy.ts         o texto de fábrica — o painel sobrescreve por cima
├─ esquema.ts      descritor dos campos do painel (formulário + validação)
├─ slots.ts        os espaços de imagem, com as exigências de cada um
└─ mapa.ts         costura tudo na ordem da página

data/              municipios-ro.json (52) · localidades · grupos.local.json
supabase/migrations/   15 migrations, em ordem
```

### Motor e maquiagem

`lib/`, `app/g/`, `app/api/` e `app/painel/` são **motor**: se repetem
em qualquer campanha. `content/`, `app/globals.css` e o que está no
banco são **maquiagem**: mudam por candidato. Foi construído separado
de propósito — em 2028 troca-se a maquiagem.

---

## Vídeo em pé e vídeo deitado

O acervo tem os dois enquadramentos, e o painel guarda qual é qual em
cada espaço. **Não existe um layout que sirva aos dois.** Um vídeo em
pé numa coluna desenhada para 16:9 vira uma tira estreita com calhas
brancas dos lados — foi o defeito relatado pela campanha.

Por isso seis seções têm **dois desenhos**, escolhidos pelo
enquadramento: `Origem`, `Rua`, `Problema`, `Provas`, `ProvaSocial` e
`Trilha`. A regra que vale para todas:

- deitado mantém o desenho original da seção, sem exceção;
- em pé, a coluna do vídeo passa a valer **a largura do vídeo** — nunca
  uma fração da seção — para que as bordas batam com as do vizinho;
- quem sobrar de altura estica (cartão, foto), em vez de deixar branco;
- a trilha vira grade quando são até seis vídeos em pé, e só volta a ser
  barra rolável do sétimo em diante.

`components/ui/Video.tsx` tem a prop `preencher` para o caso em que a
coluna já decide a largura. Cada seção explica a própria escolha em
comentário, no arquivo.

---

## Tráfego por município

A campanha roda um conjunto de anúncios por cidade. O link de cada um
termina com a cidade:

```
https://…/?cidade=porto-velho&utm_source=meta&utm_medium=cpc&utm_campaign=grupos-municipios&utm_content=porto-velho
```

Quem clica cai na página com **a cidade já escolhida**: a seção de
grupos abre com o painel dela, e todo botão de grupo — cabeçalho, hero,
flutuante, CTA final — passa a apontar direto para `/g/porto-velho`, em
vez de rolar até a busca. Um toque, não três.

Os links saem prontos de **Painel ▸ Tráfego ▸ Links de anúncio**, um por
município, com o UTM já montado e um aviso nas cidades cujo grupo ainda
não abriu — anunciar uma delas é pagar por um clique que termina num
"em breve".

**Parâmetro, e não `#porto-velho`.** O fragmento não é enviado ao
servidor: com ele a cidade só apareceria depois de a página carregar e
hidratar, piscando, num público que abre o link dentro do WhatsApp em
4G. E `#` já é das âncoras de seção. Com `?cidade=`, o card vem no
primeiro byte de HTML.

**O cookie de origem.** O botão do grupo aponta para uma URL nossa
(`/g/porto-velho?de=hero&s=…`) que não carrega `fbclid` nem UTM — eles
ficaram na URL de chegada. Sem memória, a conversão chegaria ao painel
como orgânica e à Meta sem o clique de origem. Então o `proxy.ts` grava
as marcas num cookie de primeira parte na chegada, e as duas rotas de
servidor leem de volta na saída:

- `sofia_campanha`, **de sessão** (morre ao fechar o navegador), `httpOnly`
- só é escrito quando a URL traz `fbclid`, `utm_source` ou `cidade` —
  em visita orgânica o proxy nem é invocado
- **combina, não sobrescreve**: `?cidade=` sozinho pode ser o desvio do
  próprio redirecionador quando o grupo está cheio, e substituir ali
  apagaria o anúncio de origem no meio do caminho
- entra no texto da política de privacidade que a tela de Tráfego
  entrega pronto para colar

O ganho maior é na Meta: com o pixel bloqueado — bloqueador, iOS, rede
filtrando `connect.facebook.net` — `_fbc` não existe, e é justamente
esse público que a Conversions API existe para alcançar. O cookie
devolve o `fbc` ao `Lead`, que sem ele chegaria sem saber de qual
anúncio veio.

**Painel ▸ Métricas ▸ Anúncio por município** fecha a conta: visitas
vindas do anúncio → entradas no grupo, uma linha por peça e cidade.

---

## Segurança: o link do grupo

O `grupos.link` é o segredo do projeto. Se vazar, raspam os 52.
Três camadas independentes protegem:

1. **RLS** na tabela `grupos`
2. **Privilégio por coluna** — `anon` e `authenticated` não recebem `link`.
   Mesmo com a policy errada, `select link from grupos` dá permission denied.
3. **View `grupos_publicos`** sem a coluna, é o que o site consome.

A leitura do link real acontece só em `app/g/[slug]/route.ts`, no
servidor, com `service_role` isolada em `lib/supabase/admin.ts`, que tem
`import 'server-only'` no topo — se algum componente de cliente importar
por engano, **o build quebra**.

O token da Conversions API segue a mesma lógica e mora em tabela
própria, **sem versionamento**: credencial em histórico é credencial
vazada para sempre. O painel mostra só os quatro últimos caracteres.

---

## A armadilha do Instagram

O tráfego vem da bio do Instagram. Quem clica ali abre o webview interno
do app, onde `<a download>` frequentemente não faz nada. A pessoa faz o
filtro, aperta baixar, não acontece nada, e desiste — sem reportar.

O que está no código desde o primeiro dia (`lib/navegador.ts`,
`components/filtro/AvisoWebview.tsx`, `components/filtro/Resultado.tsx`):

- detecção do webview por user-agent + faixa "abrir no navegador"
- `navigator.share` com arquivo quando existe — funciona melhor que download
- **imagem grande na tela com "segure para salvar"** como caminho principal,
  porque é o que funciona em qualquer navegador

**Este é o teste que mais vai falhar. Faça primeiro.**

---

## Conformidade eleitoral

| Item | Onde | Situação |
|---|---|---|
| Rodapé de identificação | Painel ▸ Identidade ▸ Rodapé | ✅ montado, **dados a confirmar** |
| CNPJ na moldura | `public/molduras/` | ✅ na arte |
| Política de privacidade | `app/politica-de-privacidade` | ✅ escrita e editável pelo painel |
| Silêncio eleitoral automático | `NEXT_PUBLIC_SILENCIO_ELEITORAL_EM` | ✅ variável de ambiente, não depende de alguém lembrar |
| Menções a processos judiciais | Painel ▸ Seções ▸ Prova social | ⛔ **só com o jurídico assinando** |
| Pixel ligado × texto da privacidade | Painel ▸ Tráfego | ⚠️ ligar o pixel exige trocar o texto — a tela entrega o parágrafo pronto |

O `robots.ts` bloqueia indexação enquanto a URL for `localhost` ou
`*.vercel.app`. Publicação em domínio próprio depende de CNPJ e domínio
confirmados. O estado disso aparece em **Painel ▸ Buscas**.

---

## Banco

Supabase já conectado. Tabelas: `municipios`, `grupos`, `eventos`,
`administradores`, `conteudo`, `conteudo_versoes`, `midia`,
`midia_slots`, `trafego`. Dois baldes de Storage.

Para levantar um projeto novo (outra campanha), rodar as 15 migrations
de `supabase/migrations/` em ordem e preencher no `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Nenhum componente muda: quem consulta o banco é `lib/`.

---

## Deploy

Vercel, a partir do GitHub. As variáveis do `.env.example` vão no painel
da Vercel — em especial `NEXT_PUBLIC_SITE_URL`, que é o que decide se o
site pode ser indexado e o que alimenta os endereços da tela de Buscas.

Manter em **URL de preview** até CNPJ, responsável, endereço do comitê e
domínio estarem confirmados.

---

## Como testar

- [ ] `/g/ji-parana` no celular cai no grupo certo
- [ ] trocar o link no painel e reabrir a mesma URL: vai pro novo destino sem republicar
- [ ] marcar o fixado como cheio com um grupo 2 cadastrado: passa a cair no 2 sozinho
- [ ] bater o limite de cliques: vira automático
- [ ] município sem grupo: mensagem tratada, nunca erro
- [ ] **abrir o site DENTRO do Instagram, no iPhone e no Android, e fazer o filtro até salvar**
- [ ] foto vertical de iPhone entra na orientação certa
- [ ] colar o link no WhatsApp: cartão com imagem e título
- [ ] trocar um vídeo de deitado para em pé no painel e conferir a seção nos dois estados
- [ ] editar um texto no painel e ver a home mudar sem republicar
- [ ] cronometrar num celular antigo em 4G — teto de 3s até o botão clicável
- [ ] no celular, digitar "vilh" na busca de grupo: a sugestão aparece acima do teclado e o toque abre o painel da cidade
- [ ] "Usar minha localização" no celular: o painel mostra a cidade certa; negando a permissão, aparece o aviso para digitar
- [ ] abrir `/?cidade=porto-velho` e conferir que TODO botão de grupo leva a `/g/porto-velho`
- [ ] abrir `/?cidade=porto-velo` (errado de propósito): a página cai no comportamento normal, sem adivinhar
- [ ] com um grupo cheio: clicar no botão, cair em `/grupos`, escolher outra cidade, e conferir no banco que o `clicou_grupo` guardou o UTM do anúncio original

---

Pendências do cliente: ver [PENDENCIAS.md](./PENDENCIAS.md).
Panorama do que está pronto: ver [ESTADO.md](./ESTADO.md).

# Sofia Andrade 2233

LP de campanha + gerador de filtro + painel de grupos e métricas.
Deputada Federal por Rondônia · PL · número **2233**.

> Estado atual: **estrutura levantada e rodando 100% local.**
> Supabase ainda não conectado — o site funciona inteiro com os dados
> de `data/`. Nada quebra sem banco.

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

---

## O que a página faz, em ordem de importância

1. **Colocar a pessoa num grupo de WhatsApp.** É a métrica que decide se o projeto valeu.
2. **Ser compartilhada.** A página substitui um PDF. Se não circula, falhou.
3. **Convencer.** É o trabalho da copy.

O filtro serve aos três ao mesmo tempo: cada foto de perfil trocada é
uma peça de campanha circulando de graça, assinada por alguém que a
rede da pessoa conhece.

---

## Estrutura

```
app/
├─ layout.tsx                   fontes, metadata, SEO base
├─ page.tsx                     landing page
├─ opengraph-image.tsx          cartão do WhatsApp (gerado, sem designer)
├─ sitemap.ts · robots.ts · manifest.ts
│
├─ g/[slug]/route.ts            REDIRECIONADOR — conta o clique e vira o grupo
├─ grupos/page.tsx              lista dos 52 (fallback e destino de erro)
├─ filtro/page.tsx              gerador de moldura
├─ politica-de-privacidade/
│
├─ painel/
│  ├─ login/                    senha única (vira Supabase Auth depois)
│  ├─ page.tsx                  grupos: link, situação, fixar, limite, CSV
│  ├─ metricas/                 funil, município, origem, UTM, dispositivo
│  ├─ qr/                       QR por município para material impresso
│  └─ acoes.ts                  Server Actions (toda escrita passa aqui)
│
└─ api/evento/route.ts          recebe eventos do navegador

components/
├─ site/       Header · BotaoFlutuante · Hero · Origem · Problema ·
│              Valores · Provas · Futuro · SecaoGrupos · SecaoFiltro ·
│              Compartilhar · CtaFinal · RodapeLegal
├─ grupos/     BuscadorDeGrupo · CardCidadeSugerida · ListaMunicipios · LinhaMunicipio
├─ filtro/     AvisoWebview · SeletorDeMoldura · EditorCanvas · Resultado · GeradorDeFiltro
└─ ui/         Botao · Secao · Silhueta · QuadroImagem · Aviso · Numero2233 · Revelar

lib/
├─ config.ts       ponto único de leitura de env + silêncio eleitoral
├─ dados.ts        acesso a dados com fallback local ↔ Supabase
├─ geo.ts          busca tolerante, haversine, casamento de header da Vercel
├─ eventos.ts      disparo de evento no cliente (sendBeacon)
├─ imagem.ts       EXIF, downscale, desenho e exportação do canvas
├─ navegador.ts    detecção de webview do Instagram, share nativo
├─ metricas.ts     leitura das views de métrica
├─ molduras.ts     catálogo de molduras
├─ painel/sessao.ts
└─ supabase/       client.ts · server.ts · admin.ts (server-only)

content/copy.ts    TODA a copy, num arquivo só
data/              municipios-ro.json (52) · grupos.local.json
supabase/migrations/
public/molduras/   PLACEHOLDERS em SVG — trocar pela arte final
```

### Motor e maquiagem

`lib/` e `app/g/`, `app/api/`, `app/painel/` são **motor**: se repetem
em qualquer campanha. `content/copy.ts`, `app/globals.css` e
`public/` são **maquiagem**: mudam por candidato. Foi construído
separado de propósito — em 2028 troca-se a maquiagem.

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
| Rodapé de identificação | `components/site/RodapeLegal.tsx` | ✅ montado, **dados a confirmar** |
| CNPJ na moldura | `public/molduras/*.svg` | ✅ na arte placeholder |
| Política de privacidade | `app/politica-de-privacidade` | ✅ escrita |
| Silêncio eleitoral automático | `NEXT_PUBLIC_SILENCIO_ELEITORAL_EM` | ✅ variável de ambiente, não depende de alguém lembrar |
| Menções a processos judiciais | — | ⛔ **fora da copy** até o jurídico assinar |

O `robots.ts` bloqueia indexação enquanto a URL for `localhost` ou
`*.vercel.app`. Publicação em domínio próprio depende de CNPJ e domínio
confirmados.

---

## Conectar o Supabase

Enquanto `NEXT_PUBLIC_SUPABASE_URL` estiver vazio, tudo vem de `data/`.
Para ligar:

1. Criar o projeto no Supabase.
2. Rodar as migrations em ordem, pelo SQL editor ou pela CLI:
   ```
   supabase/migrations/20260819120000_esquema.sql
   supabase/migrations/20260819120100_seguranca.sql
   supabase/migrations/20260819120200_metricas.sql
   supabase/migrations/20260819120300_seed.sql
   ```
3. Preencher no `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```
4. Colar os links dos grupos pelo painel.

Nenhum componente muda. Só `lib/dados.ts` passa a consultar o banco.

---

## Deploy

1. `git init && git add . && git commit`
2. Subir para o GitHub.
3. Importar na Vercel.
4. Configurar as variáveis do `.env.example` no painel da Vercel.
5. Manter em **URL de preview** até CNPJ, responsável, endereço do comitê
   e domínio estarem confirmados.

A sugestão de cidade por IP usa o header `x-vercel-ip-city`, que só
existe em produção na Vercel. Em local ela simplesmente não aparece.

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
- [ ] cronometrar num celular antigo em 4G — teto de 3s até o botão clicável
- [ ] conferir 5 municípios distantes no mapa (Porto Velho, Vilhena, Guajará-Mirim, Ji-Paraná, Cabixi)

---

Pendências do cliente: ver [PENDENCIAS.md](./PENDENCIAS.md).

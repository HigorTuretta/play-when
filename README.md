<div align="center">

<img src="public/favicon.svg" alt="When? logo" width="96" />

# When?

### Six rounds. Four cards. One timeline.

**Você sabe _quando_ aconteceu… ou só acha que sabe?**

[![Jogar agora](https://img.shields.io/badge/▶_Jogar_agora-201f1c?style=for-the-badge)](https://playwhen.netlify.app/)

![React](https://img.shields.io/badge/React_18-20232a?style=flat-square&logo=react&logoColor=61dafb)
![Vite](https://img.shields.io/badge/Vite_6-646cff?style=flat-square&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-ffca28?style=flat-square&logo=firebase&logoColor=black)
![dnd-kit](https://img.shields.io/badge/dnd--kit-drag_%26_drop-ffd95a?style=flat-square)
![PT-BR | EN](https://img.shields.io/badge/i18n-PT--BR_%7C_EN-0c8c73?style=flat-square)

<br />

<img src="docs/screenshots/home.webp" alt="Tela inicial do When?" width="860" />

</div>

---

## 🕰️ O que é isso?

**When?** é um jogo de cronologia para navegador. A regra cabe num tweet:

> Quatro acontecimentos aparecem embaralhados. Coloque do **mais antigo** para o **mais recente**. O ano só aparece depois que você confirma.

Parece fácil até o jogo perguntar o que veio primeiro: o **Cubo de Rubik**, o **Pong** ou a **Torre Eiffel**. (Spoiler: a Torre Eiffel está _bem_ na frente. O Pong e o Cubo são separados por dois anos e muita falsa confiança.)

São **500 fatos** e contando, misturando história, ciência, tecnologia, espaço, games, cinema, música, esportes, internet e Brasil. Com milhares de combinações possíveis, dificilmente você vai decorar as respostas.

---

## 🎴 Como se joga

<table>
<tr>
<td width="62%">
<img src="docs/screenshots/dragging.webp" alt="Arrastando uma carta; as outras abrem espaço" />
</td>
<td>

**1. Arraste.** Pegue uma carta e solte onde ela deve ficar. As outras deslizam para abrir espaço, e um contorno tracejado mostra onde ela vai cair.

**2. Confirme.** Quando a linha do tempo fizer sentido na sua cabeça, confirme a ordem.

**3. Encare a verdade.** Os anos aparecem _sem_ reorganizar nada, então dá para ver exatamente onde a sua intuição tropeçou.

</td>
</tr>
</table>

<div align="center">
<img src="docs/screenshots/reveal.webp" alt="Rodada revelada com anos, posição correta e comparação" width="860" />
</div>

Cada partida tem **6 rodadas**, ou seja, 24 cartas. No fim, você recebe um resumo completo e uma grade de emojis pronta para mandar no grupo da família.

```text
When? 🕰️ Modo Normal
470 pts · 15/24 cartas
🟩🟩🟥🟥
🟥🟩🟥🟩
🟩🟩🟩🟩
…
Jogue as mesmas cartas e tente me superar:
https://playwhen.netlify.app/desafio/…
```

---

## 🏆 Pontuação

| Situação                    | Pontos                                     |
| --------------------------- | ------------------------------------------ |
| Cada carta na posição certa | **+25**                                    |
| Rodada perfeita (4/4)       | **+50** de bônus                           |
| Rodadas perfeitas seguidas  | **+20** por perfeito anterior na sequência |

Errou uma carta? A sequência de perfeitos volta a zero. A história não perdoa.

## 🎮 Dois modos

|              | **Normal**                  | **Ranqueado**              |
| ------------ | --------------------------- | -------------------------- |
| Login        | Opcional                    | Google obrigatório         |
| Tempo        | Sem cronômetro              | **40 segundos por rodada** |
| Ranking      | Nunca altera                | Único modo que pontua      |
| Limite       | Ilimitado                   | 3 partidas por dia         |
| Compartilhar | Resultado + link de desafio | Resultado                  |

Quem joga Ranqueado ganha ainda:

- **Ranking global**: o Top 10 por pontuação acumulada em partidas ranqueadas, com bandeira do país e nickname
- **Sequência diária** 🔥: mantida enquanto você concluir uma partida ranqueada pelo menos a cada dois dias

---

## 📱 Feito para o celular também

<table>
<tr>
<td align="center" width="50%"><img src="docs/screenshots/mobile-round.webp" alt="Rodada no celular" width="300" /></td>
<td align="center" width="50%"><img src="docs/screenshots/mobile-reveal.webp" alt="Resultado da rodada no celular" width="300" /></td>
</tr>
<tr>
<td align="center"><sub>Arraste com o dedo ou use as setas ◀ ▶</sub></td>
<td align="center"><sub>Feedback e próxima rodada sempre à mão</sub></td>
</tr>
</table>

---

## ✨ Destaques

- 🎯 **Jogue sem cadastro.** O modo Normal roda a partida inteira sem gravar nada no servidor.
- ⏱️ **Modo Ranqueado** com 40 s por rodada, validado pelo relógio do servidor.
- 🔐 **Login opcional com Google**, usado só para o modo Ranqueado e o ranking.
- 🔁 **Pouca repetição.** O jogo lembra os fatos que você viu recentemente e evita repeti-los.
- 🧲 **Drag-and-drop de verdade**, com mouse, toque e teclado, animações suaves e poeirinha quando a carta pousa.
- 💾 **Retomar partida.** Trocou de tela ou recarregou a página no meio do jogo? Ele continua de onde parou.
- 🌎 **Bilíngue** (PT-BR e EN). O nome continua **When?** em qualquer idioma.
- 🖼️ **Imagens da Wikipedia**, com crédito e link para a fonte. São ilustrativas e nem sempre retratam o fato com precisão.
- 📋 **Resultado compartilhável** em emojis, pelo menu de compartilhar do celular ou copiando, com link de desafio para jogar as mesmas cartas.
- 🔎 **Páginas públicas indexáveis**: como jogar, sobre, ranking e páginas editoriais de fatos históricos.

<div align="center">
<img src="docs/screenshots/results.webp" alt="Tela de fim de jogo com estatísticas, grade compartilhável e resumo das 24 cartas" width="720" />
</div>

---

## 🔒 Privacidade, sem letras miúdas

- **Visitantes:** nenhum registro de tentativas, partidas, pontuação ou analytics é criado. O navegador guarda só a partida em andamento e os fatos vistos recentemente.
- **Jogadores logados:** o ranking mostra apenas **nickname, bandeira do país, partidas e pontuação**. Foto, nome e e-mail da conta Google nunca são exibidos.
- **Pontuação validada:** as regras de segurança do banco recalculam cada partida ranqueada no servidor. O cliente não pode simplesmente anunciar "fiz 9.999 pontos" (veja [Segurança do Ranqueado](#-segurança-do-ranqueado) para o que isso cobre e o que não cobre).

Os detalhes completos ficam nas páginas de **Política de Privacidade** e **Termos de Uso**, dentro do próprio jogo.

---

## 🧱 Por baixo do capô

| Camada            | Tecnologia                                                          |
| ----------------- | ------------------------------------------------------------------- |
| Interface         | React 18 + Vite 6                                                   |
| Páginas públicas  | Prerenderizadas em HTML estático no build e hidratadas no navegador |
| Arrastar e soltar | dnd-kit (core + sortable), carregado só quando a partida começa     |
| Autenticação      | Firebase Authentication (Google)                                    |
| Dados e ranking   | Cloud Firestore (plano Spark), com regras validando partida e tempo |
| Métricas          | Firebase Analytics (apenas para usuários logados)                   |
| Ícones            | lucide-react                                                        |
| Hospedagem        | Netlify                                                             |

### Estrutura do projeto

```text
src/
├── app/              Shell, providers, roteador e dados de rota
├── components/       UI compartilhada (layout, modal, toast, blocos de conteúdo)
├── config/           URL pública do site, rotas por idioma e chaves de armazenamento
├── content/          Conteúdo editorial: páginas, temas e fatos históricos
├── features/
│   ├── auth/         Login com Google, perfil e nickname
│   ├── challenge/    Links de desafio (/desafio/<código>)
│   ├── facts/        Páginas de fatos, temas e o índice /historia
│   ├── game/         Partida, rodadas, timer, seleção anti-repetição e pontuação
│   ├── home/         Tela inicial e o guia abaixo do jogo
│   ├── leaderboard/  Ranking (ranqueado e temporada anterior)
│   ├── legal/        Privacidade e termos
│   ├── modes/        Seletor Normal/Ranqueado e modal de login do Ranqueado
│   ├── onboarding/   Tutorial da primeira partida
│   ├── pages/        Como jogar, Sobre e 404
│   └── results/      Fim de jogo, resumo e compartilhamento
├── hooks/            Hooks genéricos
├── i18n/             Idioma (vem da URL) e traduções PT-BR / EN
├── lib/              Firebase (carregado sob demanda), analytics e storage
├── seo/              <head> por rota: title, description, canonical, hreflang, OG, JSON-LD
├── styles/           Tokens de design e CSS dividido por área
├── entry-server.jsx  Build de Node usado pelo prerender
└── main.jsx          Entrada do navegador (hidrata ou renderiza)
```

---

## 🚀 Desenvolvimento

**Pré-requisitos:** Node.js 20+ e um projeto Firebase com Authentication (Google) e Firestore.

```bash
git clone https://github.com/HigorTuretta/play-when.git
cd play-when
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Firebase
npm run dev
```

> O arquivo `.env` é ignorado pelo Git. Nunca faça commit de credenciais.

### Scripts

| Script                    | O que faz                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Servidor de desenvolvimento (SPA, sem prerender)                                                     |
| `npm run build`           | Build de produção em `dist/`, com todas as páginas públicas prerenderizadas                          |
| `npm run preview`         | Serve `dist/` como o Netlify (rotas limpas, `_redirects`, 404 real)                                  |
| `npm test`                | Testes unitários (Vitest): seleção, histórico, desafio, compartilhamento, rotas, SEO                 |
| `npm run test:rules`      | Testes das Security Rules no emulador do Firestore                                                   |
| `npm run lint`            | ESLint                                                                                               |
| `npm run format`          | Formata o projeto inteiro com Prettier                                                               |
| `npm run format:check`    | Confere a formatação (sem alterar)                                                                   |
| `npm run emulators`       | Emuladores de Auth + Firestore (projeto `demo-play-when`, isolado da produção)                       |
| `npm run seed:emulator`   | Gabaritos **inventados** das rodadas ranqueadas no emulador, para jogar Ranqueado localmente         |
| `npm run dev:emulators`   | Servidor de desenvolvimento apontando para os emuladores                                             |
| `npm run build:game-data` | Regenera `catalog.json` e `index.json` a partir dos arquivos de rodada                               |
| `npm run seed:firestore`  | Popula `facts/`, `rounds/`, `roundAnswers/` e `public/rounds/` a partir de `private-data/facts.json` |
| `npm run export:rounds`   | Regenera `public/rounds/` a partir do que já está no Firestore                                       |
| `npm run validate:facts`  | Valida `private-data/facts.json`                                                                     |
| `npm run validate:rounds` | Valida `public/rounds/` (e se `catalog.json`/`index.json` estão atualizados)                         |
| `npm run retext:rounds`   | Reescreve só o texto das cartas publicadas, sem reseed                                               |

`emulators` e `test:rules` puxam a CLI do Firebase via `npx` na hora de rodar: ela não é dependência do projeto de propósito (são ~300 MB que o build de produção nunca usa).

### Testar localmente os dois modos

```bash
npm run emulators          # terminal 1
npm run seed:emulator      # uma vez, com os emuladores no ar
npm run dev:emulators      # terminal 2 → http://localhost:5173
```

No emulador o login com Google abre uma janela falsa do próprio emulador ("Add new account"). O modo Ranqueado funciona de ponta a ponta com os gabaritos inventados do `seed:emulator`.

### Prettier e ESLint

A formatação é do Prettier (`.prettierrc.json`: sem ponto e vírgula, aspas simples, 100 colunas). `npm run format` formata JS, JSX, JSON, CSS e Markdown; `public/rounds/` e o `package-lock.json` ficam de fora (são gerados). `npm run lint` roda o ESLint com as regras de React e hooks.

---

## 🏗️ Build e deploy (Netlify)

`npm run build` faz três passos:

1. `vite build` → o app do navegador em `dist/`.
2. `vite build --ssr src/entry-server.jsx` → o mesmo app compilado para Node, em `dist-ssr/` (apagado no fim).
3. `node scripts/prerender.mjs` → renderiza cada página pública para `dist/<caminho>.html` e gera `sitemap.xml`, `robots.txt`, `llms.txt` e `_redirects`.

O Netlify publica `dist/` com o comando do `netlify.toml`, sem configuração extra. Não há mais o fallback `/* → /index.html`: cada página existe como arquivo (o `_redirects` gerado aponta `/sobre` para `/sobre.html` etc.), links de desafio (`/desafio/*`, `/challenge/*`) caem numa página própria, e qualquer outro endereço recebe `404.html` com status 404 de verdade. Assim o refresh em qualquer rota funciona e o Google não indexa cópias infinitas da home.

O `firebase.json` também tem `cleanUrls` e as mesmas reescritas, caso você volte a usar o Firebase Hosting.

### Prerenderização

Cada página pública é HTML completo antes de qualquer JavaScript: texto, headings, links, `<title>`, description, canonical, hreflang, Open Graph, Twitter Card e JSON-LD. Quando o JavaScript carrega, o React **hidrata** esse HTML (`hydrateRoot`) em vez de recriá-lo, então não há piscada nem layout shift. O `<div id="root" data-route="...">` diz qual página foi prerenderizada; se o endereço não bate (ex.: quem escolheu inglês antes e abriu `/`), o app renderiza do zero.

Só o que depende do jogador fica para o navegador: login, a partida, e a lista do ranking (a página em volta é estática).

O prerender **falha o build** se alguma página ficar sem title, description, canonical, com mais de um `<h1>`, JSON-LD inválido ou link interno quebrado.

### Domínio próprio

Toda URL absoluta (canonical, Open Graph, sitemap, robots, links compartilhados) sai de `VITE_PUBLIC_SITE_URL` (`src/config/site.js`). Para trocar de domínio:

1. Configure o domínio no Netlify.
2. Defina `VITE_PUBLIC_SITE_URL=https://seudominio.com` nas variáveis de ambiente do Netlify.
3. Adicione o domínio em **Firebase Console → Authentication → Settings → Authorized domains**.
4. Faça um novo deploy e envie o novo sitemap ao Search Console.

---

## 🔎 SEO

- **URLs por idioma**, sem prefixo, cada uma com canonical próprio e `hreflang` (`pt-BR`, `en` e `x-default` apontando para o inglês):

  | Página           | Português           | Inglês             |
  | ---------------- | ------------------- | ------------------ |
  | Jogo             | `/`                 | `/en`              |
  | Como jogar       | `/como-jogar`       | `/how-to-play`     |
  | Sobre            | `/sobre`            | `/about`           |
  | Ranking          | `/ranking`          | `/leaderboard`     |
  | Fatos históricos | `/historia`         | `/history`         |
  | Tema             | `/historia/ciencia` | `/history/science` |
  | Fato             | `/fatos/apollo-11`  | `/facts/apollo-11` |
  | Privacidade      | `/privacidade`      | `/privacy`         |
  | Termos           | `/termos`           | `/terms`           |

  Os endereços antigos `/leaderboard`, `/privacy` e `/terms` continuam funcionando (agora são as versões em inglês). O idioma da página vem da URL; o seletor PT/EN leva para a mesma página no outro idioma. Quem já escolheu inglês antes é levado de `/` para `/en` (só por escolha explícita salva, nunca pelo idioma do navegador, para não afetar robôs).

- **Home**: o jogo continua em primeiro lugar; abaixo dele há um guia curto em HTML semântico (o que é, como jogar, modos, pontuação, temas e perguntas frequentes recolhíveis).
- **Metadados por rota** em `src/seo/pageMeta.js` e `src/seo/head.js`, usados tanto pelo prerender quanto na navegação no navegador.
- **JSON-LD**: `WebSite` + `SoftwareApplication` (GameApplication, Web, preço 0) na home, `Article` + `BreadcrumbList` nos fatos, `CollectionPage` + `ItemList` nos temas, `WebPage`/`AboutPage` + `BreadcrumbList` nas demais. Nenhuma avaliação (`AggregateRating`) é declarada.
- **Imagens sociais** em `public/og/` (1200×630, uma por idioma), geradas por `scripts/render-brand-images.mjs` com a identidade visual do jogo. Os ícones PNG do manifest (`public/icons/`) saem do mesmo script.
- **Páginas não indexáveis** (`noindex`): desafios, 404.

### Páginas de fatos

Cada arquivo em `src/content/facts/entries/` é uma página editorial em PT e EN: título, data, resumo, contexto, relevância, temas, fatos relacionados e fontes. Para publicar um fato novo, crie um arquivo seguindo os existentes: ele entra automaticamente no prerender, nas páginas de tema, no índice `/historia` e no sitemap.

Regras editoriais: só publique fatos com informação suficiente e fontes verificáveis, **nunca invente dados**, e não referencie IDs de cartas ou rodadas do jogo (as páginas não podem virar um gabarito). Um tema (`src/content/topics.js`) só é publicado quando tem pelo menos um fato. Hoje o catálogo editorial fica num único chunk carregado sob demanda; se ele passar de algumas centenas de fatos, vale separar um índice leve (títulos e datas) do corpo de cada página.

### Sitemap e robots

Gerados a cada build em `dist/sitemap.xml` e `dist/robots.txt`, a partir das páginas prerenderizadas **indexáveis** (com as alternâncias de idioma no próprio sitemap). Login, partidas, desafios, 404 e `/rounds/` ficam de fora; o `robots.txt` aponta para o sitemap.

### Configuração do Google Search Console

1. Acesse [search.google.com/search-console](https://search.google.com/search-console) e adicione uma propriedade:
   - **Domínio próprio** (ex.: `playwhen.com`): escolha "Domínio" e valide com o registro TXT que o Google mostrar, no painel DNS do domínio.
   - **`playwhen.netlify.app`**: escolha "Prefixo do URL" (`https://playwhen.netlify.app/`) → método **Tag HTML**. Copie só o valor de `content="..."`, crie a variável `GOOGLE_SITE_VERIFICATION` no Netlify (Site configuration → Environment variables) e faça um novo deploy. A tag entra em todas as páginas.
2. Clique em **Verificar**.
3. Em **Sitemaps**, envie `sitemap.xml`.
4. Em **Inspeção de URL**, teste `/` e `/en` e clique em **Solicitar indexação**. Repita para `/como-jogar` e `/how-to-play` se quiser acelerar.

---

## 🔥 Firebase

Continua no **plano Spark** (gratuito). Nada roda em servidor pago: as regras do Firestore fazem toda a validação.

### Coleções

| Caminho                           | Quem escreve           | Para quê                                                           |
| --------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| `profiles/{uid}`                  | o dono, uma vez        | Nickname e país                                                    |
| `rankedLeaderboard/{sha256(uid)}` | o dono, via partida    | **Ranking atual** (só partidas ranqueadas)                         |
| `leaderboard/{uid}`               | ninguém                | Ranking antigo, somente leitura ("temporada anterior")             |
| `users/{uid}/state/daily`         | o dono                 | Partidas ranqueadas do dia, sequência, rodadas já jogadas (bitset) |
| `users/{uid}/state/history`       | o dono, 1× por partida | Fatos vistos recentemente (texto compacto, ~2 KB)                  |
| `users/{uid}/games/{gameId}`      | o dono                 | Partida ranqueada: rodadas, início de cada rodada, placar          |
| `attempts/{uid}_{roundId}`        | o dono, 1× por rodada  | A ordem enviada (ou "tempo esgotado")                              |
| `scoreCredits/{uid}_{gameId}`     | o dono, 1× por partida | Prova de que a partida fechada vale X pontos                       |
| `roundAnswers/{roundId}`          | só o seed              | Gabarito, legível só depois da tentativa registrada                |

**Partidas normais não tocam no Firestore** (a não ser pela gravação do histórico para quem está logado).

### Custo por partida

- **Visitante no Normal:** 0 leituras, 0 escritas. As cartas vêm de arquivos estáticos.
- **Logado no Normal:** 1 escrita (histórico).
- **Ranqueado:** ~17 escritas (início em transação com 2, 6 inícios de rodada, 6 respostas, fechamento em lote de 3) + 1 do histórico + 1 da sequência. O timer roda no navegador; nada é gravado por segundo.
- **Ao entrar:** 2 leituras (estado do dia e histórico) + 1 do perfil. O ranking lê 10 documentos e fica 2 minutos em cache.

### Índices

Não há índice composto a criar: o ranking usa `orderBy('totalScore', 'desc')` com `limit(10)`, coberto pelo índice automático de campo único. O `firestore.indexes.json` só **desliga** a indexação de campos que nunca são consultados (economiza armazenamento e escrita).

### O que você precisa fazer no Firebase

1. Publicar regras e índices: `npx firebase-tools deploy --only firestore:rules,firestore:indexes --project tempo-certo-6ccc2`.
2. Conferir em **Authentication → Settings → Authorized domains** que o domínio do site (ex.: `playwhen.netlify.app`) está na lista.
3. (Recomendado) Ativar o **App Check** com reCAPTCHA Enterprise e preencher `VITE_APPCHECK_SITE_KEY`. Ative o enforcement depois de conferir as métricas.

### App Check (opcional, recomendado em produção)

Preencha `VITE_APPCHECK_SITE_KEY` com uma chave do **reCAPTCHA Enterprise** para ativar o [Firebase App Check](https://firebase.google.com/docs/app-check): ele exige que as requisições ao Firestore venham do app de verdade, não de scripts usando a chave pública. Em desenvolvimento, use `VITE_APPCHECK_DEBUG_TOKEN`.

---

## ⚙️ Como funcionam os modos

### Modo Normal

As cartas são tiradas, fato a fato, de `public/rounds/v2/catalog.json`: os 430 fatos cujo ano já era público (eles aparecem nas antigas rodadas de visitante, que publicam o gabarito). Cada rodada tem 4 categorias e 4 anos diferentes, e a pontuação é calculada no navegador. Nada vai para o ranking.

### Modo Ranqueado

1. **Início** (transação): confere o limite de 3 partidas do dia, escolhe 6 rodadas ranqueadas que o jogador nunca respondeu e grava a partida com `mode: 'ranked'`.
2. **Cada rodada:** logo antes de mostrar as cartas, o app grava `roundStarts.<n>` com o **relógio do servidor**. O timer de 40 s roda no navegador, a partir desse momento.
3. **Resposta:** a ordem é gravada em `attempts/`. As regras só aceitam se chegar até **45 s** depois do início (40 s + 5 s de tolerância de rede). Aos 0 s as cartas travam e a ordem atual é enviada automaticamente, com a pontuação parcial normal.
4. **Resposta atrasada** (aba pausada, depurador, conexão caída): as regras recusam, e a rodada só pode ser fechada como **tempo esgotado**, que vale 0. Recarregar a página não reinicia o relógio: o início da rodada já está gravado no servidor e não pode ser regravado.
5. **Fim:** num único lote, a partida é fechada, um `scoreCredit` com o ID da partida é criado (então **a mesma partida não pode ser creditada duas vezes**) e o ranking recebe os pontos. As regras recalculam o placar a partir das respostas gravadas e dos gabaritos.

### Ranking: o que mudou

Antes, **toda** partida de quem estava logado contava para o ranking, sem cronômetro, e não há como saber quais dessas partidas "seriam" ranqueadas. Por isso nada foi apagado nem migrado: a coleção antiga `leaderboard` virou somente leitura e aparece na página do ranking como **"Temporada anterior"**. O ranking atual (`rankedLeaderboard`) começa do zero e só recebe partidas ranqueadas. Quem já tinha perfil ganha uma entrada nova automaticamente na primeira partida ranqueada.

Outras regras antigas ajustadas conscientemente:

- O **limite de 3 partidas por dia** agora vale só para o Ranqueado; o Normal é ilimitado, inclusive para quem está logado.
- A **sequência diária** conta partidas ranqueadas concluídas (só elas são verificáveis no servidor).
- Partidas em andamento salvas pela versão anterior não são retomadas (formato de sessão novo).

---

## 🔁 Como funciona o histórico anti-repetição

Antes, cada partida sorteava 6 rodadas prontas ao acaso: em ~40–60% das partidas o **mesmo fato aparecia duas vezes na própria partida**, e em média 5–7 das 24 cartas já tinham aparecido nas 5 partidas anteriores.

Agora:

- O jogo guarda os **números dos fatos vistos recentemente** (`238 17 402 …`, no máximo 480): no `localStorage` para todo mundo e, para quem está logado, também em **um único documento** por conta (`users/{uid}/state/history`), gravado uma vez por partida e mesclado com o do aparelho ao entrar.
- Fatos vistos recentemente são penalizados ao montar a partida; os demais são embaralhados. A penalidade só vale para a parte mais recente do histórico (60% do acervo), então, quando boa parte do catálogo já apareceu, **os fatos vistos há mais tempo voltam primeiro**.
- Nunca há fato repetido dentro da mesma partida, e a partida é equilibrada entre categorias (e, no Normal, entre épocas).
- No Ranqueado, as rodadas já jogadas ficam num **bitset** de ~380 caracteres no documento diário (substitui o antigo `roundCursor`). É só uma dica: as regras continuam recusando rodadas já respondidas, e o app se corrige se a dica estiver desatualizada.
- Tudo roda no navegador sobre arquivos estáticos (`catalog.json` e `index.json`, ~50 KB comprimidos, cache imutável): nenhuma leitura extra do Firestore por partida, e o custo não cresce com o acervo.

Numa simulação de 30 partidas seguidas, o primeiro fato repetido passou da partida 3 para a partida 13 (Normal) e 14 (Ranqueado).

---

## 🔐 Segurança do Ranqueado

**O que está garantido pelas regras do Firestore:**

- Ninguém escreve pontuação diretamente: o ranking só aceita pontos de uma partida fechada e recalculada a partir das respostas gravadas e dos gabaritos.
- Uma partida é creditada no máximo uma vez; uma rodada, respondida no máximo uma vez; uma rodada já respondida nunca é sorteada de novo.
- Só contas Google escrevem; cada jogador só escreve os próprios documentos; o ranking de outro jogador não pode ser alterado.
- O prazo de cada rodada é medido pelo **relógio do servidor**; pausar o JavaScript, recarregar a página ou mudar o relógio do aparelho não dá tempo extra.
- O gabarito de uma rodada ranqueada só é liberado depois que a resposta está registrada.
- Campos inesperados são recusados; histórico e bitset têm tamanho máximo.
- O ranking público não expõe UID: o ID de cada entrada é um hash SHA-256 do UID. Só nickname, país, número de partidas e pontuação aparecem.

**Limitações que continuam existindo** (não dá para resolver sem um backend confiável, que o plano Spark não oferece):

- **As datas são conhecimento público.** Alguém com um script e uma tabela de anos (da Wikipedia, por exemplo) pode responder rápido e certo. Além disso, os arquivos das rodadas de visitante publicados desde versões anteriores revelam o ano de 430 dos 500 fatos, e o conteúdo das cartas das rodadas ranqueadas é público. As regras impedem inventar pontos, mas não impedem **acertar** com ajuda externa. Resolver isso exigiria um acervo de fatos exclusivo do Ranqueado, com cartas entregues pelo servidor só no início de cada rodada (Cloud Functions, plano Blaze).
- O timer protege contra "pausar e pesquisar" durante a rodada, mas as cartas das próximas rodadas podem ser lidas nos arquivos estáticos por quem souber procurar.
- Uma rodada que termina com a conexão muito lenta (mais de ~5 s de atraso) é contada como tempo esgotado.
- O App Check reduz scripts fora do app, mas não impede automação dentro de um navegador real.

---

## 🧾 Variáveis de ambiente

| Variável                    | Onde             | Para quê                                                                           |
| --------------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `VITE_FIREBASE_*`           | `.env` / Netlify | Configuração pública do Firebase                                                   |
| `VITE_PUBLIC_SITE_URL`      | `.env` / Netlify | **Novo.** URL pública do site (padrão `https://playwhen.netlify.app`)              |
| `GOOGLE_SITE_VERIFICATION`  | Netlify          | **Novo.** Token da verificação por tag HTML do Search Console                      |
| `VITE_ANALYTICS_FOR_GUESTS` | `.env` / Netlify | **Novo.** `true` envia eventos também de visitantes (atualize a privacidade antes) |
| `VITE_APPCHECK_SITE_KEY`    | `.env` / Netlify | App Check (opcional)                                                               |
| `VITE_APPCHECK_DEBUG_TOKEN` | `.env` local     | App Check em desenvolvimento                                                       |
| `VITE_GITHUB_URL`           | `.env` / Netlify | Link do rodapé (o compartilhamento nunca usa)                                      |

### Analytics

Eventos enviados (apenas de jogadores logados, sem nome, e-mail ou UID): `game_started`, `game_completed`, `normal_game_started`, `ranked_game_started`, `ranked_game_completed`, `result_shared`, `result_copied`, `login_started`, `login_completed`, `challenge_shared`, `challenge_started` e `page_view` na navegação. Como a política de privacidade promete não rastrear visitantes, eventos de quem não está logado (incluindo `login_started`) são descartados, a menos que `VITE_ANALYTICS_FOR_GUESTS=true`.

---

## 🗂️ Rodadas e dados do jogo

As 2.500 rodadas são divididas em duas faixas (`RANKED_POOL_SIZE` em [constants.js](src/features/game/constants.js) e `validRankedRoundId()` em [firestore.rules](firestore.rules)):

- **`round-0001` a `round-2250`** — ranqueadas. As cartas ficam em `public/rounds/v2/`, o gabarito (`roundAnswers/`) só no Firestore.
- **`round-2251` a `round-2500`** — antigas rodadas de visitante, com gabarito no próprio arquivo. Hoje servem de fonte para o `catalog.json` do modo Normal.

Dois arquivos derivados ficam na mesma pasta e são regenerados por `seed:firestore`, `export:rounds`, `retext:rounds` e `build:game-data`: `catalog.json` (fatos do Normal) e `index.json` (eventos de cada rodada ranqueada, sem anos). `validate:rounds` falha se estiverem desatualizados. Se o conteúdo das rodadas mudar, suba `STATIC_ROUNDS_VERSION` em [scripts/lib/rounds.mjs](scripts/lib/rounds.mjs) e `STATIC_ROUNDS_URL` em [constants.js](src/features/game/constants.js): os arquivos são servidos com cache imutável.

### Texto das cartas

- **Título em português**: vem de `private-data/facts.json`; `data/event-titles-pt.json` sobrescreve os poucos casos que precisam mudar.
- **Título em inglês**: vem de `data/event-titles-en.json`, um por evento, nunca com o ano.
- **Descrição da carta**: montada no cliente a partir da categoria (`categoryShort` nos arquivos de tradução).

Cada rodada sorteia **quatro categorias diferentes** e **quatro anos diferentes** (`makeRound()` em [scripts/seed-firestore.mjs](scripts/seed-firestore.mjs)).

---

## 🇺🇸 In English

**When?** is a browser chronology game: four shuffled historical events, sort them from **oldest to newest**, and the years are only revealed after you commit. Six rounds, 24 cards, 500 facts across history, science, tech, space, games, film, music, sports and more.

- Normal mode: no clock, no sign-in needed, never touches the leaderboard. Ranked mode: Google sign-in, 40 seconds per round, three games a day, and the only way onto the global Top 10.
- Scoring: **+25** per correct card, **+50** for a perfect round, plus **+20** for each consecutive perfect before it.
- Drag-and-drop with mouse, touch or keyboard; mid-game progress survives page switches and reloads.
- Fully bilingual (PT-BR / EN), with shareable emoji results.
- Built with React, Vite, dnd-kit and Firebase, with ranked scores and round timing validated server-side by Firestore security rules.
- Recently seen events are remembered (per device, and per account when signed in) so games rarely repeat them.
- Public pages are prerendered to static HTML for search engines, with localized URLs, hreflang, Open Graph and JSON-LD.
- Every round deals four different categories and four different years, and card titles never contain the year.

---

## 📄 Créditos e avisos

- Imagens carregadas da **Wikipedia / Wikimedia Commons**, sujeitas às licenças indicadas pela fonte. O jogo exibe o crédito de cada imagem.
- Algumas datas históricas usam datação tradicional ou aproximada quando não existe uma data moderna exata.
- O licenciamento do código é definido pelo autor do repositório.

<div align="center">

<br />

Feito com ☕ e uma pitada de anacronismo por **[Turetta](https://github.com/HigorTuretta)**

<sub>Six rounds. Four cards. One timeline.</sub>

</div>

<div align="center">

<img src="public/favicon.svg" alt="When? logo" width="96" />

# When?

### Six rounds. Four cards. One timeline.

**Você sabe *quando* aconteceu… ou só acha que sabe?**

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

Parece fácil até o jogo perguntar o que veio primeiro: o **Cubo de Rubik**, o **Pong** ou a **Torre Eiffel**. (Spoiler: a Torre Eiffel está *bem* na frente. O Pong e o Cubo são separados por dois anos e muita falsa confiança.)

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

**3. Encare a verdade.** Os anos aparecem *sem* reorganizar nada, então dá para ver exatamente onde a sua intuição tropeçou.

</td>
</tr>
</table>

<div align="center">
<img src="docs/screenshots/reveal.webp" alt="Rodada revelada com anos, posição correta e comparação" width="860" />
</div>

Cada partida tem **6 rodadas**, ou seja, 24 cartas. No fim, você recebe um resumo completo e uma grade de emojis pronta para mandar no grupo da família.

```text
When? — 470 pts
🟩🟩🟥🟥
🟥🟩🟥🟩
🟩🟩🟩🟩
```

---

## 🏆 Pontuação

| Situação | Pontos |
| --- | --- |
| Cada carta na posição certa | **+25** |
| Rodada perfeita (4/4) | **+50** de bônus |
| Rodadas perfeitas seguidas | **+20** por perfeito anterior na sequência |

Errou uma carta? A sequência de perfeitos volta a zero. A história não perdoa.

Quem entra com o Google ganha ainda:

- **Ranking global**: o Top 10 por pontuação acumulada, com bandeira do país e nickname
- **Sequência diária** 🔥: mantida enquanto você jogar pelo menos uma vez por dia, a gente congela ela somente por dois dias eim
- **3 partidas ranqueadas por dia**: o suficiente para melhorar, pouco demais para virar vício (em tese)

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

- 🎯 **Jogue sem cadastro.** O modo visitante roda a partida inteira sem gravar nada.
- 🔐 **Login opcional com Google**, usado só para salvar pontos e aparecer no ranking.
- 🧲 **Drag-and-drop de verdade**, com mouse, toque e teclado, animações suaves e poeirinha quando a carta pousa.
- 💾 **Retomar partida.** Trocou de tela ou recarregou a página no meio do jogo? Ele continua de onde parou.
- 🌎 **Bilíngue** (PT-BR e EN). O nome continua **When?** em qualquer idioma.
- 🖼️ **Imagens da Wikipedia**, com crédito e link para a fonte. São ilustrativas e nem sempre retratam o fato com precisão.
- 📋 **Resultado compartilhável** em emojis, com um clique para copiar.

<div align="center">
<img src="docs/screenshots/results.webp" alt="Tela de fim de jogo com estatísticas, grade compartilhável e resumo das 24 cartas" width="720" />
</div>

---

## 🔒 Privacidade, sem letras miúdas

- **Visitantes:** nenhum registro de tentativas, partidas, pontuação ou analytics é criado.
- **Jogadores logados:** o ranking mostra apenas **nickname, bandeira do país, partidas e pontuação**. Foto, nome e e-mail da conta Google nunca são exibidos.
- **Pontuação à prova de trapaça:** as regras de segurança do banco validam cada rodada no servidor. O cliente não pode simplesmente anunciar "fiz 9.999 pontos".

Os detalhes completos ficam nas páginas de **Política de Privacidade** e **Termos de Uso**, dentro do próprio jogo.

---

## 🧱 Por baixo do capô

| Camada | Tecnologia |
| --- | --- |
| Interface | React 18 + Vite 6 |
| Arrastar e soltar | dnd-kit (core + sortable) |
| Autenticação | Firebase Authentication (Google) |
| Dados e ranking | Cloud Firestore, com regras de segurança validando a pontuação |
| Métricas | Firebase Analytics (apenas para usuários logados) |
| Ícones | lucide-react |
| Hospedagem | Firebase Hosting |

### Estrutura do projeto

O código é organizado por **funcionalidade**: cada parte do jogo tem sua própria pasta, com componentes, hooks e serviços próprios.

```text
src/
├── app/              Shell da aplicação, providers e roteador
├── components/       UI compartilhada (layout e componentes base)
├── config/           Rotas, chaves de armazenamento e constantes
├── features/
│   ├── auth/         Login com Google, perfil e nickname
│   ├── game/         Estado da partida, rodadas, cartas, drag-and-drop e pontuação
│   ├── home/         Tela inicial
│   ├── leaderboard/  Ranking Top 10
│   ├── legal/        Privacidade e termos
│   ├── onboarding/   Tutorial da primeira partida
│   └── results/      Fim de jogo, resumo e compartilhamento
├── hooks/            Hooks genéricos
├── i18n/             Provider de idioma e traduções PT-BR / EN
├── lib/              Firebase, analytics, storage e utilitários
└── styles/           Tokens de design e CSS dividido por área
```

---

## 🚀 Rodando localmente

**Pré-requisitos:** Node.js 18+ e um projeto Firebase próprio com Authentication (Google) e Firestore habilitados.

```bash
git clone https://github.com/HigorTuretta/play-when.git
cd play-when
npm install
```

Crie um arquivo `.env` a partir do exemplo e preencha com as credenciais do **seu** projeto Firebase:

```bash
cp .env.example .env
```

```bash
npm run dev
```

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |

> O arquivo `.env` é ignorado pelo Git. Nunca faça commit de credenciais.

---

## 🇺🇸 In English

**When?** is a browser chronology game: four shuffled historical events, sort them from **oldest to newest**, and the years are only revealed after you commit. Six rounds, 24 cards, 500 facts across history, science, tech, space, games, film, music, sports and more.

- Play instantly as a guest (nothing is stored), or sign in with Google to save scores, keep a daily streak and climb the global Top 10.
- Scoring: **+25** per correct card, **+50** for a perfect round, plus **+20** for each consecutive perfect before it.
- Drag-and-drop with mouse, touch or keyboard; mid-game progress survives page switches and reloads.
- Fully bilingual (PT-BR / EN), with shareable emoji results.
- Built with React, Vite, dnd-kit and Firebase, with scores validated server-side by Firestore security rules.

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

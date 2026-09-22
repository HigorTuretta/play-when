# ⏳ When?

> **Você sabe quando aconteceu... ou só acha que sabe?**

**When?** é um jogo diário de cronologia para navegador. O nome do jogo não é traduzido: em português ou em inglês, ele é sempre **When?**.

Em cada rodada, quatro acontecimentos aparecem embaralhados. Coloque-os do **mais antigo para o mais recente**. Cada partida tem **6 rodadas**.

🇧🇷 Português | 🇺🇸 English

---

## 🎴 Como funciona

Cada partida apresenta 24 cartas divididas em seis rodadas. As cartas misturam ciência, tecnologia, cultura, games, exploração espacial, esportes, internet, Brasil e muitos outros períodos da história.

O ano fica escondido enquanto você decide. Depois de confirmar a ordem, as datas são reveladas sem reorganizar as cartas, para você comparar sua linha do tempo com a resposta correta. A pontuação recompensa cartas na posição certa, rodadas perfeitas e sequências de perfeitos.

## 👤 Jogue primeiro, entre quando quiser

- **Não é necessário fazer login para jogar.** Visitantes podem completar normalmente as seis rodadas.
- Uma partida de visitante acontece sem gravar tentativas, pontuação ou dados pessoais na conta.
- Ao final da partida, o jogo exibe **“Faça login para salvar seus pontos!”**.
- Somente jogadores que entram com o Google têm partidas, pontuações e progresso registrados no Firebase.
- Contas autenticadas podem jogar até 3 partidas por dia, escolher um nickname e disputar o Top 10 global.

> A pontuação de uma partida iniciada como visitante não é retroativamente enviada ao ranking. Faça login antes de iniciar uma nova partida para que ela seja registrada.

## ✨ Recursos

- 500 fatos históricos e milhares de combinações
- 6 rodadas com 4 cartas por partida
- drag-and-drop com animações e feedback visual
- pontuação parcial, bônus de rodada perfeita e bônus de sequência
- modo visitante sem cadastro
- autenticação opcional pelo Google
- leaderboard global com os 10 maiores placares acumulados
- interface completa em PT-BR e inglês, sempre com o nome **When?**
- imagens vinculadas aos artigos relevantes da Wikipedia, com link para a fonte
- política de privacidade e termos de uso integrados

## 🔐 Dados e pontuação

O modo visitante apenas lê as cartas e suas respostas para executar a partida no navegador; ele não cria documentos de tentativa, partida ou pontuação. Para contas autenticadas, as Firestore Security Rules validam tentativas, acertos, bônus, encerramento da partida e crédito no ranking.

Foto, nome da conta Google e e-mail não são publicados. O leaderboard mostra somente posição, bandeira do país, nickname, partidas concluídas e pontuação acumulada.

---

# 🇺🇸 English

## What is When?

**When?** is a bilingual browser chronology game whose name stays the same in every language. Sort four shuffled historical events from **oldest to newest** across six rounds.

Guests can play a complete game without signing in. Guest attempts, scores, and personal data are not written to an account. After round six, the game invites the player to sign in; only Google-authenticated games are saved and added to the global leaderboard. A guest score is not uploaded retroactively, so sign in before starting a new game to record it.

Authenticated accounts can play up to three ranked games per day and choose a public nickname.

## 🧱 Technical overview

The client uses **React + Vite**, **dnd-kit**, and **Firebase** (Google Authentication, Firestore, Analytics, and Hosting). The production seed creates 2,500 prebuilt rounds from a 500-fact source bank.

Main Firestore collections:

```text
profiles/{uid}
leaderboard/{uid}
users/{uid}/state/daily
users/{uid}/games/{gameId}
rounds/{roundId}
roundAnswers/{roundId}
attempts/{uid_roundId}
roundCredits/{uid_roundId}
scoreCredits/{uid_gameId}
```

Guest play performs no writes. Authenticated score writes remain rule-validated rather than trusting arbitrary client totals.

## 🚀 Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

### Project structure

```text
src/
├── app/            App shell, providers and client-side router
├── components/     Shared UI (layout: header, footer; ui: modal, banners)
├── config/         Routes, storage keys and environment constants
├── features/
│   ├── auth/         Google sign-in, profile and nickname
│   ├── game/         Game state, rounds, cards, drag-and-drop, scoring
│   ├── home/         Landing page
│   ├── leaderboard/  Top 10 ranking
│   ├── legal/        Privacy policy and terms
│   ├── onboarding/   First-game tutorial
│   └── results/      End-of-game summary and sharing
├── hooks/          Generic React hooks
├── i18n/           Language provider and PT-BR / EN locales
├── lib/            Firebase, analytics, storage and country helpers
└── styles/         Design tokens and stylesheets split by area
```

Repository: [HigorTuretta/play-when](https://github.com/HigorTuretta/play-when)

## 📄 License / content notes

Application code licensing is defined by the repository owner. Historical images remain subject to the license shown by their source. Historical dates may use conventional or approximate dating when an exact modern date is unavailable.

---

<p align="center">
  <strong>Developed by Turetta</strong><br />
  Six rounds. Four cards. One timeline.
</p>

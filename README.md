# ⏳ Tempo Certo

> **Você sabe quando aconteceu... ou só acha que sabe?**

**Tempo Certo** é um jogo diário de cronologia para navegador. Em cada rodada, quatro acontecimentos aparecem embaralhados e o desafio é simples de explicar, mas difícil de dominar: colocar tudo do **mais antigo para o mais recente**.

São **6 rodadas por partida**, apenas **3 partidas por dia** e um ranking global para descobrir quem realmente tem a melhor noção de tempo.

🇧🇷 Português | 🇺🇸 English

---

## 🎴 Como funciona

Cada partida apresenta 24 cartas divididas em seis rodadas. As cartas podem misturar ciência, tecnologia, cultura, games, exploração espacial, esportes, internet, Brasil e muitos outros períodos da história.

O ano fica escondido enquanto você decide. Depois de confirmar a ordem, a rodada revela as datas sem reorganizar suas cartas, permitindo comparar exatamente onde você acertou e onde sua linha do tempo saiu dos trilhos.

A pontuação recompensa acertos parciais, rodadas perfeitas e sequências de perfeitos. No fim da partida, os pontos entram na sua pontuação geral e podem levar seu nickname ao **Top 10 global**.

## ✨ O que tem no jogo

- 500 fatos históricos no banco principal
- milhares de combinações possíveis de rodadas
- 6 rodadas com 4 cartas por partida
- drag-and-drop com animações e feedback visual
- pontuação por carta correta
- bônus por rodada perfeita e sequência
- limite de 3 partidas por dia por conta
- autenticação exclusivamente pelo Google
- nickname obrigatório e independente do nome da conta Google
- leaderboard global com os 10 maiores placares acumulados
- bandeira do país inferida pela localidade do navegador
- interface completa em PT-BR e inglês
- imagens obtidas do Wikimedia Commons com atribuição quando disponível
- política de privacidade e termos de uso integrados

## 🔐 A resposta não vai para o navegador antes da jogada

A versão Firebase separa o conteúdo público da resposta correta.

O navegador recebe apenas as quatro cartas da rodada, sem os anos. Quando o jogador confirma a ordem, essa tentativa é gravada de forma imutável. Só então as regras do Firestore permitem que aquela conta leia a resposta da rodada.

A pontuação que entra no ranking também não é simplesmente aceita do cliente. As **Firestore Security Rules** validam a tentativa, os acertos, o bônus, o encerramento da partida e o crédito da pontuação.

Essa arquitetura foi escolhida para manter o projeto compatível com o **Firebase Spark**, sem depender de Cloud Functions ou de um servidor pago.

## 🏆 Leaderboard

O leaderboard exibe apenas:

- posição
- bandeira do país
- nickname escolhido pelo jogador
- quantidade de partidas concluídas
- pontuação acumulada

Foto, nome da conta Google e e-mail não são publicados no ranking.

## 🎯 A ideia

Tempo Certo não é um quiz de decorar datas. A graça está em reconhecer relações de época.

Você talvez não saiba o ano exato em que algo aconteceu, mas consegue decidir se veio antes de determinado filme, depois de uma descoberta científica ou no mesmo período de uma tecnologia que conhece.

É um jogo sobre **contexto histórico**, não apenas memória.

---

# 🇺🇸 English

## ⏳ What is Tempo Certo?

**Tempo Certo** is a daily browser chronology game. Every round gives you four shuffled historical events and one objective: place them from **oldest to newest**.

Each game contains **6 rounds**, each account can start only **3 games per day**, and every completed score contributes to a global leaderboard.

The date remains hidden until you lock in your answer. After submission, the game reveals the years without moving your cards, so you can compare your timeline directly against the correct one.

## ✨ Features

- 500 historical facts
- thousands of possible round combinations
- 6 rounds × 4 cards
- animated drag-and-drop interactions
- partial scoring for correctly placed cards
- perfect-round and streak bonuses
- 3 games per day per account
- Google-only authentication
- required public nickname
- global Top 10 leaderboard
- country flag inferred from browser locale
- complete PT-BR / English interface
- Wikimedia Commons imagery with attribution when available
- integrated Privacy Policy and Terms of Use

## 🔐 Answers stay private until submission

Public round documents never contain the year.

The player's ordering is first stored as an immutable attempt. Only after that write succeeds can the same authenticated user read the private answer document for that round.

Leaderboard scoring is also validated through Firestore Security Rules rather than trusting arbitrary score values sent by the browser.

This design intentionally avoids Cloud Functions so the project can remain compatible with the **Firebase Spark** plan.

---

## 🧱 Technical overview

The client is built with **React + Vite**, with **dnd-kit** for card interaction and **Firebase** for authentication, Firestore, Analytics and Hosting.

Main Firestore collections:

```text
profiles/{uid}
leaderboard/{uid}
users/{uid}/state/daily
users/{uid}/games/{gameId}
rounds/{roundId}              # public card data, no years
roundAnswers/{roundId}        # private answers
attempts/{uid_roundId}        # immutable submitted ordering
roundCredits/{uid_roundId}    # rule-validated round score
scoreCredits/{uid_gameId}     # one-time game score credit
facts/{factId}                # administrative source data
factAnswers/{factId}          # administrative private dates
```

The production seed generates **2,500 prebuilt rounds** from the 500-fact source bank. This avoids random Firestore queries, reduces reads, and keeps each game predictable in cost.

SEO/discovery assets include structured `VideoGame` JSON-LD, Open Graph metadata, `robots.txt`, `sitemap.xml` and `llms.txt`.

### Cost-oriented decisions

The project intentionally avoids listeners where a one-time read is sufficient, does not query the entire fact bank during gameplay, limits leaderboard reads to 10 documents, uses deterministic round IDs, caches Wikimedia image metadata locally and keeps Cloud Functions out of the architecture.

The private fact source is intentionally ignored by Git and should not be published with the client repository.

---

## 📄 License / content notes

Application code licensing is defined by the repository owner. Historical images can come from Wikimedia Commons and remain subject to the license shown in their original file page.

Historical dates may use conventional or approximate dating where the underlying event itself does not have an exact modern date.

---

<p align="center">
  <strong>Developed by Turetta</strong><br />
  Six rounds. Four cards. One timeline.
</p>

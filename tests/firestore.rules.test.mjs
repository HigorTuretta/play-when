// Security Rules tests. Run with `npm run test:rules` (starts the Firestore emulator
// on a demo- project, so nothing touches production).
import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'

const roundIdFor = (n) => `round-${String(n).padStart(4, '0')}`
const answerFor = (roundId) => ['a', 'b', 'c', 'd'].map((letter) => `${roundId}-${letter}`)
const RANKED = Array.from({ length: 24 }, (_, index) => roundIdFor(index + 1))
const GUEST = [roundIdFor(2251), roundIdFor(2252)]
const DAY_MS = 24 * 60 * 60 * 1000

let env

const google = (uid) =>
  env.authenticatedContext(uid, { firebase: { sign_in_provider: 'google.com' } }).firestore()
const password = (uid) =>
  env.authenticatedContext(uid, { firebase: { sign_in_provider: 'password' } }).firestore()
const anonymous = () => env.unauthenticatedContext().firestore()

async function seed(write) {
  await env.withSecurityRulesDisabled((context) => write(context.firestore()))
}

function createProfile(db, uid, nickname = 'Turetta', countryCode = 'BR') {
  const batch = writeBatch(db)
  batch.set(doc(db, 'profiles', uid), {
    nickname,
    countryCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'leaderboard', uid), {
    nickname,
    countryCode,
    totalScore: 0,
    gamesPlayed: 0,
    updatedAt: serverTimestamp(),
  })
  return batch.commit()
}

function startGame(db, uid, gameId, roundIds, plays = 1) {
  const batch = writeBatch(db)
  batch.set(doc(db, 'users', uid, 'games', gameId), {
    uid,
    roundIds,
    score: 0,
    completed: false,
    createdAt: serverTimestamp(),
    completedAt: null,
  })
  batch.set(
    doc(db, 'users', uid, 'state', 'daily'),
    {
      day: serverTimestamp(),
      plays,
      currentGameId: gameId,
      roundCursor: 6 * plays,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
  return batch.commit()
}

const submit = (db, uid, gameId, roundId, roundIndex, orderedIds) =>
  setDoc(doc(db, 'attempts', `${uid}_${roundId}`), {
    uid,
    gameId,
    roundId,
    roundIndex,
    orderedIds,
    createdAt: serverTimestamp(),
  })

// Mirrors scoreRound() in src/features/game/scoring.js.
function scoreFor(hits) {
  let streak = 0
  let total = 0
  for (const h of hits) {
    total += h * 25 + (h === 4 ? 50 + streak * 20 : 0)
    streak = h === 4 ? streak + 1 : 0
  }
  return total
}

const PERFECT_GAME = { score: 1200, hits: [4, 4, 4, 4, 4, 4] }
const ZERO_GAME = { score: 0, hits: [0, 0, 0, 0, 0, 0] }

function finish(db, uid, gameId, { score, hits }) {
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', uid, 'games', gameId), {
    score,
    hits,
    completed: true,
    completedAt: serverTimestamp(),
  })
  batch.set(doc(db, 'scoreCredits', `${uid}_${gameId}`), {
    uid,
    gameId,
    score,
    createdAt: serverTimestamp(),
  })
  batch.update(doc(db, 'leaderboard', uid), {
    totalScore: increment(score),
    gamesPlayed: increment(1),
    lastGameId: gameId,
    updatedAt: serverTimestamp(),
  })
  return batch.commit()
}

const creditStreak = (db, uid, streak) =>
  updateDoc(doc(db, 'users', uid, 'state', 'daily'), {
    streak,
    lastPlayedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

const perfect = (roundId) => answerFor(roundId)
const swapped = (roundId) => {
  const [a, b, c, d] = answerFor(roundId)
  return [b, a, c, d]
}
const reversed = (roundId) => [...answerFor(roundId)].reverse()

async function playGame(db, uid, gameId, roundIds, orders, from = 0) {
  for (let index = from; index < orders.length + from; index += 1) {
    await assertSucceeds(
      submit(db, uid, gameId, roundIds[index], index, orders[index - from](roundIds[index])),
    )
  }
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-play-when',
    firestore: { rules: await fs.readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
  })
})

beforeEach(async () => {
  await env.clearFirestore()
  await seed(async (db) => {
    for (const roundId of [...RANKED, ...GUEST]) {
      await setDoc(doc(db, 'roundAnswers', roundId), {
        correctOrder: answerFor(roundId),
        years: {},
      })
      await setDoc(doc(db, 'rounds', roundId), { cards: [] })
    }
    await setDoc(doc(db, 'config', 'game'), { dailyLimit: 3 })
  })
})

after(() => env?.cleanup())

describe('answers and server-only data', () => {
  test('signed-out clients cannot read any answer', async () => {
    await assertFails(getDoc(doc(anonymous(), 'roundAnswers', RANKED[0])))
    await assertFails(getDoc(doc(anonymous(), 'roundAnswers', GUEST[0])))
  })

  test('a player reads an answer only after recording an attempt for it', async () => {
    const db = google('alice')
    await assertFails(getDoc(doc(db, 'roundAnswers', RANKED[0])))
    await startGame(db, 'alice', 'g1', RANKED.slice(0, 6))
    await assertSucceeds(submit(db, 'alice', 'g1', RANKED[0], 0, reversed(RANKED[0])))
    await assertSucceeds(getDoc(doc(db, 'roundAnswers', RANKED[0])))
    await assertFails(getDoc(doc(db, 'roundAnswers', RANKED[1])))
  })

  test('rounds, config and retired collections are not readable', async () => {
    for (const path of [
      ['rounds', RANKED[0]],
      ['config', 'game'],
      ['roundCredits', `alice_${RANKED[0]}`],
    ]) {
      await assertFails(getDoc(doc(anonymous(), ...path)))
      await assertFails(getDoc(doc(google('alice'), ...path)))
    }
  })
})

describe('profiles', () => {
  for (const nickname of ['Turetta', 'João Silva', 'a_b.c-d', '李小龙', 'Zé 2']) {
    test(`accepts nickname ${JSON.stringify(nickname)}`, async () => {
      await assertSucceeds(createProfile(google('alice'), 'alice', nickname))
    })
  }

  for (const nickname of [
    'a',
    'x'.repeat(25),
    ' ab',
    'ab ',
    'a  b',
    'a​b',
    '‮abc',
    '<b>hi</b>',
    'hi😀',
    'a\nb',
  ]) {
    test(`rejects nickname ${JSON.stringify(nickname)}`, async () => {
      await assertFails(createProfile(google('alice'), 'alice', nickname))
    })
  }

  test('rejects malformed country codes', async () => {
    await assertFails(createProfile(google('alice'), 'alice', 'Turetta', 'br'))
    await assertFails(createProfile(google('alice'), 'alice', 'Turetta', '<>'))
  })

  test('only Google accounts can create a profile or play ranked', async () => {
    const db = password('mallory')
    await assertFails(createProfile(db, 'mallory'))
    await assertFails(startGame(db, 'mallory', 'g1', RANKED.slice(0, 6)))
  })

  test('profiles cannot be changed or read by others', async () => {
    await assertSucceeds(createProfile(google('alice'), 'alice'))
    await assertFails(updateDoc(doc(google('alice'), 'profiles', 'alice'), { nickname: 'Other' }))
    await assertFails(getDoc(doc(google('bob'), 'profiles', 'alice')))
  })
})

describe('ranked games', () => {
  const rounds = RANKED.slice(0, 6)

  test('a perfect game credits 1200 points', async () => {
    const db = google('alice')
    await createProfile(db, 'alice')
    await assertSucceeds(startGame(db, 'alice', 'g1', rounds))
    await playGame(db, 'alice', 'g1', rounds, Array(6).fill(perfect))
    await assertSucceeds(finish(db, 'alice', 'g1', PERFECT_GAME))

    const entry = await getDoc(doc(anonymous(), 'leaderboard', 'alice'))
    assert.equal(entry.data().totalScore, 1200)
    assert.equal(entry.data().gamesPlayed, 1)
  })

  test('the score is recomputed from the attempts, streak included', async () => {
    const db = google('alice')
    await createProfile(db, 'alice')
    await startGame(db, 'alice', 'g1', rounds)
    await playGame(db, 'alice', 'g1', rounds, [
      perfect,
      perfect,
      swapped,
      perfect,
      reversed,
      perfect,
    ])
    // 150 + (100 + 50 + 20) + 50 + 150 + 0 + 150
    const hits = [4, 4, 2, 4, 0, 4]
    assert.equal(scoreFor(hits), 670)
    await assertFails(finish(db, 'alice', 'g1', { score: 671, hits }))
    await assertFails(finish(db, 'alice', 'g1', PERFECT_GAME))
    await assertFails(finish(db, 'alice', 'g1', { score: 1050, hits: [4, 4, 2, 4, 4, 4] }))
    await assertFails(finish(db, 'alice', 'g1', { score: 1050, hits: [4, 4, 4, 4, 0, 4] }))
    await assertSucceeds(finish(db, 'alice', 'g1', { score: 670, hits }))
  })

  test('a game cannot be finished before every round is answered', async () => {
    const db = google('alice')
    await createProfile(db, 'alice')
    await startGame(db, 'alice', 'g1', rounds)
    await playGame(db, 'alice', 'g1', rounds, Array(5).fill(perfect))
    await assertFails(finish(db, 'alice', 'g1', { score: 1000, hits: [4, 4, 4, 4, 4, 0] }))
  })

  test('an order that is not a permutation of the cards blocks the finish', async () => {
    const db = google('alice')
    await createProfile(db, 'alice')
    await startGame(db, 'alice', 'g1', rounds)
    const [a, b, c] = answerFor(rounds[0])
    await assertSucceeds(submit(db, 'alice', 'g1', rounds[0], 0, [a, b, c, c]))
    await playGame(db, 'alice', 'g1', rounds, Array(5).fill(perfect), 1)
    for (const first of [0, 1, 2, 3, 4]) {
      const hits = [first, 4, 4, 4, 4, 4]
      await assertFails(finish(db, 'alice', 'g1', { score: scoreFor(hits), hits }))
    }
  })

  test('ranked games cannot use the public guest pool', async () => {
    await assertFails(startGame(google('alice'), 'alice', 'g1', [...RANKED.slice(0, 5), GUEST[0]]))
  })

  test('round ids must be six distinct ranked rounds', async () => {
    const db = google('alice')
    await assertFails(startGame(db, 'alice', 'g1', [...RANKED.slice(0, 5), RANKED[0]]))
    await assertFails(startGame(db, 'alice', 'g1', RANKED.slice(0, 5)))
    await assertFails(startGame(db, 'alice', 'g1', [...RANKED.slice(0, 5), 'round-9999']))
  })

  test('a round already played cannot be dealt again', async () => {
    const db = google('alice')
    await startGame(db, 'alice', 'g1', rounds)
    await submit(db, 'alice', 'g1', rounds[0], 0, perfect(rounds[0]))
    await assertFails(startGame(db, 'alice', 'g2', [rounds[0], ...RANKED.slice(6, 11)], 2))
    await assertSucceeds(startGame(db, 'alice', 'g2', RANKED.slice(6, 12), 2))
  })

  test('attempts from one game cannot be counted in another', async () => {
    const db = google('alice')
    await createProfile(db, 'alice')
    await startGame(db, 'alice', 'g1', rounds, 1)
    await startGame(db, 'alice', 'g2', rounds, 2)
    await playGame(db, 'alice', 'g1', rounds, Array(6).fill(perfect))
    await assertSucceeds(finish(db, 'alice', 'g1', PERFECT_GAME))
    await assertFails(submit(db, 'alice', 'g2', rounds[0], 0, perfect(rounds[0])))
    await assertFails(finish(db, 'alice', 'g2', PERFECT_GAME))
  })

  test('attempts must match the round dealt at that position of an open game', async () => {
    const db = google('alice')
    await startGame(db, 'alice', 'g1', rounds)
    await assertFails(submit(db, 'alice', 'g1', rounds[1], 0, perfect(rounds[1])))
    await assertFails(submit(db, 'alice', 'g1', RANKED[10], 0, perfect(RANKED[10])))
    await assertFails(submit(db, 'alice', 'nope', rounds[0], 0, perfect(rounds[0])))
    await assertFails(submit(google('bob'), 'alice', 'g1', rounds[0], 0, perfect(rounds[0])))
    await assertFails(submit(password('alice'), 'alice', 'g1', rounds[0], 0, perfect(rounds[0])))
  })

  test('attempts are immutable', async () => {
    const db = google('alice')
    await startGame(db, 'alice', 'g1', rounds)
    await submit(db, 'alice', 'g1', rounds[0], 0, reversed(rounds[0]))
    await assertFails(submit(db, 'alice', 'g1', rounds[0], 0, perfect(rounds[0])))
  })

  test('a game closed without its score credit earns no leaderboard points', async () => {
    const db = google('alice')
    await createProfile(db, 'alice')
    await startGame(db, 'alice', 'g1', rounds)
    await playGame(db, 'alice', 'g1', rounds, [
      perfect,
      perfect,
      perfect,
      reversed,
      reversed,
      reversed,
    ])
    // Only rounds 1-3 are checked by the game update itself, so it can be forced alone...
    await assertSucceeds(
      updateDoc(doc(db, 'users', 'alice', 'games', 'g1'), {
        ...PERFECT_GAME,
        completed: true,
        completedAt: serverTimestamp(),
      }),
    )
    // ...but the credit re-checks rounds 4-6, and the leaderboard only takes credited points.
    const batch = writeBatch(db)
    batch.set(doc(db, 'scoreCredits', 'alice_g1'), {
      uid: 'alice',
      gameId: 'g1',
      score: 1200,
      createdAt: serverTimestamp(),
    })
    batch.update(doc(db, 'leaderboard', 'alice'), {
      totalScore: increment(1200),
      gamesPlayed: increment(1),
      lastGameId: 'g1',
      updatedAt: serverTimestamp(),
    })
    await assertFails(batch.commit())
  })

  test('a finished game cannot be finished again', async () => {
    const db = google('alice')
    await createProfile(db, 'alice')
    await startGame(db, 'alice', 'g1', rounds)
    await playGame(db, 'alice', 'g1', rounds, Array(6).fill(perfect))
    await finish(db, 'alice', 'g1', PERFECT_GAME)
    await assertFails(finish(db, 'alice', 'g1', PERFECT_GAME))
  })
})

describe('daily limit and streak', () => {
  test('the fourth game of the day is refused', async () => {
    const db = google('alice')
    await assertSucceeds(startGame(db, 'alice', 'g1', RANKED.slice(0, 6), 1))
    await assertSucceeds(startGame(db, 'alice', 'g2', RANKED.slice(6, 12), 2))
    await assertSucceeds(startGame(db, 'alice', 'g3', RANKED.slice(12, 18), 3))
    await assertFails(startGame(db, 'alice', 'g4', RANKED.slice(18, 24), 4))
    await assertFails(startGame(db, 'alice', 'g4', RANKED.slice(18, 24), 1))
  })

  test('a new day keeps the stored streak when starting a game', async () => {
    const yesterday = Timestamp.fromMillis(Date.now() - DAY_MS)
    await seed((db) =>
      setDoc(doc(db, 'users', 'alice', 'state', 'daily'), {
        day: yesterday,
        plays: 3,
        currentGameId: 'old',
        updatedAt: yesterday,
        streak: 4,
        lastPlayedAt: yesterday,
      }),
    )
    const db = google('alice')
    await assertSucceeds(startGame(db, 'alice', 'g1', RANKED.slice(0, 6), 1))
    const daily = await getDoc(doc(db, 'users', 'alice', 'state', 'daily'))
    assert.equal(daily.data().streak, 4)
    assert.equal(daily.data().plays, 1)
  })

  test('the streak is credited once, only after the current game is completed', async () => {
    const db = google('alice')
    const rounds = RANKED.slice(0, 6)
    await createProfile(db, 'alice')
    await startGame(db, 'alice', 'g1', rounds)
    await assertFails(creditStreak(db, 'alice', 1))
    await playGame(db, 'alice', 'g1', rounds, Array(6).fill(reversed))
    await finish(db, 'alice', 'g1', ZERO_GAME)
    await assertFails(creditStreak(db, 'alice', 2))
    await assertSucceeds(creditStreak(db, 'alice', 1))
    await assertFails(creditStreak(db, 'alice', 1))
  })

  test('the streak grows by one within the window and cannot be forged', async () => {
    const yesterday = Timestamp.fromMillis(Date.now() - DAY_MS)
    await seed(async (db) => {
      await setDoc(doc(db, 'users', 'alice', 'games', 'g0'), {
        uid: 'alice',
        roundIds: RANKED.slice(0, 6),
        score: 0,
        completed: true,
        createdAt: yesterday,
        completedAt: yesterday,
      })
      await setDoc(doc(db, 'users', 'alice', 'state', 'daily'), {
        day: yesterday,
        plays: 1,
        currentGameId: 'g0',
        updatedAt: yesterday,
        streak: 2,
        lastPlayedAt: yesterday,
      })
    })
    const db = google('alice')
    // Yesterday's completed game does not earn today's streak.
    await assertFails(creditStreak(db, 'alice', 3))

    await createProfile(db, 'alice')
    await startGame(db, 'alice', 'g1', RANKED.slice(6, 12))
    await playGame(db, 'alice', 'g1', RANKED.slice(6, 12), Array(6).fill(reversed))
    await finish(db, 'alice', 'g1', ZERO_GAME)
    await assertFails(creditStreak(db, 'alice', 5))
    await assertSucceeds(creditStreak(db, 'alice', 3))
  })
})

describe('leaderboard', () => {
  test('lists at most ten entries', async () => {
    const ranking = (size) =>
      query(collection(anonymous(), 'leaderboard'), orderBy('totalScore', 'desc'), limit(size))
    await assertSucceeds(getDocs(ranking(10)))
    await assertFails(getDocs(ranking(11)))
    await assertFails(getDocs(collection(anonymous(), 'leaderboard')))
  })

  test('scores can only be added through a finished game', async () => {
    const db = google('alice')
    await createProfile(db, 'alice')
    await assertFails(
      updateDoc(doc(db, 'leaderboard', 'alice'), {
        totalScore: 5000,
        gamesPlayed: increment(1),
        lastGameId: 'fake',
        updatedAt: serverTimestamp(),
      }),
    )
    await assertFails(
      setDoc(doc(db, 'scoreCredits', 'alice_fake'), {
        uid: 'alice',
        gameId: 'fake',
        score: 5000,
        createdAt: serverTimestamp(),
      }),
    )
  })
})

// Documents written before the current rules shipped, or left half-written by an
// interrupted migration, must not lock a player out: every one of these used to abort
// the rule with an evaluation error, so no branch could allow the write.
describe('legacy state documents', () => {
  const rounds = RANKED.slice(0, 6)
  const yesterday = () => Timestamp.fromMillis(Date.now() - DAY_MS)

  // Mirrors startGame() in src/features/game/api/gameService.js, which commits the game
  // and the daily document in a transaction rather than the batch used above.
  const startGameAsClient = (db, uid, gameId, roundIds, plays = 1) =>
    runTransaction(db, async (tx) => {
      await tx.get(doc(db, 'users', uid, 'state', 'daily'))
      tx.set(doc(db, 'users', uid, 'games', gameId), {
        uid,
        roundIds,
        score: 0,
        completed: false,
        createdAt: serverTimestamp(),
        completedAt: null,
      })
      tx.set(
        doc(db, 'users', uid, 'state', 'daily'),
        {
          day: serverTimestamp(),
          plays,
          currentGameId: gameId,
          roundCursor: 6 * plays,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    })

  test('the client transaction starts a game just like the batch above', async () => {
    await assertSucceeds(startGameAsClient(google('alice'), 'alice', 'g1', rounds))
  })

  test('a daily document without day or plays still allows the first game of the day', async () => {
    await seed((db) =>
      setDoc(doc(db, 'users', 'alice', 'state', 'daily'), { streak: 3, lastPlayedAt: yesterday() }),
    )
    await assertSucceeds(startGameAsClient(google('alice'), 'alice', 'g1', rounds))
    const daily = await getDoc(doc(google('alice'), 'users', 'alice', 'state', 'daily'))
    assert.equal(daily.data().streak, 3)
  })

  test('a daily document from today without plays counts the new game as the first', async () => {
    await seed((db) =>
      setDoc(doc(db, 'users', 'alice', 'state', 'daily'), {
        day: serverTimestamp(),
        currentGameId: 'old',
        updatedAt: serverTimestamp(),
      }),
    )
    await assertSucceeds(startGameAsClient(google('alice'), 'alice', 'g1', rounds))
    await assertFails(startGameAsClient(google('alice'), 'alice', 'g2', RANKED.slice(6, 12), 3))
  })

  test('a daily document with a plays count that is not a number cannot inflate the limit', async () => {
    await seed((db) =>
      setDoc(doc(db, 'users', 'alice', 'state', 'daily'), {
        day: serverTimestamp(),
        plays: 'many',
        currentGameId: 'old',
        updatedAt: serverTimestamp(),
      }),
    )
    await assertFails(startGameAsClient(google('alice'), 'alice', 'g1', rounds, 2))
    await assertSucceeds(startGameAsClient(google('alice'), 'alice', 'g1', rounds, 1))
  })

  test('the daily limit still holds when the stored day is today', async () => {
    const db = google('alice')
    await assertSucceeds(startGameAsClient(db, 'alice', 'g1', RANKED.slice(0, 6), 1))
    await assertSucceeds(startGameAsClient(db, 'alice', 'g2', RANKED.slice(6, 12), 2))
    await assertSucceeds(startGameAsClient(db, 'alice', 'g3', RANKED.slice(12, 18), 3))
    await assertFails(startGameAsClient(db, 'alice', 'g4', RANKED.slice(18, 24), 4))
  })

  test('a daily document without currentGameId refuses the streak, not the next game', async () => {
    await seed((db) =>
      setDoc(doc(db, 'users', 'alice', 'state', 'daily'), {
        day: yesterday(),
        plays: 1,
        updatedAt: yesterday(),
      }),
    )
    await assertFails(creditStreak(google('alice'), 'alice', 1))
    await assertSucceeds(startGameAsClient(google('alice'), 'alice', 'g1', rounds))
  })

  test('a daily document pointing at a game that no longer exists refuses the streak', async () => {
    await seed((db) =>
      setDoc(doc(db, 'users', 'alice', 'state', 'daily'), {
        day: serverTimestamp(),
        plays: 1,
        currentGameId: 'gone',
        updatedAt: serverTimestamp(),
      }),
    )
    await assertFails(creditStreak(google('alice'), 'alice', 1))
  })

  test('a stale client session cannot write an attempt for a game that is gone', async () => {
    await assertFails(submit(google('alice'), 'alice', 'ghost', RANKED[0], 0, perfect(RANKED[0])))
  })
})

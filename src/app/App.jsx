import React, { Suspense, lazy, useEffect, useRef } from 'react'
import Header from '../components/layout/Header'
import SiteFooter from '../components/layout/SiteFooter'
import { pathFor } from '../config/routes'
import NicknameModal from '../features/auth/NicknameModal'
import ChallengePage from '../features/challenge/ChallengePage'
import FactPage from '../features/facts/FactPage'
import HistoryPage from '../features/facts/HistoryPage'
import TopicPage from '../features/facts/TopicPage'
import RoundLoader from '../features/game/components/RoundLoader'
import { useGame } from '../features/game/GameProvider'
import HomePage from '../features/home/HomePage'
import LeaderboardPage from '../features/leaderboard/LeaderboardPage'
import LegalPage from '../features/legal/LegalPage'
import OnboardingModal from '../features/onboarding/OnboardingModal'
import { useOnboarding } from '../features/onboarding/useOnboarding'
import InfoPage from '../features/pages/InfoPage'
import NotFoundPage from '../features/pages/NotFoundPage'
import { useI18n } from '../i18n/LanguageProvider'
import { EVENTS, track } from '../lib/analytics'
import { applyHead, buildHead } from '../seo/head'
import { useRouter } from './router'

// The game screens (and the drag-and-drop library behind them) load when a game starts,
// not with the pages people land on. They are fetched in the background once the page is
// idle, so starting a game still feels instant.
const loadGamePage = () => import('../features/game/GamePage')
const loadResultsPage = () => import('../features/results/ResultsPage')
const GamePage = lazy(loadGamePage)
const ResultsPage = lazy(loadResultsPage)

function usePrefetchGame() {
  useEffect(() => {
    const prefetch = () => {
      loadGamePage()
      loadResultsPage()
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = setTimeout(prefetch, 2000)
    return () => clearTimeout(timer)
  }, [])
}

// Keeps <head> (title, description, canonical, hreflang, social tags, JSON-LD) in step
// with the page on client-side navigation. Prerendered pages already arrive with it.
function useDocumentHead(route) {
  const first = useRef(true)
  useEffect(() => {
    applyHead(buildHead(route))
    if (first.current) first.current = false
    else track(EVENTS.pageView, { page_path: route.path })
  }, [route])
}

export default function App() {
  const { t, language } = useI18n()
  const { route, navigate } = useRouter()
  const { status, begin, beginChallenge } = useGame()
  const onboarding = useOnboarding()

  usePrefetchGame()
  useDocumentHead(route)

  const startGame = async (mode) => {
    if (await begin(mode)) onboarding.showIfNew()
  }

  const acceptChallenge = async () => {
    if (!(await beginChallenge(route.params.slug))) return
    navigate(pathFor('home', language), { replace: true })
    onboarding.showIfNew()
  }

  let page
  switch (route.name) {
    case 'home':
      if (status === 'playing') page = <GamePage />
      else if (status === 'finished') page = <ResultsPage onPlay={startGame} />
      else page = <HomePage onStart={startGame} />
      break
    case 'howToPlay':
    case 'about':
      page = <InfoPage page={route.name} />
      break
    case 'ranking':
      page = <LeaderboardPage />
      break
    case 'history':
      page = <HistoryPage />
      break
    case 'topic':
      page = <TopicPage slug={route.params.slug} />
      break
    case 'fact':
      page = <FactPage slug={route.params.slug} />
      break
    case 'privacy':
    case 'terms':
      page = <LegalPage type={route.name} />
      break
    case 'challenge':
      page = <ChallengePage code={route.params.slug} onAccept={acceptChallenge} />
      break
    default:
      page = <NotFoundPage />
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#content">
        {t.nav.skip}
      </a>
      <Header />
      <main id="content" className="app-main" tabIndex={-1}>
        <Suspense fallback={<RoundLoader progress={0} />}>{page}</Suspense>
      </main>
      <SiteFooter />
      <NicknameModal />
      <OnboardingModal
        step={onboarding.step}
        onNext={onboarding.next}
        onSkip={onboarding.dismiss}
      />
    </div>
  )
}

import React from 'react'
import Header from '../components/layout/Header'
import SiteFooter from '../components/layout/SiteFooter'
import { ROUTES } from '../config/constants'
import { useAuth } from '../features/auth/AuthProvider'
import NicknameModal from '../features/auth/NicknameModal'
import RoundLoader from '../features/game/components/RoundLoader'
import GamePage from '../features/game/GamePage'
import { useGame } from '../features/game/GameProvider'
import HomePage from '../features/home/HomePage'
import LeaderboardPage from '../features/leaderboard/LeaderboardPage'
import LegalPage from '../features/legal/LegalPage'
import OnboardingModal from '../features/onboarding/OnboardingModal'
import { useOnboarding } from '../features/onboarding/useOnboarding'
import ResultsPage from '../features/results/ResultsPage'
import { useRouter } from './router'

export default function App() {
  const { path } = useRouter()
  const { ready } = useAuth()
  const { status, begin } = useGame()
  const onboarding = useOnboarding()

  if (!ready) {
    return <main className="app-shell center-shell"><RoundLoader progress={2} /></main>
  }

  const startGame = async () => {
    if (await begin()) onboarding.showIfNew()
  }

  let page
  if (path === ROUTES.leaderboard) page = <LeaderboardPage />
  else if (path === ROUTES.privacy) page = <LegalPage type="privacy" />
  else if (path === ROUTES.terms) page = <LegalPage type="terms" />
  else if (status === 'playing') page = <GamePage />
  else if (status === 'finished') page = <ResultsPage onPlayAgain={startGame} />
  else page = <HomePage onStart={startGame} />

  return (
    <main className="app-shell">
      <Header />
      {page}
      <SiteFooter />
      <NicknameModal />
      <OnboardingModal step={onboarding.step} onNext={onboarding.next} onSkip={onboarding.dismiss} />
    </main>
  )
}

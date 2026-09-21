import React, { useEffect, useRef, useState } from 'react'
import {
  DndContext, DragOverlay, KeyboardSensor, MeasuringStrategy, PointerSensor, TouchSensor, closestCenter,
  defaultDropAnimationSideEffects, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, defaultAnimateLayoutChanges, rectSortingStrategy,
  sortableKeyboardCoordinates, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, ArrowRight, GripVertical } from 'lucide-react'
import CommonsImage, { preloadCommonsImage } from './components/CommonsImage'
import AuthControls from './components/AuthControls'
import NicknameModal from './components/NicknameModal'
import OnboardingModal from './components/OnboardingModal'
import ShareGrid from './components/ShareGrid'
import ResultSummary from './components/ResultSummary'
import LeaderboardPage from './pages/LeaderboardPage'
import LegalPage from './pages/LegalPage'
import { accentFor } from './categories'
import { copy, getInitialLanguage, languages, saveLanguage, textForEvent } from './i18n'
import { observeAuth, signInWithGoogle, signOutUser } from './services/authService'
import { createProfile, getProfile } from './services/userService'
import {
  DAILY_LIMIT, ROUND_SIZE, TOTAL_ROUNDS, creditDailyStreak, finishGame, getDailyState, getRound,
  startGame, startGuestGame, submitGuestRound, submitRound,
} from './services/gameService'
import { setTrackingEnabled, track } from './services/analyticsService'

// Slot rects are measured once when a drag starts; re-measuring mid-drag picks
// up the neighbours' in-flight transforms and makes the drop target lag.
const MEASURING={droppable:{strategy:MeasuringStrategy.BeforeDragging}}
const SESSION_KEY = 'when-firebase-session-v1'
const ONBOARDING_KEY = 'when-onboarding-seen-v1'
const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/HigorTuretta/play-when'

const DUST_PUFFS = [
  { sx:-52,x:-96,y:-34,size:30,delay:0,scale:1.2,blur:1.2 },{ sx:-24,x:-48,y:-66,size:22,delay:40,scale:1,blur:.8 },
  { sx:26,x:52,y:-62,size:20,delay:70,scale:1.05,blur:.7 },{ sx:51,x:102,y:-30,size:31,delay:20,scale:1.22,blur:1.3 },
  { sx:-9,x:-30,y:-58,size:17,delay:110,scale:.9,blur:.5 },{ sx:12,x:34,y:-70,size:16,delay:130,scale:.88,blur:.5 },
]

const shuffle = (items) => {
  const out=[...items]
  for(let i=out.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
  return out
}
const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
const saveSession=(value)=>{try{localStorage.setItem(SESSION_KEY,JSON.stringify(value))}catch{}}
const clearSession=()=>{try{localStorage.removeItem(SESSION_KEY)}catch{}}
const readOnboardingSeen=()=>{try{return localStorage.getItem(ONBOARDING_KEY)==='1'}catch{return false}}
const saveOnboardingSeen=()=>{try{localStorage.setItem(ONBOARDING_KEY,'1')}catch{}}
const currentPath=()=>['/leaderboard','/privacy','/terms'].includes(window.location.pathname)?window.location.pathname:'/'

function LanguageSwitch({language,onChange}){
  return <div className="language-switch" role="group" aria-label={copy[language].language}>{Object.entries(languages).map(([code,meta])=><button key={code} type="button" className={language===code?'active':''} onClick={()=>onChange(code)} aria-pressed={language===code}>{meta.short}</button>)}</div>
}

function StreakChip({value,t}){
  return <div className="streak-chip" title={t.streakHint}><span className="streak-flame" aria-hidden="true"><i/><b/></span><span className="streak-value"><strong>{value}</strong><span>{t.streakUnit}</span></span></div>
}

function SiteFooter({language,navigate}){
  const t=copy[language]
  return <footer className="site-footer"><button onClick={()=>navigate('/privacy')}>{t.privacy}</button><span className="footer-dot">•</span><button onClick={()=>navigate('/terms')}>{t.terms}</button><span className="footer-dot">•</span><span>{t.developedBy} <strong>Turetta</strong></span><span className="footer-dot">•</span><a href={GITHUB_URL} target="_blank" rel="noreferrer">{t.github}</a></footer>
}

function DustBurst({burst}){if(!burst)return null;return <div className="dust-burst" style={{left:burst.x,top:burst.y}} aria-hidden="true"><span className="dust-ring"/>{DUST_PUFFS.map((p,i)=><span key={`${burst.id}-${i}`} className={`dust-puff puff-${i%4}`} style={{'--dust-start-x':`${p.sx}px`,'--dust-x':`${p.x}px`,'--dust-y':`${p.y}px`,'--dust-size':`${p.size}px`,'--dust-scale':p.scale,'--dust-blur':`${p.blur}px`,'--dust-delay':`${p.delay}ms`}}/>)}</div>}

function ShuffleArt(){
  return <div className="shuffle-art" aria-hidden="true">
    {[0,1,2,3].map((i)=><span key={i} className={`shuffle-card shuffle-card-${i+1}`}><i/><b/></span>)}
    <span className="shuffle-clock"><i/><i/></span>
  </div>
}

function RoundLoader({progress,language}){
  const t=copy[language]
  const phrase=t.loaderPhrases[Math.min(progress,t.loaderPhrases.length-1)]
  return <section className="round-loader" aria-live="polite" aria-label={t.loadingAria}><ShuffleArt/><strong>{phrase}</strong><span>{t.imagesReady(Math.min(progress,ROUND_SIZE),ROUND_SIZE)}</span><div className="loader-progress"><i style={{width:`${Math.min(progress,ROUND_SIZE)/ROUND_SIZE*100}%`}}/></div></section>
}

function CardInner({item,checked,status='',overlay=false,index,move,correctPosition,language,displayYear}){
  const t=copy[language], localized=textForEvent(item,language), accent=accentFor(item.category)
  return <>
    <div className="card-art" style={{'--accent':accent}}>
      <CommonsImage event={item} checked={checked&&!overlay}/>
      <span className="art-scrim" aria-hidden="true"/>
      <span className="category-chip">{localized.category}</span>
      <span className="card-grip" aria-hidden="true"><GripVertical size={15}/></span>
      {status&&<span className={`card-result-dot ${status}`} aria-hidden="true"><i/></span>}
    </div>
    <div className="card-body">
      <h2>{localized.title}</h2>
      <p>{localized.short}</p>
      {checked&&<div className="answer-reveal"><span className="year-reveal">{displayYear(item.year)}</span><span className={`correct-position ${status}`}>{t.correctPosition(correctPosition)}</span></div>}
      {!checked&&!overlay&&<div className="mobile-controls"><button onPointerDown={(e)=>e.stopPropagation()} onClick={()=>move(index,index-1)} disabled={index===0} aria-label={t.moveLeft}><ArrowLeft size={16}/></button><button onPointerDown={(e)=>e.stopPropagation()} onClick={()=>move(index,index+1)} disabled={index===ROUND_SIZE-1} aria-label={t.moveRight}><ArrowRight size={16}/></button></div>}
    </div>
  </>
}

function SortableCard({item,index,checked,correctOrder,move,language,displayYear}){
  const correctIndex=checked?correctOrder.indexOf(item.id):-1
  const status=!checked?'':correctIndex===index?'correct':'wrong'
  const animateLayoutChanges=(args)=>defaultAnimateLayoutChanges({...args,wasDragging:true})
  const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:item.id,disabled:checked,animateLayoutChanges,transition:{duration:340,easing:'cubic-bezier(.22,1,.36,1)'}})
  const style={transform:CSS.Transform.toString(transform),transition,'--deal-delay':`${index*70}ms`}
  return <article ref={setNodeRef} style={style} data-card-id={item.id} className={`timeline-card ${status} ${isDragging?'is-dragging':''}`} {...attributes} {...listeners}><CardInner item={item} checked={checked} status={status} index={index} move={move} correctPosition={correctIndex+1} language={language} displayYear={displayYear}/></article>
}

function App(){
  const [language,setLanguage]=useState(getInitialLanguage)
  const [path,setPath]=useState(currentPath)
  const [user,setUser]=useState(null),[profile,setProfile]=useState(null),[authReady,setAuthReady]=useState(false),[profileBusy,setProfileBusy]=useState(false)
  const [daily,setDaily]=useState({plays:0,streak:0}),[error,setError]=useState('')
  const [status,setStatus]=useState('home'),[game,setGame]=useState(null),[round,setRound]=useState(0),[roundData,setRoundData]=useState(null)
  const [ordered,setOrdered]=useState([]),[checked,setChecked]=useState(false),[correctOrder,setCorrectOrder]=useState([]),[roundHits,setRoundHits]=useState(0),[lastGain,setLastGain]=useState(0)
  const [score,setScore]=useState(0),[displayScore,setDisplayScore]=useState(0),displayScoreRef=useRef(0),[scoreGain,setScoreGain]=useState(null),[streak,setStreak]=useState(0)
  const [results,setResults]=useState([]),[submitBusy,setSubmitBusy]=useState(false)
  const [onboardStep,setOnboardStep]=useState(-1),seenOnboardingRef=useRef(readOnboardingSeen())
  const [activeId,setActiveId]=useState(null),[activeSize,setActiveSize]=useState(null),[roundLoading,setRoundLoading]=useState(false),[loadProgress,setLoadProgress]=useState(0),[dustBurst,setDustBurst]=useState(null)
  const t=copy[language]
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}),useSensor(TouchSensor,{activationConstraint:{delay:90,tolerance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}))
  const activeItem=activeId?ordered.find((item)=>item.id===activeId):null
  const remaining=Math.max(0,DAILY_LIMIT-(daily.plays||0))
  const limitReached=Boolean(user&&profile&&remaining===0)
  const progress=((round+(checked?1:0))/TOTAL_ROUNDS)*100
  const displayYear=(year)=>year<0?`${Math.abs(year)} ${t.bc}`:String(year)

  const goHome=()=>{if(status!=='playing')setStatus('home');navigate('/')}
  const navigate=(next)=>{window.history.pushState({},'',next);setPath(next);window.scrollTo({top:0,behavior:'smooth'});track('page_view',{page_path:next})}
  useEffect(()=>{const fn=()=>setPath(currentPath());window.addEventListener('popstate',fn);return()=>window.removeEventListener('popstate',fn)},[])
  useEffect(()=>{document.documentElement.lang=language},[language])
  const changeLanguage=(next)=>{if(!languages[next])return;setLanguage(next);saveLanguage(next)}

  useEffect(()=>observeAuth(async(nextUser)=>{
    setTrackingEnabled(Boolean(nextUser))
    setUser(nextUser);setError('')
    if(nextUser){
      try{const p=await getProfile(nextUser.uid);setProfile(p);if(p){setDaily(await getDailyState(nextUser.uid));const saved=readSession();if(saved?.uid===nextUser.uid&&!saved.finished){setGame({id:saved.gameId,roundIds:saved.roundIds,guest:saved.guest||saved.gameId?.startsWith('guest-')});setRound(saved.round||0);setScore(saved.score||0);displayScoreRef.current=saved.score||0;setDisplayScore(saved.score||0);setStreak(saved.streak||0);setResults(saved.results||[]);setStatus('playing')}}}catch{setError(t.genericError)}
    }else{setProfile(null);setDaily({plays:0,streak:0});setStatus('home');clearSession()}
    setAuthReady(true)
  }),[])

  useEffect(()=>{
    if(status!=='playing'||!game?.roundIds?.[round])return
    let alive=true;const controller=new AbortController();setRoundLoading(true);setLoadProgress(0);setChecked(false);setCorrectOrder([]);setRoundHits(0);setLastGain(0)
    getRound(game.roundIds[round]).then(async data=>{
      if(!alive)return;setRoundData(data)
      const saved=readSession()?.roundState,restorable=saved&&saved.gameId===game.id&&saved.round===round&&saved.orderIds?.length===data.cards.length&&saved.orderIds.every(id=>data.cards.some(c=>c.id===id))
      if(restorable){
        const byId=Object.fromEntries(data.cards.map(c=>[c.id,c]))
        setOrdered(saved.orderIds.map(id=>saved.checked?{...byId[id],year:saved.years?.[id]}:byId[id]))
        if(saved.checked){setCorrectOrder(saved.correctOrder||[]);setRoundHits(saved.hits||0);setLastGain(saved.gain||0);setChecked(true)}
      }else setOrdered(shuffle(data.cards))
      let completed=0;await Promise.allSettled(data.cards.map(async card=>{try{await preloadCommonsImage(card,controller.signal)}finally{completed+=1;if(alive)setLoadProgress(completed)}}))
      if(alive)setTimeout(()=>alive&&setRoundLoading(false),250)
    }).catch(()=>alive&&setError(t.genericError))
    return()=>{alive=false;controller.abort()}
  },[status,game?.id,round])

  useEffect(()=>{
    if(status!=='playing'||!game||!user||game.guest||roundLoading||!ordered.length)return
    const roundState={gameId:game.id,round,orderIds:ordered.map(i=>i.id),checked,correctOrder,hits:roundHits,gain:lastGain,years:checked?Object.fromEntries(ordered.map(i=>[i.id,i.year])):null}
    saveSession({uid:user.uid,gameId:game.id,roundIds:game.roundIds,guest:false,round,score,streak,results,finished:false,roundState})
  },[status,game,round,score,streak,results,user,ordered,checked,correctOrder,roundHits,lastGain,roundLoading])
  useEffect(()=>{const from=displayScoreRef.current,to=score;if(from===to){setDisplayScore(to);return}const duration=560,start=performance.now();let frame=0;const tick=(now)=>{const p=Math.min(1,(now-start)/duration),e=1-Math.pow(1-p,3),v=Math.round(from+(to-from)*e);displayScoreRef.current=v;setDisplayScore(v);if(p<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[score])

  const handleLogin=async()=>{try{setError('');await signInWithGoogle();track('login',{method:'google'})}catch{setError(t.genericError)}}
  const handleNickname=async(nickname)=>{if(!user)return;try{setProfileBusy(true);const p=await createProfile(user,nickname);setProfile(p);setDaily(await getDailyState(user.uid));track('sign_up',{method:'google'})}catch{setError(t.genericError)}finally{setProfileBusy(false)}}
  const handleLogout=async()=>{await signOutUser();navigate('/')}

  const beginGame=async()=>{
    if(user&&!profile)return
    try{
      setError('')
      let created
      if(user){
        const fresh=await getDailyState(user.uid)
        if(fresh.plays>=DAILY_LIMIT){setDaily(fresh);return}
        created=await startGame(user.uid)
        setDaily({...fresh,plays:fresh.plays+1})
        track('game_start',{daily_play:fresh.plays+1,mode:'account'})
      }else{
        created=startGuestGame()
        track('game_start',{mode:'guest'})
      }
      setGame(created);setRound(0);setScore(0);displayScoreRef.current=0;setDisplayScore(0);setStreak(0);setResults([]);setStatus('playing')
      if(!seenOnboardingRef.current)setOnboardStep(0)
    }catch(e){
      if(e?.message==='daily-limit')setDaily((current)=>({...current,plays:DAILY_LIMIT}))
      else setError(t.genericError)
    }
  }

  const dismissOnboarding=()=>{seenOnboardingRef.current=true;saveOnboardingSeen();setOnboardStep(-1)}
  const advanceOnboarding=()=>{if(onboardStep>=2){dismissOnboarding();return}setOnboardStep((step)=>step+1)}

  const move=(from,to)=>{if(checked||to<0||to>=ordered.length)return;setOrdered(items=>arrayMove(items,from,to));triggerDustForCard(ordered[from]?.id)}
  const triggerDustForCard=(cardId,fallbackRect)=>{setTimeout(()=>requestAnimationFrame(()=>{const node=[...document.querySelectorAll('[data-card-id]')].find(el=>el.dataset.cardId===String(cardId));const rect=node?.getBoundingClientRect?.()||fallbackRect;if(!rect)return;const id=Date.now();setDustBurst({id,x:rect.left+rect.width/2,y:rect.bottom});setTimeout(()=>setDustBurst(current=>current?.id===id?null:current),900)}),285)}
  const handleDragEnd=({active,over})=>{setActiveId(null);setActiveSize(null);if(checked||!over)return;const fallbackRect=over.rect;if(active.id!==over.id)setOrdered(items=>arrayMove(items,items.findIndex(i=>i.id===active.id),items.findIndex(i=>i.id===over.id)));triggerDustForCard(active.id,fallbackRect)}

  const submit=async()=>{
    if(checked||!game||submitBusy)return
    try{
      setSubmitBusy(true);setError('')
      const payload={roundId:game.roundIds[round],orderedIds:ordered.map(i=>i.id),streakBefore:streak}
      const result=user&&!game.guest?await submitRound({...payload,uid:user.uid,gameId:game.id,roundIndex:round}):await submitGuestRound(payload)
      const revealed=ordered.map(item=>({...item,year:result.years[item.id]}))
      setOrdered(revealed)
      setCorrectOrder(result.correctOrder);setRoundHits(result.hits);setLastGain(result.score);setChecked(true);setStreak(result.streakAfter)
      setResults(current=>[...current,{round,hits:result.hits,perfect:result.hits===ROUND_SIZE,ordered:revealed,correct:result.correctOrder}])
      if(result.score>0){setScore(v=>v+result.score);const id=Date.now();setScoreGain({id,value:result.score});setTimeout(()=>setScoreGain(c=>c?.id===id?null:c),1100)}
      track('round_submit',{round:round+1,hits:result.hits,score:result.score})
    }catch(error){console.error('Failed to submit round',error);setError(t.genericError)}finally{setSubmitBusy(false)}
  }

  const nextRound=async()=>{
    if(round<TOTAL_ROUNDS-1){setRound(v=>v+1);return}
    if(!user||game.guest){setStatus('finished');clearSession();track('game_complete',{score,mode:'guest'});return}
    try{
      const finalScore=await finishGame({uid:user.uid,gameId:game.id,score})
      setScore(finalScore);setStatus('finished');clearSession()
      // The streak write is deliberately separate: a rejected streak update
      // must never roll back a score that was already credited.
      try{const nextValue=await creditDailyStreak(user.uid);setDaily(current=>({...current,streak:nextValue}))}catch{}
      setDaily(await getDailyState(user.uid))
      track('game_complete',{score:finalScore,mode:'account'})
    }catch{setError(t.genericError)}
  }

  const totalHits=results.reduce((total,item)=>total+item.hits,0)
  const perfectRounds=results.filter((item)=>item.perfect).length

  const header=<header className="topbar">
    <button className="brand brand-button" onClick={goHome}><span className="brand-dot">W</span><span>{t.gameName}</span></button>
    <nav className="main-nav"><button className={path==='/'?'active':''} onClick={goHome}>{t.home}</button><button className={path==='/leaderboard'?'active':''} onClick={()=>navigate('/leaderboard')}>{t.leaderboard}</button></nav>
    <div className="topbar-tools">
      {user&&profile&&daily.streak>0&&<StreakChip value={daily.streak} t={t}/>}
      <LanguageSwitch language={language} onChange={changeLanguage}/>
      <AuthControls user={user} profile={profile} onLogin={handleLogin} onLogout={handleLogout} t={t}/>
    </div>
  </header>

  const modals=<>
    <NicknameModal open={Boolean(user&&!profile)} t={t} onSubmit={handleNickname} busy={profileBusy}/>
    <OnboardingModal step={onboardStep} t={t} onNext={advanceOnboarding} onSkip={dismissOnboarding}/>
  </>

  if(!authReady)return <main className="app-shell center-shell"><RoundLoader progress={2} language={language}/></main>

  if(path==='/leaderboard'||path==='/privacy'||path==='/terms')return <main className="app-shell">{header}{path==='/leaderboard'?<LeaderboardPage t={t} currentUid={user?.uid}/>:<LegalPage type={path==='/privacy'?'privacy':'terms'} language={language} t={t} navigate={navigate}/>}<SiteFooter language={language} navigate={navigate}/>{modals}</main>

  if(status==='finished')return <main className="app-shell">{header}
    <section className="finish-card">
      <span className="finish-blob" aria-hidden="true"/>
      <div className="finish-inner">
        <div className="page-badge" aria-hidden="true">★</div>
        <p className="eyebrow">{t.endGame}</p>
        <h1>{score>=620?t.finishGreat:t.finishTry}</h1>
        <div className="stats-grid">
          <div className="stat-card"><span>{t.statScore}</span><strong>{score}</strong></div>
          <div className="stat-card"><span>{t.statHits}</span><strong>{totalHits}</strong></div>
          <div className="stat-card"><span>{t.statPerfect}</span><strong>{perfectRounds}</strong></div>
          <div className="stat-card is-accent"><span>{t.statStreak}</span><strong>{user&&profile?daily.streak||0:0}</strong></div>
        </div>
        {results.length>0&&<ShareGrid results={results} score={score} t={t}/>}
        {(!user||game?.guest)&&<div className="login-callout"><strong>{t.loginToSave}</strong><button className="primary small" onClick={handleLogin}>{t.signIn}</button></div>}
        {results.length>0&&<ResultSummary results={results} language={language} t={t} displayYear={displayYear}/>}
        <div className="finish-actions">
          {limitReached?<div className="limit-message"><span className="limit-badge" aria-hidden="true">!</span><span>{t.completedToday}</span></div>
            :<button className="primary" onClick={beginGame}>{user&&profile?t.playAgain(remaining):t.startGame}</button>}
          <button className="outline" onClick={()=>navigate('/leaderboard')}>{t.leaderboard}</button>
        </div>
      </div>
    </section>
    <SiteFooter language={language} navigate={navigate}/>{modals}</main>

  if(status==='home')return <main className="app-shell">{header}{error&&<div className="inline-error">{error}</div>}
    <section className="home">
      <div className="home-copy">
        <h1>{t.startTitle}</h1>
        <p className="lede">{t.startCopy}</p>
        {limitReached?<div className="limit-message"><span className="limit-badge" aria-hidden="true">!</span><span>{t.dailyLimit}</span></div>:
          <div className="home-start">
            <button className="primary big" onClick={beginGame}><span className="play-glyph" aria-hidden="true"/>{t.startGame}</button>
            {user&&profile&&<div className="attempt-meter">
              <span className="meter-label">{t.todayPlays}</span>
              <div className="meter-dots">
                {[0,1,2].map((i)=><span key={i} className={i<(daily.plays||0)?'is-used':''}/>)}
                <span className="meter-remaining">{t.remainingAttempts(remaining)}</span>
              </div>
            </div>}
          </div>}
      </div>
      <ShuffleArt/>
    </section>
    <SiteFooter language={language} navigate={navigate}/>{modals}</main>

  return <main className="app-shell">{header}
    <section className="game-head">
      <div><p className="eyebrow">{t.round(round+1,TOTAL_ROUNDS)}</p><h1>{t.gameTitle}</h1><p className="subtitle">{t.gameSubtitle}</p></div>
      <div className="game-head-right">
        <div className="streak-card"><span>{t.streak}</span><strong>{streak}x</strong></div>
        <div className={`score-pill ${scoreGain?'is-gaining':''}`}><span className="score-mark" aria-hidden="true"/><span className="score-value">{displayScore}</span><span className="score-unit">{t.pointsShort}</span>{scoreGain&&<span key={scoreGain.id} className="score-float">+{scoreGain.value}</span>}</div>
      </div>
    </section>
    <div className="progress-track"><div className="progress-value" style={{width:`${progress}%`}}/></div>
    {error&&<div className="inline-error">{error}</div>}
    {roundLoading||!roundData?<RoundLoader progress={loadProgress} language={language}/>:<>
      <DndContext sensors={sensors} measuring={MEASURING} collisionDetection={closestCenter} onDragStart={({active})=>{if(checked)return;setActiveId(active.id);const rect=active.rect.current.initial;if(rect)setActiveSize({width:rect.width})}} onDragCancel={()=>{setActiveId(null);setActiveSize(null)}} onDragEnd={handleDragEnd}>
        <section className={`timeline-zone ${activeId?'is-sorting':''}`} aria-label={t.cardsAria}>
          <SortableContext items={ordered.map(i=>i.id)} strategy={rectSortingStrategy}>
            <div className="cards-grid">{ordered.map((item,index)=><SortableCard key={item.id} item={item} index={index} checked={checked} correctOrder={correctOrder} move={move} language={language} displayYear={displayYear}/>)}</div>
          </SortableContext>
          <div className="timeline-rail" aria-hidden="true">
            <span className="rail-label">{t.oldest}</span>
            <div className="rail-track"><span className="rail-line"/>{[0,1,2,3].map((i)=><span key={i} className="rail-node"/>)}</div>
            <span className="rail-label">{t.newest}</span>
          </div>
        </section>
        <DragOverlay adjustScale={false} dropAnimation={{duration:300,easing:'cubic-bezier(.2,.9,.25,1)',sideEffects:defaultDropAnimationSideEffects({styles:{active:{opacity:'0.15'}}})}}>{activeItem?<article className="timeline-card drag-overlay-card" style={{width:activeSize?.width||undefined}}><CardInner item={activeItem} checked={false} overlay language={language} displayYear={displayYear}/></article>:null}</DragOverlay>
      </DndContext>
      <section className={`actions ${checked?'is-checked':''}`}>
        {checked?<div className={`feedback ${roundHits===ROUND_SIZE?'feedback-ok':roundHits>0?'feedback-partial':'feedback-bad'}`}>
          <div className="feedback-icon">{roundHits===ROUND_SIZE?'✓':roundHits>0?roundHits:'!'}</div>
          <div><strong>{roundHits===ROUND_SIZE?t.perfect:roundHits>0?t.partial(roundHits,ROUND_SIZE):t.none}</strong><span>{lastGain>0?t.award(lastGain):t.noAward}</span></div>
        </div>:<p className="drag-hint">{t.dragHint}<span>{t.imageDisclaimer}</span></p>}
        {!checked?<button className="primary" onClick={submit} disabled={submitBusy}>{t.submit} ✓</button>:<button className="primary" onClick={nextRound}>{round===TOTAL_ROUNDS-1?t.seeResult:t.nextRound} →</button>}
      </section>
      {checked&&<section className="reveal-block">
        <div className="comparison-panel">
          <p className="panel-label">{t.diffTitle}</p>
          <div className="comparison-rows">
            <div className="comparison-row">
              <span className="comparison-label">{t.yourOrder}</span>
              <div className="comparison-chips">
                {ordered.map((card,index)=>{
                  const hit=correctOrder[index]===card.id
                  return <span key={card.id} className={`comparison-chip ${hit?'is-hit':'is-miss'}`}><i aria-hidden="true"/><b>{displayYear(card.year)}</b><em>{textForEvent(card,language).title}</em></span>
                })}
              </div>
            </div>
            <div className="comparison-row">
              <span className="comparison-label">{t.rightOrder}</span>
              <div className="comparison-chips">
                {[...ordered].sort((a,b)=>a.year-b.year).map((card)=><span key={card.id} className="comparison-chip is-answer"><b>{displayYear(card.year)}</b><em>{textForEvent(card,language).title}</em></span>)}
              </div>
            </div>
          </div>
        </div>
      </section>}
    </>}
    <SiteFooter language={language} navigate={navigate}/><DustBurst burst={dustBurst}/>{modals}</main>
}

export default App

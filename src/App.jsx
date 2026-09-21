import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, closestCenter,
  defaultDropAnimationSideEffects, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, defaultAnimateLayoutChanges, rectSortingStrategy,
  sortableKeyboardCoordinates, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft, ArrowRight, Check, Clock3, Github, GripVertical, Languages as LanguagesIcon,
  LockKeyhole, Play, Sparkles, Trophy,
} from 'lucide-react'
import CommonsImage, { preloadCommonsImage } from './components/CommonsImage'
import AuthControls from './components/AuthControls'
import NicknameModal from './components/NicknameModal'
import LeaderboardPage from './pages/LeaderboardPage'
import LegalPage from './pages/LegalPage'
import { copy, getInitialLanguage, languages, saveLanguage, textForEvent } from './i18n'
import { observeAuth, signInWithGoogle, signOutUser } from './services/authService'
import { createProfile, getProfile } from './services/userService'
import {
  DAILY_LIMIT, ROUND_SIZE, TOTAL_ROUNDS, finishGame, getDailyState, getRound, startGame, startGuestGame, submitGuestRound, submitRound,
} from './services/gameService'
import { setTrackingEnabled, track } from './services/analyticsService'

const SESSION_KEY = 'when-firebase-session-v1'
const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/HigorTuretta/play-when'

const accentByCategory = {
  História:'#9d5cff', Tecnologia:'#10bfa5', Ciência:'#ff5c7d', Espaço:'#1aa8ff', Invenções:'#ff7a18',
  Exploração:'#5f7cff', Cultura:'#f3b321', Games:'#ff5b35', Internet:'#1bbf89', 'Cinema & TV':'#ee6fa8',
  Música:'#7f6df2', Esportes:'#34a853', Transportes:'#e68a27', Brasil:'#25a65a',
}

const DUST_PUFFS = [
  { sx:-52,x:-96,y:-30,size:30,delay:0,scale:1.18,blur:1.2 },{ sx:-36,x:-74,y:-52,size:22,delay:24,scale:1.08,blur:.8 },
  { sx:-22,x:-52,y:-68,size:18,delay:56,scale:.94,blur:.5 },{ sx:-8,x:-30,y:-46,size:26,delay:16,scale:1.2,blur:1.1 },
  { sx:7,x:24,y:-60,size:20,delay:42,scale:1.02,blur:.7 },{ sx:22,x:48,y:-72,size:17,delay:72,scale:.9,blur:.4 },
  { sx:34,x:72,y:-50,size:25,delay:28,scale:1.12,blur:1 },{ sx:50,x:98,y:-30,size:31,delay:4,scale:1.22,blur:1.35 },
  { sx:-62,x:-116,y:-18,size:18,delay:80,scale:.84,blur:.6 },{ sx:62,x:116,y:-18,size:18,delay:84,scale:.84,blur:.6 },
  { sx:-16,x:-18,y:-86,size:13,delay:94,scale:.76,blur:.35 },{ sx:16,x:18,y:-88,size:14,delay:102,scale:.78,blur:.35 },
]

const shuffle = (items) => {
  const out=[...items]
  for(let i=out.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
  return out
}
const readSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
const saveSession=(value)=>{try{localStorage.setItem(SESSION_KEY,JSON.stringify(value))}catch{}}
const clearSession=()=>{try{localStorage.removeItem(SESSION_KEY)}catch{}}
const displayYear=(year,language)=>year<0?`${Math.abs(year)} ${copy[language].bc}`:String(year)
const currentPath=()=>['/leaderboard','/privacy','/terms'].includes(window.location.pathname)?window.location.pathname:'/'

function LanguageSwitch({language,onChange}){
  const t=copy[language]
  return <div className="language-switch" role="group" aria-label={t.language}><LanguagesIcon size={15}/>{Object.entries(languages).map(([code,meta])=><button key={code} type="button" className={language===code?'active':''} onClick={()=>onChange(code)} aria-pressed={language===code}>{meta.short}</button>)}</div>
}

function SiteFooter({language,navigate}){
  const t=copy[language]
  return <footer className="site-footer"><button onClick={()=>navigate('/privacy')}>{t.privacy}</button><span className="footer-dot">•</span><button onClick={()=>navigate('/terms')}>{t.terms}</button><span className="footer-dot">•</span><span>{t.developedBy} <strong>Turetta</strong></span><span className="footer-dot">•</span><a href={GITHUB_URL} target="_blank" rel="noreferrer"><Github size={15}/> {t.github}</a></footer>
}

function DustBurst({burst}){if(!burst)return null;return <div className="dust-burst" style={{left:burst.x,top:burst.y,'--dust-width':`${Math.min(burst.width||220,260)}px`}} aria-hidden="true"><span className="dust-ground-shadow"/><span className="dust-sweep dust-sweep-left"/><span className="dust-sweep dust-sweep-right"/>{DUST_PUFFS.map((p,i)=><span key={`${burst.id}-${i}`} className="dust-puff" style={{'--dust-start-x':`${p.sx}px`,'--dust-x':`${p.x}px`,'--dust-y':`${p.y}px`,'--dust-size':`${p.size}px`,'--dust-scale':p.scale,'--dust-blur':`${p.blur}px`,'--dust-delay':`${p.delay}ms`}}/>)}</div>}

function RoundLoader({progress,language}){const t=copy[language];const phrase=t.loaderPhrases[Math.min(progress,t.loaderPhrases.length-1)];return <section className="round-loader" aria-live="polite" aria-label={t.loadingAria}><div className="loader-scene" aria-hidden="true">{Array.from({length:4}).map((_,i)=><span key={i} className={`loader-card loader-card-${i+1}`}><i/><b/></span>)}<span className="loader-clock"><i/></span></div><strong>{phrase}</strong><span>{t.imagesReady(Math.min(progress,ROUND_SIZE),ROUND_SIZE)}</span><div className="loader-progress"><i style={{width:`${Math.min(progress,ROUND_SIZE)/ROUND_SIZE*100}%`}}/></div></section>}

function CardInner({item,checked,status='',overlay=false,index,move,correctPosition,language}){
  const t=copy[language], localized=textForEvent(item,language), accent=accentByCategory[item.category]||'#222'
  return <><div className="card-grip" aria-hidden="true"><GripVertical size={18}/></div><div className="card-image-wrap" style={{'--accent':accent}}><CommonsImage event={item} checked={checked&&!overlay} categoryLabel={localized.category}/><span className="category-chip" style={{'--accent':accent}}>{localized.category}</span></div><div className="card-body"><h2>{localized.title}</h2><p>{localized.short}</p>{checked&&<div className="answer-reveal"><span className="year-reveal">{displayYear(item.year,language)}</span><span className={`correct-position ${status}`}>{t.correctPosition(correctPosition)}</span></div>}</div>{!checked&&!overlay&&<div className="mobile-controls"><button onPointerDown={(e)=>e.stopPropagation()} onClick={()=>move(index,index-1)} disabled={index===0}><ArrowLeft size={16}/></button><button onPointerDown={(e)=>e.stopPropagation()} onClick={()=>move(index,index+1)} disabled={index===ROUND_SIZE-1}><ArrowRight size={16}/></button></div>}{status&&<span className={`card-result-dot ${status}`} aria-hidden="true"/>}</>
}

function SortableCard({item,index,checked,correctOrder,move,language}){
  const correctIndex=checked?correctOrder.indexOf(item.id):-1
  const status=!checked?'':correctIndex===index?'correct':'wrong'
  const animateLayoutChanges=(args)=>defaultAnimateLayoutChanges({...args,wasDragging:true})
  const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:item.id,disabled:checked,animateLayoutChanges,transition:{duration:300,easing:'cubic-bezier(0.18, 0.92, 0.28, 1)'}})
  const style={transform:CSS.Transform.toString(transform),transition,'--tilt':`${[-2.2,1.4,-1.1,2][index]}deg`,'--deal-delay':`${index*55}ms`}
  return <article ref={setNodeRef} style={style} data-card-id={item.id} className={`timeline-card ${status} ${isDragging?'is-dragging':''}`} {...attributes} {...listeners}><CardInner item={item} checked={checked} status={status} index={index} move={move} correctPosition={correctIndex+1} language={language}/></article>
}

function App(){
  const [language,setLanguage]=useState(getInitialLanguage)
  const [path,setPath]=useState(currentPath)
  const [user,setUser]=useState(null),[profile,setProfile]=useState(null),[authReady,setAuthReady]=useState(false),[profileBusy,setProfileBusy]=useState(false)
  const [daily,setDaily]=useState({plays:0}),[error,setError]=useState('')
  const [status,setStatus]=useState('home'),[game,setGame]=useState(null),[round,setRound]=useState(0),[roundData,setRoundData]=useState(null)
  const [ordered,setOrdered]=useState([]),[checked,setChecked]=useState(false),[correctOrder,setCorrectOrder]=useState([]),[roundHits,setRoundHits]=useState(0),[lastAward,setLastAward]=useState(0)
  const [score,setScore]=useState(0),[displayScore,setDisplayScore]=useState(0),displayScoreRef=useRef(0),[scoreGain,setScoreGain]=useState(null),[streak,setStreak]=useState(0)
  const [activeId,setActiveId]=useState(null),[activeSize,setActiveSize]=useState(null),[roundLoading,setRoundLoading]=useState(false),[loadProgress,setLoadProgress]=useState(0),[dustBurst,setDustBurst]=useState(null)
  const autoStartRef=useRef(false)
  const t=copy[language]
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}),useSensor(TouchSensor,{activationConstraint:{delay:90,tolerance:8}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}))
  const activeItem=activeId?ordered.find((item)=>item.id===activeId):null
  const remaining=Math.max(0,DAILY_LIMIT-(daily.plays||0))
  const progress=((round+(checked?1:0))/TOTAL_ROUNDS)*100

  const navigate=(next)=>{window.history.pushState({},'',next);setPath(next);window.scrollTo({top:0,behavior:'smooth'});track('page_view',{page_path:next})}
  useEffect(()=>{const fn=()=>setPath(currentPath());window.addEventListener('popstate',fn);return()=>window.removeEventListener('popstate',fn)},[])
  useEffect(()=>{document.documentElement.lang=language},[language])
  const changeLanguage=(next)=>{if(!languages[next])return;setLanguage(next);saveLanguage(next)}

  useEffect(()=>observeAuth(async(nextUser)=>{
    setTrackingEnabled(Boolean(nextUser))
    setUser(nextUser);setError('')
    if(nextUser){
      try{const p=await getProfile(nextUser.uid);setProfile(p);if(p){setDaily(await getDailyState(nextUser.uid));const saved=readSession();if(saved?.uid===nextUser.uid&&!saved.finished){setGame({id:saved.gameId,roundIds:saved.roundIds});setRound(saved.round||0);setScore(saved.score||0);displayScoreRef.current=saved.score||0;setDisplayScore(saved.score||0);setStreak(saved.streak||0);setStatus('playing')}}}catch{setError(t.genericError)}
    }else{setProfile(null);setDaily({plays:0});setStatus('home');clearSession()}
    setAuthReady(true)
  }),[])

  useEffect(()=>{
    if(status!=='playing'||!game?.roundIds?.[round])return
    let alive=true;const controller=new AbortController();setRoundLoading(true);setLoadProgress(0);setChecked(false);setCorrectOrder([]);setRoundHits(0);setLastAward(0)
    getRound(game.roundIds[round]).then(async data=>{
      if(!alive)return;setRoundData(data);const shuffled=shuffle(data.cards);setOrdered(shuffled)
      let completed=0;await Promise.allSettled(data.cards.map(async card=>{try{await preloadCommonsImage(card,controller.signal)}finally{completed+=1;if(alive)setLoadProgress(completed)}}))
      if(alive)setTimeout(()=>alive&&setRoundLoading(false),250)
    }).catch(()=>alive&&setError(t.genericError))
    return()=>{alive=false;controller.abort()}
  },[status,game?.id,round])

  useEffect(()=>{if(status!=='playing'||!game||!user)return;saveSession({uid:user.uid,gameId:game.id,roundIds:game.roundIds,round,score,streak,finished:false})},[status,game,round,score,streak,user])
  useEffect(()=>{const from=displayScoreRef.current,to=score;if(from===to){setDisplayScore(to);return}const duration=520,start=performance.now();let frame=0;const tick=(now)=>{const p=Math.min(1,(now-start)/duration),e=1-Math.pow(1-p,3),v=Math.round(from+(to-from)*e);displayScoreRef.current=v;setDisplayScore(v);if(p<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[score])

  const handleLogin=async()=>{try{setError('');await signInWithGoogle();track('login',{method:'google'})}catch{setError(t.genericError)}}
  const handleNickname=async(nickname)=>{if(!user)return;try{setProfileBusy(true);const p=await createProfile(user,nickname);setProfile(p);setDaily(await getDailyState(user.uid));track('sign_up',{method:'google'})}catch{setError(t.genericError)}finally{setProfileBusy(false)}}
  const handleLogout=async()=>{await signOutUser();navigate('/')}

  const beginGame=async()=>{
    if(user&&!profile)return
    try{setError('');let created;if(user){const fresh=await getDailyState(user.uid);if(fresh.plays>=DAILY_LIMIT){setDaily(fresh);return}created=await startGame(user.uid);setDaily({plays:fresh.plays+1});track('game_start',{daily_play:fresh.plays+1,mode:'account'})}else{created=startGuestGame();track('game_start',{mode:'guest'})}setGame(created);setRound(0);setScore(0);displayScoreRef.current=0;setDisplayScore(0);setStreak(0);setStatus('playing')}catch(e){if(e?.message==='daily-limit')setDaily({plays:DAILY_LIMIT});else setError(t.genericError)}
  }

  useEffect(()=>{
    if(!authReady||path!=='/'||status!=='home'||(user&&!profile)){
      if(path!=='/'||status!=='home')autoStartRef.current=false
      return
    }
    if(autoStartRef.current)return
    autoStartRef.current=true
    beginGame()
  },[authReady,path,status,user,profile])

  const move=(from,to)=>{if(checked||to<0||to>=ordered.length)return;setOrdered(items=>arrayMove(items,from,to))}
  const triggerDustForCard=(cardId,fallbackRect)=>{setTimeout(()=>requestAnimationFrame(()=>{const node=[...document.querySelectorAll('[data-card-id]')].find(el=>el.dataset.cardId===String(cardId));const rect=node?.getBoundingClientRect?.()||fallbackRect;if(!rect)return;const id=Date.now();setDustBurst({id,x:rect.left+rect.width/2,y:rect.bottom-3,width:rect.width});setTimeout(()=>setDustBurst(current=>current?.id===id?null:current),980)}),285)}
  const handleDragEnd=({active,over})=>{setActiveId(null);setActiveSize(null);if(checked||!over)return;const fallbackRect=over.rect;if(active.id!==over.id)setOrdered(items=>arrayMove(items,items.findIndex(i=>i.id===active.id),items.findIndex(i=>i.id===over.id)));triggerDustForCard(active.id,fallbackRect)}

  const submit=async()=>{
    if(checked||!game)return
    try{
      const payload={roundId:game.roundIds[round],orderedIds:ordered.map(i=>i.id),streakBefore:streak}
      const result=user?await submitRound({...payload,uid:user.uid,gameId:game.id,roundIndex:round}):await submitGuestRound(payload)
      setOrdered(items=>items.map(item=>({...item,year:result.years[item.id]})))
      setCorrectOrder(result.correctOrder);setRoundHits(result.hits);setLastAward(result.score);setChecked(true);setStreak(result.streakAfter)
      if(result.score>0){setScore(v=>v+result.score);const id=Date.now();setScoreGain({id,value:result.score});setTimeout(()=>setScoreGain(c=>c?.id===id?null:c),1050)}
      track('round_submit',{round:round+1,hits:result.hits,score:result.score})
    }catch{setError(t.genericError)}
  }

  const nextRound=async()=>{
    if(round<TOTAL_ROUNDS-1){setRound(v=>v+1);return}
    if(!user){setStatus('finished');clearSession();track('game_complete',{score,mode:'guest'});return}
    try{const finalScore=await finishGame({uid:user.uid,gameId:game.id,score});setScore(finalScore);setStatus('finished');clearSession();setDaily(await getDailyState(user.uid));track('game_complete',{score:finalScore,mode:'account'})}catch{setError(t.genericError)}
  }
  const backHome=()=>{clearSession();setStatus('home');setGame(null);setRoundData(null);navigate('/')}

  const header=<header className="topbar"><button className="brand brand-button" onClick={()=>{setStatus('home');navigate('/')}}><span className="brand-dot">W</span><span>{t.gameName}</span></button><nav className="main-nav"><button className={path==='/'?'active':''} onClick={()=>navigate('/')}>{t.home}</button><button className={path==='/leaderboard'?'active':''} onClick={()=>navigate('/leaderboard')}>{t.leaderboard}</button></nav><div className="topbar-tools"><LanguageSwitch language={language} onChange={changeLanguage}/><AuthControls user={user} profile={profile} onLogin={handleLogin} onLogout={handleLogout} t={t}/></div></header>

  if(!authReady)return <main className="app-shell center-shell"><RoundLoader progress={2} language={language}/></main>
  if(path==='/leaderboard'||path==='/privacy'||path==='/terms')return <main className="app-shell">{header}{path==='/leaderboard'?<LeaderboardPage t={t} currentUid={user?.uid}/>:<LegalPage type={path==='/privacy'?'privacy':'terms'} language={language}/>}<SiteFooter language={language} navigate={navigate}/><NicknameModal open={Boolean(user&&!profile)} t={t} onSubmit={handleNickname} busy={profileBusy}/></main>

  if(status==='finished')return <main className="app-shell center-shell">{header}<section className="finish-card"><div className="finish-icon"><Trophy size={40}/></div><p className="eyebrow">{t.endGame}</p><h1>{score>=620?t.finishGreat:t.finishTry}</h1><p>{t.finishScore(TOTAL_ROUNDS,score)}</p><div className="finish-actions">{user&&(remaining>0?<button className="primary big" onClick={beginGame}><Play size={18}/>{t.playAgain(remaining)}</button>:<div className="limit-message"><Clock3 size={19}/><span>{t.completedToday}</span></div>)}<button className="secondary" onClick={backHome}>{t.backHome}</button></div></section><SiteFooter language={language} navigate={navigate}/></main>

  if(status==='home')return <main className="app-shell center-shell">{header}{error&&<div className="inline-error">{error}</div>}{user&&profile&&remaining===0?<section className="start-card"><div className="limit-message"><LockKeyhole size={19}/><span>{t.dailyLimit}</span></div></section>:<RoundLoader progress={0} language={language}/>}<SiteFooter language={language} navigate={navigate}/><NicknameModal open={Boolean(user&&!profile)} t={t} onSubmit={handleNickname} busy={profileBusy}/></main>

  return <main className="app-shell">{header}<section className="game-head"><div><p className="eyebrow">{t.round(round+1,TOTAL_ROUNDS)}</p><h1>{t.gameTitle}</h1><p className="subtitle">{t.gameSubtitle}</p></div><div className="game-head-right"><div className="streak-card"><span>{t.streak}</span><strong>{streak}x</strong></div><div className={`score-pill ${scoreGain?'is-gaining':''}`}><Sparkles size={16}/><span className="score-value">{displayScore}</span><span>{t.pointsShort}</span>{scoreGain&&<span key={scoreGain.id} className="score-float">+{scoreGain.value}</span>}</div></div></section><div className="progress-track"><div className="progress-value" style={{width:`${progress}%`}}/></div>{error&&<div className="inline-error">{error}</div>}{roundLoading||!roundData?<RoundLoader progress={loadProgress} language={language}/>:<><DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({active})=>{if(checked)return;setActiveId(active.id);const rect=active.rect.current.initial;if(rect)setActiveSize({width:rect.width})}} onDragCancel={()=>{setActiveId(null);setActiveSize(null)}} onDragEnd={handleDragEnd}><section className={`timeline-zone ${activeId?'is-sorting':''}`} aria-label={t.cardsAria}><div className="direction-label oldest">{t.oldest}</div><SortableContext items={ordered.map(i=>i.id)} strategy={rectSortingStrategy}><div className="cards-grid">{ordered.map((item,index)=><SortableCard key={item.id} item={item} index={index} checked={checked} correctOrder={correctOrder} move={move} language={language}/>)}</div></SortableContext><div className="direction-label newest">{t.newest}</div></section><DragOverlay adjustScale={false} dropAnimation={{duration:390,easing:'cubic-bezier(0.18, 0.92, 0.28, 1)',sideEffects:defaultDropAnimationSideEffects({styles:{active:{opacity:'0.15'}}})}}>{activeItem?<article className="timeline-card drag-overlay-card" style={{width:activeSize?.width||undefined}}><CardInner item={activeItem} checked={false} overlay language={language}/></article>:null}</DragOverlay></DndContext>{checked&&<section className={`feedback ${roundHits===ROUND_SIZE?'feedback-ok':roundHits>0?'feedback-partial':'feedback-bad'}`}><div className="feedback-icon">{roundHits===ROUND_SIZE?<Check size={22}/>:roundHits>0?roundHits:'!'}</div><div><strong>{roundHits===ROUND_SIZE?t.perfect:roundHits>0?t.partial(roundHits,ROUND_SIZE):t.none}</strong><span>{lastAward>0?t.award(lastAward):t.noAward}</span></div></section>}<section className="actions"><p>{checked?t.compareHint:t.dragHint}</p>{!checked?<button className="primary" onClick={submit}>{t.submit}<Check size={18}/></button>:<button className="primary" onClick={nextRound}>{round===TOTAL_ROUNDS-1?t.seeResult:t.nextRound}<ArrowRight size={18}/></button>}</section></>}<SiteFooter language={language} navigate={navigate}/><DustBurst burst={dustBurst}/><NicknameModal open={Boolean(user&&!profile)} t={t} onSubmit={handleNickname} busy={profileBusy}/></main>
}

export default App

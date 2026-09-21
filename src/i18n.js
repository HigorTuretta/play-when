export const LANGUAGE_KEY = 'when-language-v1'

export const languages = {
  'pt-BR': { short: 'PT', label: 'Português' },
  en: { short: 'EN', label: 'English' },
}

export const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    if (saved && languages[saved]) return saved
  } catch {}
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en'
}

export const saveLanguage = (language) => {
  try { localStorage.setItem(LANGUAGE_KEY, language) } catch {}
}

export const categoryLabels = {
  'pt-BR': { História:'História', Tecnologia:'Tecnologia', Ciência:'Ciência', Espaço:'Espaço', Invenções:'Invenções', Exploração:'Exploração', Cultura:'Cultura', Games:'Games', Internet:'Internet', 'Cinema & TV':'Cinema & TV', Música:'Música', Esportes:'Esportes', Transportes:'Transportes', Brasil:'Brasil' },
  en: { História:'History', Tecnologia:'Technology', Ciência:'Science', Espaço:'Space', Invenções:'Inventions', Exploração:'Exploration', Cultura:'Culture', Games:'Games', Internet:'Internet', 'Cinema & TV':'Film & TV', Música:'Music', Esportes:'Sports', Transportes:'Transport', Brasil:'Brazil' },
}

export const copy = {
  'pt-BR': {
    gameName:'When?', dailyGame:'Jogo diário de cronologia', startTitle:'Coloque a história na ordem certa.',
    startCopy:'Seis rodadas, quatro cartas por rodada. Arraste cada acontecimento do mais antigo para o mais recente — o ano só aparece depois que você confirma.',
    pill1:'500 fatos históricos', pill2:'6 rodadas por partida', pill3:'Sem login para jogar',
    todayPlays:'Partidas de hoje', remainingAttempts:(n)=>`${n} restante${n===1?'':'s'}`,
    startGame:'Começar partida',
    dailyLimit:'As 3 partidas de hoje já foram usadas. O limite reinicia amanhã — sua sequência continua se você voltar em até 2 dias.',
    bankNote:'500 fatos históricos, milhares de combinações e nenhuma resposta entregue antes da sua jogada.',
    round:(c,t)=>`Rodada ${c} de ${t}`, gameTitle:'Sua noção de tempo está certa?', gameSubtitle:'Ordene do mais antigo para o mais recente.',
    streak:'sequência', today:'hoje', pointsShort:'pts', oldest:'mais antigo', newest:'mais recente', cardsAria:'Cartas para ordenar',
    moveLeft:'Mover para a esquerda', moveRight:'Mover para a direita', correctPosition:(p)=>`${p}º na ordem`, submit:'Confirmar ordem', nextRound:'Próxima rodada', seeResult:'Ver resultado',
    dragHint:'Pegue uma carta e arraste. As outras abrem espaço automaticamente.', compareHint:'Sua ordem ficou preservada para você comparar com a linha do tempo real.',
    perfect:'Perfeito!', partial:(h,t)=>`Boa! ${h} de ${t} no lugar certo.`, none:'Ainda não.',
    award:(p)=>`+${p} pontos. Sua ordem ficou preservada para você comparar com a linha do tempo real.`, noAward:'Confira o ano e a posição correta em cada carta.',
    diffTitle:'Comparação da rodada', yourOrder:'Sua ordem', rightOrder:'Ordem correta',
    endGame:'Fim de jogo', finishGreat:'Sua linha do tempo está afiada.', finishTry:'A história ainda consegue te surpreender.', finishScore:(r,p)=>`Você terminou ${r} rodadas com ${p} pontos.`,
    statScore:'Pontuação', statHits:'Cartas certas', statPerfect:'Rodadas perfeitas', statStreak:'Sequência diária',
    shareTitle:'Seu resultado', shareCopy:'Cada linha é uma rodada, cada quadrado é uma carta. Copie e mande para quem acha que sabe história.',
    copyShare:'Copiar resultado', copied:'Copiado!', summaryTitle:'As 24 cartas da partida', roundLabel:(n)=>`Rodada ${n}`,
    playAgain:(n)=>`Jogar novamente · ${n} restante${n===1?'':'s'}`, completedToday:'Você já completou suas 3 partidas de hoje.', backHome:'Voltar ao início',
    loadingAria:'Preparando a rodada', loaderPhrases:['Abrindo o arquivo do tempo…','Buscando imagens na história…','Embaralhando séculos…','Quase pronto para viajar no tempo…'], imagesReady:(r,t)=>`${r}/${t} imagens prontas`,
    language:'Idioma', developedBy:'Feito por', github:'GitHub', bc:'a.C.', signIn:'Entrar com Google', signOut:'Sair', account:'Conta',
    streakUnit:'dias', streakHint:'Sequência diária: você perde se ficar 2 dias sem jogar.',
    loginRequired:'Entre com o Google para salvar sua pontuação e aparecer no ranking.', guestReady:'Jogue sem login. Seus pontos só serão registrados se você entrar com o Google.', loginToSave:'Faça login para salvar seus pontos!',
    profileTitle:'Escolha seu nome no ranking', profileCopy:'Seu nome real e sua foto do Google não serão exibidos. Cadastre apenas um apelido.', nickname:'Nickname', nicknamePlaceholder:'Ex.: Turetta', saveNickname:'Salvar e continuar', nicknameHint:'2 a 24 caracteres.',
    skip:'Pular', next:'Próximo', gotIt:'Entendi, bora jogar',
    onboard:[
      { icon:'1', title:'Quatro cartas, uma linha do tempo', copy:'Cada rodada traz quatro acontecimentos embaralhados. A missão é simples de entender e difícil de acertar: ordenar do mais antigo para o mais recente.' },
      { icon:'2', title:'Arraste — ou use as setas', copy:'Pegue uma carta e solte onde ela deve ficar; as outras abrem espaço sozinhas. No celular, os botões ◀ ▶ fazem o mesmo trabalho.' },
      { icon:'3', title:'Confirme e compare', copy:'Depois de confirmar, os anos aparecem sem reorganizar nada, para você comparar sua ordem com a real. Cartas certas, rodadas perfeitas e sequências valem pontos.' },
    ],
    leaderboard:'Ranking', leaderboardTitle:'Os 10 melhores viajantes do tempo', leaderboardCopy:'Ranking geral por pontuação acumulada.', noLeaderboard:'Ainda não há jogadores no ranking.', games:'partidas', points:'pts', you:'você',
    privacy:'Política de Privacidade', terms:'Termos de Uso', home:'Jogo', loadingAccount:'Carregando sua conta…', genericError:'Algo deu errado. Tente novamente.',
    lastUpdated:'Última atualização: 21/09/2026.',
    sparkNote:'O jogo foi desenhado para operar dentro da camada gratuita do Firebase.',
  },
  en: {
    gameName:'When?', dailyGame:'Daily chronology game', startTitle:'Put history in the right order.',
    startCopy:'Six rounds, four cards each. Drag every event from oldest to newest — the year only shows up after you confirm.',
    pill1:'500 historical facts', pill2:'6 rounds per game', pill3:'No sign-in needed',
    todayPlays:"Games today", remainingAttempts:(n)=>`${n} left`,
    startGame:'Start game',
    dailyLimit:'You have used all 3 games for today. The limit resets tomorrow — your streak survives if you come back within 2 days.',
    bankNote:'500 historical facts, thousands of combinations, and no answer sent before your move.',
    round:(c,t)=>`Round ${c} of ${t}`, gameTitle:'Is your sense of time right?', gameSubtitle:'Order the cards from oldest to newest.',
    streak:'streak', today:'today', pointsShort:'pts', oldest:'oldest', newest:'newest', cardsAria:'Cards to sort',
    moveLeft:'Move left', moveRight:'Move right', correctPosition:(p)=>`#${p} in order`, submit:'Confirm order', nextRound:'Next round', seeResult:'See result',
    dragHint:'Pick up a card and drag it. The others make room automatically.', compareHint:'Your order stays in place so you can compare it with the real timeline.',
    perfect:'Perfect!', partial:(h,t)=>`Nice! ${h} of ${t} in the right place.`, none:'Not quite.',
    award:(p)=>`+${p} points. Your order stays in place so you can compare it with the real timeline.`, noAward:'Check the year and correct position on each card.',
    diffTitle:'Round comparison', yourOrder:'Your order', rightOrder:'Correct order',
    endGame:'Game over', finishGreat:'Your timeline instincts are sharp.', finishTry:'History still has a few surprises for you.', finishScore:(r,p)=>`You finished ${r} rounds with ${p} points.`,
    statScore:'Score', statHits:'Cards right', statPerfect:'Perfect rounds', statStreak:'Daily streak',
    shareTitle:'Your result', shareCopy:'Each row is a round, each square is a card. Copy it and send it to someone who thinks they know history.',
    copyShare:'Copy result', copied:'Copied!', summaryTitle:'All 24 cards of this game', roundLabel:(n)=>`Round ${n}`,
    playAgain:(n)=>`Play again · ${n} left`, completedToday:"You've completed all 3 games for today.", backHome:'Back to start',
    loadingAria:'Preparing the round', loaderPhrases:['Opening the time archive…','Searching history for images…','Shuffling centuries…','Almost ready to travel through time…'], imagesReady:(r,t)=>`${r}/${t} images ready`,
    language:'Language', developedBy:'Made by', github:'GitHub', bc:'BC', signIn:'Continue with Google', signOut:'Sign out', account:'Account',
    streakUnit:'days', streakHint:'Daily streak: you lose it after two days without playing.',
    loginRequired:'Sign in with Google to save your score and join the leaderboard.', guestReady:'Play without signing in. Your points are only recorded when you use Google.', loginToSave:'Sign in to save your points!',
    profileTitle:'Choose your leaderboard name', profileCopy:'Your Google name and photo are never shown. Pick only a nickname.', nickname:'Nickname', nicknamePlaceholder:'e.g. Turetta', saveNickname:'Save and continue', nicknameHint:'2 to 24 characters.',
    skip:'Skip', next:'Next', gotIt:'Got it, let’s play',
    onboard:[
      { icon:'1', title:'Four cards, one timeline', copy:'Every round deals four shuffled events. Easy to understand, hard to nail: sort them from oldest to newest.' },
      { icon:'2', title:'Drag — or use the arrows', copy:'Pick up a card and drop it where it belongs; the others make room. On mobile the ◀ ▶ buttons do the same job.' },
      { icon:'3', title:'Confirm and compare', copy:'After confirming, the years appear without reshuffling anything, so you can compare your order with the real one. Right cards, perfect rounds and streaks all score.' },
    ],
    leaderboard:'Leaderboard', leaderboardTitle:'Top 10 time travelers', leaderboardCopy:'Global ranking by accumulated score.', noLeaderboard:'No players on the board yet.', games:'games', points:'pts', you:'you',
    privacy:'Privacy Policy', terms:'Terms of Use', home:'Game', loadingAccount:'Loading your account…', genericError:'Something went wrong. Try again.',
    lastUpdated:'Last updated: 2026-09-21.',
    sparkNote:'The game is designed to stay within Firebase’s free tier.',
  },
}

export const textForEvent = (event, language) => ({
  title: language === 'en' ? (event.titleEn || event.titlePt || event.title) : (event.titlePt || event.title),
  category: categoryLabels[language]?.[event.category] || event.category,
  short: language === 'en' ? (event.shortEn || 'A notable milestone in its own timeline.') : (event.shortPt || 'Um marco importante em sua própria linha do tempo.'),
})

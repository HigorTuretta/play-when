export const LANGUAGE_KEY = 'tempo-certo-language-v1'

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
    gameName:'tempo certo', dailyGame:'Jogo diário de cronologia', startTitle:'Coloque a história na ordem certa.',
    startCopy:'Seis rodadas. Quatro cartas por rodada. Arraste cada fato do mais antigo para o mais recente.',
    todayPlays:'Partidas de hoje', remainingAttempts:(n)=>`${n} partida${n===1?'':'s'} restante${n===1?'':'s'}`,
    startGame:'Começar partida', dailyLimit:'As 3 partidas de hoje já foram usadas. O limite reinicia amanhã.',
    bankNote:'500 fatos históricos, milhares de combinações e nenhuma resposta entregue antes da sua jogada.',
    round:(c,t)=>`Rodada ${c} de ${t}`, gameTitle:'Sua noção de tempo está certa?', gameSubtitle:'Ordene do mais antigo para o mais recente.',
    streak:'sequência', today:'hoje', pointsShort:'pts', oldest:'mais antigo', newest:'mais recente', cardsAria:'Cartas para ordenar',
    moveLeft:'Mover para a esquerda', moveRight:'Mover para a direita', correctPosition:(p)=>`${p}º na ordem`, submit:'Confirmar ordem', nextRound:'Próxima rodada', seeResult:'Ver resultado',
    dragHint:'Pegue uma carta e arraste. As outras abrem espaço automaticamente.', compareHint:'Sua ordem ficou preservada para você comparar.',
    perfect:'Perfeito!', partial:(h,t)=>`Boa! ${h} de ${t} no lugar certo.`, none:'Ainda não.', award:(p)=>`+${p} pontos. Sua ordem foi preservada para você comparar.`, noAward:'Confira o ano e a posição correta em cada carta.',
    endGame:'Fim de jogo', finishGreat:'Sua linha do tempo está afiada.', finishTry:'A história ainda consegue te surpreender.', finishScore:(r,p)=>`Você terminou ${r} rodadas com ${p} pontos.`,
    playAgain:(n)=>`Jogar novamente · ${n} restante${n===1?'':'s'}`, completedToday:'Você já completou suas 3 partidas de hoje.', backHome:'Voltar ao início',
    loadingAria:'Preparando a rodada', loaderPhrases:['Abrindo o arquivo do tempo…','Buscando imagens na história…','Embaralhando séculos…','Quase pronto para viajar no tempo…'], imagesReady:(r,t)=>`${r}/${t} imagens prontas`,
    language:'Idioma', developedBy:'Developed by', github:'GitHub', bc:'a.C.', signIn:'Entrar com Google', signOut:'Sair', account:'Conta',
    loginRequired:'Entre com o Google para jogar, salvar sua pontuação e aparecer no ranking.', profileTitle:'Escolha seu nome no ranking', profileCopy:'Seu nome real e sua foto do Google não serão exibidos. Cadastre apenas um apelido.', nickname:'Nickname', nicknamePlaceholder:'Ex.: Turetta', saveNickname:'Salvar e continuar', nicknameHint:'2 a 24 caracteres.',
    leaderboard:'Leaderboard', leaderboardTitle:'Os 10 melhores viajantes do tempo', leaderboardCopy:'Ranking geral por pontuação acumulada.', noLeaderboard:'Ainda não há jogadores no ranking.', games:'partidas', points:'pontos', you:'você',
    privacy:'Política de Privacidade', terms:'Termos de Uso', home:'Jogo', loadingAccount:'Carregando sua conta…', genericError:'Algo deu errado. Tente novamente.',
    sparkNote:'O jogo foi desenhado para operar dentro da camada gratuita do Firebase.',
  },
  en: {
    gameName:'tempo certo', dailyGame:'Daily chronology game', startTitle:'Put history in the right order.',
    startCopy:'Six rounds. Four cards per round. Drag each event from oldest to newest.',
    todayPlays:"Today's games", remainingAttempts:(n)=>`${n} game${n===1?'':'s'} remaining`,
    startGame:'Start game', dailyLimit:"You've used all 3 games for today. The limit resets tomorrow.",
    bankNote:'500 historical facts, thousands of combinations, and no answer sent before your move.',
    round:(c,t)=>`Round ${c} of ${t}`, gameTitle:'Is your sense of time right?', gameSubtitle:'Order the cards from oldest to newest.',
    streak:'streak', today:'today', pointsShort:'pts', oldest:'oldest', newest:'newest', cardsAria:'Cards to sort', moveLeft:'Move left', moveRight:'Move right', correctPosition:(p)=>`#${p} in order`, submit:'Confirm order', nextRound:'Next round', seeResult:'See result',
    dragHint:'Pick up a card and drag it. The others make room automatically.', compareHint:'Your order stays in place so you can compare it.', perfect:'Perfect!', partial:(h,t)=>`Nice! ${h} of ${t} are in the right place.`, none:'Not quite.', award:(p)=>`+${p} points. Your order stays in place so you can compare it.`, noAward:'Check the year and correct position on each card.',
    endGame:'Game over', finishGreat:'Your timeline instincts are sharp.', finishTry:'History still has a few surprises for you.', finishScore:(r,p)=>`You finished ${r} rounds with ${p} points.`, playAgain:(n)=>`Play again · ${n} remaining`, completedToday:"You've completed all 3 games for today.", backHome:'Back to start',
    loadingAria:'Preparing the round', loaderPhrases:['Opening the time archive…','Searching history for images…','Shuffling centuries…','Almost ready to travel through time…'], imagesReady:(r,t)=>`${r}/${t} images ready`,
    language:'Language', developedBy:'Developed by', github:'GitHub', bc:'BC', signIn:'Continue with Google', signOut:'Sign out', account:'Account',
    loginRequired:'Sign in with Google to play, save your score, and join the leaderboard.', profileTitle:'Choose your leaderboard name', profileCopy:'Your Google name and photo are never shown. Pick only a nickname.', nickname:'Nickname', nicknamePlaceholder:'e.g. Turetta', saveNickname:'Save and continue', nicknameHint:'2 to 24 characters.',
    leaderboard:'Leaderboard', leaderboardTitle:'Top 10 time travelers', leaderboardCopy:'Global ranking by accumulated score.', noLeaderboard:'No players on the board yet.', games:'games', points:'points', you:'you',
    privacy:'Privacy Policy', terms:'Terms of Use', home:'Game', loadingAccount:'Loading your account…', genericError:'Something went wrong. Try again.', sparkNote:'The game is designed to stay within Firebase’s free tier.',
  },
}

export const textForEvent = (event, language) => ({
  title: language === 'en' ? (event.titleEn || event.titlePt || event.title) : (event.titlePt || event.title),
  category: categoryLabels[language]?.[event.category] || event.category,
  short: language === 'en' ? (event.shortEn || 'A notable milestone in its own timeline.') : (event.shortPt || 'Um marco importante em sua própria linha do tempo.'),
})

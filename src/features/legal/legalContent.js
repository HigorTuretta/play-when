// The first entry of each list is the page title; the rest are paragraphs.
export const legalContent = {
  privacy: {
    'pt-BR': [
      'Política de Privacidade',
      'O When? usa autenticação do Google apenas para identificar sua conta. O jogo não exibe sua foto nem seu nome do Google no ranking. O único nome público é o nickname escolhido por você, com a bandeira do país.',
      'Sem login, você joga no modo Normal e não criamos registros de partidas, pontuações, Analytics ou dados pessoais. O próprio navegador guarda, apenas no seu aparelho, a partida em andamento e a lista dos acontecimentos vistos recentemente, para evitar que eles se repitam.',
      'Depois do login, armazenamos no Firebase o identificador da conta, nickname, país inferido pelo idioma/região do navegador, a lista compacta de acontecimentos vistos recentemente (usada para evitar repetições) e, nas partidas ranqueadas, as respostas de cada rodada com seus horários, as partidas, as pontuações, a sequência diária e os dados do ranking. Não vendemos dados pessoais.',
      'Para jogadores autenticados, usamos Google Analytics para entender o uso agregado, como páginas acessadas, partidas iniciadas e concluídas e resultados compartilhados. Nenhum desses eventos inclui nome, e-mail ou identificador da conta. Imagens das cartas podem ser carregadas do Wikimedia Commons.',
      'Você pode deixar de usar o serviço a qualquer momento. Para solicitar remoção dos dados vinculados à conta, utilize o canal de contato publicado no repositório oficial do projeto.',
    ],
    en: [
      'Privacy Policy',
      'When? uses Google authentication only to identify your account. Your Google photo and Google display name are not shown on the leaderboard. The only public name is the nickname you choose, with your country flag.',
      'Without signing in you play normal mode, and we create no game, score, Analytics or personal-data records. Your own browser keeps, on your device only, the game in progress and the list of events you have seen recently, so they do not repeat.',
      'After sign-in, Firebase stores your account identifier, nickname, browser-inferred country, the compact list of recently seen events (used to avoid repeats) and, for ranked games, the answer to each round with its timing, your games, scores, daily streak and leaderboard data. We do not sell personal data.',
      'For authenticated players, Google Analytics is used to understand aggregate usage such as page views, games started and completed and results shared. None of these events include your name, e-mail or account identifier. Card images may be loaded from Wikimedia Commons.',
      'You can stop using the service at any time. To request deletion of account-linked data, use the contact channel published in the official project repository.',
    ],
  },
  terms: {
    'pt-BR': [
      'Termos de Uso',
      'When? é um jogo de conhecimento e entretenimento. As datas são apresentadas no nível de precisão indicado no banco do jogo e alguns eventos históricos podem utilizar datas tradicionais ou aproximadas.',
      'O modo Normal é livre e não altera o ranking. O modo Ranqueado exige login com Google, tem 40 segundos por rodada e cada conta pode iniciar até três partidas ranqueadas por dia; apenas elas contam para o ranking. Respostas enviadas depois do tempo da rodada não pontuam.',
      'Tentativas, pontuações, sequência diária e ranking são controlados no Firebase. Qualquer tentativa de manipular o cliente, automatizar respostas, contornar limites ou adulterar pontuações pode resultar na exclusão desses registros.',
      'A sequência diária conta partidas ranqueadas concluídas e é mantida enquanto você jogar pelo menos uma a cada dois dias; após dois dias sem partidas, ela volta a zero.',
      'O conteúdo visual de terceiros, quando utilizado, mantém sua atribuição e licença indicadas pela fonte. O jogo pode ser alterado, suspenso ou atualizado sem aviso prévio.',
    ],
    en: [
      'Terms of Use',
      'When? is a knowledge and entertainment game. Dates use the precision recorded in the game database, and some historical events may rely on traditional or approximate dating.',
      'Normal mode is open to everyone and does not change the leaderboard. Ranked mode requires Google sign-in, gives 40 seconds per round, and each account may start up to three ranked games per day; only those count for the leaderboard. Answers sent after the round time score nothing.',
      'Attempts, scores, daily streak and leaderboard data are controlled through Firebase. Attempts to tamper with the client, automate answers, bypass limits or manipulate scores may result in those records being removed.',
      'The daily streak counts completed ranked games and is kept while you play at least one every two days; after two days without games it resets to zero.',
      'Third-party visual content keeps the attribution and license indicated by its source. The game may be changed, suspended, or updated without prior notice.',
    ],
  },
}

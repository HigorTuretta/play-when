// Text below the game on the home page. It explains the game to people and search engines
// alike, so it stays short, factual and out of the way of the "play" buttons above it.
export const homeGuide = {
  'pt-BR': {
    intro: {
      title: 'Você sabe quando aconteceu?',
      paragraphs: [
        'When? é um jogo gratuito de cronologia no qual você precisa colocar acontecimentos históricos na ordem correta. Cada partida tem seis rodadas com quatro cartas, e cada carta traz um fato: uma invenção, uma guerra, uma descoberta científica, um marco da cultura, do esporte ou da internet.',
        'É um quiz de história diferente: em vez de lembrar uma data exata, você compara acontecimentos entre si. A penicilina veio antes ou depois da televisão? A Torre Eiffel é mais antiga que o primeiro voo dos irmãos Wright? Você só descobre as datas depois de confirmar a sua linha do tempo.',
      ],
    },
    howTo: {
      title: 'Como jogar',
      steps: [
        'Receba quatro acontecimentos históricos embaralhados.',
        'Organize as cartas do mais antigo para o mais recente, arrastando-as ou usando as setas.',
        'Confirme sua resposta.',
        'Descubra as datas corretas e compare com a sua ordem.',
        'Acumule pontos ao longo das seis rodadas.',
      ],
      more: 'Regras completas e pontuação',
    },
    modes: {
      title: 'Dois modos de jogo',
      normal: {
        title: 'Modo Normal',
        copy: 'Para jogar com calma, quantas vezes quiser, com ou sem login. Não tem cronômetro e não altera o ranking.',
      },
      ranked: {
        title: 'Modo Ranqueado',
        copy: 'Para quem quer competir: 40 segundos por rodada, login com Google e até três partidas por dia. A pontuação é validada e somada ao ranking.',
      },
    },
    scoring: {
      title: 'Pontuação e ranking',
      copy: 'Cada carta na posição certa vale 25 pontos. Uma rodada perfeita rende 50 pontos extras, e rodadas perfeitas seguidas aumentam o bônus. O ranking mostra quem acumulou mais pontos em partidas ranqueadas.',
      more: 'Ver o ranking',
    },
    topics: {
      title: 'O que cai no When?',
      items: [
        {
          title: 'História',
          copy: 'Revoluções, impérios, tratados e mudanças de governo que marcaram séculos.',
          page: ['history'],
        },
        {
          title: 'Ciência',
          copy: 'Descobertas que mudaram a medicina, a física e a forma como entendemos a vida.',
          page: ['topic', 'ciencia'],
        },
        {
          title: 'Tecnologia',
          copy: 'Da prensa de tipos móveis ao smartphone, passando pelo avião e pela web.',
          page: ['topic', 'tecnologia'],
        },
        {
          title: 'Cultura',
          copy: 'Monumentos, obras e fenômenos culturais que viraram referência de uma época.',
          page: ['topic', 'cultura'],
        },
        {
          title: 'Guerras',
          copy: 'Conflitos e revoluções que redesenharam fronteiras e governos.',
          page: ['topic', 'guerras'],
        },
        {
          title: 'Descobertas',
          copy: 'Viagens de exploração e descobertas que ampliaram mapas e conhecimento.',
          page: ['topic', 'descobertas'],
        },
        {
          title: 'Acontecimentos mundiais',
          copy: 'Esportes, música, cinema, games, internet e grandes eventos que o mundo inteiro acompanhou.',
          page: ['history'],
        },
      ],
    },
    faq: {
      title: 'Perguntas frequentes',
      items: [
        {
          q: 'O When? é gratuito?',
          a: 'Sim. O jogo roda no navegador, no celular ou no computador, sem instalar nada e sem pagar.',
        },
        {
          q: 'Preciso criar uma conta?',
          a: 'Não para o modo Normal. O login com Google só é necessário para o modo Ranqueado, que registra as partidas para validar a pontuação do ranking.',
        },
        {
          q: 'Os fatos se repetem?',
          a: 'O jogo lembra os acontecimentos que você viu recentemente e evita repeti-los até que boa parte do acervo tenha aparecido.',
        },
        {
          q: 'De onde vêm as imagens?',
          a: 'As imagens das cartas vêm da Wikipedia e do Wikimedia Commons, com crédito para a fonte. Elas são ilustrativas e nem sempre retratam o fato com precisão.',
        },
      ],
    },
  },
  en: {
    intro: {
      title: 'Do you know when it happened?',
      paragraphs: [
        'When? is a free chronology game where you put historical events in the right order. Each game has six rounds of four cards, and every card is an event: an invention, a war, a scientific discovery, a milestone in culture, sport or the internet.',
        "It is a different kind of history quiz: instead of recalling an exact date, you compare events with each other. Did penicillin come before or after television? Is the Eiffel Tower older than the Wright brothers' first flight? You only see the dates after you lock in your timeline.",
      ],
    },
    howTo: {
      title: 'How to play',
      steps: [
        'Get four shuffled historical events.',
        'Arrange the cards from oldest to newest by dragging them or using the arrows.',
        'Confirm your answer.',
        'See the real dates and compare them with your order.',
        'Build up points over six rounds.',
      ],
      more: 'Full rules and scoring',
    },
    modes: {
      title: 'Two ways to play',
      normal: {
        title: 'Normal mode',
        copy: 'Play at your own pace, as often as you like, signed in or not. No clock, and the leaderboard is not affected.',
      },
      ranked: {
        title: 'Ranked mode',
        copy: 'For competitive players: 40 seconds per round, Google sign-in and up to three games a day. Scores are verified and added to the leaderboard.',
      },
    },
    scoring: {
      title: 'Scoring and leaderboard',
      copy: 'Every card in the right place is worth 25 points. A perfect round earns 50 bonus points, and consecutive perfect rounds raise the bonus. The leaderboard shows who has scored the most in ranked games.',
      more: 'See the leaderboard',
    },
    topics: {
      title: "What's in When?",
      items: [
        {
          title: 'History',
          copy: 'Revolutions, empires, treaties and changes of government that shaped centuries.',
          page: ['history'],
        },
        {
          title: 'Science',
          copy: 'Discoveries that changed medicine, physics and how we understand life.',
          page: ['topic', 'science'],
        },
        {
          title: 'Technology',
          copy: 'From movable type to the smartphone, by way of the aeroplane and the web.',
          page: ['topic', 'technology'],
        },
        {
          title: 'Culture',
          copy: 'Monuments, works and cultural phenomena that came to define an era.',
          page: ['topic', 'culture'],
        },
        {
          title: 'Wars',
          copy: 'Conflicts and revolutions that redrew borders and governments.',
          page: ['topic', 'wars'],
        },
        {
          title: 'Discoveries',
          copy: 'Voyages of exploration and discoveries that widened maps and knowledge.',
          page: ['topic', 'discoveries'],
        },
        {
          title: 'World events',
          copy: 'Sport, music, film, games, the internet and big moments the whole world followed.',
          page: ['history'],
        },
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Is When? free?',
          a: 'Yes. It runs in your browser, on a phone or a computer, with nothing to install and nothing to pay.',
        },
        {
          q: 'Do I need an account?',
          a: 'Not for the normal mode. Google sign-in is only needed for ranked mode, which records games so leaderboard scores can be verified.',
        },
        {
          q: 'Do events repeat?',
          a: 'The game remembers the events you have seen recently and avoids repeating them until a good part of the collection has come up.',
        },
        {
          q: 'Where do the images come from?',
          a: 'Card images come from Wikipedia and Wikimedia Commons, credited to their source. They are illustrative and may not depict the event precisely.',
        },
      ],
    },
  },
}

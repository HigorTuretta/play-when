// Editorial topics used by the /historia/<tema> and /history/<topic> pages. A topic page
// is only published when at least one fact page belongs to it (see publishedTopics in
// src/content/facts/store.js), so no empty category ever reaches the sitemap.
export const TOPICS = [
  {
    id: 'science',
    slug: { 'pt-BR': 'ciencia', en: 'science' },
    'pt-BR': {
      name: 'Ciência',
      title: 'Descobertas científicas que mudaram a história',
      description:
        'Da penicilina à dupla hélice do DNA: conheça descobertas científicas marcantes e teste se sabe colocá-las na ordem certa no When?.',
      intro: [
        'A história da ciência é feita de observações cuidadosas, experimentos repetidos e, às vezes, de um acaso bem aproveitado. Muitas das descobertas que hoje parecem óbvias levaram décadas para serem aceitas.',
        'Colocar essas descobertas em ordem cronológica ajuda a entender como uma leva à outra: sem o microscópio não há microbiologia, e sem a microbiologia não há antibióticos.',
      ],
    },
    en: {
      name: 'Science',
      title: 'Scientific discoveries that changed history',
      description:
        'From penicillin to the DNA double helix: explore landmark scientific discoveries and see if you can put them in order in When?.',
      intro: [
        'The history of science is made of careful observation, repeated experiments and, now and then, a lucky accident put to good use. Many discoveries that seem obvious today took decades to be accepted.',
        'Putting them in chronological order shows how one leads to the next: without the microscope there is no microbiology, and without microbiology there are no antibiotics.',
      ],
    },
  },
  {
    id: 'technology',
    slug: { 'pt-BR': 'tecnologia', en: 'technology' },
    'pt-BR': {
      name: 'Tecnologia',
      title: 'Marcos da tecnologia: da prensa à internet',
      description:
        'Prensa de Gutenberg, primeiro voo motorizado, World Wide Web: marcos da tecnologia explicados e prontos para a sua linha do tempo no When?.',
      intro: [
        'Algumas invenções mudam tanto o cotidiano que fica difícil imaginar o mundo antes delas. A prensa de tipos móveis, o avião e a web encurtaram distâncias e mudaram a forma como a informação circula.',
        'No When?, os marcos tecnológicos costumam ser os mais traiçoeiros: a sensação de que algo é "moderno" nem sempre corresponde à data real.',
      ],
    },
    en: {
      name: 'Technology',
      title: 'Technology milestones: from the printing press to the web',
      description:
        "Gutenberg's press, the first powered flight, the World Wide Web: technology milestones explained and ready for your timeline in When?.",
      intro: [
        'Some inventions change daily life so deeply that it is hard to picture the world before them. Movable type, the aeroplane and the web shrank distances and changed how information travels.',
        'In When?, technology milestones are often the trickiest cards: the feeling that something is "modern" does not always match its real date.',
      ],
    },
  },
  {
    id: 'culture',
    slug: { 'pt-BR': 'cultura', en: 'culture' },
    'pt-BR': {
      name: 'Cultura',
      title: 'Marcos culturais na linha do tempo',
      description:
        'Monumentos, livros e ideias que marcaram a cultura mundial. Descubra quando aconteceram e desafie sua memória no When?.',
      intro: [
        'A cultura também tem datas: monumentos inaugurados, obras publicadas e novas formas de compartilhar ideias deixam marcas que ajudam a situar uma época.',
        'Esses acontecimentos são ótimos pontos de referência numa linha do tempo, porque costumam estar ligados a mudanças econômicas, tecnológicas e políticas do mesmo período.',
      ],
    },
    en: {
      name: 'Culture',
      title: 'Cultural milestones on the timeline',
      description:
        'Monuments, books and ideas that shaped world culture. Find out when they happened and challenge your memory in When?.',
      intro: [
        'Culture has dates too: monuments that open, works that are published and new ways of sharing ideas leave marks that help place an era.',
        'These events are great reference points on a timeline, because they are usually tied to the economic, technological and political changes of their time.',
      ],
    },
  },
  {
    id: 'wars',
    slug: { 'pt-BR': 'guerras', en: 'wars' },
    'pt-BR': {
      name: 'Guerras e revoluções',
      title: 'Guerras e revoluções que redesenharam o mundo',
      description:
        'Da Queda da Bastilha ao Dia D: guerras e revoluções que mudaram fronteiras e governos. Conheça o contexto e jogue no When?.',
      intro: [
        'Revoluções e guerras costumam marcar viradas bruscas: governos caem, fronteiras mudam e novas ideias políticas ganham força em poucos anos.',
        'Entender a ordem desses acontecimentos ajuda a ligar causas e consequências, como o caminho entre a Revolução Francesa e as grandes transformações políticas do século XIX.',
      ],
    },
    en: {
      name: 'Wars and revolutions',
      title: 'Wars and revolutions that redrew the world',
      description:
        'From the storming of the Bastille to D-Day: wars and revolutions that changed borders and governments. Learn the context and play When?.',
      intro: [
        'Revolutions and wars tend to mark sharp turning points: governments fall, borders move and new political ideas take hold within a few years.',
        'Knowing the order of these events helps connect causes and consequences, such as the path from the French Revolution to the political upheavals of the nineteenth century.',
      ],
    },
  },
  {
    id: 'discoveries',
    slug: { 'pt-BR': 'descobertas', en: 'discoveries' },
    'pt-BR': {
      name: 'Descobertas e explorações',
      title: 'Grandes descobertas e explorações',
      description:
        'Viagens que ampliaram o mapa e descobertas que ampliaram o conhecimento. Veja quando aconteceram e monte a linha do tempo no When?.',
      intro: [
        'Descobrir pode significar chegar a um lugar que não constava nos mapas de quem viajava ou perceber algo que sempre esteve ali, mas ninguém havia explicado.',
        'Essas viagens e descobertas raramente foram obra de uma pessoa só: dependeram de técnicas de navegação, instrumentos, financiamento e do trabalho de muita gente anônima.',
      ],
    },
    en: {
      name: 'Discoveries and exploration',
      title: 'Great discoveries and explorations',
      description:
        'Voyages that widened the map and discoveries that widened knowledge. See when they happened and build the timeline in When?.',
      intro: [
        "Discovery can mean reaching a place missing from the travellers' maps, or noticing something that was always there but that nobody had explained.",
        'These voyages and discoveries were rarely the work of one person: they relied on navigation techniques, instruments, funding and the work of many unnamed people.',
      ],
    },
  },
  {
    id: 'space',
    slug: { 'pt-BR': 'espaco', en: 'space' },
    'pt-BR': {
      name: 'Espaço',
      title: 'A exploração espacial na linha do tempo',
      description:
        'Do Sputnik 1 à Apollo 11: os primeiros passos da humanidade no espaço, com contexto e datas. Teste sua noção de tempo no When?.',
      intro: [
        'A corrida espacial transformou em poucos anos o que parecia ficção científica em rotina de engenharia: do primeiro satélite artificial ao primeiro pouso tripulado na Lua passaram-se menos de doze anos.',
        'Os marcos espaciais são próximos entre si no tempo, o que torna a ordem deles um desafio interessante no When?.',
      ],
    },
    en: {
      name: 'Space',
      title: 'Space exploration on the timeline',
      description:
        "From Sputnik 1 to Apollo 11: humanity's first steps into space, with context and dates. Test your sense of time in When?.",
      intro: [
        'The space race turned what looked like science fiction into engineering routine within a few years: less than twelve years separate the first artificial satellite from the first crewed Moon landing.',
        'Space milestones sit close together in time, which makes putting them in order an interesting challenge in When?.',
      ],
    },
  },
]

export const topicById = (id) => TOPICS.find((topic) => topic.id === id)
export const topicBySlug = (slug, language) => TOPICS.find((topic) => topic.slug[language] === slug)

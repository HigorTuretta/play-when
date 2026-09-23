export const howToPlayContent = {
  'pt-BR': {
    eyebrow: 'Como jogar',
    title: 'Como jogar When?',
    lede: 'When? é um jogo de ordenar eventos históricos. As regras cabem em uma frase: coloque quatro acontecimentos do mais antigo para o mais recente. Acertar é outra história.',
    sections: [
      {
        title: 'Objetivo',
        paragraphs: [
          'Em cada rodada aparecem quatro cartas embaralhadas, cada uma com um acontecimento. O objetivo é montar a linha do tempo correta. As datas ficam escondidas até você confirmar a ordem.',
        ],
      },
      {
        title: 'Passo a passo',
        steps: [
          'Leia as quatro cartas da rodada. As categorias (Ciência, Espaço, Games…) ajudam a situar cada uma.',
          'Arraste as cartas até a posição certa. No celular, você também pode usar os botões ◀ ▶ de cada carta.',
          'Quando a ordem fizer sentido, toque em "Confirmar ordem".',
          'Os anos aparecem sem reorganizar nada, para você ver exatamente onde acertou e onde errou.',
          'Siga para a próxima rodada. Depois da sexta, você vê o resumo da partida e pode compartilhar o resultado.',
        ],
      },
      {
        title: 'Pontuação',
        paragraphs: [
          'Cada carta na posição certa vale 25 pontos, mesmo que as outras estejam erradas. Acertar as quatro rende mais 50 pontos de bônus. Rodadas perfeitas seguidas valem ainda mais: cada perfeita anterior na sequência soma 20 pontos ao bônus. Errar uma carta zera a sequência.',
        ],
        table: {
          headers: ['Situação', 'Pontos'],
          rows: [
            ['Cada carta na posição certa', '+25'],
            ['Rodada perfeita (4 de 4)', '+50'],
            ['Rodadas perfeitas seguidas', '+20 por perfeita anterior'],
          ],
        },
      },
      {
        title: 'Modo Normal e modo Ranqueado',
        paragraphs: [
          'No modo Normal você joga sem cronômetro, quantas vezes quiser, com ou sem login. É o jeito de treinar e de jogar com calma, e ele não altera o ranking.',
          'No modo Ranqueado cada rodada tem 40 segundos. Quando o tempo acaba, as cartas travam e vale a ordem em que elas estavam. É preciso entrar com Google, cada conta pode jogar até três partidas ranqueadas por dia, e só elas entram no ranking.',
        ],
      },
      {
        title: 'Controles',
        list: [
          'Mouse ou toque: segure uma carta e solte onde ela deve ficar. As outras abrem espaço.',
          'Botões ◀ ▶: movem a carta uma posição para a esquerda ou para a direita.',
          'Teclado: selecione uma carta com Tab, pressione Espaço para pegá-la, use as setas para mover e Espaço de novo para soltar.',
        ],
      },
      {
        title: 'Dicas',
        list: [
          'Comece pelos acontecimentos que você conhece bem e use-os como âncoras.',
          'Pense primeiro em séculos e décadas; o ano exato raramente é necessário.',
          'Desconfie da sensação de que algo é "moderno": muita tecnologia é mais antiga do que parece.',
          'Use o modo Normal para treinar antes de disputar o ranking.',
        ],
      },
    ],
  },
  en: {
    eyebrow: 'How to play',
    title: 'How to play When?',
    lede: 'When? is a game about putting historical events in order. The rules fit in one sentence: arrange four events from oldest to newest. Getting it right is another story.',
    sections: [
      {
        title: 'The goal',
        paragraphs: [
          'Each round deals four shuffled cards, each with an event. Your goal is to build the correct timeline. The dates stay hidden until you confirm your order.',
        ],
      },
      {
        title: 'Step by step',
        steps: [
          "Read the round's four cards. Their categories (Science, Space, Games…) help you place each one.",
          'Drag the cards into position. On mobile you can also use the ◀ ▶ buttons on each card.',
          'When the order makes sense, tap "Confirm order".',
          'The years appear without anything being rearranged, so you can see exactly what you got right and wrong.',
          'Move on to the next round. After the sixth, you get a summary of the game and can share your result.',
        ],
      },
      {
        title: 'Scoring',
        paragraphs: [
          'Every card in the right position is worth 25 points, even if the others are wrong. Getting all four right adds a 50-point bonus. Consecutive perfect rounds are worth even more: each previous perfect round in the streak adds 20 points to the bonus. One wrong card resets the streak.',
        ],
        table: {
          headers: ['Situation', 'Points'],
          rows: [
            ['Each card in the right position', '+25'],
            ['Perfect round (4 of 4)', '+50'],
            ['Consecutive perfect rounds', '+20 per previous perfect'],
          ],
        },
      },
      {
        title: 'Normal and ranked modes',
        paragraphs: [
          'In normal mode there is no clock: play as often as you like, signed in or not. It is the way to practise and to play at your own pace, and it does not change the leaderboard.',
          'In ranked mode each round lasts 40 seconds. When time runs out, the cards lock and they count in the order they were in. You need to sign in with Google, each account can play up to three ranked games a day, and only ranked games count for the leaderboard.',
        ],
      },
      {
        title: 'Controls',
        list: [
          'Mouse or touch: hold a card and drop it where it belongs. The others make room.',
          '◀ ▶ buttons: move a card one place left or right.',
          'Keyboard: focus a card with Tab, press Space to pick it up, move it with the arrow keys and press Space again to drop it.',
        ],
      },
      {
        title: 'Tips',
        list: [
          'Start with the events you know well and use them as anchors.',
          'Think in centuries and decades first; you rarely need the exact year.',
          'Be wary of the feeling that something is "modern": a lot of technology is older than it seems.',
          'Use normal mode to practise before you compete on the leaderboard.',
        ],
      },
    ],
  },
}

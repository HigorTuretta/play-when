// Card art accent, used as the backdrop behind the illustration and to tint
// the category chip. Kept in one place so the round cards and the end-of-game
// summary thumbnails never drift apart.
export const accentByCategory = {
  História:'#9d5cff', Tecnologia:'#10bfa5', Ciência:'#ff5c7d', Espaço:'#1aa8ff', Invenções:'#ff7a18',
  Exploração:'#5f7cff', Cultura:'#f3b321', Games:'#ff5b35', Internet:'#1bbf89', 'Cinema & TV':'#ee6fa8',
  Música:'#7f6df2', Esportes:'#34a853', Transportes:'#e68a27', Brasil:'#25a65a',
}

export const accentFor = (category) => accentByCategory[category] || '#201f1c'

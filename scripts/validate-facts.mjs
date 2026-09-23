import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  assertNoYearInTitles,
  titleCatalogueSize,
  titleEnFor,
  titlePtFor,
} from './lib/eventText.mjs'

const ROUND_SIZE = 4
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const facts = JSON.parse(
  await fs.readFile(path.resolve(__dirname, '../private-data/facts.json'), 'utf8'),
)
const normalize = (value) =>
  value
    .toLocaleLowerCase('pt-BR')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const ids = new Set(),
  titles = new Set(),
  queries = new Set(),
  categories = new Set()
const errors = []

if (facts.length !== 500) errors.push(`Quantidade esperada: 500; encontrada: ${facts.length}.`)
for (const fact of facts) {
  if (!fact.id || ids.has(fact.id)) errors.push(`ID duplicado/inválido: ${fact.id}`)
  ids.add(fact.id)
  const title = normalize(titlePtFor(fact) || '')
  const query = normalize(fact.imageQuery || '')
  if (!title || titles.has(title)) errors.push(`Título duplicado/inválido: ${fact.titlePt}`)
  if (!query || queries.has(query))
    errors.push(`Consulta de imagem duplicada/inválida: ${fact.imageQuery}`)
  titles.add(title)
  queries.add(query)
  if (!fact.category) errors.push(`Categoria ausente: ${fact.id}`)
  categories.add(fact.category)
  if (!Number.isInteger(fact.year) || fact.year < -4000 || fact.year > new Date().getFullYear())
    errors.push(`Ano fora do intervalo: ${fact.id} (${fact.year})`)
  if (!/^https:\/\//.test(fact.sourceUrl || '')) errors.push(`Referência ausente: ${fact.id}`)

  // The English title comes from data/event-titles-en.json, never from imageQuery: the
  // query usually contains the year, which would hand the player the answer.
  const english = titleEnFor(fact)
  if (!english || normalize(english) === query)
    errors.push(`Título em inglês ausente no catálogo: ${fact.id}`)
  try {
    assertNoYearInTitles(fact)
  } catch (error) {
    errors.push(error.message)
  }
}

// Every round deals one card per category, so the pool needs at least four of them.
if (categories.size < ROUND_SIZE)
  errors.push(`Rodadas precisam de ${ROUND_SIZE} categorias; o acervo tem ${categories.size}.`)

if (titleCatalogueSize !== facts.length) {
  errors.push(
    `Catálogo de títulos em inglês tem ${titleCatalogueSize} entradas para ${facts.length} fatos.`,
  )
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(
  `OK: ${facts.length} fatos em ${categories.size} categorias, IDs/títulos/consultas únicos, anos válidos e referência preenchida.`,
)
console.log(`Títulos em inglês: ${titleCatalogueSize} no catálogo, nenhum deles revela o ano.`)

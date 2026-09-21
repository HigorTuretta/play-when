import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const facts = JSON.parse(await fs.readFile(path.resolve(__dirname, '../private-data/facts.json'), 'utf8'))
const normalize = (value) => value.toLocaleLowerCase('pt-BR').normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim()
const ids = new Set(), titles = new Set(), queries = new Set()
const errors = []

if (facts.length !== 500) errors.push(`Quantidade esperada: 500; encontrada: ${facts.length}.`)
for (const fact of facts) {
  if (!fact.id || ids.has(fact.id)) errors.push(`ID duplicado/inválido: ${fact.id}`)
  ids.add(fact.id)
  const title = normalize(fact.titlePt || '')
  const query = normalize(fact.imageQuery || '')
  if (!title || titles.has(title)) errors.push(`Título duplicado/inválido: ${fact.titlePt}`)
  if (!query || queries.has(query)) errors.push(`Consulta de imagem duplicada/inválida: ${fact.imageQuery}`)
  titles.add(title); queries.add(query)
  if (!Number.isInteger(fact.year) || fact.year < -4000 || fact.year > new Date().getFullYear()) errors.push(`Ano fora do intervalo: ${fact.id} (${fact.year})`)
  if (!/^https:\/\//.test(fact.sourceUrl || '')) errors.push(`Referência ausente: ${fact.id}`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`OK: ${facts.length} fatos, IDs/títulos/consultas únicos, anos válidos e referência preenchida.`)

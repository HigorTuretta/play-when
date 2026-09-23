// Regenerates public/rounds/<version>/catalog.json and index.json from the round files
// in the same folder. The export, seed and retext scripts run this too; run it by hand
// only after editing round files some other way. `npm run validate:rounds` fails when the
// two files are out of date.
import path from 'node:path'
import { staticRoundsDir } from './lib/rounds.mjs'
import { writeGameData } from './lib/gameData.mjs'

const files = await writeGameData()
for (const [name, body] of Object.entries(files)) {
  console.log(`${path.basename(staticRoundsDir)}/${name}: ${(body.length / 1024).toFixed(1)} KB`)
}

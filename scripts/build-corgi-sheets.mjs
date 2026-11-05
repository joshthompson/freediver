// Rebuilds the swimming corgi sprite sheets so frames don't pick up pixels from their neighbours.
// The drawn sheets have three 634×394 frames side by side, with the art touching the frame edges,
// and frames that aren't quite the shape of the 70×44 sprite, so each frame slipped a little
// further into the next. This puts each frame in a cell the sprite's shape, with empty gutters
// between them. The art is copied pixel for pixel, so the sheets stay as small as the drawn ones.
// Sheets already rebuilt are skipped, so it's safe to run again after adding or redrawing a sheet
// in the drawn layout.
// Run with: node scripts/build-corgi-sheets.mjs
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const assets = path.resolve(import.meta.dirname, '../src/assets')
const sheets = [
  'sprites/link/link.png',
  'sprites/multiplayer/red/link.png',
  'sprites/multiplayer/yellow/link.png',
  'sprites/multiplayer/pink/link.png',
  'kingdom/corgi-citizen.png',
  'kingdom/corgi-citizen-cardigan.png',
  'kingdom/corgi-king.png',
  'realms/corgosphere/space-corgi.png',
  'realms/fried-egg/eggy-corgi.png',
  'realms/depths/judge-corgi.png',
  'realms/hell/hell-corgi.png',
]

const frameCount = 3
const drawn = { width: 634, height: 394 } // A frame as drawn
// Must match corgiSheet in src/game/freediver/controllers/main/CorgiController.ts. 634×398 is as
// close to 70×44's shape as whole pixels get without resizing the art
const cell = { width: 634, height: 398 }
const gutter = 36 // Empty space between cells, and half as much before the first and after the last
const top = (cell.height - drawn.height) / 2

for (const sheetPath of sheets) {
  const file = path.join(assets, sheetPath)
  const source = PNG.sync.read(fs.readFileSync(file))
  if (source.width !== drawn.width * frameCount || source.height !== drawn.height) {
    console.log(`Skipped ${sheetPath}, ${source.width}×${source.height} isn't the drawn layout`)
    continue
  }
  const sheet = new PNG({ width: (cell.width + gutter) * frameCount, height: cell.height })
  for (let n = 0; n < frameCount; n++) {
    PNG.bitblt(source, sheet, n * drawn.width, 0, drawn.width, drawn.height, gutter / 2 + n * (cell.width + gutter), top)
  }
  fs.writeFileSync(file, PNG.sync.write(sheet))
  console.log(`Rebuilt ${sheetPath}, ${frameCount} cells of ${cell.width}×${cell.height}`)
}

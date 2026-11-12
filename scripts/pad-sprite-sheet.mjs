// Adds empty space around every frame of a sprite sheet, in place. When the game shrinks a sheet,
// the browser blends in pixels just past a frame's edge, so art touching the edge picks up stray
// pixels from the next frame. After padding, draw each frame `padding` source pixels bigger on
// every side, and offset it by the same, so the art stays where it was.
// Run once per sheet, as running it again pads it again:
//   node scripts/pad-sprite-sheet.mjs src/assets/sprites/costumes/teal/seadiver-body.png 7 10
import fs from 'node:fs'
import { PNG } from 'pngjs'

const [file, frameCountArg, paddingArg] = process.argv.slice(2)
const frameCount = Number(frameCountArg)
const padding = Number(paddingArg)
if (!file || !frameCount || !padding) {
  console.error('Usage: node scripts/pad-sprite-sheet.mjs <sheet.png> <frame count> <padding>')
  process.exit(1)
}

const sheet = PNG.sync.read(fs.readFileSync(file))
const frameWidth = sheet.width / frameCount
if (!Number.isInteger(frameWidth)) {
  console.error(`${sheet.width}px doesn't split into ${frameCount} whole frames`)
  process.exit(1)
}

const cell = { width: frameWidth + padding * 2, height: sheet.height + padding * 2 }
const padded = new PNG({ width: cell.width * frameCount, height: cell.height })

for (let n = 0; n < frameCount; n++) {
  for (let y = 0; y < sheet.height; y++) {
    const from = (y * sheet.width + n * frameWidth) * 4
    const to = ((y + padding) * padded.width + n * cell.width + padding) * 4
    sheet.data.copy(padded.data, to, from, from + frameWidth * 4)
  }
}

fs.writeFileSync(file, PNG.sync.write(padded))
console.log(`Padded ${file}: ${frameCount} frames of ${cell.width}×${cell.height}`)

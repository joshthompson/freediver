// Builds the octopus sprite sheet from the ten source frames. Every frame is cropped to the same
// window, so the octopus stays in place as it animates, and is padded with empty space so the
// browser never blends in pixels from the next frame when it shrinks the sheet.
// Run with: node scripts/build-octopus-sheet.mjs
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const dir = path.resolve(import.meta.dirname, '../src/assets/sprites/octopus')
const frameCount = 10
const scale = 3 // Each sheet pixel averages a 3×3 block of source pixels

// The smallest window holding the octopus in every source frame, in source pixels
const crop = { x: 172, y: 117, width: 813, height: 927 }

// The octopus fills 271×309 of each 300×340 frame, in the same proportions as its 30×34 sprite
const frame = { width: 300, height: 340 }
const art = { width: crop.width / scale, height: crop.height / scale }
const offset = { x: Math.floor((frame.width - art.width) / 2), y: Math.floor((frame.height - art.height) / 2) }

const sheet = new PNG({ width: frame.width * frameCount, height: frame.height })

for (let n = 0; n < frameCount; n++) {
  const source = PNG.sync.read(fs.readFileSync(path.join(dir, `octopus ${String(n + 1).padStart(2, '0')}.png`)))
  for (let y = 0; y < art.height; y++) {
    for (let x = 0; x < art.width; x++) {
      // Weighted by alpha, so the dark edges of transparent pixels don't bleed into the outline
      let r = 0, g = 0, b = 0, a = 0
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const i = ((crop.y + y * scale + dy) * source.width + crop.x + x * scale + dx) * 4
          const alpha = source.data[i + 3]
          r += source.data[i] * alpha
          g += source.data[i + 1] * alpha
          b += source.data[i + 2] * alpha
          a += alpha
        }
      }
      const o = ((offset.y + y) * sheet.width + n * frame.width + offset.x + x) * 4
      sheet.data[o] = a ? Math.round(r / a) : 0
      sheet.data[o + 1] = a ? Math.round(g / a) : 0
      sheet.data[o + 2] = a ? Math.round(b / a) : 0
      sheet.data[o + 3] = Math.round(a / scale ** 2)
    }
  }
}

fs.writeFileSync(path.join(dir, 'octopus.png'), PNG.sync.write(sheet))
console.log(`Wrote octopus.png, ${frameCount} frames of ${frame.width}×${frame.height}`)

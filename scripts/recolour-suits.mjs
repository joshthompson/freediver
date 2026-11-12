// Generates the costume colours by recolouring only the teal wetsuit pixels of the teal costume:
// the diver and Linkosha swimming, and facing you at the surface. Purple trim, skin, hair, goggles
// and fur are left alone. Every costume is a folder of these same files in src/assets/sprites/costumes
// Run with: node scripts/recolour-suits.mjs
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const root = path.resolve(import.meta.dirname, '../src/assets/sprites/costumes')
const files = [
  'seadiver-body.png',
  'seadiver-head.png',
  'seadiver-arm-front-upper.png',
  'seadiver-arm-front-lower.png',
  'seadiver-arm-front-hand.png',
  'link.png',
  'seadiver-front-body.png',
  'seadiver-front-head.png',
  'link-front.png',
]

// Teal is the original art. Lightness is scaled up because the suit is very dark,
// which keeps the near-black outlines dark
const colours = {
  red: { hue: 0, saturation: 0.75, lightness: l => l * 3 },
  yellow: { hue: 46, saturation: 0.9, lightness: l => l * 3.8 },
  pink: { hue: 322, saturation: 0.7, lightness: l => l * 3.8 },
}

const isSuit = (h, s, l) => h >= 160 && h <= 230 && l < 0.45 && s > 0.15
// Goggle lenses are light teal (the diver's) or pale green (Linkosha's). Eyes and eyebrows seen
// through them are dark teal like the suit
const isGlass = (h, s, l) => h >= 80 && h <= 230 && l >= 0.45 && s < 0.6
const glassyPatch = 0.6 // A patch of suit-coloured pixels mostly surrounded by glass is behind it, not suit

for (const [name, colour] of Object.entries(colours)) {
  for (const file of files) {
    const png = PNG.sync.read(fs.readFileSync(path.join(root, 'teal', file)))
    const { width, height, data } = png
    const kind = new Uint8Array(width * height) // 0 nothing, 1 suit, 2 glass
    for (let p = 0; p < kind.length; p++) {
      if (data[p * 4 + 3] === 0) continue
      const hsl = rgbToHsl(data[p * 4], data[p * 4 + 1], data[p * 4 + 2])
      kind[p] = isSuit(...hsl) ? 1 : isGlass(...hsl) ? 2 : 0
    }
    const neighbours = function* (p) {
      const x = p % width
      const y = (p - x) / width
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if ((dx || dy) && nx >= 0 && ny >= 0 && nx < width && ny < height) yield ny * width + nx
        }
      }
    }

    // Each patch of touching suit-coloured pixels, kept only if it isn't seen through glass
    const done = new Uint8Array(kind.length)
    for (let start = 0; start < kind.length; start++) {
      if (kind[start] !== 1 || done[start]) continue
      const patch = [start]
      done[start] = 1
      let glass = 0
      let other = 0
      for (let n = 0; n < patch.length; n++) {
        for (const q of neighbours(patch[n])) {
          if (kind[q] === 1) {
            if (!done[q]) {
              done[q] = 1
              patch.push(q)
            }
          } else if (kind[q] === 2) glass++
          else other++
        }
      }
      if (glass / (glass + other) > glassyPatch) continue

      for (const p of patch) {
        const i = p * 4
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
        const [r, g, b] = hslToRgb(colour.hue, Math.min(1, s * colour.saturation), Math.min(0.85, colour.lightness(l)))
        // Where the suit meets glass, its edge pixels are part glass, so the lighter they are the
        // more they keep their own colour, rather than turning almost white
        const atGlass = [...neighbours(p)].some(q => kind[q] === 2)
        const keep = atGlass ? smoothstep(0.15, 0.45, l) : 0
        data[i] = Math.round(r + (data[i] - r) * keep)
        data[i + 1] = Math.round(g + (data[i + 1] - g) * keep)
        data[i + 2] = Math.round(b + (data[i + 2] - b) * keep)
      }
    }
    fs.mkdirSync(path.join(root, name), { recursive: true })
    fs.writeFileSync(path.join(root, name, file), PNG.sync.write(png))
  }
}

function smoothstep(from, to, value) {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0)
    : max === g ? (b - r) / d + 2
      : (r - g) / d + 4
  return [h * 60, s, l]
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return [r, g, b].map(v => Math.round((v + m) * 255))
}

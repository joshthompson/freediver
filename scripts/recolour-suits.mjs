// Generates the multiplayer suit colours by recolouring only the teal wetsuit pixels
// of the diver and corgi sprites. Purple trim, skin, hair, goggles and fur are left alone.
// Run with: node scripts/recolour-suits.mjs
import fs from 'node:fs'
import path from 'node:path'
import { PNG } from 'pngjs'

const root = path.resolve(import.meta.dirname, '../src/assets/sprites')
const sources = [
  'seadiver/seadiver-body.png',
  'seadiver/seadiver-head.png',
  'seadiver/seadiver-arm-front-upper.png',
  'seadiver/seadiver-arm-front-lower.png',
  'seadiver/seadiver-arm-front-hand.png',
  'link/link.png',
]

// Teal is slot 1, the original art. Lightness is scaled up because the suit is very dark,
// which keeps the near-black outlines dark
const colours = {
  red: { hue: 0, saturation: 0.75, lightness: l => l * 3 },
  yellow: { hue: 46, saturation: 0.9, lightness: l => l * 3.8 },
  pink: { hue: 322, saturation: 0.7, lightness: l => l * 3.8 },
}

const isSuit = (h, s, l) => h >= 160 && h <= 230 && l < 0.45 && s > 0.15

for (const [name, colour] of Object.entries(colours)) {
  for (const source of sources) {
    const png = PNG.sync.read(fs.readFileSync(path.join(root, source)))
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i + 3] === 0) continue
      const [h, s, l] = rgbToHsl(png.data[i], png.data[i + 1], png.data[i + 2])
      if (!isSuit(h, s, l)) continue
      const [r, g, b] = hslToRgb(colour.hue, Math.min(1, s * colour.saturation), Math.min(0.85, colour.lightness(l)))
      png.data[i] = r
      png.data[i + 1] = g
      png.data[i + 2] = b
    }
    const out = path.join(root, 'multiplayer', name, path.basename(source))
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, PNG.sync.write(png))
  }
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

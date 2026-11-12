import type { DiverSkin } from '../controllers/main/DiverController'
import { GameState, useGameState } from '@/utils/GameStateContext'
import { SlotColour, SlotColours, slotColour } from './protocol'

// Every costume is a folder in src/assets/sprites/costumes holding the same files. Teal is the
// original art, and scripts/recolour-suits.mjs makes the other colours from it
const files = import.meta.glob<string>('/src/assets/sprites/costumes/*/*.png', { eager: true, import: 'default' })
const file = (colour: SlotColour, name: string) => files[`/src/assets/sprites/costumes/${colour}/${name}.png`]

export interface Costume {
  diver: DiverSkin // Swimming
  corgi: string // Linkosha's sprite sheet, swimming
  surface: { body: string, head: string, corgi: string } // Facing you at the surface
}

const skins = Object.fromEntries(SlotColours.map(colour => [colour, {
  diver: {
    body: file(colour, 'seadiver-body'),
    head: file(colour, 'seadiver-head'),
    armUpper: file(colour, 'seadiver-arm-front-upper'),
    armLower: file(colour, 'seadiver-arm-front-lower'),
    armHand: file(colour, 'seadiver-arm-front-hand'),
  },
  corgi: file(colour, 'link'),
  surface: {
    body: file(colour, 'seadiver-front-body'),
    head: file(colour, 'seadiver-front-head'),
    corgi: file(colour, 'link-front'),
  },
} satisfies Costume])) as Record<SlotColour, Costume>

export function skinFor(slot: number) {
  return skins[slotColour(slot)]
}

// The same suits, sold by the shopkeeper for single player
export function suitSkin(colour: SlotColour) {
  return skins[colour]
}

// What the single-player diver and Linkosha wear: the suit last chosen in the shop
export function wornSuit(gameState: GameState) {
  return {
    diver: () => skins[gameState.suits.wearing].diver,
    corgi: () => skins[gameState.suits.wearing].corgi,
    surface: () => skins[gameState.suits.wearing].surface,
  }
}

// The surface art for the costume being worn, read when the surface is set up. Teal outside the game
export function wornSurfaceCostume() {
  const gameState = useGameState()?.gameState
  return skins[gameState?.suits.wearing ?? 'teal'].surface
}

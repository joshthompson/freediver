export const CAVE = {
  minX: 0,
  maxX: 10000,
} as const

export const OCEAN = {
  minX: -4000,
  maxX: 8000,
} as const

export type LevelName = 'ocean' | 'cave'

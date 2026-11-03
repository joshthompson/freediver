export const CAVE = {
  minX: 0,
  maxX: 10000,
} as const

export const OCEAN = {
  minX: -4000,
  maxX: 8000,
} as const

// The corgi kingdom sits beneath the statue in the cave level
export const KINGDOM = {
  minX: 0,
  maxX: 2400,
  hole: { x: 1110, width: 120 },
  depthOffset: 720,
} as const

// Where Continue on the menu takes you back to. Leaving mid-realm resumes in the kingdom
export type LevelName = 'ocean' | 'cave' | 'kingdom'

import { createContext, useContext } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { Locale } from "./Translations"


export const AllAchievements = [
  'firstDive', // First dive
  'almostFaint', // Return to the surface with 1 oxygen remaining
  'crabJump', // Make a crab jump
  'prequalisation', // Equalise before you need to
  'total100', // Obtain a total score of over 100
  'total500', // Obtain a total score of over 500
  'total1000', // Obtain a total sore of over 1000
  'dive10', // Get 10 points in a single dive
  'dive25', // Get 25 points in a single dive
  'dive50', // Get 50 points in a single dive
  'bilingual', // Change language
  'surviveTitanTriggerFish', // Survive an encounter with a titan trigger fish
  'whale', // Find a whale
  'wreck', // Find a ship wreck
  'statue', // Find the Linkosha statue
] as const

export type Achievement = typeof AllAchievements[number]
  

export interface GameState {
  score: {
    total: number
    currentDive: number
    maxDive: number
  }
  diver: {
    x: number
    oxygen: number
    showDamage: boolean
  }
  options: {
    locale: Locale
    debug: boolean
    volume: number
  }
  achievements: Partial<Record<Achievement, 'new' | 'shown' | false>>
}

export const saveState = (gameState: GameState) => {
  window.localStorage.setItem('game-state', JSON.stringify({
    volume: gameState.options.volume,
    score: gameState.score,
    locale: gameState.options.locale,
    achievements: gameState.achievements,
  }))
}

export const GameStateContext = createContext<[GameState, SetStoreFunction<GameState>]>()
export type GameStateActions = NonNullable<ReturnType<typeof useGameState>>['gameStateActions']

export const useGameState = () => {
  const context = useContext(GameStateContext)
  if (!context) return undefined
  
  const [gameState, setGameState] = context

  function achievement(name: Achievement) {
    if (!gameState.achievements[name]) {
      setGameState('achievements', name, 'new')
      saveState(gameState)
      return true
    } else {
      return false
    }
  }

  return {
    gameState,
    setGameState,
    gameStateActions: {
      score: (points: number) => {
        setGameState('score', 'currentDive', (score) => score + points)
      },
      registerCurrentDive: () => {
        setGameState('score', (state) => {
          const newTotal = state.total + state.currentDive
          const newMaxDive = Math.max(state.maxDive, state.currentDive)

          if (state.currentDive >= 10) achievement('dive10')
          if (state.currentDive >= 25) achievement('dive25')
          if (state.currentDive >= 50) achievement('dive50')
          if (newTotal >= 100) achievement('total100')
          if (newTotal >= 500) achievement('total500')
          if (newTotal >= 1000) achievement('total1000')

          return {
            ...state,
            total: newTotal,
            maxDive: newMaxDive,
          }
        })
        saveState(gameState)
      },
      toggleVolume: () => {
        const on = gameState.options.volume > 0
        const audioElements = document.querySelectorAll<HTMLAudioElement>('audio[data-game-volume]')
        audioElements.forEach(audio => {
          audio.volume = on ? 0 : parseFloat(audio.getAttribute('data-game-volume')!)
        })
        setGameState('options', 'volume', on ? 0 : 1)
        saveState(gameState)
      },
      clearScoreData: () => {
        setGameState('score', {
          total: 0,
          currentDive: 0,
          maxDive: 0,
        })
        saveState(gameState)
      },
      clearAchievements: () => {
        setGameState('achievements', achievements => Object.fromEntries(
          Object.entries(achievements).map(([key]) => [key, false])
        ))
        saveState(gameState)
      },
      toggleLanguage: () => {
        const nextLocale: Record<Locale, Locale> = {
          en: 'ru',
          ru: 'sv',
          sv: 'en',
        }
        setGameState('options', 'locale', nextLocale[gameState.options.locale])
        achievement('bilingual')
        saveState(gameState)
      },
      achievement,
      damage: (amount: number) => {
        setGameState('diver', 'oxygen', oxygen => Math.max(0, oxygen - amount))
        setGameState('diver', 'showDamage', true)
      }
    }
  }
}
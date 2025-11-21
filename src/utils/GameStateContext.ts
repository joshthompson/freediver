import { createContext, useContext } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { Locale } from "./Translations"

export const AllAchievements = [
  // Basic
  'firstDive', // First dive
  'total100', // Obtain a total score of over 100
  'dive10', // Get 10 points in a single dive
  'dive20', // Get 20 points in a single dive
  'almostFaint', // Return to the surface with 1 oxygen remaining
  'blackout', // Experience a blackout

  // Random
  'prequalisation', // Equalise near the surface
  'bone', // Find Linkosha 5 bones
  'crabJump', // Make a crab jump
  'bilingual', // Change language
  'surviveTitanTriggerFish', // Survive an encounter with a titan trigger fish
  'eggFishKiss', // Get kissed by a fried egg fish

  // Explore
  'whale', // Find a whale
  'whaleShark', // Find a whale-shark
  'shark', // Find a shark
  'wreck', // Find a ship wreck
  'statue', // Find the Linkosha statue
  'endOfTheWorld', // Reach the end of the world
] as const

export type Achievement = typeof AllAchievements[number]
export type AchievementState = 'new' | 'shown' | false
export type AchievementsRecord = Partial<Record<Achievement, AchievementState>>
const AchievementDisplayDuration = 5000
  

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
    showHeal: boolean
  }
  options: {
    locale: Locale
    debug: boolean
    volume: number
  }
  showGift: boolean
  achievements: AchievementsRecord
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
      setTimeout(() => {
        setGameState('achievements', name, 'shown')
        saveState(gameState)
      }, AchievementDisplayDuration)

      // SPECIAL GIFT THING
      const total = Object.values(gameState.achievements).filter(state => state === 'shown' || state === 'new').length
      if (total % 3 === 0 && total > 0) {
        setGameState('showGift', true)
      }

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
          if (state.currentDive >= 30) achievement('dive20')
          if (newTotal >= 100) achievement('total100')

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
      clearGameData: () => {
        setGameState('score', {
          total: 0,
          currentDive: 0,
          maxDive: 0,
        })
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
      },
      heal: (amount: number) => {
        setGameState('diver', 'oxygen', oxygen => Math.min(100, oxygen + amount))
        setGameState('diver', 'showHeal', true)
      }
    }
  }
}
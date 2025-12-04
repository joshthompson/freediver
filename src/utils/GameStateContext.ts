import { createContext, useContext } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import {
  Achievement,
  AchievementDisplayDuration,
  AchievementsRecord,
} from '@/game/freediver/data/Achievements'
import { Locale } from "@/game/freediver/data/Translations"
import { OCEAN } from "@/game/freediver/scene/levels/ocean"

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
  questState: {
    cow: {
      state: 'waiting' | 'following' | 'lost' | 'reunited',
      x: number
    },
    cave: {
      state: 'open' | 'closed',
    },
    corgi: {
      bones: boolean[]
      delivered: number
      open: boolean
    }
  }
  achievements: AchievementsRecord
}

const baseState: GameState = {
  score: {
    total: 0,
    currentDive: 0,
    maxDive: 0,
  },
  diver: {
    x: 0,
    oxygen: 100,
    showDamage: false,
    showHeal: false,
  },
  options: {
    locale: 'en',
    volume: 1,
    debug: import.meta.env.DEV,
  },
  achievements: {},
  questState: {
    cow: {
      state: 'waiting',
      x: OCEAN.minX + 500,
    },
    cave: {
      state: 'closed',
    },
    corgi: {
      bones: Array(10).fill(false),
      delivered: 0,
      open: false
    }
  },
}

export function initialState(): GameState {
  const loadedState = loadState()
  return {
    score: {
      ...baseState.score,
      ...loadedState.score,
      currentDive: 0,
    },
    diver: {
      ...baseState.diver,
      ...loadedState.diver,
      oxygen: 100,
      showDamage: false,
      showHeal: false,
    },
    options: {
      ...baseState.options,
      ...loadedState.options,
      debug: import.meta.env.DEV,
    },
    questState: {
      ...baseState.questState,
      ...loadedState.questState,
    },
    achievements: Object.fromEntries(
      Object.entries((loadedState.achievements ?? {}))
          .map(([key, value]) => [key as Achievement, value === 'new' ? 'shown' : value])
    ) as AchievementsRecord
  }
}

export function setGameStateWithSaveWrapper(
  gameState: GameState,
  setGameState: SetStoreFunction<GameState>
) {
  return ((...args: any[]) => {
    (setGameState as any)(...args)
    saveState(gameState)
  }) as any as SetStoreFunction<GameState>
}


export const saveState = (gameState: GameState) => {
  window.localStorage.setItem('game-state', JSON.stringify(gameState satisfies GameState))
}

export const loadState = (): GameState => {
  return JSON.parse(window.localStorage.getItem('game-state') ?? '{}')
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
      setTimeout(() => {
        setGameState('achievements', name, 'shown')
      }, AchievementDisplayDuration)
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

          if (state.currentDive >= 15) achievement('dive15')
          if (state.currentDive >= 30) achievement('dive30')
          if (newTotal >= 100) achievement('total100')

          return {
            ...state,
            total: newTotal,
            maxDive: newMaxDive,
          }
        })
      },
      toggleVolume: () => {
        const on = gameState.options.volume > 0
        const audioElements = document.querySelectorAll<HTMLAudioElement>('audio[data-game-volume]')
        audioElements.forEach(audio => {
          audio.volume = on ? 0 : parseFloat(audio.getAttribute('data-game-volume')!)
        })
        setGameState('options', 'volume', on ? 0 : 1)
      },
      clearGameData: () => {
        setGameState('score', {
          total: 0,
          currentDive: 0,
          maxDive: 0,
        })
        setGameState('achievements', achievements => Object.fromEntries(
          Object.entries(achievements).map(([key]) => [key, undefined])
        ))
        setGameState('questState', questData => Object.fromEntries(
          Object.entries(questData).map(([key]) => [key, undefined])
        ))
      },
      toggleLanguage: () => {
        const nextLocale: Record<Locale, Locale> = {
          en: 'ru',
          ru: 'sv',
          sv: 'en',
        }
        setGameState('options', 'locale', nextLocale[gameState.options.locale])
        achievement('bilingual')
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
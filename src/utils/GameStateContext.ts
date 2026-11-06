import { createContext, useContext } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import {
  Achievement,
  AchievementDisplayDuration,
  AchievementsRecord,
} from '@/game/freediver/data/Achievements'
import { Locale } from "@/game/freediver/data/Translations"
import { LevelName, OCEAN } from "@/game/freediver/scene/levels/data"
import { RealmName, RealmNames, RealmPoints, Realms } from "@/game/freediver/data/Realms"
import { SuitColour, suitPrice } from "@/game/freediver/data/Suits"

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
    level: LevelName
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
      bones: (number | 'delivered')[] // -1 for not found, otherwise the find order
      delivered: number
      open: boolean
    }
    king: {
      state: 'new' | 'accepted' | 'crowned', // Crowned once Linkosha takes the crown
    }
    // A Crystal Corgi is carried from its realm's Exit Portal until Linkosha puts it on its Plinth
    crystals: Partial<Record<RealmName, 'carried' | 'delivered'>>
  }
  suits: {
    owned: SuitColour[]
    wearing: SuitColour
  }
  achievements: AchievementsRecord
}

declare global {
  interface Window {
    gameState?: GameState
    setGameState?: SetStoreFunction<GameState>
  }
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
    level: 'ocean',
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
      // bones: [1,2,3,4,5,6,7,8,9,0],
      bones: Array(10).fill(-1),
      delivered: 0,
      open: false
    },
    king: {
      state: 'new',
    },
    crystals: {},
  },
  suits: {
    owned: ['teal'],
    wearing: 'teal',
  },
}

export function initialState(): GameState {
  const loadedState = loadState()
  const state = {
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
      // Dev tools can be switched off while developing, and are never on in production
      debug: import.meta.env.DEV && (loadedState.options?.debug ?? true),
    },
    questState: {
      ...baseState.questState,
      ...loadedState.questState,
    },
    suits: {
      ...baseState.suits,
      ...loadedState.suits,
    },
    achievements: Object.fromEntries(
      Object.entries((loadedState.achievements ?? {}))
          .map(([key, value]) => [key as Achievement, value === 'new' ? 'shown' : value])
    ) as AchievementsRecord
  }
  return state
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

const saveFrequency = 5000
let lastSaved = 0
export const saveState = (gameState: GameState, forceSave = false) => {
  if (Date.now() - lastSaved > saveFrequency || forceSave) {
    window.localStorage.setItem('game-state', JSON.stringify(gameState satisfies GameState))
    lastSaved = Date.now()
  }
}

export const loadState = (): GameState => {
  return JSON.parse(window.localStorage.getItem('game-state') ?? '{}')
}

// Achievement popups only count down while gameplay is running
const achievementCountdownTick = 100
let achievementCountdownPaused = false
export const setAchievementCountdownPaused = (paused: boolean) => {
  achievementCountdownPaused = paused
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
      let timeLeft = AchievementDisplayDuration
      const countdown = setInterval(() => {
        if (achievementCountdownPaused) return
        timeLeft -= achievementCountdownTick
        if (timeLeft <= 0) {
          clearInterval(countdown)
          setGameState('achievements', name, 'shown')
        }
      }, achievementCountdownTick)
      return true
    } else {
      return false
    }
  }

  function score(points: number) {
    setGameState('score', 'currentDive', (score) => score + points)
  }

  // Everything you can spend: what's banked, and what you've picked up on this dive so far
  const points = () => gameState.score.total + gameState.score.currentDive

  return {
    gameState,
    setGameState,
    gameStateActions: {
      score,
      achievement,
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
        setGameState((prev) => ({
          ...baseState,
          options: prev.options
        }))
      },
      toggleDebug: () => {
        if (!import.meta.env.DEV) return
        setGameState('options', 'debug', debug => !debug)
      },
      // Multiplayer earns no Achievements, so it changes the language without Bilingual
      toggleLanguage: (options?: { achievement?: boolean }) => {
        const nextLocale: Record<Locale, Locale> = {
          en: 'ru',
          ru: 'sv',
          sv: 'fl',
          fl: 'en',
        }
        setGameState('options', 'locale', nextLocale[gameState.options.locale])
        if (options?.achievement !== false) achievement('bilingual')
      },
      damage: (amount: number) => {
        setGameState('diver', 'oxygen', oxygen => Math.max(0, oxygen - amount))
        setGameState('diver', 'showDamage', true)
      },
      heal: (amount: number) => {
        setGameState('diver', 'oxygen', oxygen => Math.min(100, oxygen + amount))
        setGameState('diver', 'showHeal', true)
      },
      claimBone: (n: number) => {
        score(1)
        const totalBonesFound = gameState.questState.corgi.bones.filter(b => b !== -1).length
        const delivered = gameState.questState.corgi.delivered
        const nextBoneNumber = totalBonesFound - delivered
        setGameState('questState', 'corgi', 'bones', n, nextBoneNumber)
        return nextBoneNumber
      },
      depositBone: (n: number) => {
        const prev = gameState.questState.corgi.bones[n]
        setGameState('questState', 'corgi', 'bones', bones => bones.map(
          (bone, i) => i === n
            ? 'delivered'
            : typeof bone === 'number' && typeof prev === 'number' && bone !== -1 && bone > prev
              ? bone - 1
              : bone
        ))
        setGameState('questState', 'corgi', 'delivered', prev => prev + 1)
        if (gameState.questState.corgi.delivered === gameState.questState.corgi.bones.length) {
          achievement('statue')
          setGameState('questState', 'corgi', 'open', true)
        }
      },
      // Leaving through a realm's Exit Portal. The first time brings its Crystal Corgi back
      completeRealm: (realm: RealmName) => {
        const firstTime = !gameState.questState.crystals[realm]
        score(firstTime ? RealmPoints.first : RealmPoints.replay)
        if (firstTime) {
          setGameState('questState', 'crystals', realm, 'carried')
          achievement(Realms[realm].achievement)
        }
      },
      deliverCrystal: (realm: RealmName) => {
        setGameState('questState', 'crystals', realm, 'delivered')
        saveState(gameState, true)
        return RealmNames.filter(name => gameState.questState.crystals[name] !== 'delivered').length
      },
      points,
      // Spends points from this dive first, then banked ones. Returns whether there were enough
      buySuit: (suit: SuitColour) => {
        if (points() < suitPrice) return false
        const fromDive = Math.min(suitPrice, gameState.score.currentDive)
        setGameState('score', 'currentDive', dive => dive - fromDive)
        setGameState('score', 'total', total => total - (suitPrice - fromDive))
        setGameState('suits', 'owned', owned => [...owned, suit])
        setGameState('suits', 'wearing', suit)
        saveState(gameState, true) // Points spent shouldn't be lost if the game closes straight after
        return true
      },
      wearSuit: (suit: SuitColour) => {
        if (!gameState.suits.owned.includes(suit)) return
        setGameState('suits', 'wearing', suit)
        saveState(gameState, true)
      },
      crown: () => {
        setGameState('questState', 'king', 'state', 'crowned')
        achievement('corgiKing')
      },
      blackout: () => {
        setGameState('score', 'currentDive', 0)
        setGameState('diver', 'x', 0)
        setGameState('diver', 'level', 'ocean')
        achievement('blackout')
      },
    }
  }
}
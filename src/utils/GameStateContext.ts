import { createContext, useContext } from "solid-js"
import { SetStoreFunction } from "solid-js/store"

export interface GameState {
  score: {
    total: number
    currentDive: number
    maxDive: number
  }
  diver: {
    x: number
    oxygen: number
  }
  options: {
    debug: boolean
    volume: number
  }
}


export const GameStateContext = createContext<[GameState, SetStoreFunction<GameState>]>()
export type GameStateActions = NonNullable<ReturnType<typeof useGameState>>['gameStateActions']

export const useGameState = () => {
  const context = useContext(GameStateContext)
  if (!context) return undefined
  
  const [gameState, setGameState] = context

  const saveState = () => {
    window.localStorage.setItem('game-state', JSON.stringify({
      volume: gameState.options.volume,
      score: gameState.score,
    }))
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
          return {
            ...state,
            total: newTotal,
            maxDive: newMaxDive,
          }
        })
        saveState()
      },
      toggleVolume: () => {
        const on = gameState.options.volume > 0
        const audioElements = document.querySelectorAll<HTMLAudioElement>('audio[data-game-volume]')
        audioElements.forEach(audio => {
          audio.volume = on ? 0 : parseFloat(audio.getAttribute('data-game-volume')!)
        })
        setGameState('options', 'volume', on ? 0 : 1)
        saveState()
      },
      clearScoreData: () => {
        setGameState('score', {
          total: 0,
          currentDive: 0,
          maxDive: 0,
        })
        saveState()
      }
    }
  }
}
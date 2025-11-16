import { createContext } from "solid-js"
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
    volume: number
  }
}


export const GameStateContext = createContext<[GameState, SetStoreFunction<GameState>]>()
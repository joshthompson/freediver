import { Component, createSignal } from 'solid-js'
import { css } from '@style/css'
import { OceanScene } from './scene/OceanScene'
import { SurfaceScene } from './scene/SurfaceScene'
import { MenuScene } from './scene/MenuScene'
import { InstructionsScene } from './scene/InstructionsScene'
import { playSound } from '@/utils/game'
import ocean1 from '@assets/sounds/ocean1.mp3'
import { createStore } from 'solid-js/store'
import { GameState, GameStateContext } from '@/utils/GameStateContext'
import { BlackoutScene } from './scene/BlackoutScene'
import { OptionsScene } from './scene/OptionsScene'

const local = window.location.hostname === 'localhost'

export const FreediverGame: Component = () => {
  const savedGameState = JSON.parse(window.localStorage.getItem('game-state') ?? '{}')
  const [gameState, setGameState] = createStore<GameState>({
    score: savedGameState?.score ?? {
      total: 0,
      currentDive: 0,
      maxDive: 0,
    },
    diver: {
      x: 0,
      oxygen: 100,
    },
    options: {
      debug: local,
      volume: savedGameState?.volume ?? 1,
    },
  })

  const [scene, _setScene] = createSignal<string>(local ? 'menu' : 'menu')
  const setScene = (newScene: string) => {
    if (['ocean', 'surface'].includes(newScene) && !music()) {
      startMusic()
    }
    if (newScene === 'menu' && music()) {
      music()!.pause()
      music()!.remove()
      setMusic(undefined)
    }
    _setScene(newScene)
  }

  const [music, setMusic] = createSignal<HTMLAudioElement | undefined>(undefined)
  const startMusic = () => {
    setMusic(playSound(ocean1, { loop: true, mute: gameState.options.volume === 0 }))
  }

  return (
    <GameStateContext.Provider value={[gameState, setGameState]}>
      <div class={styles.page}>
        {scene() === 'menu' && <MenuScene setScene={setScene} />}
        {scene() === 'instructions' && <InstructionsScene setScene={setScene} />}
        {scene() === 'options' && <OptionsScene setScene={setScene} />}
        {scene() === 'surface' && <SurfaceScene setScene={setScene} />}
        {scene() === 'ocean' && <OceanScene setScene={setScene} />}
        {scene() === 'blackout' && <BlackoutScene setScene={setScene} />}
      </div>
    </GameStateContext.Provider>
  )
}

const styles = {
  page: css({
    '--u': 'min(1dvh, 1dvw)',
    '--size': 'calc(80 * var(--u))',
    width: '100dvw',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    fontFamily: '"Jersey 10", sans-serif',
  }),
}

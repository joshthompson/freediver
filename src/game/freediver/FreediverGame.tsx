import { Component, createSignal } from 'solid-js'
import { css } from '@style/css'
import { OceanScene } from './scene/OceanScene'
import { SurfaceScene } from './scene/SurfaceScene'
import { MenuScene } from './scene/MenuScene'
import { InstructionsScene } from './scene/InstructionsScene'
import { playSound } from '@/utils/game'
import ocean1 from '@assets/sounds/ocean1.mp3'

export const FreediverGame: Component = () => {
  const [scene, _setScene] = createSignal<string>('menu')
  const [sceneData, setSceneData] = createSignal<any>(null)
  const setScene = (newScene: string, data?: any) => {
    if (['ocean', 'surface'].includes(newScene) && !music()) {
      startMusic()
    }
    _setScene(newScene)
    setSceneData(data ?? null)
  }

  const [music, setMusic] = createSignal<HTMLAudioElement | undefined>(undefined)
  const startMusic = () => {
    setMusic(playSound(ocean1, 1, true))
  }

  const debug = window.location.hostname === 'localhost'
  return (
    <div class={styles.page}>
      <MenuScene debug={debug} active={scene() === 'menu'} setScene={setScene} />
      <InstructionsScene
        debug={debug}
        active={scene() === 'instructions'}
        setScene={setScene}
        sceneData={sceneData}
      />
      <OceanScene debug={debug} active={scene() === 'ocean'} setScene={setScene} />
      <SurfaceScene debug={debug} active={scene() === 'surface'} setScene={setScene} />
    </div>
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

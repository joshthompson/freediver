import { Component, createSignal } from 'solid-js'
import { css } from '@style/css'
import { OceanScene } from './scene/OceanScene'
import { SurfaceScene } from './scene/SurfaceScene'
import { MenuScene } from './scene/MenuScene'
import { InstructionsScene } from './scene/InstructionsScene'

export const FreediverGame: Component = () => {
  const [scene, setScene] = createSignal<string>('menu')
  const debug = window.location.hostname === 'localhost'
  return (
    <div class={styles.page}>
      <MenuScene debug={debug} active={scene() === 'menu'} setScene={setScene} />
      <InstructionsScene debug={debug} active={scene() === 'instructions'} setScene={setScene} />
      <OceanScene debug={debug} active={scene() === 'ocean'} setScene={setScene} />
      <SurfaceScene debug={debug} active={scene() === 'surface'} />
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

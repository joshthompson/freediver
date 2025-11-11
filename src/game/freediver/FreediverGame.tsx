import { Component } from 'solid-js'
import { css } from '@style/css'
import { createDiverController, DiverController } from './controllers/DiverController'
import { createCorgiController } from './controllers/CorgiController'
import { createFishController } from './controllers/FishController'
import { createCrabController } from './controllers/CrabController'
import { Canvas } from '../core/Canvas'
import { Game } from '@/utils/game'
import sand from '@public/sand.png'
import bg1 from '@public/bg-1.png'
import bg2 from '@public/bg-2.png'
import bg3 from '@public/bg-3.png'

export const FreediverGame: Component = () => {
  const game = new Game({
    width: 700,
    height: 700,
    controllers: {
      diver: createDiverController('diver'),
      corgi: createCorgiController('corgi'),
    },
  })

  Array(10).fill(null).forEach((_, n) => {
    game.addController(createFishController('fish-' + n, {
      x: Math.random() * 500 + 100,
      y: Math.random() * 500 + 100,
    }))
  })

  Array(3).fill(null).forEach((_, n) => {
    game.addController(createCrabController('crab-' + n, {
      x: Math.random() * 700,
    }))
  })

  const depth = () => {
    const diver = game.getController('diver') as DiverController
    return diver.actions.depth()
  }

  return (
    <div class={styles.page}>
      <Canvas game={game} class={styles.level} style={{
        'background-image': `
          url(${sand}),
          url(${bg1}),
          url(${bg2}),
          url(${bg3}),
          linear-gradient(0deg,rgba(7, 0, 145, 1) 0%, rgba(10, 182, 250, 1) 100%)
        `,
        'background-position': `
          ${-game.canvas.x()}px bottom,
          ${-game.canvas.x() / 2.5}px 85%,
          ${-game.canvas.x() / 2.0}px 85%,
          ${-game.canvas.x() / 1.5}px 85%,
          ${-game.canvas.x()}px bottom
        `,
      }}>
        <div class={styles.depth}>{depth() ?? 0}m</div>
      </Canvas>
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
  }),
  level: css({
    position: 'relative',
    border: '3px solid black',
    backgroundRepeat: 'repeat-x',
    backgroundSize: '200px, 612px, 612px, 612px, cover',
    fontFamily: '"Jersey 10", sans-serif',
    color: 'white',
  }),
  depth: css({
    position: 'absolute',
    top: '5px',
    right: '10px',
    fontSize: '2rem',
  }),
}

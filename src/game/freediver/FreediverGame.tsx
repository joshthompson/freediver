import { Component } from 'solid-js'
import { css, cva } from '@style/css'
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
import surface from '@public/surface.png'
import watch from '@public/watch.png'
import { createOctopusController } from './controllers/OctopusController'

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

  const crabs = Array(3).fill(null).map((_, n) => 
    createCrabController('crab-' + n, {
      x: Math.random() * 700,
    })
  ).sort((a, b) => a.data.y() - b.data.y())
  crabs.forEach(crab => game.addController(crab))

  const octopi = Array(4).fill(null).map((_, n) => 
    createOctopusController('octopus-' + n, {
      x: Math.random() * 500 + 100,
      y: Math.random() * 500 + 100,
    })
  ).sort((a, b) => b.data.y() - a.data.y())
  octopi.forEach(octopus => game.addController(octopus))

  return (
    <div class={styles.page}>
      <Canvas
        game={game}
        overlay={<GameOverlay game={game} />}
        underlay={<GameUnderlay />}
        class={styles.level}
        style={{
          'background-image': `
            url(${sand}),
            url(${bg1}),
            url(${bg2}),
            url(${bg3}),
            linear-gradient(
              0deg,
              rgba(7, 0, 145, 1) 0%,
              rgba(10, 182, 250, 1) 90%,
              rgba(230, 240, 255, 1) 100%
            )
          `,
          'background-position': `
            ${-game.canvas.x()}px bottom,
            ${-game.canvas.x() / 2.5}px 85%,
            ${-game.canvas.x() / 2.0}px 85%,
            ${-game.canvas.x() / 1.5}px 85%,
            ${-game.canvas.x()}px bottom
          `,
        }}
      />
    </div>
  )
}

const GameOverlay: Component<{ game: Game }> = props => {
  const depth = () => {
    const diver = props.game.getController('diver') as DiverController
    return diver.actions.depth()
  }

  const eqWarn = () => {
    const diver = props.game.getController('diver') as DiverController
    const { eqLevel, eqTolerance } = diver.data
    return eqLevel() > eqTolerance
  }

  const eqBar = () => {
    const diver = props.game.getController('diver') as DiverController
    const { holdSpace, holdSpaceMax } = diver.data
    return Math.min(100, holdSpace() / holdSpaceMax * 100)
  }

  return <>
    <div class={styles.depth} style={{ 'background-image': `url(${watch})` }}>{depth() ?? 0}m</div>
    <div class={styles.equalisation({ warn: eqWarn() })}>
      <div class={styles.equalisationBackground({ warn: eqWarn() })} />
      <div>Hold <div class={styles.key}>SPACE</div> to equalise</div>
      <div class={styles.equalisationBar}>
        <div style={{ '--percent': eqBar() }} />
      </div>
    </div>
  </>
}
const GameUnderlay: Component = () => {
  return <div class={styles.surface} style={{ 'background-image': `url(${surface})` }} />
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
    width: '84px',
    aspectRatio: '21 / 26',
    top: '4px',
    right: '4px',
    fontSize: '2rem',
    backgroundSize: 'cover',
    textAlign: 'center',
    paddingRight: '16px',
    paddingLeft: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  equalisation: cva({
    base: {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '3rem',
      gap: '3rem',
      transition: 'opacity 0.5s ease-in-out',
      opacity: 0,
    },
    variants: {
      warn: {
        true: {
          opacity: '1',
        },
      },
    },
  }),
  equalisationBackground: cva({
    base: {
      position: 'absolute',
      inset: '0',
      background: 'red',
      opacity: 0,
    },
    variants: {
      warn: {
        true: {
          animation: 'flash 1s ease-in-out infinite'
        },
      },
    },
  }),
  surface: css({
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '50px',
    backgroundSize: 'auto 100%',
    filter: 'saturate(0) brightness(10)',
    opacity: '0.5',
  }),
  key: css({
    display: 'inline-block',
    background: 'white',
    color: 'black',
    p: '0px 15px',
    lineHeight: '1.2em',
    mx: '0.15em',
  }),
  equalisationBar: css({
    width: '300px',
    borderRadius: '10px',
    border: '3px solid white',
    height: '20px',
    background: 'white',

    '& > div': {
      height: '100%',
      width: 'calc(1% * var(--percent))',
      background: `
        color-mix(
          in srgb,
          #0ab6fa calc(1% * var(--percent)),
          red calc(100% - 1% * var(--percent))
        )
      `,
      borderRadius: '7px',
      transition: 'width 0.1s linear',
    },
  }),
}

import { Canvas } from "@/game/core/Canvas"
import { createBubbleController } from "../controllers/BubbleController"
import { createOctopusController } from "../controllers/OctopusController"
import { createCrabController } from "../controllers/CrabController"
import { createFishController } from "../controllers/FishController"
import { createDiverController, DiverController } from "../controllers/DiverController"
import { Game, SceneComponent } from "@/utils/game"
import { createCorgiController } from "../controllers/CorgiController"
import { createRopeController } from "../controllers/RopeController"
import { Component, Show } from "solid-js"
import { css, cva } from "@style/css"
import bg1 from '@public/bg-1.png'
import bg2 from '@public/bg-2.png'
import bg3 from '@public/bg-3.png'
import surface from '@public/surface.png'
import watch from '@public/watch.png'
import sand from '@public/sand.png'

export const OceanScene: SceneComponent = props => {
  const game = new Game({
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    controllers: {
      ...createDiverController('diver'),
      corgi: createCorgiController('corgi'),
      rope: createRopeController('rope', { x: -50 })
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

  return <Show when={props.active}>
    <Canvas
      debug={props.debug}
      game={game}
      overlay={<GameOverlay game={game} />}
      underlay={<GameUnderlay game={game} />}
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
      onClick={event => {
        game.addController(createBubbleController('bubble-click-' + Date.now(), event))
      }}
    />
  </Show>
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
      <div class={styles.equalisationBackground} />
      <div>Hold <div class={styles.key}>SPACE</div> to equalise</div>
      <div class={styles.equalisationBar}>
        <div style={{ '--percent': eqBar() }} />
      </div>
    </div>
  </>
}

const GameUnderlay: Component<{ game: Game }> = props => {
  return <div class={styles.surface} style={{
    'background-image': `url(${surface})`,
    'background-position-x': `${-props.game.canvas.x() / 10}px`
  }} />
}

const styles = {
  level: css({
    position: 'relative',
    backgroundRepeat: 'repeat-x',
    backgroundSize: '200px, 612px, 612px, 612px, cover',
    color: 'white',
    maxWidth: '100%',
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
      p: '0.5rem',
      textAlign: 'center',
    },
    variants: {
      warn: {
        true: {
          opacity: '1',
        },
      },
    },
  }),
  equalisationBackground: css({
      position: 'absolute',
      inset: '0',
      background: 'red',
      opacity: 0,
          animation: 'flash 1s ease-in-out infinite'
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

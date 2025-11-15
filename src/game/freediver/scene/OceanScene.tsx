import { Canvas } from "@/game/core/Canvas"
import { createBubbleController } from "../controllers/BubbleController"
import { createOctopusController } from "../controllers/OctopusController"
import { createCrabController } from "../controllers/CrabController"
import { createFishController } from "../controllers/FishController"
import { createDiverController, DiverController } from "../controllers/DiverController"
import { Game, SceneComponent } from "@/utils/game"
import { createCorgiController } from "../controllers/CorgiController"
import { createRopeController } from "../controllers/RopeController"
import { Component, createEffect, Show } from "solid-js"
import { css, cva } from "@style/css"
import bg1 from '@public/bg-1.png'
import bg2 from '@public/bg-2.png'
import bg3 from '@public/bg-3.png'
import surface from '@public/surface.png'
import sand from '@public/sand.png'
import { PauseMenu } from "../ui/PauseMenu"
import { Bar } from "../ui/Bar"
import { DivingWatch } from "../ui/DivingWatch"

export const OceanScene: SceneComponent = props => {
  const game = new Game({
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    setup: ($game: Game) => {
      $game.addController(...createDiverController('diver', {
        goToSurface: (speed: number) => {
          $game.reset()
          props.setScene('surface', { speed, })
        },
      }))
      $game.addController(createCorgiController('corgi', { mode: 'ocean' }))
      $game.addController(createRopeController('rope', { x: -50, mode: 'ocean' }))

      Array(10).fill(null).forEach((_, n) => {
        $game.addController(createFishController('fish-' + n, {
          x: Math.random() * 500 + 100,
          y: Math.random() * 500 + 100,
        }))
      })
    
      const crabs = Array(3).fill(null).map((_, n) => 
        createCrabController('crab-' + n, {
          x: Math.random() * 700,
        })
      ).sort((a, b) => a.data.y() - b.data.y())
      crabs.forEach(crab => $game.addController(crab))
    
      const octopi = Array(4).fill(null).map((_, n) => 
        createOctopusController('octopus-' + n, {
          x: Math.random() * 500 + 100,
          y: Math.random() * 500 + 100,
        })
      ).sort((a, b) => b.data.y() - a.data.y())
      octopi.forEach(octopus => $game.addController(octopus))
    }
  })

  createEffect(() => {
    game.setActive(props.active)
  })

  const exitToMenu = () => {
    game.reset()
    props.setScene('menu')
  }

  return <Show when={props.active}>
    <Canvas
      debug={props.debug}
      game={game}
      overlay={<GameOverlay game={game} exitToMenu={exitToMenu} />}
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
          ${-game.canvas().x()}px bottom,
          ${-game.canvas().x() / 2.5}px 85%,
          ${-game.canvas().x() / 2.0}px 85%,
          ${-game.canvas().x() / 1.5}px 85%,
          ${-game.canvas().x()}px bottom
        `,
      }}
      onClick={event => {
        if (!game.paused()) {
          game.addController(createBubbleController('bubble-click-' + Date.now(), event))
        }
      }}
    />
  </Show>
}

const GameOverlay: Component<{ game: Game, exitToMenu: () => void }> = props => {
  const depth = () => {
    const diver = props.game.getController<DiverController>('diver')
    if (!diver) return 0
    return diver.data.depth()
  }

  const eqWarn = () => {
    const diver = props.game.getController<DiverController>('diver')
    if (!diver) return false
    const { eqLevel, eqTolerance } = diver.data
    return eqLevel() > eqTolerance
  }

  const eqBar = () => {
    const diver = props.game.getController<DiverController>('diver')
    if (!diver) return 0
    const { holdSpace, holdSpaceMax } = diver.data
    return Math.min(100, holdSpace() / holdSpaceMax * 100)
  }

  return <>
    <DivingWatch depth={depth()} />
    <div class={styles.equalisation({ warn: eqWarn() })}>
      <div class={styles.equalisationBackground({ paused: props.game.paused() })} />
      <div>Hold <div class={styles.key}>SPACE</div> to equalise</div>
      <Bar percent={eqBar()} />
    </div>
    {props.game.paused() && <PauseMenu game={props.game} exitToMenu={props.exitToMenu} />}
  </>
}

const GameUnderlay: Component<{ game: Game }> = props => {
  return <div class={styles.surface} style={{
    'background-image': `url(${surface})`,
    'background-position-x': `${-props.game.canvas().x() / 10}px`
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
  equalisationBackground: cva({
    base: {
      position: 'absolute',
      inset: '0',
      background: 'red',
      opacity: 0,
      animation: 'flash 1s ease-in-out infinite'
    },
    variants: {
      paused: {
        true: {
          animationPlayState: 'paused',
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
}

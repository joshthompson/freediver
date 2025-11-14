import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { createEffect, Show } from "solid-js"
import { createDiverController } from "../controllers/DiverController"
import { css, cva } from "@style/css"
import { createCorgiController } from "../controllers/CorgiController"
import { createRopeController } from "../controllers/RopeController"
import { PauseMenu } from "../ui/PauseMenu"
import { DivingWatch } from "../ui/DivingWatch"
import { Bar } from "../ui/Bar"

export const SurfaceScene: SceneComponent = props => {
  const game = new Game({
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    setup($game: Game) {
      $game.addController(
        ...createDiverController('diver', {
          x: 0,
          y: 400,
          mode: 'surface',
        })
      )
      $game.addController(createCorgiController('corgi', {
        x: 70,
        y: 400,
        mode: 'surface',
      }))
      $game.addController(createRopeController('rope', {
        x: -40,
        y: 420,
        mode: 'surface',
      }))
    },
  })

  const exitToMenu = () => {
    game.reset()
    props.setScene('menu')
  }

  createEffect(() => {
    game.setActive(props.active)
  })

  const oxygen = () => game.getController('diver')?.data.oxygen() ?? 0

  createEffect(() => {
    if (oxygen() > 100) {
      props.setScene('ocean')
    }
  })
  
  return <Show when={props.active}>
    <Canvas
      debug={props.debug}
      game={game}
      class={styles.canvas}
      overlay={
        <>
          <DivingWatch depth={0} />
          <div class={styles.instructions}>Relax!<br />Once you are ready, tap SPACE to breathe in</div>
          <Bar percent={oxygen()} class={styles.bar({ show: oxygen() > 0 })} />
          <div class={styles.surfaceLayer} />
          {game.paused() && <PauseMenu game={game} exitToMenu={exitToMenu} />}
        </>
      }
    />
  </Show>
}

const styles = {
  canvas: css({
    backgroundImage: `linear-gradient(
      0deg,
      #399cdc 0%,
      #399cdc 70%,
      #c6fff8 70%,
      #aefff5 100%
    )`,
    backgroundSize: 'cover',
  }),
  instructions: css({
    p: '80px 20px',
    textAlign: 'center',
    fontSize: '32px',
  }),
  surfaceLayer: css({
    position: 'absolute',
    top: '55%',
    inset: '0',
    backgroundImage: `linear-gradient(
      0deg,
      #399cdcfc 70%,
      #399cdcee 80%,
      #399cdc00 90%
    )`,
    backgroundSize: 'cover',
  }),
  bar: cva({
    base: {
      m: 'auto',
      opacity: 0,
      transition: 'opacity 0.1s ease-in',
    },
    variants: {
      show: {
        true: {
          opacity: 1,
        },
      },
    },
  }),
}
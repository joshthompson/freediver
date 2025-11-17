import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { createEffect, onCleanup, useContext } from "solid-js"
import { css, cva } from "@style/css"
import { PauseMenu } from "../ui/PauseMenu"
import { DivingWatch } from "../ui/DivingWatch"
import { Bar } from "../ui/Bar"
import { createDiverSurfaceController } from "../controllers/DiverSurface"
import { createCorgiSurfaceController } from "../controllers/CorgiSurface"
import { GameStateContext } from "@/utils/GameStateContext"
import { LoadingScreen } from "../ui/LoadingScreen"
import { createBoatController } from "../controllers/BoatController"
import { createSignController } from "../controllers/SignController"

export const SurfaceScene: SceneComponent = props => {
  const [gameState, setGameState] = useContext(GameStateContext)!
  const game = new Game('surface', {
    gameState,
    setGameState,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    setup($game: Game) {
      $game.addController(
        createBoatController('boat'),
        createSignController('sign'),
        ...createDiverSurfaceController('diver-surface'),
        createCorgiSurfaceController('corgi-surface', {
          x: 200,
          y: 380,
        }),
      )
    },
  })
  onCleanup(() => game.destroy())

  const exitToMenu = () => {
    props.setScene('menu')
  }

  const oxygen = () => game.getController('diver-surface')?.data.oxygen() ?? 0

  createEffect(() => {
    if (oxygen() > 100) {
      setGameState('score', 'currentDive', 0)
      setGameState('diver', 'oxygen', 100)
      props.setScene('ocean')
    }
  })
  
  return <Canvas
    debug={game.gameState.options.debug}
    game={game}
    loading={LoadingScreen}
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
    p: '40px 20px',
    textAlign: 'center',
    fontSize: '32px',
  }),
  surfaceLayer: css({
    position: 'absolute',
    top: '55%',
    inset: '0',
    backgroundImage: `linear-gradient(
      0deg,
      #399cdcfc 65%,
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

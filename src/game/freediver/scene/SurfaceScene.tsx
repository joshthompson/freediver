import { Canvas } from "@/engine/components/Canvas"
import { Scene, SceneComponent } from "@/engine"
import { createEffect, onCleanup } from "solid-js"
import { css, cva } from "@style/css"
import { PauseMenu } from "../ui/PauseMenu"
import { Bar } from "../ui/Bar"
import { createDiverSurfaceController, DiverSurfaceBodyController } from "../controllers/surface/DiverSurface"
import { createCorgiSurfaceController } from "../controllers/surface/CorgiSurface"
import { useGameState } from "@/utils/GameStateContext"
import { LoadingScreen } from "../ui/LoadingScreen"
import { createBoatController } from "../controllers/surface/BoatController"
import { createSignController } from "../controllers/surface/SignController"
import { createCloudController } from "../controllers/surface/CloudController"
import { Translations } from "@/game/freediver/data/Translations"
import { alertAsset } from "@/assets"

export const SurfaceScene: SceneComponent = props => {
  const state = useGameState()!
  const game = new Scene('surface', {
    ...state,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      $scene.addController(
        createBoatController('boat'),
        createSignController('sign'),
        createDiverSurfaceController('diver-surface'),
        createCorgiSurfaceController('corgi-surface', {
          x: 200,
          y: 380,
        }),
        createCloudController('cloud-1', { x: -100, y: 50, flip: false, size: 1 }),
        createCloudController('cloud-2', { x: 100, y: 20, flip: false, size: 2 }),
        createCloudController('cloud-3', { x: 300, y: 30, flip: true, size: 0.8 }),
        createCloudController('cloud-4', { x: 500, y: 10, flip: true, size: 1.5 }),
      )
    },
    afterEnterFrames: ({ $scene }) => {
      const diver = $scene.getControllerById<DiverSurfaceBodyController>('diver-surface')
      // Center camera
      if (diver) {
        $scene.canvas.get().setX(diver.data.x() - $scene.canvas.get().width / 2 + diver.data.width() / 2)
        $scene.canvas.get().setX(diver.data.x() - $scene.canvas.get().width / 2 + diver.data.width() / 2 + 80)
      }
    },
    images: [alertAsset],
  })
  const t = () => Translations[game.gameState.options.locale]
  onCleanup(() => game.destroy())

  const exitToMenu = () => {
    props.setScene('menu')
  }

  const oxygen = () => game.getControllerById('diver-surface')?.data.oxygen() ?? 0

  createEffect(() => {
    if (oxygen() > 100) {
      state.setGameState('score', 'currentDive', 0)
      state.setGameState('diver', 'oxygen', 100)
      props.setScene(state.gameState.diver.level)
      game.gameStateActions.achievement('firstDive')
    }
  })
  
  return <Canvas
    debug={game.gameState.options.debug}
    scene={game}
    loading={LoadingScreen}
    class={styles.canvas}
    overlay={
      <>
        <div class={styles.instructions}>{t().surface.relax}<br />{t().surface.getReady}</div>
        <Bar percent={oxygen()} class={styles.bar({ show: oxygen() > 0 })} />
        <div class={styles.surfaceLayer} />
        {game.paused.get() && <PauseMenu scene={game} exitToMenu={exitToMenu} />}
      </>
    }
  />
}

const styles = {
  canvas: css({
    backgroundImage: `
      url(/src/assets/island.png),
      url(/src/assets/island-flip.png),
      linear-gradient(
        0deg,
        #399cdc 0%,
        #399cdc 60%,
        #2a7db3 70%,
        #c6fff8 70%,
        #3ea8ff 100%
      )
    `,
    backgroundSize: '200px, 200px, cover',
    backgroundPosition: '-20px 152px, 523px 152px, center',
    backgroundRepeat: 'no-repeat',
  }),
  instructions: css({
    position: 'relative',
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

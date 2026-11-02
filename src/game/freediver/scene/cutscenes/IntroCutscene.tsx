import { Canvas } from "@/engine/components/Canvas"
import { onCleanup } from "solid-js"
import { css } from "@style/css"
import { useGameState } from "@/utils/GameStateContext"
import { Translations } from "@/game/freediver/data/Translations"
import { Scene, SceneComponent } from "@/engine"

export const IntroCutscene: SceneComponent = () => {
  const { gameState, setGameState, gameStateActions } = useGameState()!
  const scene = new Scene('intro-cutscene', {
    gameState,
    setGameState,
    gameStateActions,
    width: 700,
    height: 700,
  })
  onCleanup(() => scene.destroy())
  const t = () => Translations[gameState.options.locale]

  return <Canvas
    scene={scene}
    overlay={<div class={styles.overlay} />}
  />
}

const styles = {
  overlay: css({
    width: '100%',
    height: '100%',
    inset: 0,
    background: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    fontSize: '50px',
    color: 'white',
  }),
}

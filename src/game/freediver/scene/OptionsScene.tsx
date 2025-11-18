import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup } from "solid-js"
import menu from '@assets/menu.png'
import { css } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"

export const OptionsScene: SceneComponent = props => {
  const state = useGameState()!
  const game = new Game('options', {
    ...state,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    images: [menu],
  })
  onCleanup(() => game.destroy())

  return <Canvas
    game={game}
    style={{ background: `url(${menu})` }}
    overlay={<div class={styles.overlay}>
      <div class={styles.options}>
        <div>
          <Button onClick={state.gameStateActions.toggleVolume}>
            Volume: { state.gameState.options.volume > 0 ? 'On' : 'Off' }
          </Button>
        </div>
        <div>
          <Button onClick={state.gameStateActions.clearScoreData}>
            Clear Score Data
          </Button>
          </div>
      </div>
      <Button onClick={() => props.setScene('menu')} size="small">Back</Button>
    </div>}
  />
}

const styles = {
  overlay: css({
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '5px',
    pb: '10px',
    fontSize: '20px',
  }),
  options: css({
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    fontSize: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  }),
}
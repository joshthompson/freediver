import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup } from "solid-js"
import { css } from "@style/css"
import { useGameState } from "@/utils/GameStateContext"
import { Button } from "../ui/Button"
import { Translations } from "@/game/freediver/data/Translations"

export const BlackoutScene: SceneComponent = props => {
  const { gameState, setGameState, gameStateActions } = useGameState()!
  const game = new Game('blackout', {
    gameState,
    setGameState,
    gameStateActions,
    width: 700,
    height: 700,
  })
  onCleanup(() => game.destroy())
  const t = () => Translations[gameState.options.locale]

  return <Canvas
    game={game}
    overlay={<div class={styles.overlay}>
      <div class={styles.text}>{t().blackout.youBlackedOut}</div>
      <div class={styles.button}><Button onClick={props.setScene('menu')}>
        {t().common.exitToMenu}
      </Button></div>
    </div>}
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

  text: css({
    animation: 'fadeIn 5s ease-in forwards',
  }),

  button: css({
    opacity: 0,
    animation: 'fadeIn 5s ease-in forwards',
    animationDelay: '3.5s',
  }),
}

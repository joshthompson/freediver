import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup, useContext } from "solid-js"
import { css } from "@style/css"
import { GameStateContext } from "@/utils/GameStateContext"
import { defineKeyframes } from "@pandacss/dev"
import { Button } from "../ui/Button"

export const BlackoutScene: SceneComponent = props => {
  const [gameState, setGameState] = useContext(GameStateContext)!
  const game = new Game('blackout', {
    gameState,
    setGameState,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
  })
  onCleanup(() => game.destroy())

  return <Canvas
    game={game}
    overlay={<div class={styles.overlay}>
      <div class={styles.text}>You blacked out</div>
      <div class={styles.button}><Button onClick={props.setScene('menu')}>Exit to menu</Button></div>
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

import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { Show } from "solid-js"
import menu from '@public/menu.png'
import { css } from "@style/css"
import { Button } from "../ui/Button"

export const MenuScene: SceneComponent = props => {
  const game = new Game({
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
  })
  return <Show when={props.active}>
    <Canvas
      game={game}
      style={{ background: `url(${menu})` }}
      overlay={<div class={styles.overlay}>
        <Button onClick={() => props.setScene('surface')}>Start</Button>
        <Button onClick={() => props.setScene('instructions')} size="small">Instructions</Button>
        <div class={styles.credits}>A game by Josh Thompson and Olesya Vasileva</div>
      </div>}
    />
  </Show>
}

const styles = {
  overlay: css({
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '10px',
    pb: '100px',
  }),
  credits: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    p: '10px',
  }),
}
import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { Show } from "solid-js"
import menu from '@public/menu.png'
import { css } from "@style/css"

export const MenuScene: SceneComponent<{ start: () => void }> = props => {
  const game = new Game({
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    controllers: {},
  })
  return <Show when={props.active}>
    <Canvas
      game={game}
      style={{ background: `url(${menu})` }}
      overlay={<div class={styles.overlay}>
        <button class={styles.button} onClick={props.start}>Start</button>
      </div>}
    />
  </Show>
}

const styles = {
  overlay: css({
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  button: css({
    background: '#FDD000',
    p:'7px 30px',
    borderRadius: '15px',
    border: '1px solid black',
    boxShadow: `
      inset 0 12px 3px -7px rgba(255, 255, 255, 0.8),
      inset 0 -3px 3px 0px rgba(0, 0, 0, 0.4)
    `,
    cursor: 'pointer',

    _active: {
      boxShadow: `
        inset 0 10px 3px -7px rgba(0, 0, 0, 0.4),
        inset 0 0px 6px 0px rgba(255, 255, 255, 0.8)
      `,
    }
  }),
}
import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { Show } from "solid-js"
import menu from '@public/menu.png'
import { css, cva } from "@style/css"
import { Button } from "../ui/Button"

export const InstructionsScene: SceneComponent = props => {
  const game = new Game({
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
  })
  return <Show when={props.active}>
    <Canvas
      game={game}
      style={{ background: `url(${menu})` }}
      overlay={<div class={styles.overlay}>
        <p>Dive and explore with your friend Linkosha the corgi</p>
        <div class={styles.keyboard}>
          <div class={styles.key({ key: 'up' })}>
            <div class={styles.keyName}>↑</div>
            <div class={styles.keyDescription}>Swim forward</div>
          </div>
          <div class={styles.key({ key: 'down' })}>
            <div class={styles.keyName}>↓</div>
            <div class={styles.keyDescription}>Swim backwards</div>
          </div>
          <div class={styles.key({ key: 'left' })}>
            <div class={styles.keyName}>←</div>
            <div class={styles.keyDescription}>Rotate left</div>
          </div>
          <div class={styles.key({ key: 'right' })}>
            <div class={styles.keyName}>→</div>
            <div class={styles.keyDescription}>Rotate right</div>
          </div>
          <div class={styles.key({ key: 'space' })}>
            <div class={styles.keyName}>Spacebar</div>
            <div class={styles.keyDescription}>Equalise air pressure</div>
          </div>
        </div>
        <Button onClick={() => props.setScene?.('menu')} size="small">Back</Button>
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
    gap: '5px',
    pb: '10px',
    fontSize: '20px',
  }),
  keyboard: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 70px)',
    gridTemplateRows: 'repeat(3, auto)',
    gap: '15px 10px',
    mb: '20px',
    '--key-size': '70px',
  }),
  key: cva({
    base: {
      position: 'relative',
      width: '100%',
      height: '70px',
      border: '2px solid black',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '30px',
      background: '#FFFACD',
      boxShadow: `
        inset 0 4px 0 rgba(255, 255, 255, 0.8),
        inset 0 -2px 0 rgba(0, 0, 0, 0.4)
      `,
    },
    variants: {
      key: {
        up: {
          gridColumn: '2',
          gridRow: '1',
        },
        down: {
          gridColumn: '2',
          gridRow: '2',
        },
        left: {
          gridColumn: '1',
          gridRow: '2',
        },
        right: {
          gridColumn: '3',
          gridRow: '2',
        },
        space: {
          gridColumn: '1 / span 3',
          gridRow: '4',
        },
      },
    },
  }),
  keyName: css({
    m: '20px',
  }),
  keyDescription: css({
    position: 'absolute',
    bottom: '-20px',
    fontSize: '14px',
    width: 'max-content',
    textAlign: 'center',
  }),
}
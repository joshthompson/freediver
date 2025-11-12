import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { Show } from "solid-js"
import menu from '@public/menu.png'
import { css, cva } from "@style/css"

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
        <button class={styles.button({ size: 'medium' })} onClick={props.start}>START</button>
        <button class={styles.button({ size: 'small' })}>INSTRUCTIONS</button>
        <button class={styles.button({ size: 'small' })}>SOMETHING ELSE?</button>
        <button class={styles.button({ size: 'small' })}>SOMETHING ELSE?</button>
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
  button: cva({
    base: {
      background: '#FDD000',
      p:'7px 30px',
      borderRadius: '15px',
      border: '1px solid black',
      fontSize: '26px',
      lineHeight: '110%',
      color: 'white',
      width: '180px',
      textShadow: `
        1px 1px 0 black,
        -1px 1px 0 black,
        1px -1px 0 black,
        -1px -1px 0 black
      `,
      boxShadow: `
        inset 0 12px 3px -7px rgba(255, 255, 255, 0.8),
        inset 0 -3px 3px 0px rgba(0, 0, 0, 0.4)
      `,
      cursor: 'pointer',
      transition: 'background 0.1s linear, padding 0.05s linear',

      _active: {
        boxShadow: `
          inset 0 10px 3px -7px rgba(0, 0, 0, 0.4),
          inset 0 0px 6px 0px rgba(255, 255, 255, 0.8)
        `,
        pt: '9px',
        pb: '5px',
      },

      _hover: {
        background: '#FDBA00',
      },
    },
    variants: {
      size: {
        medium: {},
        small: {
          fontSize: '22px',
          px: '15px',
        }
      },
    }
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
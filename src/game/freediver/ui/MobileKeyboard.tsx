import { Component } from "solid-js";
import { css, cva } from "@style/css";
import { useGameState } from "@/utils/GameStateContext";
import { Translations } from "@/game/freediver/data/Translations";
import { Key } from "@/engine";

export const MobileKeyboard: Component<{ scene: string}> = props => {
  const { gameState } = useGameState()!
  const t = () => Translations[gameState.options.locale]
  const emulate = (key: string) => {
    if (props.scene === 'surface' && key === ' ') Key.emulateKeydown(key, 50)
    else if (props.scene === 'ocean' && key === ' ') Key.emulateKeydown(key, 500)
    else Key.emulateKeydown(key, 300)
  }

  const pause = () => {
    window.dispatchEvent(new Event('pause-game'))
  }

  return <div class={styles.buttons}>
    <button class={styles.button({ key: 'left' })} onClick={() => emulate('ArrowLeft')}>←</button>
    <button class={styles.button({ key: 'right' })} onClick={() => emulate('ArrowRight')}>→</button>
    <button class={styles.button({ key: 'up' })} onClick={() => emulate('ArrowUp')}>↑</button>
    <button class={styles.button({ key: 'down' })} onClick={() => emulate('ArrowDown')}>↓</button>
    <button class={styles.button({ key: 'space' })} onClick={() => emulate(' ')}>{t().instructions.spacebar}</button>
    <button class={styles.button({ key: 'pause' })} onClick={() => pause()}>{t().instructions.pause}</button>
  </div>
}

const styles = {
  buttons: css({
    position: 'fixed',
    bottom: '1rem',
    left: '1rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    width: 'calc(100% - 2rem)',
    maxWidth: '600px',
  }),
  button: cva({
    base: {
      background: 'white',
      color: 'black',
      height: '50px',
      textTransform: 'uppercase',
      fontSize: '26px',
      width: '100%',
      userSelect: 'none',
    },
    variants: {
      key: {
        up: { gridColumn: '2', gridRow: '1' },
        down: { gridColumn: '2', gridRow: '2' },
        left: { gridColumn: '1', gridRow: '2' },
        right: { gridColumn: '3', gridRow: '2' },
        space: { gridColumn: '1 / span 3', gridRow: '3' },
        pause: { mt: '20px', gridColumn: '1 / span 3', gridRow: '4' },
      },
    },
  }),
}
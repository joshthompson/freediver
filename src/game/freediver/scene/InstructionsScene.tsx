import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup } from "solid-js"
import menu from '@assets/menu.png'
import { css, cva } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { Translations } from "@/utils/Translations"

export const InstructionsScene: SceneComponent = props => {
  const game = new Game('instructions', {
    ...useGameState()!,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    images: [menu],
  })
  onCleanup(() => game.destroy())
  const t = () => Translations[game.gameState.options.locale]

  return <Canvas
    game={game}
    style={{ background: `url(${menu})` }}
    overlay={<div class={styles.overlay}>
      <p class={styles.description}>{t().instructions.description}</p>
      <div class={styles.keyboard}>
        <div class={styles.key({ key: 'up' })}>
          <div class={styles.keyName}>↑</div>
          <div class={styles.keyDescription}>{t().instructions.up}</div>
        </div>
        <div class={styles.key({ key: 'down' })}>
          <div class={styles.keyName}>↓</div>
          <div class={styles.keyDescription}>{t().instructions.down}</div>
        </div>
        <div class={styles.key({ key: 'left' })}>
          <div class={styles.keyName}>←</div>
          <div class={styles.keyDescription}>{t().instructions.left}</div>
        </div>
        <div class={styles.key({ key: 'right' })}>
          <div class={styles.keyName}>→</div>
          <div class={styles.keyDescription}>{t().instructions.right}</div>
        </div>
        <div class={styles.key({ key: 'space' })}>
          <div class={styles.keyName}>{t().instructions.spacebar}</div>
          <div class={styles.keyDescription}>{t().instructions.space}</div>
        </div>
      </div>
      <Button onClick={() => props.setScene('menu')} size="small">{t().common.back}</Button>
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
  description: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    p: '40px 10px',
    textAlign: 'center',
    fontSize: '32px',
  }),
  keyboard: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 70px)',
    gridTemplateRows: 'repeat(3, auto)',
    gap: '20px 15px',
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
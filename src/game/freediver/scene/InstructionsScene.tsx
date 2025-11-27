import { Canvas } from "@/engine/components/Canvas"
import { Scene, SceneComponent } from "@/engine"
import { onCleanup } from "solid-js"
import { css, cva } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { Translations } from "@/game/freediver/data/Translations"
import { menu2Asset } from "@/assets"

export const InstructionsScene: SceneComponent = props => {
  const game = new Scene('instructions', {
    ...useGameState()!,
    width: 700,
    height: 700,
    images: [menu2Asset],
  })
  onCleanup(() => game.destroy())
  const t = () => Translations[game.gameState.options.locale]

  return <Canvas
    scene={game}
    style={{ background: `url(${menu2Asset})`, 'background-size': 'cover' }}
    overlay={<div class={styles.overlay}>
      <div class={styles.description}>
        <div>{t().instructions.description}</div>
      </div>
      <div class={styles.alternative}>
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
          <div class={styles.or}>{t().instructions.or}</div>
          <div class={styles.key({ key: 'w' })}>
            <div class={styles.keyName}>W</div>
            <div class={styles.keyDescription}>{t().instructions.up}</div>
          </div>
          <div class={styles.key({ key: 's' })}>
            <div class={styles.keyName}>S</div>
            <div class={styles.keyDescription}>{t().instructions.down}</div>
          </div>
          <div class={styles.key({ key: 'a' })}>
            <div class={styles.keyName}>A</div>
            <div class={styles.keyDescription}>{t().instructions.left}</div>
          </div>
          <div class={styles.key({ key: 'd' })}>
            <div class={styles.keyName}>D</div>
            <div class={styles.keyDescription}>{t().instructions.right}</div>
          </div>
          <div class={styles.key({ key: 'space' })}>
            <div class={styles.keyName}>{t().instructions.spacebar}</div>
            <div class={styles.keyDescription}>{t().instructions.space}</div>
          </div>
          <div class={styles.key({ key: 'escape' })}>
            <div class={styles.keyName}>ESC</div>
            <div class={styles.keyDescription}>{t().instructions.pause}</div>
          </div>
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
    gap: '50px',
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
  alternative: css({
    display: 'flex',
    gap: '10px',
  }),
  keyboard: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 70px)',
    gridTemplateRows: 'repeat(3, auto)',
    gap: '20px 15px',
    mb: '20px',
    '--key-size': '70px',
    background: '#00000090',
    borderRadius: '12px',
    color: 'white',
    p: '40px',
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
        up: { gridColumn: '2', gridRow: '1' },
        down: { gridColumn: '2', gridRow: '2' },
        left: { gridColumn: '1', gridRow: '2' },
        right: { gridColumn: '3', gridRow: '2' },
        w: { gridColumn: '6', gridRow: '1' },
        a: { gridColumn: '5', gridRow: '2' },
        s: { gridColumn: '6', gridRow: '2' },
        d: { gridColumn: '7', gridRow: '2' },
        space: { gridColumn: '1 / span 7', gridRow: '4' },
        escape: { gridColumn: '3 / span 3', gridRow: '5' },
      },
    },
  }),
  or: css({
    gridColumn: '4',
    gridRow: '1 / span 2',
    fontSize: '24px',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  }),
  keyName: css({
    m: '20px',
    color: 'black',
  }),
  keyDescription: css({
    position: 'absolute',
    bottom: '-20px',
    fontSize: '14px',
    width: 'max-content',
    textAlign: 'center',
  }),
}
import { boneAsset, statueSignAsset } from '@/assets'
import { createController } from '@/engine'
import { useGameState } from '@/utils/GameStateContext'
import { css, cva } from '@style/css'
import { Index } from 'solid-js'

// Sign by the statue showing how many bones have been delivered, hinting that more are needed
export function createStatueSignController(id: string, props: { x: number }) {
  const { gameState } = useGameState()!
  const total = () => gameState.questState.corgi.bones.length
  const delivered = () => gameState.questState.corgi.delivered

  return createController({
    frames: [statueSignAsset],
    init() {
      return {
        id,
        type: 'statue-sign',
        x: () => props.x,
        y: () => 690 - 230,
        width: () => 200,
        height: () => 230,
        children: () => <div class={styles.content}>
          <div class={styles.bones}>
            <Index each={Array(total())}>
              {(_, n) => <img src={boneAsset} class={styles.bone({ delivered: n < delivered() })} />}
            </Index>
          </div>
          <div class={styles.count}>{delivered()} / {total()}</div>
        </div>,
      }
    },
  })
}

const styles = {
  content: css({
    position: 'absolute',
    top: '28px',
    left: '24px',
    width: '152px',
    pointerEvents: 'none',
  }),
  bones: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '4px 6px',
  }),
  bone: cva({
    base: {
      width: '100%',
    },
    variants: {
      delivered: {
        false: {
          filter: 'brightness(0)',
          opacity: 0.3,
        },
      },
    },
  }),
  count: css({
    mt: '8px',
    textAlign: 'center',
    fontSize: '22px',
    color: '#5A3A1E',
  }),
}

import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import rope from '@assets/sprites/rope.png'
import { css } from '@style/css'
import { GameState } from '@/utils/GameStateContext'

export function createSignController(id: string) {
  const baseY = 240
  return createController({
    frames: [rope],
    init() {
      const [y, setY] = createSignal<number>(baseY)
      const [rotation, setRotation] = createSignal<number>(0)
      const [score, setScore] = createSignal<GameState['score']>({
        currentDive: 0,
        maxDive: 0,
        total: 0,
      })
      return {
        id,
        type: 'sign',
        x: () => -70,
        y,
        setY,
        rotation,
        setRotation,
        score,
        setScore,
        width: () => 170,
        origin: () => ({ x: 85, y: 200 }),
        children: () => <div class={styles.sign}>
          <div>Last Dive: {score().currentDive}</div>
          <div>Best Dive: {score().maxDive}</div>
          <div>Total Score: {score().total}</div>
        </div>,
      }
    },
    onEnterFrame({ $, $game, $age }) {
      $.setScore($game.gameState.score)
      const float = Math.cos(10 + $age / 10) * 2
      $.setY(baseY + float)
      $.setRotation(Math.sin(10 + $age / 50) * 3)
    }
  })
}

const styles = {
  sign: css({
    fontFamily: '"Rye", serif',
    position: 'absolute',
    top: '23px',
    right: '20px',
    left: '25px',
    height: '80px',
    // outline: '2px solid red',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    overflow: 'hidden',
    lineHeight: '0.6em',
    fontSize: '12px',
  }),
}
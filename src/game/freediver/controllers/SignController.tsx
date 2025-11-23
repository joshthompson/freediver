import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { css } from '@style/css'
import { GameState, useGameState } from '@/utils/GameStateContext'
import { Translations } from '@/utils/Translations'
import { ropeAsset } from '@/assets'

export function createSignController(id: string) {
  
  const baseY = 240
  return createController({
    frames: [ropeAsset],
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
        children: () => {
          const { gameState } = useGameState()!
          const t = () => Translations[gameState.options.locale]
          return <div class={styles.sign}>
            <div>{t().score.lastDive}: {score().currentDive}</div>
            <div>{t().score.bestDive}: {score().maxDive}</div>
            <div>{t().score.totalScore}: {score().total}</div>
          </div>
        },
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
    fontFamily: '"Snowstorm", serif',
    position: 'absolute',
    top: '23px',
    right: '20px',
    left: '25px',
    height: '80px',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    overflow: 'hidden',
    lineHeight: '0.6em',
    fontSize: '14px',
  }),
}
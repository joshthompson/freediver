import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup } from "solid-js"
import trophy from '@assets/sprites/trophy.png'
import { css, cva } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { Translations } from "@/utils/Translations"
import { Achievements } from "../ui/Achievements"

export const AchievementsScene: SceneComponent = props => {
  const state = useGameState()!
  const game = new Game('achievements', {
    ...state,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    images: [trophy],
  })
  onCleanup(() => game.destroy())
  const t = () => Translations[state.gameState.options.locale]

  return <Canvas
    game={game}
    overlay={<div class={styles.overlay}>
      <div class={styles.title}>{t().achievements.title}</div>
      <Achievements />
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
    backgroundImage: `linear-gradient(
      0deg,
      #399cdc 0%,
      #399cdc 20%,
      #c6fff8 50%,
      #3ea8ff 100%
    )`,
  }),
  title: css({
    fontSize: '2rem',
    my: '20px -20px'
  }),
}
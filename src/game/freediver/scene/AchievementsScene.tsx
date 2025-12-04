import { Canvas } from "@/engine/components/Canvas"
import { onCleanup } from "solid-js"
import { css } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { Translations } from "@/game/freediver/data/Translations"
import { Achievements } from "../ui/Achievements"
import { menu2Asset, trophyAsset } from "@/assets"
import { Scene, SceneComponent } from "@/engine"

export const AchievementsScene: SceneComponent = props => {
  const state = useGameState()!
  const game = new Scene('achievements', {
    ...state,
    width: 700,
    height: 700,
    images: [trophyAsset, menu2Asset],
  })
  onCleanup(() => game.destroy())
  const t = () => Translations[state.gameState.options.locale]

  return <Canvas
    scene={game}
    style={{ background: `url(${menu2Asset})`, 'background-size': 'cover' }}
    overlay={<div class={styles.overlay}>
      <div class={styles.title}>{t().achievements.title}</div>
      <div class={styles.achievements}><Achievements /></div>
      <div class={styles.spacer} />
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
  title: css({
    fontSize: '2rem',
    my: '20px -20px'
  }),
  achievements: css({
    overflowY: 'auto',
    p: '20px',
  }),
  spacer: css({
    flexGrow: 1,
  }),
}
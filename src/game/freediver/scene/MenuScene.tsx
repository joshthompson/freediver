import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup } from "solid-js"
import menu from '@assets/menu.png'
import { css } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { flags, translations } from "@/utils/Translations"

export const MenuScene: SceneComponent = props => {
  const game = new Game('menu', {
      ...useGameState()!,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    images: [menu],
  })
  onCleanup(() => game.destroy())
  const t = () => translations[game.gameState.options.locale]

  return <Canvas
    game={game}
    style={{ background: `url(${menu})` }}
    overlay={<div class={styles.overlay}>
      <img
      src={flags[game.gameState.options.locale]}
      class={styles.flag}
      onClick={game.gameStateActions.toggleLanguage}
    />
      <Button onClick={() => props.setScene('surface')}>{t().menu.start}</Button>
      <Button onClick={() => props.setScene('instructions')} size="small">{t().menu.instructions}</Button>
      <Button onClick={() => props.setScene('options')} size="small">{t().menu.options}</Button>
      <div class={styles.credits}>{t().menu.credits}</div>
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
    gap: '10px',
    pb: '100px',
  }),
  credits: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    p: '10px',
  }),
  flag: css({
    position: 'absolute',
    top: '10px',
    right: '10px',
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    border: '2px solid white',
    cursor: 'pointer',
  }),
}

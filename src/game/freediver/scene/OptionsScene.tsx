import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup } from "solid-js"
import menu1 from '@assets/menu1.png'
import { css } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { Translations } from "@/utils/Translations"
import { Options } from "../ui/Options"

export const OptionsScene: SceneComponent = props => {
  const state = useGameState()!
  const game = new Game('options', {
    ...state,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    images: [menu1],
  })
  onCleanup(() => game.destroy())
  const t = () => Translations[state.gameState.options.locale]

  return <Canvas
    game={game}
    style={{ background: `url(${menu1})`, 'background-size': 'cover' }}
    overlay={<div class={styles.overlay}>
      <div class={styles.options}>
        <Options mode="menu" />
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
  options: css({
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    fontSize: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  }),
}
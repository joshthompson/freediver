import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup } from "solid-js"
import menu from '@assets/menu.png'
import { css } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { flags, languageNames, Translations } from "@/utils/Translations"

export const OptionsScene: SceneComponent = props => {
  const state = useGameState()!
  const game = new Game('options', {
    ...state,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    images: [menu],
  })
  onCleanup(() => game.destroy())
  const t = () => Translations[state.gameState.options.locale]

  return <Canvas
    game={game}
    style={{ background: `url(${menu})` }}
    overlay={<div class={styles.overlay}>
      <div class={styles.options}>
        <div>
          <Button onClick={state.gameStateActions.toggleVolume}>
            {state.gameState.options.volume > 0
              ? t().common.volumeOn
              : t().common.volumeOff}
          </Button>
        </div>
        <div>
          <Button onClick={state.gameStateActions.clearScoreData}>
            {t().options.clearScoreData}
          </Button>
        </div>
        <div>
          <Button onClick={state.gameStateActions.clearAchievements}>
            {t().options.clearAchievements}
          </Button>
        </div>
        <div>
          <Button onClick={state.gameStateActions.toggleLanguage}>
            <div class={styles.localePicker}>
              {languageNames[state.gameState.options.locale]}
              <img src={flags[state.gameState.options.locale]} class={styles.flag} />
            </div>
          </Button>
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
  localePicker: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }),
  flag: css({
    height: '1.5rem',
    width: '1.5rem',
    borderRadius: '50%',
    border: '2px solid white',
    mr: '-10px'
  }),
}
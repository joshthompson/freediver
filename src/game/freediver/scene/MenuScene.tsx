import { Canvas } from "@/engine/components/Canvas"
import { Scene, SceneComponent } from "@/engine"
import { onCleanup } from "solid-js"
import { css } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { LocaleFlags, Translations } from "@/game/freediver/data/Translations"
import { alertAsset, logoAlisaAsset, logoAlisaRuAsset, logoFreediverAsset, logoFreediverRuAsset, menu1Asset } from "@/assets"

export const MenuScene: SceneComponent = props => {
  const game = new Scene('menu', {
      ...useGameState()!,
    width: 700,
    height: 700,
    images: [
      menu1Asset,
      logoAlisaAsset,
      logoFreediverAsset,
      logoAlisaRuAsset,
      logoFreediverRuAsset,
      alertAsset,
    ],
  })
  onCleanup(() => game.destroy())
  const locale = () => game.gameState.options.locale
  const t = () => Translations[locale()]

  return <Canvas
    scene={game}
    style={{ background: `url(${menu1Asset})`, 'background-size': 'cover' }}
    overlay={<div class={styles.overlay}>
      <div  class={styles.logo}>
        <img src={locale() === 'ru' ? logoAlisaRuAsset : logoAlisaAsset} class={styles.logoTop} />
        <img src={locale() === 'ru' ? logoFreediverRuAsset : logoFreediverAsset} class={styles.logoBottom} />
      </div>
      <img
        src={LocaleFlags[game.gameState.options.locale]}
        class={styles.flag}
        onClick={game.gameStateActions.toggleLanguage}
      />
      <Button onClick={() => props.setScene('surface')}>
        {game.gameState.score.total > 0 ? t().menu.continue : t().menu.start}
      </Button>
      <Button onClick={() => props.setScene('instructions')} size="small">{t().menu.instructions}</Button>
      <Button onClick={() => props.setScene('achievements')} size="small">{t().achievements.title}</Button>
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
    pb: '75px',
  }),
  credits: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    p: '10px',
    color: 'white',
  }),
  logo: css({
    position: 'absolute',
    width: '300px',
    top: '20px',
    right: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  }),
  logoTop: css({
    width: '100%',
    filter: 'drop-shadow(2px 4px 0 black)',
  }),
  logoBottom: css({
    width: '80%',
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

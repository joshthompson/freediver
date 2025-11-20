import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { onCleanup } from "solid-js"
import menu1 from '@assets/menu1.png'
import logoAlisa from '@assets/logo-alisa.png'
import logoFreediver from '@assets/logo-freediver.png'
import logoAlisaRu from '@assets/logo-alisa-ru.png'
import logoFreediverRu from '@assets/logo-freediver-ru.png'
import { css } from "@style/css"
import { Button } from "../ui/Button"
import { useGameState } from "@/utils/GameStateContext"
import { LocaleFlags, Translations } from "@/utils/Translations"

export const MenuScene: SceneComponent = props => {
  const game = new Game('menu', {
      ...useGameState()!,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    images: [
      menu1,
      logoAlisa,
      logoFreediver,
      logoAlisaRu,
      logoFreediverRu,
    ],
  })
  onCleanup(() => game.destroy())
  const locale = () => game.gameState.options.locale
  const t = () => Translations[locale()]

  return <Canvas
    game={game}
    style={{ background: `url(${menu1})`, 'background-size': 'cover' }}
    overlay={<div class={styles.overlay}>
      <div  class={styles.logo}>
        <img src={locale() === 'ru' ? logoAlisaRu : logoAlisa} class={styles.logoTop} />
        <img src={locale() === 'ru' ? logoFreediverRu : logoFreediver} class={styles.logoBottom} />
      </div>
      <img
        src={LocaleFlags[game.gameState.options.locale]}
        class={styles.flag}
        onClick={game.gameStateActions.toggleLanguage}
      />
      <Button onClick={() => props.setScene('surface')}>{t().menu.start}</Button>
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

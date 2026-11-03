import { Canvas } from '@/engine/components/Canvas'
import { Scene, SceneComponent } from '@/engine'
import { createSignal, onCleanup } from 'solid-js'
import { css } from '@style/css'
import { Button } from '../ui/Button'
import { useGameState } from '@/utils/GameStateContext'
import { LocaleFlags, Translations } from '@/game/freediver/data/Translations'
import { alertAsset, menu1Asset } from '@/assets'
import { Logo } from '../ui/Logo'

export const MenuScene: SceneComponent = props => {
  const scene = new Scene('menu', {
      ...useGameState()!,
    width: 700,
    height: 700,
    images: [
      menu1Asset,
      alertAsset,
    ],
  })
  onCleanup(() => scene.destroy())
  const locale = () => scene.gameState.options.locale
  const t = () => Translations[locale()]

  // Multiplayer needs the internet, though the rest of the game works offline
  const [online, setOnline] = createSignal(navigator.onLine)
  const updateOnline = () => setOnline(navigator.onLine)
  window.addEventListener('online', updateOnline)
  window.addEventListener('offline', updateOnline)
  onCleanup(() => {
    window.removeEventListener('online', updateOnline)
    window.removeEventListener('offline', updateOnline)
  })

  return <Canvas
    scene={scene}
    style={{ background: `url(${menu1Asset})`, 'background-size': 'cover' }}
    overlay={<div class={styles.overlay}>
      <Logo class={styles.logo} />
      <img
        src={LocaleFlags[scene.gameState.options.locale]}
        class={styles.flag}
        onClick={scene.gameStateActions.toggleLanguage}
      />
      <Button onClick={() => scene.gameState.diver.level === 'kingdom'
        ? props.setScene('kingdom', 'portal') // Left partway through a Crystal Realm
        : props.setScene('surface')}>
        {scene.gameState.score.total > 0 ? t().menu.continue : t().menu.start}
      </Button>
      <Button onClick={() => props.setScene('lobby')} size="small" disabled={!online()}>
        {online() ? t().menu.multiplayer : t().multiplayer.needsInternet}
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
    top: '50px',
    right: '50px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  }),
  flag: css({
    position: 'absolute',
    top: '10px',
    left: '10px',
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    border: '2px solid white',
    cursor: 'pointer',
    boxShadow: '2px 2px 4px #00000050',
    transition: 'scale 0.1s ease-in-out',

    _hover: {
      scale: 1.1,
    }
  }),
}

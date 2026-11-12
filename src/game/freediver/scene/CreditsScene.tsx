import { For, onCleanup, onMount } from 'solid-js'
import { css } from '@style/css'
import { Canvas } from '@/engine/components/Canvas'
import { Scene, SceneComponent } from '@/engine'
import { useGameState } from '@/utils/GameStateContext'
import { Translations } from '@/game/freediver/data/Translations'
import { kingdomCrownAsset, linkDialogAsset } from '@/assets'
import { music } from '../music/music'

const duration = 30

const cast = [
  'Linkosha',
  'Alisa the Freediver',
  'The Corgi King',
  'Wanda the Cow',
  'Manny the Manatee',
  'Cosmo the Space Corgi',
  'Captain Chum',
  'Yolko the Eggy Corgi',
  'Judge Fathom',
  'Ember',
  'The Scrambled Egg Monster',
  'The Devil Corgi Fish',
]

const makers = ['Josh Thompson', 'Olesia Vasileva']

// Rolls once the Corgi King's quest is done, then takes you back to the Corgi Kingdom
export const CreditsScene: SceneComponent = props => {
  const { gameState, setGameState, gameStateActions } = useGameState()!
  const scene = new Scene('credits', {
    gameState,
    setGameState,
    gameStateActions,
    width: 700,
    height: 700,
    images: [linkDialogAsset, kingdomCrownAsset],
  })
  const t = () => Translations[gameState.options.locale]
  music.play('credits')
  onCleanup(() => music.stop('credits'))

  let done = false
  const finish = () => {
    if (done) return
    done = true
    props.setScene('kingdom', 'portal')
  }
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ') finish()
  }
  onMount(() => window.addEventListener('keydown', handleKeyDown))
  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown)
    scene.destroy()
  })

  return <Canvas
    scene={scene}
    class={styles.canvas}
    onClick={finish}
    overlay={<>
      <div class={styles.roll} style={{ '--duration': `${duration}s` }} onAnimationEnd={finish}>
        <div class={styles.portrait}>
          <img src={linkDialogAsset} class={styles.link} />
          <img src={kingdomCrownAsset} class={styles.crown} />
        </div>
        <div class={styles.heading}>{t().credits.newKing}</div>
        <div class={styles.subheading}>{t().credits.cast}</div>
        <For each={cast}>{name => <div class={styles.name}>{name}</div>}</For>
        <div class={styles.subheading}>{t().credits.madeBy}</div>
        <For each={makers}>{name => <div class={styles.name}>{name}</div>}</For>
        <div class={styles.heading}>{t().credits.thanks}</div>
      </div>
      <div class={styles.skip}>{t().credits.skip}</div>
    </>}
  />
}

const styles = {
  canvas: css({
    background: 'linear-gradient(180deg, #2A5853 0%, #0E262C 60%, #07161B 100%) !important',
    color: 'white',
  }),
  roll: css({
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'center',
    textShadow: '2px 2px 4px #000',
    animation: 'creditsRoll var(--duration) linear forwards',
  }),
  portrait: css({
    position: 'relative',
    width: '160px',
    height: '160px',
    mb: '1rem',
  }),
  link: css({
    width: '100%',
    height: '100%',
  }),
  crown: css({
    position: 'absolute',
    top: '-30px',
    left: '50%',
    width: '80px',
    translate: '-50% 0',
    rotate: '-8deg',
  }),
  heading: css({
    fontSize: '3rem',
    my: '2rem',
  }),
  subheading: css({
    fontSize: '2rem',
    mt: '2rem',
    color: '#FDD000',
  }),
  name: css({
    fontSize: '1.6rem',
  }),
  skip: css({
    position: 'absolute',
    bottom: '10px',
    right: '16px',
    fontSize: '1rem',
    opacity: 0.6,
  }),
}

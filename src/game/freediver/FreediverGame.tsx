import { Component, createEffect, createSignal, For, Show } from 'solid-js'
import { css, cva } from '@style/css'
import { OceanScene } from './scene/OceanScene'
import { SurfaceScene } from './scene/SurfaceScene'
import { MenuScene } from './scene/MenuScene'
import { InstructionsScene } from './scene/InstructionsScene'
import { playSound } from '@/utils/game'
import ocean1 from '@assets/sounds/ocean1.mp3'
import alert from '@assets/sprites/alert.png'
import gift from '@assets/sprites/gift.png'
import { createStore } from 'solid-js/store'
import { Achievement, AchievementsRecord, GameState, GameStateContext } from '@/utils/GameStateContext'
import { BlackoutScene } from './scene/BlackoutScene'
import { OptionsScene } from './scene/OptionsScene'
import { Translations } from '@/utils/Translations'
import { AchievementsScene } from './scene/AchievementsScene'

const local = window.location.hostname === 'localhost'

export const FreediverGame: Component = () => {
  const savedGameState = JSON.parse(window.localStorage.getItem('game-state') ?? '{}')
  const [gameState, setGameState] = createStore<GameState>({
    score: {
      currentDive: 0,
      total: savedGameState?.score?.total ?? 0,
      maxDive: savedGameState?.score?.maxDive ?? 0,
    },
    diver: {
      x: 0,
      oxygen: 100,
      showDamage: false,
      showHeal: false,
    },
    options: {
      debug: local,
      locale: savedGameState?.locale ?? 'en',
      volume: savedGameState?.volume ?? 1,
    },
    achievements:
      Object.fromEntries(
        Object.entries((savedGameState?.achievements ?? {}) as AchievementsRecord)
          .map(([key, value]) => [key as Achievement, value === 'new' ? 'shown' : value])
      ),
    showGift: false,
  })
  const t = () => Translations[gameState.options.locale]

  const [scene, _setScene] = createSignal<string>(local ? 'menu' : 'menu')
  const setScene = (newScene: string) => {
    if (['ocean', 'surface'].includes(newScene) && !music()) {
      startMusic()
    }
    if (newScene === 'menu' && music()) {
      music()!.pause()
      music()!.remove()
      setMusic(undefined)
    }
    _setScene(newScene)
  }

  const [music, setMusic] = createSignal<HTMLAudioElement | undefined>(undefined)
  const startMusic = () => {
    setMusic(playSound(ocean1, { loop: true, mute: gameState.options.volume === 0 }))
  }

  const newAchievement = () => {
    return Object.entries(gameState.achievements)
      .filter(([, state]) => state === 'new')
      .map(([achievement]) => achievement) as Achievement[]
  }

  createEffect(() => {
    if (gameState.showGift) {
      setTimeout(() => setGameState('showGift', false), 2000)
    }
  })

  return (
    <GameStateContext.Provider value={[gameState, setGameState]}>
      <div class={styles.page({ locale: gameState.options.locale })}>
        {scene() === 'menu' && <MenuScene setScene={setScene} />}
        {scene() === 'instructions' && <InstructionsScene setScene={setScene} />}
        {scene() === 'options' && <OptionsScene setScene={setScene} />}
        {scene() === 'achievements' && <AchievementsScene setScene={setScene} />}
        {scene() === 'surface' && <SurfaceScene setScene={setScene} />}
        {scene() === 'ocean' && <OceanScene setScene={setScene} />}
        {scene() === 'blackout' && <BlackoutScene setScene={setScene} />}
        {newAchievement().length > 0 && <div class={styles.achievements}>
          <For each={newAchievement()}>
            {achievement => (<div class={styles.achievement} style={{ 'background-image': `url(${alert})` }}>
            <div class={styles.achievementInner}>
              <small>{t().achievements.new}</small>
              <div>{t().achievements[achievement]}</div>
            </div>
          </div>)}
          </For>
        </div>}
        <Show when={gameState.showGift}>
          <div class={styles.gift} style={{ 'background-image': `url(${gift})`}} />
        </Show>
      </div>
    </GameStateContext.Provider>
  )
}

const styles = {
  page: cva({
    base: {
      '--u': 'min(1dvh, 1dvw)',
      '--size': 'calc(80 * var(--u))',
      width: '700px',
      m: '20px auto',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      fontFamily: '"Jersey 10", sans-serif',
    },
    variants: {
      locale: {
        en: {},
        ru: {
          fontFamily: '"Tiny5", sans-serif',
        },
        sv: {},
      },
    }
  }),
  achievements: css({
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  }),
  achievement: css({
    height: '100px',
    aspectRatio: '1323 / 510',
    backgroundSize: 'cover',
    p: '25px 35px 30px 35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  achievementInner: css({
    rotate: '-1deg',
    maxHeight: '90px',
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: '26px',
    lineHeight: '0.7em',
  }),
  gift: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    filter: 'drop-shadow(0 0 30px #FFFFFF) drop-shadow(0 0 30px #FFFFFF)',
    width: '150px',
    height: '150px',
    backgroundImage: 'url(/assets/sprites/gift.png)',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
    animation: 'gift 2s ease-in forwards',
  }),
}

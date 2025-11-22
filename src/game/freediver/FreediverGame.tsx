import { Component, createMemo, createSignal, For } from 'solid-js'
import { css, cva } from '@style/css'
import { OceanScene } from './scene/OceanScene'
import { SurfaceScene } from './scene/SurfaceScene'
import { MenuScene } from './scene/MenuScene'
import { InstructionsScene } from './scene/InstructionsScene'
import { isMobileBrowser, playSound } from '@/utils/game'
import { createStore } from 'solid-js/store'
import { Achievement, AchievementsRecord, GameState, GameStateContext } from '@/utils/GameStateContext'
import { BlackoutScene } from './scene/BlackoutScene'
import { OptionsScene } from './scene/OptionsScene'
import { Translations } from '@/utils/Translations'
import { AchievementsScene } from './scene/AchievementsScene'
import { MobileKeyboard } from './ui/MobileKeyboard'
import { alertAsset, musicSound } from '@/assets'

const local = window.location.hostname === 'localhost'

export const FreediverGame: Component = () => {
  const savedGameState = JSON.parse(window.localStorage.getItem('game-state') ?? '{}')
  const [windowWidth, setWindowWidth] = createSignal(window.innerWidth)
  const zoom = createMemo(() => windowWidth() < 700 ? windowWidth() / 700 : 1)

  const [gameState, setGameState] = createStore<GameState>({
    score: {
      currentDive: 0,
      total: savedGameState?.score?.total ?? 0,
      maxDive: savedGameState?.score?.maxDive ?? 0,
    },
    diver: {
      x: savedGameState?.diver?.x ?? 0,
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
  })
  const t = () => Translations[gameState.options.locale]

  const [scene, _setScene] = createSignal<string>(local ? 'ocean' : 'menu')
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
    setMusic(playSound(musicSound, { loop: true, mute: gameState.options.volume === 0 }))
  }

  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth)
  })

  const newAchievement = () => {
    return Object.entries(gameState.achievements)
      .filter(([, state]) => state === 'new')
      .map(([achievement]) => achievement) as Achievement[]
  }

  return (
    <GameStateContext.Provider value={[gameState, setGameState]}>
      <div class={styles.page({ locale: gameState.options.locale })} style={{ transform: `scale(${zoom()})`}}>
        {scene() === 'menu' && <MenuScene setScene={setScene} />}
        {scene() === 'instructions' && <InstructionsScene setScene={setScene} />}
        {scene() === 'options' && <OptionsScene setScene={setScene} />}
        {scene() === 'achievements' && <AchievementsScene setScene={setScene} />}
        {scene() === 'surface' && <SurfaceScene setScene={setScene} />}
        {scene() === 'ocean' && <OceanScene setScene={setScene} />}
        {scene() === 'blackout' && <BlackoutScene setScene={setScene} />}
        {newAchievement().length > 0 && <div class={styles.achievements}>
          <For each={newAchievement()}>
            {achievement => (<div class={styles.achievement} style={{ 'background-image': `url(${alertAsset})` }}>
            <div class={styles.achievementInner}>
              <small>{t().achievements.new}</small>
              <div>{t().achievements[achievement]}</div>
            </div>
          </div>)}
          </For>
        </div>}
      </div>
      {isMobileBrowser() && <MobileKeyboard scene={scene()} />}
    </GameStateContext.Provider>
  )
}

const styles = {
  page: cva({
    base: {
      '--u': 'min(1dvh, 1dvw)',
      '--size': 'calc(80 * var(--u))',
      width: '700px',
      m: '0 auto',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      fontFamily: '"Jersey 10", sans-serif',
      transformOrigin: 'top left',

      md: {
        m: '20px auto',
      }
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
}

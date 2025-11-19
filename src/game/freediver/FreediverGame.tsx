import { Component, createSignal } from 'solid-js'
import { css, cva } from '@style/css'
import { OceanScene } from './scene/OceanScene'
import { SurfaceScene } from './scene/SurfaceScene'
import { MenuScene } from './scene/MenuScene'
import { InstructionsScene } from './scene/InstructionsScene'
import { playSound } from '@/utils/game'
import ocean1 from '@assets/sounds/ocean1.mp3'
import { createStore } from 'solid-js/store'
import { Achievement, GameState, GameStateContext, saveState } from '@/utils/GameStateContext'
import { BlackoutScene } from './scene/BlackoutScene'
import { OptionsScene } from './scene/OptionsScene'
import alert from '@assets/sprites/alert.png'
import { Translations } from '@/utils/Translations'
import { AchievementsScene } from './scene/AchievementsScene'

const local = window.location.hostname === 'localhost'

export const FreediverGame: Component = () => {
  const savedGameState = JSON.parse(window.localStorage.getItem('game-state') ?? '{}')
  const [gameState, setGameState] = createStore<GameState>({
    score: savedGameState?.score ?? {
      total: 0,
      currentDive: 0,
      maxDive: 0,
    },
    diver: {
      x: 0,
      oxygen: 100,
      showDamage: false,
    },
    options: {
      locale: savedGameState?.locale ?? 'en',
      debug: local,
      volume: savedGameState?.volume ?? 1,
    },
    achievements: savedGameState?.achievements ?? {},
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

  const achievementDuration = 5000
  const newAchievement = () => {
    const achievement = Object.entries(gameState.achievements)
      .find(([, state]) => state === 'new')?.[0] as Achievement | undefined
    if (achievement) {
      setTimeout(() => {
        setGameState('achievements', achievement, 'shown')
        saveState(gameState)
      }, achievementDuration)
    }
    return achievement
  }

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
        {newAchievement() && <>
          <div class={styles.achievement} style={{ 'background-image': `url(${alert})` }}>
            <div class={styles.achievementInner}>
              <small>{t().achievements.new}</small>
              <div>{(t().achievements as any)[newAchievement()!]}</div>
            </div>
          </div>
        </>}
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
      mx: 'auto',
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
  achievement: css({
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    width: '288px',
    height: '100px',
    backgroundSize: 'cover',
    p: '25px 35px 30px 35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 0 5px white) drop-shadow(0 0 100px #FFFFFF88)',
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

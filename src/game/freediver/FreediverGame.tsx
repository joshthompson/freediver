import { Component, createMemo, createSignal, For } from 'solid-js'
import { css, cva } from '@style/css'
import { OceanScene } from './scene/OceanScene'
import { SurfaceScene } from './scene/SurfaceScene'
import { MenuScene } from './scene/MenuScene'
import { InstructionsScene } from './scene/InstructionsScene'
import { isMobileBrowser, playSound } from '@/utils/game'
import { createStore } from 'solid-js/store'
import { GameState, GameStateContext, initialState, setGameStateWithSaveWrapper } from '@/utils/GameStateContext'
import { BlackoutScene } from './scene/BlackoutScene'
import { OptionsScene } from './scene/OptionsScene'
import { Translations } from '@/game/freediver/data/Translations'
import { AchievementsScene } from './scene/AchievementsScene'
import { MobileKeyboard } from './ui/MobileKeyboard'
import { alertAsset, musicSound } from '@/assets'
import { Achievement } from '@/game/freediver/data/Achievements'
import { CaveScene } from './scene/CaveScene'

const testScene = 'menu'
const fadeScenes = ['ocean', 'surface', 'cave']
const fadeDuration = 300

export const FreediverGame: Component = () => {
  const [windowWidth, setWindowWidth] = createSignal(window.innerWidth)
  const zoom = createMemo(() => windowWidth() < 700 ? windowWidth() / 700 : 1)

  const [gameState, _setGameState] = createStore<GameState>(initialState())

  const setGameState = setGameStateWithSaveWrapper(gameState, _setGameState)

  const t = () => Translations[gameState.options.locale]

  const [scene, _setScene] = createSignal<string>(import.meta.env.DEV ? testScene : 'menu')
  const [sceneMode, setSceneMode] = createSignal<string | undefined>(undefined)
  const [sceneFade, setSceneFade] = createSignal<'in' | 'out' | undefined>(undefined)
  const setScene = (newScene: string, mode?: string) => {
    const fadeOut = fadeScenes.includes(newScene) ? fadeDuration : 0
    const fadeIn = fadeScenes.includes(scene()) ? fadeDuration : 0
    
    if (['ocean', 'surface'].includes(newScene) && !music()) {
      startMusic()
    }
    if (newScene === 'menu' && music()) {
      music()!.pause()
      music()!.remove()
      setMusic(undefined)
    }

    setSceneFade('out')
    setTimeout(() => {
      setSceneFade('in')
      setSceneMode(mode)
      _setScene(newScene)
      setTimeout(() => setSceneFade(undefined), fadeIn)
    }, fadeOut)
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
      <div
        class={styles.page({ fade: sceneFade() })}
        style={{ transform: `scale(${zoom()})`, '--fade-duration': `${fadeDuration}ms` }}
      >
        {scene() === 'menu' && <MenuScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'instructions' && <InstructionsScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'options' && <OptionsScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'achievements' && <AchievementsScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'surface' && <SurfaceScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'ocean' && <OceanScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'cave' && <CaveScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'blackout' && <BlackoutScene setScene={setScene} mode={sceneMode()} />}
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
      fontFamily: '"Snowstorm", sans-serif',
      transformOrigin: 'top left',
  
      md: {
        m: '20px auto',
      }
    },
    variants: {
      fade: {
        in: {
          animation: `fadeIn var(--fade-duration) ease-in-out forwards`,
          opacity: '1',
        },
        out: {
          animation: `fadeOut var(--fade-duration) ease-in-out forwards`,
          opacity: '0',
        },
        undefined: {}
      },
    },
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

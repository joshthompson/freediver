import { Component, createMemo, createSignal } from 'solid-js'
import { cva } from '@style/css'
import { OceanScene } from './scene/OceanScene'
import { SurfaceScene } from './scene/SurfaceScene'
import { MenuScene } from './scene/MenuScene'
import { InstructionsScene } from './scene/InstructionsScene'
import { isMobileBrowser, playSound } from '@/utils/game'
import { createStore } from 'solid-js/store'
import { GameState, GameStateContext, initialState, setGameStateWithSaveWrapper } from '@/utils/GameStateContext'
import { BlackoutScene } from './scene/BlackoutScene'
import { OptionsScene } from './scene/OptionsScene'
import { AchievementsScene } from './scene/AchievementsScene'
import { MobileKeyboard } from './ui/MobileKeyboard'
import { musicSound } from '@/assets'
import { AchievementPopups } from './ui/AchievementPopups'
import { CaveScene } from './scene/CaveScene'
import { KingdomScene } from './scene/KingdomScene'
import { CreditsScene } from './scene/CreditsScene'
import { Dynamic } from 'solid-js/web'
import { SceneComponent } from '@/engine'
import { isRealm, RealmName, RealmNames } from './data/Realms'
import { RealmScene } from './scene/levels/realm'
import { CorgosphereLevel } from './scene/levels/CorgosphereLevel'
import { TriggerFishLairLevel } from './scene/levels/TriggerFishLairLevel'
import { FriedEggLevel } from './scene/levels/FriedEggLevel'
import { DepthsLevel } from './scene/levels/DepthsLevel'
import { HellLevel } from './scene/levels/HellLevel'
import { LobbyScene } from './scene/LobbyScene'
import { MultiplayerScene } from './scene/MultiplayerScene'

const RealmScenes: Record<RealmName, SceneComponent> = {
  corgosphere: RealmScene(CorgosphereLevel),
  triggerFishLair: RealmScene(TriggerFishLairLevel),
  friedEgg: RealmScene(FriedEggLevel),
  depths: RealmScene(DepthsLevel),
  hell: RealmScene(HellLevel),
}

const testScene = 'menu'
const fadeScenes = ['ocean', 'surface', 'cave', 'kingdom', 'credits', 'multiplayer', ...RealmNames]
const levelScenes = ['ocean', 'cave', 'kingdom', 'multiplayer', ...RealmNames]
const fadeDuration = 300

export const FreediverGame: Component = () => {
  const [windowWidth, setWindowWidth] = createSignal(window.innerWidth)
  const zoom = createMemo(() => windowWidth() < 700 ? windowWidth() / 700 : 1)

  const [gameState, _setGameState] = createStore<GameState>(initialState())
  window.gameState = gameState
  window.setGameState = _setGameState

  const setGameState = setGameStateWithSaveWrapper(gameState, _setGameState)


  const [scene, _setScene] = createSignal<string>(import.meta.env.DEV ? testScene : 'menu')
  const [sceneMode, setSceneMode] = createSignal<string | undefined>(undefined)
  const [sceneFade, setSceneFade] = createSignal<'in' | 'out' | undefined>(undefined)
  const setScene = (newScene: string, mode?: string) => {
    const fadeOut = fadeScenes.includes(newScene) ? fadeDuration : 0
    const fadeIn = fadeScenes.includes(scene()) ? fadeDuration : 0
    
    if (['surface', ...levelScenes].includes(newScene) && !music()) {
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
        {scene() === 'kingdom' && <KingdomScene setScene={setScene} mode={sceneMode()} />}
        {isRealm(scene()) && <Dynamic component={RealmScenes[scene() as RealmName]} setScene={setScene} mode={sceneMode()} />}
        {scene() === 'lobby' && <LobbyScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'multiplayer' && <MultiplayerScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'credits' && <CreditsScene setScene={setScene} mode={sceneMode()} />}
        {scene() === 'blackout' && <BlackoutScene setScene={setScene} mode={sceneMode()} />}
        {/* Levels draw these inside their canvas so they sit beneath dialog */}
        {!levelScenes.includes(scene()) && <AchievementPopups />}
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
}

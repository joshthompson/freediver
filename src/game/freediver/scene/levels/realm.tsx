import { Accessor, createEffect, createSignal, JSX, onCleanup } from 'solid-js'
import { css } from '@style/css'
import { createController, Scene, SceneComponent } from '@/engine'
import { emptyAsset } from '@/assets'
import { useGameState } from '@/utils/GameStateContext'
import { Translations } from '@/game/freediver/data/Translations'
import { RealmName } from '@/game/freediver/data/Realms'
import { Dialog } from '@/utils/game'
import { createBoxController } from '../../controllers/utils/BoxController'
import { createDiverController, DiverController } from '../../controllers/main/DiverController'
import { createCorgiController } from '../../controllers/main/CorgiController'
import { createPortalControllers } from '../../controllers/realm/PortalController'
import { createCrystalCorgiController, CrystalCorgiController } from '../../controllers/realm/CrystalCorgiController'
import { createRealmGuideController } from '../../controllers/realm/RealmGuideController'
import { LetterBounce } from '../../ui/LetterBounce'
import { Level } from '../Level'
import { music } from '../../music/music'
import type { SongName } from '../../music/songs'
import { wornSuit } from '../../multiplayer/skins'

export interface RealmLevelProps {
  setScene: (scene: string, mode?: string) => void
  state: NonNullable<ReturnType<typeof useGameState>>
  mode?: string
}

export interface RealmLevel {
  scene: Scene
  style: Accessor<JSX.CSSProperties>
  hud?: () => JSX.Element
  music: Accessor<SongName> // Which song plays, which can change as the realm goes on
}

const failDuration = 2000
const portalSize = 200

// Shared rules for every Crystal Realm: how you arrive, fail, find the Crystal Corgi and leave
export function createRealm(realm: RealmName, props: RealmLevelProps) {
  const { gameState, setGameState, gameStateActions } = props.state
  const ghost = !!gameState.questState.crystals[realm] // Already brought home, so this is a replay
  const [ending, setEnding] = createSignal(false)
  let failTimeout: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => clearTimeout(failTimeout)) // In case you quit to the menu while it's showing

  // Every realm starts on a full breath, and leaving mid-realm resumes in the kingdom
  setGameState('diver', 'oxygen', 100)
  setGameState('diver', 'level', 'kingdom')

  const realmFailed = <div class={styles.failed}>
    <LetterBounce children={Translations[gameState.options.locale].realms.realmFailed} />
  </div>

  // Realm Failure: you're sent back to the King's Portal, keeping your dive points
  const fail = (scene: Scene) => {
    if (ending()) return
    setEnding(true)
    scene.dialog.setData(undefined) // Close any dialog without running what it would do next
    setGameState('diver', 'oxygen', 100) // Clears the low oxygen warning so the message shows
    scene.modal.set(realmFailed)
    failTimeout = setTimeout(() => props.setScene('kingdom', 'portal'), failDuration)
  }

  const finish = () => {
    if (ending()) return
    setEnding(true)
    gameStateActions.completeRealm(realm)
    props.setScene('kingdom', 'portal')
  }

  return { realm, ghost, ending, fail, finish }
}

export type Realm = ReturnType<typeof createRealm>

// Adds the diver and Linkosha arriving through the Entry Portal, and solid walls around the realm
export function addRealmArrival($scene: Scene, realm: Realm, options: {
  bounds: Rect
  entry: Vector // The Entry Portal's centre
  diver?: Partial<Parameters<typeof createDiverController>[1]>
  walls?: boolean
  bubbles?: boolean // False where there's no water, so neither the diver nor Linkosha make bubbles
}) {
  const { bounds, entry } = options
  if (options.walls ?? true) {
    const thickness = 1000
    $scene.addController(
      createBoxController('bound-top', { x: bounds.x - thickness, y: bounds.y - thickness, width: bounds.width + thickness * 2, height: thickness }),
      createBoxController('bound-bottom', { x: bounds.x - thickness, y: bounds.y + bounds.height, width: bounds.width + thickness * 2, height: thickness }),
      createBoxController('bound-left', { x: bounds.x - thickness, y: bounds.y, width: thickness, height: bounds.height }),
      createBoxController('bound-right', { x: bounds.x + bounds.width, y: bounds.y, width: thickness, height: bounds.height }),
    )
  }

  $scene.addController(...createPortalControllers('entry-portal', {
    x: entry.x - portalSize / 2,
    y: entry.y - portalSize / 2,
    size: portalSize,
    closeAfter: 75,
  }))

  const diver = createDiverController('diver', {
    skin: wornSuit($scene.gameState).diver,
    x: entry.x - 34,
    y: entry.y - 78,
    rotation: 90,
    speed: 0,
    bubbles: options.bubbles,
    ...options.diver,
    blackout: () => realm.fail($scene),
  })
  $scene.addController(diver)
  const corgi = createCorgiController('corgi', { skin: wornSuit($scene.gameState).corgi, x: entry.x - 20, y: entry.y, bubbles: options.bubbles })
  $scene.addController(corgi)
  return { diver, corgi }
}

// The realm's guide, saying its intro once when you first swim up to it
export function addRealmGuide($scene: Scene, options: {
  asset: string
  position: Vector
  intro: Dialog['messages']
  onIntroComplete?: () => void
  end?: () => Dialog | undefined
}) {
  let introDone = false
  const guide = createRealmGuideController('realm-guide', {
    x: options.position.x,
    y: options.position.y,
    asset: options.asset,
    dialog: () => {
      if (!introDone) {
        return {
          messages: options.intro,
          pauseGameplay: true,
          onComplete: () => {
            introDone = true
            options.onIntroComplete?.()
          },
        }
      }
      return options.end?.()
    },
  })
  $scene.addController(guide)
  return guide
}

// The Crystal Corgi and the Exit Portal beside it, which opens once Linkosha has found it.
// It only counts once Linkosha carries it through, and only on a first visit
export function addRealmFinish($scene: Scene, realm: Realm, options: {
  crystal: Vector // Top left of the Crystal Corgi
  exit: Vector // The Exit Portal's centre
  visible?: Accessor<boolean>
  exitOpen?: Accessor<boolean> // When the Exit Portal opens, if not as soon as the Crystal Corgi is found
  onFound?: () => void
}) {
  const [found, setFound] = createSignal(false)
  const crystal: CrystalCorgiController = createCrystalCorgiController('crystal-corgi', {
    realm: realm.realm,
    x: options.crystal.x,
    y: options.crystal.y,
    ghost: realm.ghost,
    visible: options.visible,
    onFound: () => {
      setFound(true)
      options.onFound?.()
    },
  })
  $scene.addController(crystal)
  $scene.addController(...createPortalControllers('exit-portal', {
    x: options.exit.x - portalSize / 2,
    y: options.exit.y - portalSize / 2,
    size: portalSize,
    open: options.exitOpen ?? found,
    onEnter: () => realm.finish(),
  }))
  return { crystal, found }
}

// Keeps the diver in the middle of the screen without showing past the realm's edges
export function followDiver($scene: Scene, bounds: Rect) {
  const diver = $scene.getControllerById<DiverController>('diver')
  if (!diver) return
  const canvas = $scene.canvas.get()
  const center = diver.data.center()
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
  canvas.setX(clamp(center.x - canvas.width() / 2, bounds.x, Math.max(bounds.x, bounds.x + bounds.width - canvas.width())))
  canvas.setY(clamp(center.y - canvas.height() / 2, bounds.y, Math.max(bounds.y, bounds.y + bounds.height - canvas.height())))
}

// Frames for a number of seconds at the game's frame rate
export const seconds = (n: number) => Math.round(n * 25)

// An invisible controller for a realm's own rules, which only run while gameplay is running
export function createRealmDirector(id: string, onFrame: (data: { $scene: Scene, $age: number }) => void) {
  return createController({
    frames: [emptyAsset],
    init() {
      return {
        id,
        type: 'director',
        x: () => 0,
        y: () => 0,
        width: () => 0,
        height: () => 0,
      }
    },
    onEnterFrame: ({ $scene, $age }) => onFrame({ $scene, $age }),
  })
}

export function RealmScene(level: (props: RealmLevelProps) => RealmLevel): SceneComponent {
  return props => {
    const realm = level({
      setScene: props.setScene,
      state: useGameState()!,
      mode: props.mode,
    })
    createEffect(() => music.play(realm.music()))
    onCleanup(() => music.stop(realm.music()))

    return <Level
      levelStyle={realm.style}
      scene={realm.scene}
      surface={false}
      setScene={props.setScene}
      hud={realm.hud}
      // Gives up on the realm for now, arriving back through the King's Portal
      returnToKingdom={() => props.setScene('kingdom', 'portal')}
    />
  }
}

const styles = {
  failed: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    p: '3rem 1rem',
    fontSize: '4rem',
    color: 'white',
    textShadow: '2px 2px 4px #000',
    background: '#3a0a0a',
    animation: 'fadeIn 0.5s ease-in-out',
  }),
}

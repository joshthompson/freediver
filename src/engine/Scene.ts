import { type Controller, createObjectSignal, type ObjectSignal, Scene as CoreScene, type SceneOptions } from 'scoopjs'
import { SetStoreFunction } from 'solid-js/store'
import { GameState, GameStateActions } from '@/utils/GameStateContext'
import { BackgroundDialog, Dialog } from '@/utils/game'
import { createDialogs, type Dialogs } from './plugins/dialog'
import { createSounds, type PlaySoundOptions, type Sounds } from './plugins/sounds'
import { isOnCanvas } from './utils/isOnCanvas'
import { isTyping } from './utils/Key'

export type { SceneComponent } from 'scoopjs'

export interface GameOptions extends Omit<SceneOptions, 'setup' | 'afterEnterFrames'> {
  gameState: GameState
  setGameState: SetStoreFunction<GameState>
  gameStateActions: GameStateActions,
  setup?: (scene: Scene) => void
  afterEnterFrames?: (data: { $scene: Scene }) => void
  sounds?: Record<string, string>
  pauseStopsGameplay?: boolean // False in multiplayer, where pausing only opens the menu. Defaults to true
}

// Freediver's own parts of a scene. They're declared on ScoopJS's Scene, rather than only on the class
// below, so the scene ScoopJS hands a controller ($scene) has them too: every scene in freediver is one
// of these
declare module 'scoopjs' {
  interface Scene<C extends Controller<any> = Controller<any>> {
    gameState: GameState
    setGameState: SetStoreFunction<GameState>
    gameStateActions: GameStateActions
    paused: ObjectSignal<boolean>
    dialog: Dialogs<Scene<C>, Dialog, BackgroundDialog>['dialog']
    backgroundDialogs: ObjectSignal<BackgroundDialog[]>
    togglePause(): void
    startDialog(dialog: Dialog, options?: { firstMessageIndex?: number }): void
    startBackgroundDialog(backgroundDialog: BackgroundDialog): boolean
    diaglogAction(optionIndex: number): void
    endDialog(): void
    playSound(name: string, options?: PlaySoundOptions): void
    stopSound(name: string): void
    isOnCanvas(controller: Controller<any>, margin?: number): boolean
  }
}

// What a scene keeps to itself. Out here, so the class has nothing ScoopJS's Scene doesn't, and either
// can stand in for the other
interface Parts {
  options: GameOptions
  dialogs: Dialogs<Scene, Dialog, BackgroundDialog>
  sounds: Sounds
  onKeydown: (event: KeyboardEvent) => void
  onPauseGame: () => void
}
const parts = new WeakMap<CoreScene, Parts>()
const partsOf = (scene: CoreScene) => parts.get(scene)!

export class Scene<C extends Controller<any> = Controller<any>> extends CoreScene<C> {
  constructor(id: string, options: GameOptions) {
    super(id, {
      // How freediver draws its scenes (see each in ScoopJS's SceneOptions)
      cameraLayer: true,
      standbyFrames: true,
      frameClock: 'display',
      ...options,
      // ScoopJS runs setup from inside its own constructor, before this one's body would, so freediver's
      // parts go on first thing in it, ready for the game's own setup
      setup: scene => {
        addParts(scene, options)
        options.setup?.(scene)
      },
      afterEnterFrames: options.afterEnterFrames as SceneOptions['afterEnterFrames'],
    })
  }

  togglePause() {
    this.paused.set(!this.paused.get())
  }

  isActive() {
    const { options, dialogs } = partsOf(this)
    return (!this.paused.get() || options.pauseStopsGameplay === false)
        && super.isActive() // Not loading, and no modal up
        && !dialogs.pausesScene()
  }

  destroy() {
    super.destroy()
    const { onKeydown, onPauseGame } = partsOf(this)
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('pause-game', onPauseGame)
  }

  // Sounds count towards loading, alongside ScoopJS's images
  async preloadAssets() {
    const images = super.preloadAssets()
    const sounds = partsOf(this).sounds.preload(() => this.loadingAssetCount.set(this.loadingAssetCount.get() + 1))
    this.loadingAssetTotal.set(this.loadingAssetTotal.get() + sounds.length)
    await Promise.allSettled([images, ...sounds])
  }

  startDialog(dialog: Dialog, options?: { firstMessageIndex?: number }) {
    partsOf(this).dialogs.start(dialog, options)
  }

  // Only one shows at a time, and none while a dialog is open. Returns whether it started
  startBackgroundDialog(backgroundDialog: BackgroundDialog) {
    return partsOf(this).dialogs.startBackground(backgroundDialog)
  }

  diaglogAction(optionIndex: number) {
    partsOf(this).dialogs.choose(optionIndex)
  }

  endDialog() {
    partsOf(this).dialogs.end()
  }

  playSound(name: string, options?: PlaySoundOptions) {
    partsOf(this).sounds.play(name, options)
  }

  stopSound(name: string) {
    partsOf(this).sounds.stop(name)
  }

  isOnCanvas(controller: Controller<any>, margin = 0) {
    return isOnCanvas(this, controller, margin)
  }
}

function addParts(scene: CoreScene, options: GameOptions) {
  scene.gameState = options.gameState
  scene.setGameState = options.setGameState
  scene.gameStateActions = options.gameStateActions
  scene.paused = createObjectSignal(false)

  const dialogs = createDialogs<Scene, Dialog, BackgroundDialog>(scene)
  scene.dialog = dialogs.dialog
  scene.backgroundDialogs = dialogs.background

  const sounds = createSounds(options.sounds ?? {}, { volume: () => scene.gameState.options.volume ?? 1 })

  const onKeydown = (event: KeyboardEvent) => {
    if (isTyping(event)) return
    if (event.key === 'p' || event.key === 'Escape') {
      scene.togglePause()
    }
  }
  const onPauseGame = () => scene.togglePause()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pause-game', onPauseGame)

  parts.set(scene, { options, dialogs, sounds, onKeydown, onPauseGame })
}

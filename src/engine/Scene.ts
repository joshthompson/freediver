import { SetStoreFunction } from "solid-js/store"
import { GameState, GameStateActions } from "../utils/GameStateContext"
import { BackgroundDialog, Dialog } from "../utils/game"
import { Accessor, Component, createMemo, createSignal, JSX, Setter } from "solid-js"
import { Canvas, CanvasControllers } from "@/engine/components/Canvas"
import { createObjectSignal, isTyping, ObjectSignal } from "./utils"
import { Controller } from "./Controller"


export type SceneComponent<T extends {} = any> = Component<{
  setScene: (scene: string, mode?: string) => void
  mode?: string
} & T>

interface GameOptions {
  gameState: GameState
  setGameState: SetStoreFunction<GameState>
  gameStateActions: GameStateActions,
  width: number
  height: number
  x?: number,
  y?: number,
  setup?: (scene: Scene) => void
  afterEnterFrames?: (data: { $scene: Scene }) => void
  sounds?: Record<string, string>
  images?: string[] // These are other assets that are not in controllers
  frameRate?: number
  assetOrder?: (string | string[])[]
  pauseStopsGameplay?: boolean // False in multiplayer, where pausing only opens the menu. Defaults to true
}

export class Scene<C extends Controller<any> = Controller<any>> {
  gameState: GameState
  setGameState: SetStoreFunction<GameState>
  gameStateActions: GameStateActions
  // canvas: ObjectSignal<Canvas>
  // controllers: ObjectSignal<CanvasControllers>
  sounds: Record<string, HTMLAudioElement>
  // loadingAssetCount: ObjectSignal<number>
  // loadingAssetTotal: ObjectSignal<number>
  interval: number
  dialog: {
    data: Accessor<Dialog | undefined>
    setData: Setter<Dialog | undefined>
    messageIndex: Accessor<number>
    setMessageIndex: Setter<number>
  }
  backgroundDialogs = createObjectSignal([] as BackgroundDialog[])
  loading = createObjectSignal(false)
  paused = createObjectSignal(false)
  modal = createObjectSignal(undefined as JSX.Element | undefined)
  loadingAssetCount = createObjectSignal(0)
  loadingAssetTotal = createObjectSignal(0)
  controllers = createObjectSignal([] as CanvasControllers)
  canvas: ObjectSignal<Canvas>

  // Lookup indexes over controllers and their children, rebuilt only when either list changes
  #indexes = createMemo(() => {
    const byId = new Map<string, Controller<any>>()
    const byType = new Map<string, Controller<any>[]>()
    this.getAllControllers().forEach(controller => {
      // Keep the first match, as Array.find did
      if (!byId.has(controller.id)) byId.set(controller.id, controller)
      const ofType = byType.get(controller.type)
      if (ofType) ofType.push(controller)
      else byType.set(controller.type, [controller])
    })
    return { byId, byType }
  })

  // Bound once so destroy() can remove the same function references
  #onKeydown = (event: KeyboardEvent) => this.handleWindowKeydown(event)
  #onPauseGame = () => this.togglePause()

  constructor(public id: string, public options: GameOptions) {
    // Store setup options
    this.gameState = options.gameState
    this.setGameState = options.setGameState
    this.gameStateActions = options.gameStateActions

    // Setup sounds
    this.sounds = {}
    Object.entries(options.sounds ?? {}).forEach(([name, path]) => {
      this.sounds[name] = new Audio(path)
    })


    // Setup signals
    this.canvas = createObjectSignal(this.createCanvas())

    // Dialog setup
    const [dialog, setDialog] = createSignal<Dialog | undefined>(undefined)
    const [currentMessageIndex, setCurrentMessageIndex] = createSignal<number>(0)
    this.dialog = {
      data: dialog,
      setData: setDialog,
      messageIndex: currentMessageIndex,
      setMessageIndex: setCurrentMessageIndex,
    }

    // Setup onEnterFrame functions for controllers
    this.interval = window.setInterval(() => {
      if (this.isActive()) {
        this.controllers.get().forEach(({ controller }) => controller.onEnterFrame(this))
        this.#tickBackgroundDialogs()
      }
      this.options.afterEnterFrames?.({ $scene: this })
    }, this.options.frameRate ?? 40)

    // Set window event listeners
    window.addEventListener('keydown', this.#onKeydown)
    window.addEventListener('pause-game', this.#onPauseGame)

    // Run setup
    this.setup()
  }

  addController(...controllers: (C | undefined)[]) {
    const added: CanvasControllers = []
    controllers.forEach(controller => {
      if (!controller) return
      controller.setGame(this)
      added.push({ id: controller.id, controller })
    })
    if (added.length) {
      this.controllers.set([...this.controllers.get(), ...added])
    }
  }

  removeController(id: string) {
    this.controllers.set(this.controllers.get().filter(({ id: name }) => name !== id))
  }

  getAllControllers() {
    return [
      ...this.controllers.get().map(c => c.controller),
      ...this.controllers.get().map(c => c.controller.childControllers()).flat(),
    ]
  }

  getControllerById<T = Controller<any>>(id: string) {
    return this.#indexes().byId.get(id) as T | undefined
  }

  getControllersByType<T = Controller<any>>(type: string) {
    return (this.#indexes().byType.get(type)?.slice() ?? []) as T[]
  }

  getSolidControllerRects(): Rect[] {
    return this.controllers.get()
      .filter(c => c.controller.solid && c.controller.sprite())
      .map(c => {
        const solid = c.controller.solid as Accessor<Rect> | Rect | true
        if (solid === true) {
          return {
            x: c.controller.data.x() + c.controller.solid,
            y: c.controller.data.y() + c.controller.solid,
            width: c.controller.data.width,
            height: c.controller.data.height, // TODO Force height being set
          }
        }
        const rect = typeof solid === 'function' ? solid() : solid
        return {
          x: c.controller.data.x() + rect.x,
          y: c.controller.data.y() + rect.y,
          width: rect.width,
          height: rect.height,
        }
      })
  }

  handleWindowKeydown(event: KeyboardEvent) {
    if (isTyping(event)) return
    if (event.key === 'p' || event.key === 'Escape') {
      this.togglePause()
    }
  }

  togglePause() {
    this.paused.set(!this.paused.get())
  }

  isActive() {
    return (!this.paused.get() || this.options.pauseStopsGameplay === false)
        && !this.loading.get()
        && ((this.dialog.data()?.pauseGameplay ?? false) !== true)
        && !this.modal.get()
  }

  destroy() {
    clearInterval(this.interval)
    window.removeEventListener('keydown', this.#onKeydown)
    window.removeEventListener('pause-game', this.#onPauseGame)
  }

  createCanvas(): Canvas {
    return {
      width: this.options.width,
      height: this.options.height,
      controllers: this.controllers.get,
      ...createObjectSignal(this.options.x ?? 0, 'x'),
      ...createObjectSignal(this.options.y ?? 0, 'y'),
    }
  }

  startDialog(dialog: Dialog, options?: { firstMessageIndex?: number }) {
    this.backgroundDialogs.set([])
    this.dialog.setMessageIndex(options?.firstMessageIndex ?? 0)
    this.dialog.setData(dialog)
  }

  // Only one shows at a time, and none while a dialog is open. Returns whether it started
  startBackgroundDialog(backgroundDialog: BackgroundDialog) {
    if (this.dialog.data() || this.backgroundDialogs.get().length) return false
    this.backgroundDialogs.set([backgroundDialog])
    return true
  }

  // Drop background dialogs that have run out of frames or whose speaker has left the screen
  #tickBackgroundDialogs() {
    const dialogs = this.backgroundDialogs.get()
    if (!dialogs.length) return
    const canvas = this.canvas.get()
    const remaining = dialogs.filter(dialog => {
      dialog.framesLeft--
      const speaker = this.getControllerById(dialog.controllerId)
      if (!speaker || dialog.framesLeft <= 0) return false
      const x = speaker.data.x() - canvas.x()
      const y = speaker.data.y() - canvas.y()
      return x + speaker.data.width() > 0 && x < canvas.width
        && y + speaker.data.height() > 0 && y < canvas.height
    })
    if (remaining.length !== dialogs.length) this.backgroundDialogs.set(remaining)
  }

  diaglogAction(optionIndex: number) {
    const data = this.dialog.data()
    const message = data?.messages[this.dialog.messageIndex()]
    if (!message) return

    // Run after hook and option onSelect
    message.after?.()
    const option = message.options?.[optionIndex]
    if (option?.end) {
      this.endDialog()
    }
    option?.onSelect?.(this)

    // Move to next message or end dialog
    const nextMessageIndex = option?.next ?? this.dialog.messageIndex() + 1
    if (data.messages[nextMessageIndex]) {
      this.dialog.setMessageIndex(nextMessageIndex)
    } else {
      this.endDialog()
    }
  }

  endDialog() {
    this.dialog.data()?.onComplete?.()
    this.dialog.setData(undefined)
    this.dialog.setMessageIndex(0)
  }
  
  async setup() {
    this.options.setup?.(this)
    this.controllers.get().forEach(({ controller }) => {
      controller.setGame(this)
    })
    this.load()
  }

  playSound(name: string, options?: {
    volume?: number,
    loop?: boolean,
    unique?: boolean,
  }) {
    let sound = this.sounds[name]
    if (!sound) return
    if (options?.unique) {
      sound = new Audio(sound.src)
    }
    sound.volume = (options?.volume ?? 1) * (this.gameState.options.volume ?? 1)
    sound.loop = options?.loop ?? false
    sound.setAttribute('data-game-volume', `${options?.volume ?? 1}`)
    sound.play()
    sound.style.setProperty('display', 'none')
    document.body.appendChild(sound)
    if (options?.unique) {
      sound.addEventListener('ended', () => sound.remove())
    }
  }

  stopSound(name: string) {
    let sound = this.sounds[name]
    if (!sound) return
    sound.pause()
    sound.currentTime = 0
  }

  async load() {
    this.loading.set(true)
    await this.preloadAssets()
    this.loading.set(false)
  }

  async preloadAssets() {
    const frameAssets = this.controllers.get()
      .map(({ controller }) => controller.frames ?? [])
      .flat()
      .map(frame => frame.split('#')[0])

    const imageAssets = [...new Set([...frameAssets, ...(this.options.images ?? [])])]
    const audioAssets = Object.values(this.options.sounds ?? {})
    this.loadingAssetCount.set(0)
    this.loadingAssetTotal.set(imageAssets.length + audioAssets.length)
    const assetLoaded = () => this.loadingAssetCount.set(this.loadingAssetCount.get() + 1)
    const assetSet = new Set([...imageAssets, ...audioAssets])
    const images = imageAssets.map(path => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.src = path
        img.onload = () => assetLoaded() && resolve()
        img.onerror = () => assetLoaded() && resolve()
      }).then(() => assetSet.delete(path)).catch(() => console.error(`Error preloading "${path}"`))
    })
    const sounds = audioAssets.map(path => {
      return new Promise<void>((resolve) => {
        const audio = new Audio(path)
        const done = () => {
          audio.removeEventListener('canplay', done)
          audio.removeEventListener('loadeddata', done)
          audio.removeEventListener('error', done)
          assetLoaded()
          resolve()
        }
        audio.addEventListener('canplay', done)
        audio.addEventListener('loadeddata', done)
        audio.addEventListener('error', done)
      }).then(() => assetSet.delete(path)).catch(() => console.error(`Error preloading "${path}"`))
    })
    await Promise.allSettled([...images, ...sounds])
  }
}

import { SetStoreFunction } from "solid-js/store"
import { GameState, GameStateActions } from "../utils/GameStateContext"
import { Controller, Dialog } from "../utils/game"
import { Accessor, Component, createSignal, Setter } from "solid-js"
import { Canvas, CanvasControllers } from "@/engine/components/Canvas"
import { createObjectSignal, ObjectSignal } from "./utils"


export type SceneComponent<T extends {} = any> = Component<{
  setScene: (scene: string) => void
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
}

export class Scene<C extends Controller<any> = Controller<any>> {
  gameState: GameState
  setGameState: SetStoreFunction<GameState>
  gameStateActions: GameStateActions
  canvas: ObjectSignal<Canvas>
  controllers: ObjectSignal<CanvasControllers>
  paused: ObjectSignal<boolean>
  sounds: Record<string, HTMLAudioElement>
  loading: ObjectSignal<boolean>
  loadingAssetCount: ObjectSignal<number>
  loadingAssetTotal: ObjectSignal<number>
  interval: number
  dialog: {
    data: Accessor<Dialog | undefined>
    setData: Setter<Dialog | undefined>
    messageIndex: Accessor<number>
    setMessageIndex: Setter<number>
  }

  // Lookup indexes, rebuilt lazily whenever the controllers array changes
  #indexSource?: CanvasControllers
  #byId = new Map<string, Controller<any>>()
  #byType = new Map<string, Controller<any>[]>()

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
    this.loading = createObjectSignal(false)
    this.loadingAssetCount = createObjectSignal(0)
    this.loadingAssetTotal = createObjectSignal(0)
    this.controllers = createObjectSignal([] as CanvasControllers)
    this.canvas = createObjectSignal(this.createCanvas())
    this.paused = createObjectSignal(false)

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
      this.controllers.get().forEach(({ controller }) => controller.onEnterFrame())
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

  #updateIndexes() {
    // Reading the signal keeps callers subscribed to controller list changes
    const controllers = this.controllers.get()
    if (controllers === this.#indexSource) return
    this.#indexSource = controllers
    this.#byId.clear()
    this.#byType.clear()
    controllers.forEach(({ id, controller }) => {
      // Keep the first match, as Array.find did
      if (!this.#byId.has(id)) this.#byId.set(id, controller)
      const ofType = this.#byType.get(controller.type)
      if (ofType) ofType.push(controller)
      else this.#byType.set(controller.type, [controller])
    })
  }

  getControllerById<T = Controller<any>>(id: string) {
    this.#updateIndexes()
    return this.#byId.get(id) as T | undefined
  }

  getControllersByType<T = Controller<any>>(type: string) {
    this.#updateIndexes()
    return (this.#byType.get(type)?.slice() ?? []) as T[]
  }

  handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'p' || event.key === 'Escape') {
      this.togglePause()
    }
  }

  togglePause() {
    this.paused.set(!this.paused.get())
  }

  isActive() {
    return !this.paused.get()
        && !this.loading.get()
        && ((this.dialog.data()?.pauseGameplay ?? false) !== true)
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
    this.dialog.setMessageIndex(options?.firstMessageIndex ?? 0)
    this.dialog.setData(dialog)
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
    const images = imageAssets.map(asset => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.src = asset
        img.onload = () => assetLoaded() && resolve()
        img.onerror = () => assetLoaded() && resolve()
      })
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
      })
    })
    await Promise.all([...images, ...sounds])
  }
}

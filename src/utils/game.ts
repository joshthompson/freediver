import { Canvas, CanvasControllers } from '@/game/core/Canvas'
import { Sprite } from '@/game/core/Sprite'
import { cx } from '@style/css'
import { Accessor, Component, createMemo, createSignal, JSX, Setter } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import { GameState } from './GameStateContext'

type Accessorise<T> = {
  [K in keyof T]: Accessor<T[K]>
}

export type SceneComponent<T extends {} = any> = Component<{
  setScene: (scene: string) => void
} & T>

class KeyController {
  #keys = new Map<string, boolean>()

  constructor() {
    window.addEventListener('keydown', this.#keydown.bind(this))
    window.addEventListener('keyup', this.#keyup.bind(this))
  }

  destroy() {
    window.addEventListener('keydown', this.#keydown.bind(this))
    window.addEventListener('keyup', this.#keyup.bind(this))
  }

  #keydown(event: KeyboardEvent) {
    this.#keys.set(event.key, true)
  }

  #keyup(event: KeyboardEvent) {
    this.#keys.set(event.key, false)
  }

  isDown(key: string) {
    return this.#keys.get(key) ?? false
  }

  get all() {
    return this.#keys.entries()
  }
}

export const Key = new KeyController()

export function isOverlapping(
  object1: HTMLElement | DOMRect | undefined,
  object2: HTMLElement | DOMRect | undefined,
) {
  if (!object1 || !object2) return false
  const rect1 = 'right' in object1 ? object1 : object1.getBoundingClientRect()
  const rect2 = 'right' in object2 ? object2 : object2.getBoundingClientRect()
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  )
}

export function playSound(
  url: string,
  options?: {
    volume?: number,
    loop?: boolean,
    play?: boolean,
    manage?: boolean,
    mute?: boolean
  },
) {
  const volume = options?.volume ?? 1
  const loop = options?.loop ?? false
  const play = options?.play ?? true
  const manage = options?.manage ?? true

  const audio = new Audio(url)
  audio.volume = options?.mute ? 0 : volume
  audio.loop = loop
  audio.setAttribute('data-game-volume', `${volume}`)
  audio.style.setProperty('display', 'none')
  document.body.appendChild(audio)
  if (play) audio.play()
  if (manage) audio.addEventListener('ended', () => audio.remove())
  return audio
}

type ControllerBaseType = {
  id: string
  type: string
  x: Accessor<Sprite['x']>
  y: Accessor<Sprite['y']>
  game?: Game
  style?: Accessor<Sprite['style']>
  width?: Accessor<Sprite['width']>
  height?: Accessor<number>
  inner?: {
    rotation?: Accessor<number>
    origin?: Accessor<{ x: number; y: number }>
  },
} & Partial<Accessorise<Sprite>>

interface OnEnterFrameData<T extends ControllerBaseType> {
  $: T,
  $game: Game,
  $age: number,
  $currentFrame: number
  $controller: Controller<T>
}

interface ControllerProps<T extends ControllerBaseType> {
  init: () => T
  frames?: Sprite['frames']
  randomStartFrame?: Sprite['randomStartFrame']
  class?: Sprite['class']
  style?: Sprite['style']
  frameRate?: number
  onEnterFrame?: (data: OnEnterFrameData<T>) => void
}

export interface Controller<
  CP extends ControllerBaseType,
> {
  type: string
  id: string
  frames?: Sprite['frames']
  frameRate: number
  onEnterFrame: (data: OnEnterFrameData<CP>) => void
  destroy: () => void
  hitTest: (other: Controller<any>) => boolean
  setGame: (game: Game) => void
  data: CP
  sprite: Accessor<Sprite>
  age: Accessor<number>
}

export function createController<
  CP extends ControllerBaseType
>(options: ControllerProps<CP>): Controller<CP> {

  const [age, setAge] = createSignal<number>(0)
  const onEnterFrame = options.onEnterFrame ?? (() => {})
  const frameRate = options.frameRate ?? 40
  const [currentFrame, setCurrentFrame] = createSignal<number>(0)
  const data: CP = options.init()
  const destroy = () => {
    clearInterval(interval)
  }
  const setGame = (game: Game) => (data.game = game)
  const hitTest = (other: Controller<any>) => {
    const ref1 = document.querySelector(`[data-controller-id="${data.id}"]`) as HTMLElement
    const ref2 = document.querySelector(`[data-controller-id="${other.id}"]`) as HTMLElement
    return isOverlapping(ref1, ref2)
  }

  const controller: Controller<CP> = {
    id: data.id,
    type: data.type,
    frames: options.frames,
    frameRate,
    onEnterFrame,
    destroy,
    hitTest,
    setGame,
    age,
    data,
    sprite: createMemo(
      (): Sprite => ({
        frames: options.frames ?? [],
        frame: data?.frame?.(),
        randomStartFrame: options.randomStartFrame ?? false,
        class: cx(options.class, data.class?.()),
        style: { ...options.style, ...data.style?.() },
        x: data.x(),
        y: data.y(),
        origin: data.origin?.(),
        xScale: data.xScale?.() ?? 1,
        yScale: data.yScale?.() ?? 1,
        width: data.width?.() ?? 1,
        parallax: data.parallax?.() ?? 1,
        rotation: data.rotation?.() ?? 0,
        state: data.state?.(),
        frameInterval: data.frameInterval?.(),
        children: data.children?.(),
        inner: {
          rotation: data.inner?.rotation?.(),
          origin: data.inner?.origin?.(),
        },
        onChangeFrame: frame => setCurrentFrame(frame),
      }),
    ),
  }

  const interval = setInterval(() => {
    if (data.game && data.game?.isActive()) {
      onEnterFrame({
        $: data,
        $game: data.game,
        $age: age(),
        $currentFrame: currentFrame(),
        $controller: controller
      })
      setAge(age() + 1)
    }
  }, frameRate)

  return controller
}

type ExtractControllerType<T> = T extends Controller<infer A> ? A : never

export function createConnectedController<C extends Controller<any>>(options: {
  type: string,
  base: C,
  frames?: ControllerProps<ExtractControllerType<C>>['frames'],
  offset: { x: number, y: number },
  origin?: { x: number, y: number },
  width: ($: ExtractControllerType<C>) => number,
  xScale?: ($: ExtractControllerType<C>) => number,
  rotation?: ($: ExtractControllerType<C>, $age: number) => number,
  onEnterFrame?: ControllerProps<ExtractControllerType<C>>['onEnterFrame'],
  frame?: ($: ExtractControllerType<C>) => number,
}) {
  return createController({
    frames: options.frames,
    init() {
      const baseData = options.base.data as ExtractControllerType<C>

      return {
        id: `${options.base.id}-${options.type}`,
        type: options.type,

        x: () => baseData.x() + options.offset.x,
        y: () => baseData.y() + options.offset.y,
        frame: () => options.frame?.(baseData),
        width: options.width,
        rotation: baseData.rotation,
        xScale: baseData.xScale,
        origin: () => ({
          x: baseData.width() / 2 - options.offset.x,
          y: baseData.height() / 2 - options.offset.y,
        }),
        inner: {
          rotation: () => options.rotation?.(baseData, options.base.age()) ?? 0,
          origin: () => ({ x: options.origin?.x ?? 0, y: options.origin?.y ?? 0 }),
        },
      } as ExtractControllerType<C>
    },
    onEnterFrame: options.onEnterFrame,
  })
}


interface GameOptions {
  gameState: GameState
  setGameState: SetStoreFunction<GameState>
  width: number
  height: number
  x?: number,
  y?: number,
  setup?: (game: Game) => void
  sounds?: Record<string, string>
  images?: string[] // These are other assets that are not in controllers
}

export class Game<C extends Controller<any> = Controller<any>> {
  gameState: GameState
  setGameState: SetStoreFunction<GameState>
  canvas: Accessor<Canvas>
  setCanvas: Setter<Canvas>
  controllers: Accessor<CanvasControllers>
  setControllers: Setter<CanvasControllers>
  paused: Accessor<boolean>
  setPaused: Setter<boolean>
  sounds: Record<string, HTMLAudioElement>
  loading: Accessor<boolean>
  setLoading: Setter<boolean>
  loadingAssetCount: Accessor<number>
  loadingAssetTotal: Accessor<number>
  setLoadingAssetCount: Setter<number>
  setLoadingAssetTotal: Setter<number>

  constructor(public id: string, public options: GameOptions) {
    // Store setup options
    this.gameState = options.gameState
    this.setGameState = options.setGameState

    // Setup sounds
    this.sounds = {}
    Object.entries(options.sounds ?? {}).forEach(([name, path]) => {
      this.sounds[name] = new Audio(path)
    })

    // Setup signals
    const [loading, setLoading] = createSignal<boolean>(false)
    const [loadingAssetCount, setLoadingAssetCount] = createSignal<number>(0)
    const [loadingAssetTotal, setLoadingAssetTotal] = createSignal<number>(0)
    const [canvas, setCanvas] = createSignal<Canvas>(this.createCanvas())
    const [controllers, setControllers] = createSignal<CanvasControllers>([])
    const [paused, setPaused] = createSignal<boolean>(false)
    this.loading = loading
    this.setLoading = setLoading
    this.loadingAssetCount = loadingAssetCount
    this.setLoadingAssetCount = setLoadingAssetCount
    this.loadingAssetTotal = loadingAssetTotal
    this.setLoadingAssetTotal = setLoadingAssetTotal
    this.canvas = canvas
    this.setCanvas = setCanvas
    this.paused = paused
    this.setPaused = setPaused
    this.controllers = controllers
    this.setControllers = setControllers

    // Set window event listeners
    window.addEventListener('keydown', this.handleWindowKeydown.bind(this))

    // Run setup
    this.setup()
  }

  addController(...controllers: (C | undefined)[]) {
    controllers.forEach(controller => {
      if (!controller) return
      controller.setGame(this)
      this.setControllers([
        ...this.controllers(),
        { id: controller.id, controller },
      ])
    })
  }

  removeController(id: string) {
    this.setControllers(this.controllers().filter(({ id: name }) => name !== id))
  }

  getController<T = Controller<any>>(id: string) {
    return this.controllers().find(c => c.id === id)?.controller as T | undefined
  }

  handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'p' || event.key === 'Escape') {
      this.togglePause()
    }
  }

  togglePause() {
    this.setPaused(!this.paused())
  }

  isActive() {
    return !this.paused() && !this.loading()
  }

  destroy() {
    window.removeEventListener('keydown', this.handleWindowKeydown.bind(this))
  }

  createCanvas(): Canvas {
    const [x, setX] = createSignal(this.options.x ?? 0)
    const [y, setY] = createSignal(this.options.y ?? 0)

    return {
      width: this.options.width,
      height: this.options.height,
      x,
      y,
      setX,
      setY,
      controllers: this.controllers,
    }
  }
  
  async setup() {
    this.options.setup?.(this)
    this.controllers().forEach(({ controller }) => {
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
    this.setLoading(true)
    await this.preloadAssets()
    this.setLoading(false)
  }

  async preloadAssets() {
    const frameAssets = this.controllers()
      .map(({ controller }) => controller.frames ?? [])
      .flat()
      .map(frame => frame.split('#')[0])

    const imageAssets = [...new Set([...frameAssets, ...(this.options.images ?? [])])]
    const audioAssets = Object.values(this.options.sounds ?? {})
    this.setLoadingAssetCount(0)
    this.setLoadingAssetTotal(imageAssets.length + audioAssets.length)
    const assetLoaded = () => this.setLoadingAssetCount(this.loadingAssetCount() + 1)
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

export function playTone(
  frequency = 440,
  duration = 0.5,
  volume = 1,
  type: OscillatorType = 'sine'
) {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  const compensatedGain = 1 / Math.sqrt(frequency)
  gain.gain.setValueAtTime(volume * compensatedGain, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

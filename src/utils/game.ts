import { Canvas, CanvasControllers } from '@/game/core/Canvas'
import { Sprite } from '@/game/core/Sprite'
import { Accessor, Component, createMemo, createSignal, Setter } from 'solid-js'

type Accessorise<T> = {
  [K in keyof T]: Accessor<T[K]>
}

export type SceneComponent<
  T extends {} = any,
  D extends {} = any,
> = Component<{
  active: boolean
  debug: boolean
  setScene: (scene: string, data?: D) => void
  sceneData?: D
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

export function playSound(url: string, volume = 1) {
  const audio = new Audio(url)
  audio.volume = volume
  audio.play()
  audio.addEventListener('ended', () => audio.remove())
}

type ControllerBaseType = {
  id: string
  type: string
  x: Accessor<Sprite['x']>
  y: Accessor<Sprite['y']>
  game?: Game
  style?: Accessor<Sprite['style']>
} & Partial<Accessorise<Sprite>>

type ControllerActions<CP extends ControllerBaseType> = {
  [key: string]: (data: CP, game: Game | undefined) => void
}

interface ControllerProps<T extends ControllerBaseType> {
  init: () => T
  frames?: Sprite['frames']
  randomStartFrame?: Sprite['randomStartFrame']
  class?: Sprite['class']
  style?: Sprite['style']
  frameRate?: number
  onEnterFrame?: (data: T, game: Game, age: number, currentFrame: number) => void
}

export interface Controller<
  CP extends ControllerBaseType,
> {
  type: string
  id: string
  frameRate: number
  onEnterFrame: (data: CP, game: Game, age: number, currentFrame: number) => void
  destroy: () => void
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
  const interval = setInterval(() => {
    if (data.game && data.game?.isActive()) {
      onEnterFrame(data, data.game, age(), currentFrame())
      setAge(age() + 1)
    }
  }, frameRate)
  const destroy = () => {
    clearInterval(interval)
  }
  const setGame = (game: Game) => (data.game = game)

  return {
    id: data.id,
    type: data.type,
    frameRate,
    onEnterFrame,
    destroy,
    setGame,
    age,
    data,
    sprite: createMemo(
      (): Sprite => ({
        frames: options.frames ?? [],
        randomStartFrame: options.randomStartFrame ?? false,
        class: options.class,
        style: { ...options.style, ...data.style?.() },
        x: data.x(),
        y: data.y(),
        origin: data.origin?.(),
        xScale: data.xScale?.() ?? 1,
        yScale: data.yScale?.() ?? 1,
        width: data.width?.(),
        rotation: data.rotation?.() ?? 0,
        state: data.state?.(),
        frameInterval: data.frameInterval?.(),
        onChangeFrame: frame => setCurrentFrame(frame),
      }),
    ),
  }
}

interface GameOptions {
  width: number
  height: number
  x?: number,
  y?: number,
  setup?: (game: Game) => void
}

export class Game<C extends Controller<any> = Controller<any>> {
  options: GameOptions
  canvas: Accessor<Canvas>
  setCanvas: Setter<Canvas>
  controllers: Accessor<CanvasControllers>
  setControllers: Setter<CanvasControllers>
  active: Accessor<boolean>
  setActive: Setter<boolean>
  paused: Accessor<boolean>
  setPaused: Setter<boolean>
  mute: Accessor<boolean>
  setMute: Setter<boolean>


  constructor(options: GameOptions) {
    // Store setup options
    this.options = options

    // Setup signals
    const [canvas, setCanvas] = createSignal<Canvas>(this.createCanvas())
    const [controllers, setControllers] = createSignal<CanvasControllers>({})
    const [active, setActive] = createSignal<boolean>(true)
    const [paused, setPaused] = createSignal<boolean>(false)
    const [mute, setMute] = createSignal<boolean>(false)
    this.canvas = canvas
    this.setCanvas = setCanvas
    this.active = active
    this.setActive = setActive
    this.paused = paused
    this.setPaused = setPaused
    this.controllers = controllers
    this.setControllers = setControllers
    this.mute = mute
    this.setMute = setMute

    // Set window event listeners
    window.addEventListener('keydown', this.handleWindowKeydown.bind(this))

    // Run setup
    this.setup()
  }

  addController(...controllers: (C | undefined)[]) {
    controllers.forEach(controller => {
      if (!controller) return
      controller.setGame(this)
      this.setControllers({
        ...this.controllers(),
        [controller.id]: controller,
      })
    })
  }

  removeController(id: string) {
    const controllers = this.controllers()
    delete controllers[id]
    this.setControllers(controllers)
  }

  getController<T = Controller<any>>(id: string) {
    return this.controllers()[id] as T | undefined
  }

  handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'p' || event.key === 'Escape') {
      this.togglePause()
    }
  }

  togglePause() {
    if (!this.active()) return
    this.setPaused(!this.paused())
  }

  isActive() {
    return this.active() && !this.paused()
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
  
  setup() {
    this.options.setup?.(this)
    Object.values(this.controllers()).forEach(controller => {
      controller.setGame(this)
    })
  }

  reset() {
    Object.values(this.controllers()).forEach(controller => {
      controller.destroy()
    })
    requestAnimationFrame(() => {
      this.setControllers({})
      this.setup()
      this.setPaused(false)
      this.setCanvas(this.createCanvas())
    })
  }
}

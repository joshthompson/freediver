import { Canvas, CanvasControllers } from '@/game/core/Canvas'
import { Sprite } from '@/game/core/Sprite'
import { Accessor, createMemo, createSignal, Setter } from 'solid-js'

type Accessorise<T> = {
  [K in keyof T]: Accessor<T[K]>
}

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
  x: Accessor<number>
  y: Accessor<number>
  game?: Game
} & Partial<Accessorise<Sprite>>

type ControllerActions<CP extends ControllerBaseType> = {
  [key: string]: (data: CP, game: Game | undefined) => void
}

interface ControllerProps<T extends ControllerBaseType> {
  init: () => T
  frames?: Sprite['frames']
  class?: Sprite['class']
  style?: Sprite['style']
  frameRate?: number
  onEnterFrame?: (data: T, game: Game, age: number) => void
}

export interface Controller<
  CP extends ControllerBaseType,
  CA extends ControllerActions<CP>,
> {
  id: string
  frameRate: number
  onEnterFrame: (data: CP, game: Game, age: number) => void
  destroy: () => void
  setGame: (game: Game) => void
  data: CP
  sprite: Accessor<Sprite>
  age: Accessor<number>
  actions: {
    [K in keyof CA]: () => ReturnType<CA[K]>
  }
}

export function createController<
  CP extends ControllerBaseType,
  CA extends ControllerActions<CP>,
>(
  options: ControllerProps<CP>,
  actions: ControllerActions<CP> = {},
): Controller<CP, CA> {
  const [age, setAge] = createSignal<number>(0)
  const onEnterFrame = options.onEnterFrame ?? (() => {})
  const frameRate = options.frameRate ?? 40

  const data: CP = options.init()
  const interval = setInterval(() => {
    data.game && onEnterFrame(data, data.game, age())
    setAge(age() + 1)
  }, frameRate)
  const destroy = () => clearInterval(interval)
  const setGame = (game: Game) => (data.game = game)

  const frameInterval = data.frameInterval

  return {
    id: data.id,
    frameRate,
    onEnterFrame,
    destroy,
    setGame,
    age,
    data,
    sprite: createMemo(
      (): Sprite => ({
        frames: options.frames ?? [],
        class: options.class,
        style: options.style,
        x: data.x(),
        y: data.y(),
        xScale: data.xScale?.() ?? 1,
        yScale: data.yScale?.() ?? 1,
        width: data.width?.(),
        rotation: data.rotation?.() ?? 0,
        state: data.state?.(),
        frameInterval: data.frameInterval?.(),
      }),
    ),
    actions: Object.fromEntries(
      Object.entries(actions).map(([key, fn]) => [
        key,
        () => fn(data, data.game),
      ]),
    ) as { [K in keyof CA]: () => ReturnType<CA[K]> },
  }
}

export class Game<C extends Controller<any, any> = Controller<any, any>> {
  canvas: Canvas
  controllers: Accessor<CanvasControllers>
  setControllers: Setter<CanvasControllers>

  constructor(options: {
    width: number
    height: number
    x?: number,
    y?: number,
    controllers?: CanvasControllers
  }) {
    const [controllers, setControllers] = createSignal<CanvasControllers>(
      options.controllers ?? {},
    )

    Object.values(controllers()).forEach(controller => {
      controller.setGame(this)
    })

    this.controllers = controllers
    this.setControllers = setControllers

    const [x, setX] = createSignal(options.x ?? 0)
    const [y, setY] = createSignal(options.y ?? 0)

    this.canvas = {
      width: options.width,
      height: options.height,
      x,
      y,
      setX,
      setY,
      controllers,
    }
  }

  addController(controller: C) {
    controller.setGame(this)
    this.setControllers({
      ...this.controllers(),
      [controller.id]: controller,
    })
  }

  removeController(id: string) {
    const controllers = this.controllers()
    delete controllers[id]
    this.setControllers(controllers)
  }

  getController(id: string) {
    return this.controllers()[id]
  }
}

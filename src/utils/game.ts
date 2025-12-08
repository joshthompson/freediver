import { Scene } from '@/engine'
import { Sprite } from '@/engine/components/Sprite'
import { cx } from '@style/css'
import { Accessor, createMemo, createSignal, JSX, Setter } from 'solid-js'
import { blockBySolidsRectPlayer } from './blockBySolids'

type Accessorise<T> = {
  [K in keyof T]: Accessor<T[K]>
}

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

export type ControllerBaseType = {
  id: string
  type: string
  x: Accessor<Sprite['x']>
  y: Accessor<Sprite['y']>
  setX?: Setter<Sprite['x']>
  setY?: Setter<Sprite['y']>
  scene?: Scene
  style?: Accessor<Sprite['style']>
  width: Accessor<Sprite['width']>
  height: Accessor<number>
  inner?: {
    rotation?: Accessor<number>
    origin?: Accessor<Vector>
  },
} & Partial<Accessorise<Sprite>>

interface OnEnterFrameData<T extends ControllerBaseType> {
  $: T,
  $scene: Scene,
  $age: number,
  $currentFrame: number
  $controller: Controller<T>
}

interface OnMountData<T extends ControllerBaseType> {
  $: T,
  $scene: Scene,
  $currentFrame: number
  $controller: Controller<T>
  $ref: HTMLDivElement | undefined
}

interface ControllerProps<T extends ControllerBaseType> {
  init: () => T
  frames?: Sprite['frames']
  solid?: SolidRect
  blockedBySolid?: boolean
  randomStartFrame?: Sprite['randomStartFrame']
  class?: Sprite['class']
  style?: Sprite['style']
  onEnterFrame?: (data: OnEnterFrameData<T>) => void
  onMount?: (data: OnMountData<T>) => void
}

export type SolidRectInner = boolean | Rect
export type SolidRect = SolidRectInner | Accessor<SolidRectInner>

export interface Controller<
  CP extends ControllerBaseType,
> {
  type: string
  id: string
  frames?: Sprite['frames']
  solid: SolidRect
  onEnterFrame: (scene: Scene) => void
  destroy: () => void
  hitTest: (other: Controller<any>) => boolean
  distanceTo: (x: number, y: number) => number
  direction: (x: number, y: number) => number
  setGame: (scene: Scene) => void
  data: CP
  sprite: Accessor<Sprite>
  age: Accessor<number>
}

export function createController<
  CP extends ControllerBaseType
>(options: ControllerProps<CP>): Controller<CP> {

  const [age, setAge] = createSignal<number>(0)
  const onEnterFrame = options.onEnterFrame ?? (() => {})
  const [currentFrame, setCurrentFrame] = createSignal<number>(0)
  const data: CP = options.init()
  const destroy = () => {}
  const setGame = (scene: Scene) => (data.scene = scene)
  const hitTest = (other: Controller<any>) => {
    const ref1 = document.querySelector(`[data-controller-id="${data.id}"]`) as HTMLElement
    const ref2 = document.querySelector(`[data-controller-id="${other.id}"]`) as HTMLElement
    return isOverlapping(ref1, ref2)
  }
  const distanceTo = (x: number, y: number) => {
    return Math.hypot(data.x() - x, data.y() - y)
  }
  const direction = (x: number, y: number) => {
    return Math.atan2(y - data.y(), x - data.x())
  }

  const controller: Controller<CP> = {
    id: data.id,
    type: data.type,
    frames: options.frames,
    solid: options.solid ?? false,
    onEnterFrame: $scene => {
      const prevX = data.x()
      const prevY = data.y()

      onEnterFrame({
        $: data,
        $scene,
        $age: age(),
        $currentFrame: currentFrame(),
        $controller: controller
      })

      if (options.blockedBySolid) {
        // blockBySolids(data, prevX, prevY)
        blockBySolidsRectPlayer(data, prevX, prevY)
      }
      setAge(age() + 1)
    },
    destroy,
    hitTest,
    distanceTo,
    direction,
    setGame,
    age,
    data,
    sprite: createMemo(
      (): Sprite => ({
        frames: data?.frames?.() ?? options.frames ?? [],
        frame: data?.frame?.(),
        randomStartFrame: options.randomStartFrame ?? false,
        class: cx(options.class, data.class?.()),
        style: { ...options.style, ...data.style?.() },
        x: data.x(),
        y: data.y(),
        origin: data.origin?.(),
        xScale: data.xScale?.() ?? 1,
        yScale: data.yScale?.() ?? 1,
        width: data.width(),
        height: data.height?.() ?? console.log(data.type) ?? 0,
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
        onMount: ({ $ref }) => {
          options.onMount && options.onMount({
            $: data,
            $scene: data.scene!,
            $controller: controller,
            $currentFrame: currentFrame(),
            $ref: $ref,
          })
        },
      }),
    ),
  }

  return controller
}

type ExtractControllerType<T> = T extends Controller<infer A> ? A : never

export function createConnectedController<C extends Controller<any>>(options: {
  type: string | ((baseType: string) => string),
  base: C,
  frames?: ControllerProps<ExtractControllerType<C>>['frames'],
  offset: { x: number, y: number },
  transformOrigin?: { x: number, y: number },
  origin?: { x: number, y: number },
  solid?: SolidRect
  width: ($: ExtractControllerType<C>) => number,
  height: ($: ExtractControllerType<C>) => number,
  xScale?: ($: ExtractControllerType<C>) => number,
  rotation?: ($: ExtractControllerType<C>, $age: number) => number,
  frameInterval?: ($: ExtractControllerType<C>) => number,
  state?: ($: ExtractControllerType<C>) => Sprite['state'],
  onEnterFrame?: ControllerProps<ExtractControllerType<C>>['onEnterFrame'],
  frame?: ($: ExtractControllerType<C>) => number,
  style?: ($: ExtractControllerType<C>) => JSX.CSSProperties,
  randomStartFrame?: boolean
}) {
  return createController({
    frames: options.frames,
    randomStartFrame: options.randomStartFrame ?? false,
    init() {
      const baseData = options.base.data as ExtractControllerType<C>

      return {
        id: `${options.base.id}-${options.type}`,
        type: typeof options.type === 'function'
          ? options.type(options.base.type)
          : `${options.base.type}-${options.type}`,

        x: () => baseData.x() + options.offset.x,
        y: () => baseData.y() + options.offset.y,
        frame: () => options.frame?.(baseData),
        frameInterval: () => options.frameInterval?.(baseData),
        state: () => options.state?.(baseData),
        width: options.width,
        height: options.height,
        rotation: baseData.rotation,
        xScale: baseData.xScale,
        solid: options.solid,
        origin: () => ({
          x: baseData.width() / 2 - options.offset.x + (options.transformOrigin?.x ?? 0),
          y: baseData.height() / 2 - options.offset.y + (options.transformOrigin?.y ?? 0),
        }),
        inner: {
          rotation: () => options.rotation?.(baseData, options.base.age()) ?? 0,
          origin: () => ({ x: options.origin?.x ?? 0, y: options.origin?.y ?? 0 }),
        },
        style: () => options.style?.(baseData),
      } as ExtractControllerType<C>
    },
    onEnterFrame: options.onEnterFrame,
  })
}

export interface Dialog {
  messages: DialogMessage[],
  onComplete?: () => void,
  pauseGameplay?: boolean,
}

export interface DialogMessage {
  text: string
  speaker?: string
  image?: string
  after?: () => void,
  options?: {
    text: string;
    value: string,
    next?: number,
    end?: boolean
    onSelect?: (scene: Scene) => void,
  }[]
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

export function isMobileBrowser() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

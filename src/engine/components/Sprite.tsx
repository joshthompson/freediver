import {
  Accessor,
  batch,
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Index,
  JSX,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { css, cx } from '@style/css'
import { SceneContext } from '@/utils/SceneContext'
import { Controller } from '../Controller'

export interface Sprite {
  ref?: HTMLDivElement | undefined
  frames: string[]
  frame?: number
  randomStartFrame?: boolean
  x: number
  y: number
  xScale?: number
  yScale?: number
  state?: 'play' | 'pause' | undefined
  width: number
  height: number
  class?: string
  style?: JSX.CSSProperties
  frameInterval?: number | Accessor<number>
  rotation?: number
  origin?: Vector
  inner?: {
    rotation?: number
    origin?: Vector
    style?: JSX.CSSProperties
  }
  parallax?: number
  children?: JSX.Element
  onClick?: () => void
  onChangeFrame?: (frameIndex: number) => void
  onMount?: (data: { $ref: HTMLDivElement | undefined }) => void
  controllers?: Accessor<Controller<any>[]>
}

// One animation clock for every sprite, rather than a timer each, so frame changes are written together
// just before the browser paints
const animations = new Set<(now: number) => void>()
let animationFrame: number | undefined

function tickAnimations(now: number) {
  batch(() => animations.forEach(animate => animate(now)))
  animationFrame = animations.size ? requestAnimationFrame(tickAnimations) : undefined
}

function addAnimation(animate: (now: number) => void) {
  animations.add(animate)
  animationFrame ??= requestAnimationFrame(tickAnimations)
  return () => animations.delete(animate)
}

interface SpriteExtendedProps {
  active?: boolean
  id?: string
  type?: string
  fixed?: boolean
}

export const Sprite: Component<Sprite & SpriteExtendedProps> = props => {
  const scene = useContext(SceneContext)
  if (!scene) return

  let ref: HTMLDivElement
  
  const [currentFrame, setCurrentFrame] = createSignal(
    props.randomStartFrame
      ? Math.floor(Math.random() * props.frames.length)
      : 0,
  )
  createEffect(() => props.onChangeFrame?.(currentFrame()))
  createEffect(() => typeof props.frame === 'number' && setCurrentFrame(props.frame))
  // Every prop read goes through the controller's sprite memo, so isolate the
  // frames array to only re-parse when the array itself changes
  const rawFrames = createMemo(() => props.frames)
  const frames = createMemo(() =>
    rawFrames().map(frame => {
      const image = frame.split('#')[0]
      const [left, top, width, height] = frame
        .split('#')[1]
        ?.split(',')
        .map(Number) ?? [0, 0, 0, 0]
      return {
        image,
        left,
        top,
        width,
        height,
      }
    }),
  )

  // Sprites that switch between separate image files keep them all painted, invisibly, so switching
  // doesn't flash blank while a big image decodes for the first time
  const standbyImages = createMemo(() => {
    const images = [...new Set(frames().map(frame => frame.image))]
    return images.length > 1 ? images : []
  })

  const frameStyle = createMemo(() => {
    const frame = frames()[currentFrame()]
    return {
      'background-image': `url(${frame.image})`,
      'background-position': `${frame.left}px ${frame.top}px`,
      'background-size':
        frame.width && frame.height
          ? `auto 100%`
          : '100% 100%',
    }
  })

  const frameInterval = () => typeof props.frameInterval === 'function'
    ? props.frameInterval()
    : (props.frameInterval ?? 100)
  const runAnimation = () => {
    if (props.active !== false && props.state === 'play' && props.frames.length) {
      setCurrentFrame(prev => (prev + 1) % props.frames.length)
    }
  }
  runAnimation()
  let nextFrameAt = performance.now() + frameInterval()
  onCleanup(addAnimation(now => {
    if (now < nextFrameAt) return
    runAnimation()
    // Step from when the frame was due, so intervals don't round up to the display's frame rate
    nextFrameAt = Math.max(nextFrameAt + frameInterval(), now)
  }))

  onMount(() => props.onMount?.({ $ref: ref }))

  // The Canvas's world layer already moves by the camera, so only parallax sprites need to offset it here
  const top = createMemo(() => {
    const parallax = props.parallax ?? 1
    if (props.fixed || parallax === 1) return props.y + 'px'
    return (props.y - scene.canvas.get().y() * (parallax - 1)) + 'px'
  })

  const left = createMemo(() => {
    const parallax = props.parallax ?? 1
    if (props.fixed || parallax === 1) return props.x + 'px'
    return (props.x - scene.canvas.get().x() * (parallax - 1)) + 'px'
  })

  return (
    <div
      data-controller-id={props.id}
      data-controller-type={props.type}
      ref={el => {
        ref = el
        props.ref = el
      }}
      class={cx(styles.sprite, props.class)}
      style={{
        top: top(),
        left: left(),
        transform: `scale(${(props.xScale ?? 1).toString()}, ${(props.yScale ?? 1).toString()})`,
        width: props.width + 'px',
        height: props.height + 'px',
        'pointer-events': props.onClick ? 'auto' : 'none',
        rotate: props.rotation + 'deg',
        "transform-origin": props.origin ? `${props.origin.x}px ${props.origin.y}px` : 'center',
        ...props.style,
      }}
      onClick={props.onClick}
      onTouchStart={props.onClick}
    >
      <div children={props.children} style={{
        width: '100%',
        height: '100%',
        rotate: props.inner?.rotation + 'deg',
        "transform-origin": props.inner?.origin ? `${props.inner.origin.x}px ${props.inner.origin.y}px` : 'center',
        ...(props.inner?.style ?? {}),
        ...frameStyle(),
      }} />
      <For each={standbyImages()}>
        {image => <div class={styles.standby} style={{ 'background-image': `url(${image})` }} />}
      </For>
      <Index each={props.controllers?.() ?? []}>
        {controller => <Sprite
          {...controller().sprite()}
          id={controller().id}
          type={controller().type}
          active={props.active}
          fixed
        />}
      </Index>
    </div>
  )
}

const styles = {
  sprite: css({
    position: 'absolute',
    top: 0,
    left: 0,
  }),
  standby: css({
    position: 'absolute',
    inset: 0,
    backgroundSize: '100% 100%',
    opacity: 0,
    willChange: 'opacity', // Keeps it rasterised, so the browser doesn't skip decoding it
    pointerEvents: 'none',
  }),
}

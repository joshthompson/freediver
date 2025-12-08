import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import { css, cx } from '@style/css'
import { SceneContext } from '@/utils/SceneContext'

export interface Sprite {
  ref?: HTMLDivElement | undefined
  frames: string[]
  frame?: number
  randomStartFrame?: boolean
  x: number
  y: number
  z?: number
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
}

interface SpriteExtendedProps {
  active?: boolean
  id?: string
  type?: string
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
  const frames = createMemo(() =>
    props.frames.map(frame => {
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
  const width = () => props.width
  const height = () => props.height

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

  // Preload frames
  // Promise.all(
  //   [...new Set(frames().map(f => f.image))].map(
  //     frame =>
  //       new Promise<HTMLImageElement>(resolve => {
  //         const img = new Image()
  //         img.src = frame
  //         img.onload = () => resolve(img)
  //       }),
  //   ),
  // ).then(results => {
  //   setImageSize({ width: results[0].width, height: results[0].height })
  // })

  let enterFrameTimeout: ReturnType<typeof setTimeout> | undefined

  const runAnimation = () => {
    if (props.active !== false && props.state === 'play' && props.frames.length) {
      setCurrentFrame(prev => (prev + 1) % props.frames.length)
    }
    setTimeout(
      runAnimation,
      typeof props.frameInterval === 'function'
        ? props.frameInterval()
        : (props.frameInterval ?? 100),
    )
  }
  runAnimation()

  onMount(() => props.onMount?.({ $ref: ref }))
  onCleanup(() => clearTimeout(enterFrameTimeout))

  const left = createMemo(() => {
    return (props.x - scene.canvas.get().x() * (props.parallax ?? 1)) + 'px'
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
        top: (props.y - 0 * (props.parallax ?? 1)) + 'px',
        left: left(),
        transform: `scale(${(props.xScale ?? 1).toString()}, ${(props.yScale ?? 1).toString()})`,
        width: props.width + 'px',
        height: props.height + 'px',
        'pointer-events': props.onClick ? 'auto' : 'none',
        rotate: props.rotation + 'deg',
        'z-index': props.z,
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
    </div>
  )
}

const styles = {
  sprite: css({
    position: 'absolute',
    top: 0,
    left: 0,
  }),
}

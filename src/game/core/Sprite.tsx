import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  JSX,
  onCleanup,
  useContext,
} from 'solid-js'
import { css, cx } from '@style/css'
import { GameContext } from '@/utils/GameContext'

export interface Sprite {
  ref?: HTMLDivElement | undefined
  frames: string[]
  randomStartFrame?: boolean
  x: number
  y: number
  z?: number
  xScale?: number
  yScale?: number
  state?: 'play' | 'pause' | undefined
  width?: number
  class?: string
  style?: JSX.CSSProperties
  frameInterval?: number | Accessor<number>
  rotation?: number
  origin?: { x: number; y: number }
  onClick?: () => void
  onChangeFrame?: (frameIndex: number) => void
}

export const Sprite: Component<Sprite> = props => {
  const game = useContext(GameContext)
  if (!game) return
  
  const [loading, setLoading] = createSignal(true)
  const [imageSize, setImageSize] = createSignal<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0,
  })
  const [currentFrame, setCurrentFrame] = createSignal(
    props.randomStartFrame
      ? Math.floor(Math.random() * props.frames.length)
      : 0,
  )
  createEffect(() => props.onChangeFrame?.(currentFrame()))
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
  const width = createMemo(() => props.width ? props.width : imageSize().width)

  const size = createMemo(() =>
    frames()[0].width
      ? { width: frames()[0].width, height: frames()[0].height }
      : imageSize(),
  )

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
  Promise.all(
    [...new Set(frames().map(f => f.image))].map(
      frame =>
        new Promise<HTMLImageElement>(resolve => {
          const img = new Image()
          img.src = frame
          img.onload = () => resolve(img)
        }),
    ),
  ).then(results => {
    setLoading(false)
    setImageSize({ width: results[0].width, height: results[0].height })
  })

  let enterFrameTimeout: ReturnType<typeof setTimeout> | undefined

  const runAnimation = () => {
    if (props.state === 'play' && props.frames.length) {
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

  onCleanup(() => clearTimeout(enterFrameTimeout))

  return (
    <div
      ref={props.ref}
      class={cx(styles.sprite, props.class)}
      style={{
        display: loading() ? 'none' : 'block',
        'aspect-ratio': `${size().width} / ${size().height}`,
        top: (props.y - game.canvas.y()) + 'px',
        left: (props.x - game.canvas.x()) + 'px',
        transform: `scale(${(props.xScale ?? 1).toString()}, ${(props.yScale ?? 1).toString()})`,
        width: width() + 'px',
        'pointer-events': props.onClick ? 'auto' : 'none',
        rotate: props.rotation + 'deg',
        'z-index': props.z,
        "transform-origin": props.origin ? `${props.origin.x}px ${props.origin.y}px` : 'center',
        ...frameStyle(),
        ...props.style,
      }}
      onClick={props.onClick}
      onTouchStart={props.onClick}
    />
  )
}

const styles = {
  sprite: css({
    position: 'absolute',
    top: 0,
    left: 0,
  }),
}

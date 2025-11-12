import { Accessor, createSignal, For, JSX, onCleanup, Setter } from 'solid-js'
import { css, cx } from '@style/css'
import { Sprite } from './Sprite'
import { Controller, Game } from '@/utils/game'
import { GameContext } from '@/utils/GameContext'
import { Debugger } from './Debugger'

export type CanvasControllers = Record<string, Controller<any, any>>

export interface CanvasProps {
  ref?: HTMLDivElement | undefined
  game: Game
  overlay?: JSX.Element
  underlay?: JSX.Element
  style?: JSX.CSSProperties
  class?: string
  debug?: boolean
  onClick?: (event: { x: number, y: number }) => void
  onMouseDown?: (event: { x: number, y: number }) => void
  onMouseUp?: (event: { x: number, y: number }) => void
}

export interface Canvas<T extends CanvasControllers = CanvasControllers> {
  width: number
  height: number
  x: Accessor<number>
  setX: Setter<number>
  y: Accessor<number>
  setY: Setter<number>
  controllers: Accessor<T>
}

export function Canvas<T extends CanvasControllers = CanvasControllers>(
  props: CanvasProps,
) {
  const [debugOn, setDebugOn] = createSignal(!!props.debug)

  onCleanup(() => {
    Object.values(props.game.controllers()).forEach(controller =>
      controller.destroy(),
    )
  })

  const typeOrder = [
    'bubble',
    'corgi',
    'diver',
    'fish',
    'octopus',
    'crab',
  ]
  const sprites = () => {
    const all = Object.values(props.game.controllers())
    return all.toSorted((a, b) => {
      const aP = typeOrder.findIndex(type => type === a.type)
      const bP = typeOrder.findIndex(type => type === b.type)
      return bP - aP
    })
  }

  const getMousePosition = (event: MouseEvent | TouchEvent) => {
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = (event instanceof MouseEvent
      ? event.clientX - rect.left
      : event.touches[0].clientX - rect.left) + props.game.canvas().x()
    const y = (event instanceof MouseEvent
      ? event.clientY - rect.top
      : event.touches[0].clientY - rect.top) + props.game.canvas().y()
    return { x, y }
  }

  const handleClick = (e: MouseEvent) => props.onClick?.(getMousePosition(e))
  const handleTouchStart = (e: TouchEvent) => {
    props.onClick?.(getMousePosition(e))
    props.onMouseDown?.(getMousePosition(e))
  }
  const handleTouchEnd = (e: TouchEvent) => {
    props.onClick?.(getMousePosition(e))
    props.onMouseUp?.(getMousePosition(e))
  }
  const handleMouseDown = (e: MouseEvent) => props.onMouseDown?.(getMousePosition(e))
  const handleMouseUp = (e: MouseEvent) => props.onMouseUp?.(getMousePosition(e))

  return (
    <GameContext.Provider value={props.game}>
      <div
        ref={props.ref}
        class={cx(styles.canvas, props.class)}
        style={{
          width: `${props.game.canvas().width}px`,
          height: `${props.game.canvas().height}px`,
          ...props.style,
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {props.underlay}
        <For each={sprites()}>
          {controller => <Sprite {...controller.sprite()} active={props.game.isActive()} />}
        </For>
        {props.overlay}
        {debugOn() && <Debugger game={props.game} />}
      </div>
    </GameContext.Provider>
  )
}

const styles = {
  canvas: css({
    position: 'relative',
    overflow: 'hidden',
    background: 'white',
    imageRendering: 'pixelated',
  }),
}

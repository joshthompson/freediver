import { Accessor, Component, For, JSX, onCleanup, Setter } from 'solid-js'
import { css, cx } from '@style/css'
import { Sprite } from './Sprite'
import { Controller, Game } from '@/utils/game'
import { GameContext } from '@/utils/GameContext'
import { Debugger } from './Debugger'

export type CanvasControllers = { id: string, controller: Controller<any> }[]

export interface CanvasProps {
  ref?: HTMLDivElement | undefined
  game: Game
  loading?: Component<{ game: Game }>
  dialog?: Component<{ game: Game }>
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
  onCleanup(() => {
    props.game.controllers().forEach(({ controller }) =>
      controller.destroy(),
    )
  })

  const sprites = () => {
    const assetOrder = props.game.options.assetOrder ?? []
    return props.game.controllers()
      .map(({ controller }) => controller)
      .toSorted((a, b) => {
        const aP = assetOrder.findIndex(type => type === a.type)
        const bP = assetOrder.findIndex(type => type === b.type)
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
        data-game-scene={props.game.id}
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
          {controller => <Sprite {...controller.sprite()} id={controller.id} active={props.game.isActive()} />}
        </For>
        {props.dialog && <props.dialog game={props.game} />}
        {props.overlay}
        {props.loading && props.game.loading() && <props.loading game={props.game} />}
        {!!props.debug && <Debugger game={props.game} />}
      </div>
    </GameContext.Provider>
  )
}

const styles = {
  canvas: css({
    position: 'relative',
    overflow: 'hidden',
    background: 'white',
  }),
}

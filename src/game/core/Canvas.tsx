import { Accessor, For, JSX, onCleanup, Setter } from 'solid-js'
import { css, cx } from '@style/css'
import { Sprite } from './Sprite'
import { Controller, Game } from '@/utils/game'
import { GameContext } from '@/utils/GameContext'

export type CanvasControllers = Record<string, Controller<any, any>>

export interface CanvasProps {
  ref?: HTMLDivElement | undefined
  game: Game
  children?: JSX.Element
  style?: JSX.CSSProperties
  class?: string
  onClick?: () => void
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
    Object.values(props.game.controllers()).forEach(controller =>
      controller.destroy(),
    )
  })

  const sprites = () => {
    const all = Object.values(props.game.controllers())
    return all.toSorted((a, b) => a.data.y - b.data.y)
  }

  return (
    <GameContext.Provider value={props.game}>
      <div
        ref={props.ref}
        class={cx(styles.canvas, props.class)}
        style={{
          width: `${props.game.canvas.width}px`,
          height: `${props.game.canvas.height}px`,
          ...props.style,
        }}
        onClick={props.onClick}
        onTouchStart={props.onClick}
      >
        <For each={sprites()}>
          {controller => <Sprite {...controller.sprite()} />}
        </For>
        {props.children}
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

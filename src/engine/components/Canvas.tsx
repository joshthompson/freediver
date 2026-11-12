import { Canvas as ScoopCanvas, type CanvasProps as ScoopCanvasProps } from 'scoopjs'
import { css, cx } from '@style/css'
import { Debugger } from './Debugger'

export type { CanvasControllers } from 'scoopjs'

export interface CanvasProps extends Omit<ScoopCanvasProps, 'runOffScreen'> {
  debug?: boolean
}

// ScoopJS's Canvas, the way freediver has always had it:
// - The scene keeps running whether or not the canvas is on the screen
// - A class can set the background, which is white otherwise, and a modal's shade is a little darker
// - Clicks and touches are heard here rather than by ScoopJS, which reads a touch from the fingers
//   still down, so has nothing to go on when the last one lifts. Here a touch is wherever the finger
//   that changed is, so a tap's end is heard too
export function Canvas(props: CanvasProps) {
  let events: HTMLDivElement | undefined

  const getMousePosition = (event: MouseEvent | TouchEvent) => {
    const canvas = events!.firstElementChild as HTMLElement
    const rect = canvas.getBoundingClientRect()
    const point = event instanceof MouseEvent ? event : event.changedTouches[0]
    return {
      x: point.clientX - rect.left + props.scene.canvas.get().x(),
      y: point.clientY - rect.top + props.scene.canvas.get().y(),
    }
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

  // No box of its own, so the canvas is laid out as if this weren't here
  return <div
    ref={events}
    class={styles.events}
    onClick={handleClick}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    onMouseDown={handleMouseDown}
    onMouseUp={handleMouseUp}
  >
    <ScoopCanvas
      scene={props.scene}
      loading={props.loading}
      dialog={props.dialog}
      underDialog={props.underDialog}
      underlay={props.underlay}
      overlay={<>
        {props.overlay}
        {!!props.debug && <Debugger scene={props.scene} />}
      </>}
      class={cx(styles.canvas, props.class)}
      style={{
        background: undefined, // Left to the class, unlike ScoopJS's inline white
        ...props.style,
      }}
      runOffScreen
    />
  </div>
}

const styles = {
  events: css({
    display: 'contents',
    // Up here rather than on the canvas: a level restyles its canvas every tick as the camera moves, and
    // a custom property of its own makes the browser restyle every sprite in it each time
    '--scoopjs-modal-backdrop': '#00000088',
  }),
  canvas: css({
    background: 'white',
  }),
}

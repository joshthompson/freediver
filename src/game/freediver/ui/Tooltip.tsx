import { css } from '@style/css'
import { Component, createEffect, createSignal, JSX, Show } from 'solid-js'

export const Tooltip: Component<{
  content: JSX.Element
  children: JSX.Element
  disabled?: boolean
}> = props => {
  const [show, setShow] = createSignal(false)
  let anchor: HTMLDivElement | undefined
  let tooltip: HTMLDivElement | undefined

  createEffect(() => {
    if (show()) {
      if (anchor && tooltip) {
        const anchorRect = anchor.getBoundingClientRect()
        const tooltipRect = tooltip.getBoundingClientRect()
        const canvasRect = document.querySelector('[data-game-scene]')!.getBoundingClientRect()

        const pageMargin = 10
        const margin = pageMargin + (canvasRect.left ?? 0)
        const tooltipLeft = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2 - margin

        tooltip.style.left = `${Math.max(
          -margin + 30,
          Math.min(window.innerWidth - tooltipRect.width - margin * 2, tooltipLeft)
        )}px`
        tooltip.style.top = `${anchorRect.top - tooltipRect.height - 23}px`
      }
    }
  })

  return <div class={styles.tooltipContainer}>
    <div
      ref={anchor}
      class={styles.anchor}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      children={props.children} 
    />
    <Show when={show() && !props.disabled}>
      <div ref={tooltip} class={styles.tooltip} children={props.content} />
    </Show>
  </div>
}

const styles = {
  tooltipContainer: css({
    position: 'relative',
  }),
  anchor: css({
    display: 'inline-block',
    height: '100%',
  }),
  tooltip: css({
    position: 'fixed',

    padding: '0.4rem 0.6rem',
    fontSize: '1rem',
    background: '#000000',
    color: 'white',
    borderRadius: '5px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    zIndex: 100,
  }),
}

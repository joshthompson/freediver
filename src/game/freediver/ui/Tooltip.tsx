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
    if (!show() || props.disabled || !anchor || !tooltip) return

    // The game page is scaled with a transform (and some menus use backdrop-filter), which makes
    // that ancestor the containing block for this fixed tooltip. Measure where left/top 0 lands
    // and the current scale, then work in screen coordinates and convert back.
    tooltip.style.left = '0px'
    tooltip.style.top = '0px'
    const origin = tooltip.getBoundingClientRect()
    const scale = origin.width / tooltip.offsetWidth || 1
    const anchorRect = anchor.getBoundingClientRect()
    const bounds = (anchor.closest('[data-game-scene]') ?? document.body).getBoundingClientRect()

    const margin = 10 * scale
    const gap = 5 * scale
    const centred = anchorRect.left + anchorRect.width / 2 - origin.width / 2
    const left = Math.max(bounds.left + margin, Math.min(bounds.right - origin.width - margin, centred))
    const above = anchorRect.top - origin.height - gap
    const top = above < bounds.top ? anchorRect.bottom + gap : above

    tooltip.style.left = `${(left - origin.left) / scale}px`
    tooltip.style.top = `${(top - origin.top) / scale}px`
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

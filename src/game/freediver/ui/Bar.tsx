import { css, cx } from '@style/css'
import { Component } from 'solid-js'

export const Bar: Component<{
  percent: number
  class?: string
}> = props => {
  return <div class={cx(styles.bar, props.class)}>
    <div class={styles.inner} style={{ '--percent': props.percent }} />
  </div>
}

const styles = {
  bar: css({
    width: '300px',
    borderRadius: '10px',
    border: '3px solid white',
    height: '20px',
    background: 'white',
  }),
  inner: css({
    height: '100%',
    width: 'calc(1% * var(--percent, 0))',
    maxWidth: '100%',
    minWidth: '0%',
    background: `
      color-mix(
        in srgb,
        #0ab6fa calc(1% * var(--percent, 0)),
        red calc(100% - 1% * var(--percent, 0))
      )
    `,
    borderRadius: '7px',
    transition: 'width 0.1s linear',
  }),
}

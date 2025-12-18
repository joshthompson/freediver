import { css } from '@style/css'
import { Component, Index } from 'solid-js'

export const LetterBounce: Component<{ children: string }> = props => {

  const letters = () => props.children.split('')

  return <div class={styles.letter}>
    <Index each={letters()}>
      {(letter, i) => <div
        class={styles.letter}
        style={{
          'animation-delay': `${i * 0.1 - 0.1 * letters().length}s`,
          'display': 'inline-block',
          'animation': 'bounce 0.6s infinite',
        }}
      >
        {letter()}
      </div>}
    </Index>
  </div>
}

const styles = {
  letters: css({
  }),
  letter: css({
  }),
}

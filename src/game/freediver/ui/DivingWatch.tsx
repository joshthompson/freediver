import { Component } from "solid-js"
import watch from '@assets/sprites/watch/watch.png'
import { css, cx } from "@style/css"
import { useGameState } from "@/utils/GameStateContext"
import { Translations } from "@/utils/Translations"

export const DivingWatch: Component<{ depth: number }> = props => {
  const { gameState } = useGameState()!
  const t = () => Translations[gameState.options.locale]

  return <div class={styles.watch} style={{ 'background-image': `url(${watch})` }}>
    <div class={styles.data}>
      <div class={styles.key}>{props.depth}</div>
      <div class={styles.value}>{t().watch.meters}</div>
    </div>
    <div class={styles.data}>
      <div class={styles.key}>{Math.ceil(gameState.diver.oxygen)}</div>
      <div class={styles.value}>{t().watch.oxygen}</div>
    </div>
    <div class={styles.data}>
      <div class={styles.key}>{gameState.score.currentDive}</div>
      <div class={cx(styles.value, styles.star)}>★</div>
    </div>
  </div>
}

const styles = {
  watch: css({
    position: 'absolute',
    width: '84px',
    aspectRatio: '425 / 576',
    top: '4px',
    right: '4px',
    fontSize: '1.25rem',
    backgroundSize: 'cover',
    textAlign: 'center',
    paddingRight: '16px',
    paddingLeft: '8px',
    paddingBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    lineHeight: '0.75em',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
  }),

  data: css({
    width: '80%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
  }),

  key: css({
    flex: '1 1 50%',
    textAlign: 'right',
    // outline: '1px dashed white',
  }),

  value: css({
    flex: '1 1 50%',
    textAlign: 'left',
    // outline: '1px dashed white',
  }),

  star: css({
    fontSize: '0.6rem',
    mt: '3px',
  }),
}

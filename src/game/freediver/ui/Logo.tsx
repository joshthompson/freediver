import { useGameState } from '@/utils/GameStateContext'
import { css, cx } from '@style/css'
import { Component } from 'solid-js'
import { Translations } from '../data/Translations'

export const Logo: Component<{ class?: string }> = props => {
  const gameState = useGameState()!
  const t = () => Translations[gameState.gameState.options.locale]

  return <div class={cx(styles.logo, props.class)}>
    <div class={styles.alisa}>{t().common.title1}</div>
    <div class={styles.freediver}>{t().common.title2}</div>
  </div>
}

const styles = {
  logo: css({
    fontSize: '4rem',
    textAlign: 'center',
    lineHeight: '1em',
    textTransform: 'uppercase',
  }),
  alisa: css({
    color: '#FACC17',
    fontSize: '2em',
    textShadow: '0.03em 0.03em 0 black',
  }),
  freediver: css({
    fontSize: '0.6em',
  }),
}

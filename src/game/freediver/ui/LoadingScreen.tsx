import { Game } from '@/utils/game'
import { css } from '@style/css'
import { Component } from 'solid-js'

export const LoadingScreen: Component<{game: Game}> = props => {
  const percent = () => Math.floor(
    100 * props.game.loadingAssetCount() / props.game.loadingAssetTotal()
  )

  return <div class={styles.loadingScreen}>
    {percent()}%
  </div>
}

const styles = {
  loadingScreen: css({
    position: 'absolute',
    inset: '0',
    background: 'black',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '3rem',
  }),
}

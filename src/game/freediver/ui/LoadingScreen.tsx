import { Scene } from '@/engine'
import { css } from '@style/css'
import { Component } from 'solid-js'

export const LoadingScreen: Component<{scene: Scene}> = props => {
  const percent = () => Math.floor(
    100 * props.scene.loadingAssetCount.get() / props.scene.loadingAssetTotal.get()
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

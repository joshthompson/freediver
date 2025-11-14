import { Component } from "solid-js"
import watch from '@public/watch.png'
import { css } from "@style/css"

export const DivingWatch: Component<{ depth: number}> = props => {
  return <div class={styles.depth} style={{ 'background-image': `url(${watch})` }}>{props.depth}m</div>
}

const styles = {
  depth: css({
    position: 'absolute',
    width: '84px',
    aspectRatio: '21 / 26',
    top: '4px',
    right: '4px',
    fontSize: '2rem',
    backgroundSize: 'cover',
    textAlign: 'center',
    paddingRight: '16px',
    paddingLeft: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
  }),
}

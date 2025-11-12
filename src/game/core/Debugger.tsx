import { Game } from "@/utils/game";
import { css } from "@style/css";
import { Component } from "solid-js";

export const Debugger: Component<{ game: Game }> = props => {
  return <div class={styles.debugger}>
    <div>
      <div>Controllers:</div>
      <div>{Object.keys(props.game.controllers()).length}</div>
    </div>
  </div>
}

const styles = {
  debugger: css({
    position: 'absolute',
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gap: '0 2rem',
    top: '10px',
    left: '10px',
    width: 'max-content',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    fontSize: '12px',
    overflowY: 'auto',
    p: '10px',
    zIndex: 1000,

    '& > div': {
      display: 'contents',
    },
  }),
}

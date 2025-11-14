import { Game } from "@/utils/game";
import { Component } from "solid-js";
import { Button } from "./Button";
import { css } from "@style/css";

export const PauseMenu: Component<{ game: Game, exitToMenu: () => void }> = props => {
  return <div class={styles.paused}>
    <div>PAUSED</div>
    <Button onClick={() => props.game.togglePause()} size="small">Resume</Button>
    <Button onClick={() => props.game.setMute(!props.game.mute())} size="small">
     Volume: { props.game.mute() ? 'Off' : 'On' }
    </Button>
    <Button onClick={() => props.exitToMenu()} size="small">Exit to menu</Button>
  </div>
}

const styles = {
  paused: css({
    position: 'absolute',
    inset: '0',
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '3rem',
    flexDirection: 'column',
    gap: '10px',
  }),
}

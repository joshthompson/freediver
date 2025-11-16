import { Game } from "@/utils/game";
import { Component, useContext } from "solid-js";
import { Button } from "./Button";
import { css } from "@style/css";
import { GameStateContext } from "@/utils/GameStateContext";

export const PauseMenu: Component<{ game: Game, exitToMenu: () => void }> = props => {
  const [gameState, setGameState] = useContext(GameStateContext)!

  const toggleVolume = () => {
    const on = gameState.options.volume > 0
    const audioElements = document.querySelectorAll<HTMLAudioElement>('audio[data-game-volume]')
    audioElements.forEach(audio => {
      audio.volume = on ? 0 : parseFloat(audio.getAttribute('data-game-volume')!)
    })
    window.localStorage.setItem('game-volume', JSON.stringify(on ? 0 : 1))
    setGameState('options', 'volume', on ? 0 : 1)
  }
  
  return <div class={styles.paused}>
    <div>PAUSED</div>
    <Button onClick={() => props.game.togglePause()} size="small">Resume</Button>
    <Button onClick={toggleVolume} size="small">
     Volume: { gameState.options.volume > 0 ? 'On' : 'Off' }
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

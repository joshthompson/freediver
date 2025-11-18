import { Game } from "@/utils/game";
import { Component } from "solid-js";
import { Button } from "./Button";
import { css } from "@style/css";
import { useGameState } from "@/utils/GameStateContext";
import { translations } from "@/utils/Translations";

export const PauseMenu: Component<{ game: Game, exitToMenu: () => void }> = props => {
  const { gameState, gameStateActions } = useGameState()!
    const t = () => translations[gameState.options.locale]

  return <div class={styles.paused}>
    <div>{t().pause.title}</div>
    <Button onClick={() => props.game.togglePause()} size="small">{t().pause.resume}</Button>
    <Button onClick={gameStateActions.toggleVolume} size="small">
      {gameState.options.volume > 0
        ? t().common.volumeOn
        : t().common.volumeOff}
    </Button>
    <Button onClick={() => props.exitToMenu()} size="small">{t().common.exitToMenu}</Button>
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
    color: 'white',
  }),
}

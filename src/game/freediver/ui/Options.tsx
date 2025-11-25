import { css } from "@style/css";
import { Component } from "solid-js";
import { Button } from "./Button";
import { useGameState } from "@/utils/GameStateContext";
import { LocaleFlags, LocaleNames, Translations } from "@/game/freediver/data/Translations";

export const Options: Component<{ mode: 'pause' | 'menu' }> = props => {
  const size = () => props.mode === 'menu' ? 'medium' : 'small'
  const { gameState, gameStateActions } = useGameState()!
  const t = () => Translations[gameState.options.locale]

  return <>
    <Button onClick={gameStateActions.toggleVolume} size={size()}>
      {gameState.options.volume > 0
        ? t().common.volumeOn
        : t().common.volumeOff}
    </Button>
    {props.mode === 'menu' && <Button onClick={gameStateActions.clearGameData} size={size()}>
      {t().options.clearGameData}
    </Button>}
    <Button onClick={gameStateActions.toggleLanguage} size={size()}>
      <div class={styles.localePicker}>
        {LocaleNames[gameState.options.locale]}
        <img src={LocaleFlags[gameState.options.locale]} class={styles.flag} />
      </div>
    </Button>
  </>
}

const styles = {
  localePicker: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  }),
  flag: css({
    height: '1.5rem',
    width: '1.5rem',
    borderRadius: '50%',
    border: '2px solid white',
    mr: '-10px'
  }),
}
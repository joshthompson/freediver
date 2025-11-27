import { Scene } from "@/engine";
import { Component, createSignal } from "solid-js";
import { Button } from "./Button";
import { css } from "@style/css";
import { useGameState } from "@/utils/GameStateContext";
import { Translations } from "@/game/freediver/data/Translations";
import { Achievements } from "./Achievements";
import { Options } from "./Options";

export const PauseMenu: Component<{ scene: Scene, exitToMenu: () => void }> = props => {
  const [view, setView] = createSignal<'main' | 'achievements'>('main')
  const { gameState } = useGameState()!
    const t = () => Translations[gameState.options.locale]

  return <div class={styles.paused}>
    {view() === 'main' && <>
      <div>{t().pause.title}</div>
      <Button onClick={() => props.scene.togglePause()} size="small">{t().pause.resume}</Button>
      <Options mode="pause" />
      <Button onClick={() => setView('achievements')} size="small">{t().achievements.title}</Button>
      <Button onClick={() => props.exitToMenu()} size="small">{t().common.exitToMenu}</Button>
    </>}
    {view() === 'achievements' && <>
      <Achievements />
      <Button onClick={() => setView('main')} size="small">{t().common.back}</Button>
    </>}
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
    backdropFilter: 'blur(2px)',
  }),
}

import { trophyAsset } from "@/assets";
import { useGameState } from "@/utils/GameStateContext";
import { css, cva } from "@style/css";
import { Component, For, Show } from "solid-js";
import { Tooltip } from "./Tooltip";
import { AchievementEmojis, AllAchievements } from "../data/Achievements";
import { Translations } from "@/game/freediver/data/Translations";

export const Achievements: Component = () => {
  const { gameState } = useGameState()!
  const t = () => Translations[gameState.options.locale]

  const achievements = () => AllAchievements.map(achievement => ({
    id: achievement,
    name: t().achievements[achievement],
    desription: t().achievements[`${achievement}Description`] || undefined,
    emoji: AchievementEmojis[achievement],
    unlocked: !!gameState.achievements[achievement],
  }))

  return <div class={styles.achievements}>
    <For each={achievements()}>
      {achievement => (
        <Tooltip content={achievement.desription} disabled={!achievement.desription}>
          <div class={styles.achievement({ unlocked: achievement.unlocked })}>
            <img src={trophyAsset} />
            <Show when={achievement.unlocked}>
              <div class={styles.emoji}>{achievement.emoji}</div>
            </Show>
            <div class={styles.name}>{achievement.name}</div>
          </div>
        </Tooltip>
      )}
    </For>
  </div>
}

const styles = {
  title: css({
    fontSize: '2rem',
    my: '20px -20px'
  }),
  achievements: css({
    display: 'grid',
    gap: '5px',
    m: '2rem 1rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    fontSize: '16px',
    wordBreak: 'break-word',
  }),
  achievement: cva({
    base: {
      position: 'relative',
      backgroundColor: '#00000070',
      color: 'white',
      p: '5px',
      borderRadius: '10px',
      textAlign: 'center',
      backdropFilter: 'blur(3px)',
      lineHeight: '1.1em',
      height: '100%',

      '& img': {
        filter: 'brightness(0) invert(1) ',
        opacity: '0.4',
      },
    },
    variants: {
      unlocked: {
        true: {
          '& img': {
            filter: 'none',
            opacity: '1',
          }
        },
      },
    },
  }),
  emoji: css({
    position: 'absolute',
    top: '25px',
    right: '50%',
    translate: '50% 0',
    fontSize: '1.5rem',
    filter: 'sepia(1)',
    opacity: '0.75',
    userSelect: 'none',
  }),
  name: css({
    mt: '10px',
  }),
}

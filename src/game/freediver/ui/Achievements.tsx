import { AllAchievements, useGameState } from "@/utils/GameStateContext";
import { Translations } from "@/utils/Translations";
import { css, cva } from "@style/css";
import { Component, For } from "solid-js";
import trophy from '@assets/sprites/trophy.png'

export const Achievements: Component = () => {
  const { gameState } = useGameState()!
  const t = () => Translations[gameState.options.locale]

  const achievements = () => AllAchievements.map(achievement => ({
    id: achievement,
    name: t().achievements[achievement],
    unlocked: !!gameState.achievements[achievement],
  }))

  return <div class={styles.achievements({ locale: gameState.options.locale })}>
    <For each={achievements()}>
      {achievement => (
        <div class={styles.achievement({ unlocked: achievement.unlocked })}>
          <img src={trophy} />
          <div>{achievement.unlocked ? achievement.name : '???'}</div>
        </div>
      )}
    </For>
  </div>
}

const styles = {
  title: css({
    fontSize: '2rem',
    my: '20px -20px'
  }),
  achievements: cva({
    base: {
      display: 'grid',
      gap: '10px',
      m: '2rem 1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      fontSize: '20px',
      wordBreak: 'break-word',
    },
    variants: {
      locale: {
        en: {},
        ru: {
          fontSize: '16px',
          lineHeight: '20px',
        },
        sv: {},
      }
    },
  }),
  achievement: cva({
    base: {
      backgroundColor: '#00000030',
      p: '10px',
      borderRadius: '10px',
      textAlign: 'center',

      '& img': {
        filter: 'brightness(0)',
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
  })
}

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
          <div>{achievement.unlocked || 1 ? achievement.name : '???'}</div>
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
      gap: '5px',
      m: '2rem 1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      fontSize: '18px',
      wordBreak: 'break-word',
    },
    variants: {
      locale: {
        en: {},
        ru: {
          fontSize: '15px',
          lineHeight: '20px',
        },
        sv: {},
      }
    },
  }),
  achievement: cva({
    base: {
      backgroundColor: '#00000070',
      color: 'white',
      p: '5px',
      borderRadius: '10px',
      textAlign: 'center',
      backdropFilter: 'blur(3px)',

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
  })
}

import { alertAsset } from '@/assets'
import { useGameState } from '@/utils/GameStateContext'
import { css } from '@style/css'
import { Component, For, Show } from 'solid-js'
import { Achievement } from '../data/Achievements'
import { Translations } from '../data/Translations'

// Popups for newly unlocked achievements, shown until their countdown ends
export const AchievementPopups: Component = () => {
  const { gameState } = useGameState()!
  const t = () => Translations[gameState.options.locale]

  const newAchievements = () => {
    return Object.entries(gameState.achievements)
      .filter(([, state]) => state === 'new')
      .map(([achievement]) => achievement) as Achievement[]
  }

  return <Show when={newAchievements().length > 0}>
    <div class={styles.achievements}>
      <For each={newAchievements()}>
        {achievement => (<div class={styles.achievement} style={{ 'background-image': `url(${alertAsset})` }}>
          <div class={styles.achievementInner}>
            <small>{t().achievements.new}</small>
            <div>{t().achievements[achievement]}</div>
          </div>
        </div>)}
      </For>
    </div>
  </Show>
}

const styles = {
  achievements: css({
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  }),
  achievement: css({
    height: '100px',
    aspectRatio: '1323 / 510',
    backgroundSize: 'cover',
    p: '25px 35px 30px 35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  achievementInner: css({
    rotate: '-1deg',
    maxHeight: '90px',
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: '26px',
    lineHeight: '0.7em',
    color: 'black',
  }),
}

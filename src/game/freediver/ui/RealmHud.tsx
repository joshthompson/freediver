import { Component, JSX } from 'solid-js'
import { css, cva } from '@style/css'

// Readouts for the Crystal Realms, drawn over the game in the top left
export const HudStack: Component<{ children: JSX.Element }> = props => {
  return <div class={styles.stack}>{props.children}</div>
}

export const HudTimer: Component<{ label: string, seconds: number }> = props => {
  return <div class={styles.panel({ warn: props.seconds <= 10 })}>
    {props.label}: {Math.ceil(Math.max(0, props.seconds))}
  </div>
}

export const HudMeter: Component<{ label: string, value: number, max: number, color?: string }> = props => {
  return <div class={styles.panel({})}>
    <div>{props.label}: {props.value}/{props.max}</div>
    <div class={styles.meter}>
      <div
        class={styles.fill}
        style={{
          width: `${Math.min(100, props.value / props.max * 100)}%`,
          background: props.color ?? '#FDD000',
        }}
      />
    </div>
  </div>
}

export const HudItem: Component<{ image: string, count: number }> = props => {
  return <div class={styles.panel({ warn: props.count === 0, row: true })}>
    <img src={props.image} class={styles.item} />
    <span>x{props.count}</span>
  </div>
}

export const HudBanner: Component<{ children: JSX.Element }> = props => {
  return <div class={styles.banner}>{props.children}</div>
}

// A boss's health, drawn as a bar beneath it. x and y are in screen space
export const BossHealthBar: Component<{ label: string, health: number, x: number, y: number }> = props => {
  return <div class={styles.boss} style={{ left: `${props.x}px`, top: `${props.y}px` }}>
    <div class={styles.bossLabel}>{props.label}</div>
    <div class={styles.meter}>
      <div class={styles.fill} style={{ width: `${Math.max(0, props.health) * 100}%`, background: '#e8322a' }} />
    </div>
  </div>
}

const styles = {
  stack: css({
    position: 'absolute',
    top: '8px',
    left: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    pointerEvents: 'none',
  }),
  panel: cva({
    base: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      p: '4px 12px',
      borderRadius: '10px',
      background: '#00000088',
      color: 'white',
      fontSize: '1.4rem',
      lineHeight: '1.1',
      '& img': { display: 'inline-block' },
    },
    variants: {
      warn: {
        true: { color: '#ff6a5a' },
      },
      row: {
        true: { flexDirection: 'row', alignItems: 'center' },
      },
    },
  }),
  meter: css({
    width: '160px',
    height: '12px',
    borderRadius: '6px',
    background: '#ffffff33',
    overflow: 'hidden',
  }),
  fill: css({
    height: '100%',
    transition: 'width 0.2s linear',
  }),
  item: css({
    width: '36px',
    height: '26px',
  }),
  banner: css({
    position: 'absolute',
    top: '80px',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: '3rem',
    color: 'white',
    textShadow: '2px 2px 4px #000',
    pointerEvents: 'none',
    animation: 'fadeIn 0.3s ease-in-out',
  }),
  boss: css({
    position: 'absolute',
    translate: '-50% 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    color: 'white',
    fontSize: '1rem',
    textShadow: '1px 1px 2px #000',
    pointerEvents: 'none',
  }),
  bossLabel: css({
    whiteSpace: 'nowrap',
  }),
}

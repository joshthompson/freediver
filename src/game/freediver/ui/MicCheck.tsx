import { Component, createSignal, For, onCleanup, Show } from 'solid-js'
import { css } from '@style/css'
import { useGameState } from '@/utils/GameStateContext'
import { Translations } from '../data/Translations'
import { mic } from '../multiplayer/mic'
import { Button } from './Button'

// Turn your microphone on or off, choose which one, and see it picking up sound. Your own
// voice is never played back, which would feed back through speakers
export const MicCheck: Component = () => {
  const { gameState } = useGameState()!
  const t = () => Translations[gameState.options.locale].multiplayer
  const [levels, setLevels] = createSignal(mic.levels())

  let frame = requestAnimationFrame(function tick() {
    setLevels(mic.levels())
    frame = requestAnimationFrame(tick)
  })
  onCleanup(() => cancelAnimationFrame(frame))

  const label = () => ({
    on: t().micOn,
    off: t().micOff,
    asking: t().micAsking,
    blocked: t().micOff,
    unavailable: t().micOff,
  })[mic.status()]

  return <div class={styles.micCheck}>
    <Button size="small" onClick={() => mic.toggle()}>{label()}</Button>
    <Show when={mic.status() === 'on'}>
      <div class={styles.row}>
        <select
          class={styles.select}
          value={mic.activeDevice() ?? ''}
          onChange={event => mic.setDevice(event.currentTarget.value)}
        >
          <For each={mic.devices()}>
            {(device, n) => <option value={device.deviceId}>{device.label || t().micDevice(n() + 1)}</option>}
          </For>
        </select>
        <div class={styles.bars}>
          <For each={levels()}>
            {level => <div class={styles.bar} style={{ height: `${10 + Math.min(level * 1.5, 1) * 90}%` }} />}
          </For>
        </div>
      </div>
    </Show>
    <Show when={mic.status() === 'blocked'}>
      <div class={styles.problem}>{t().micBlocked}</div>
    </Show>
    <Show when={mic.status() === 'unavailable'}>
      <div class={styles.problem}>{t().micUnavailable}</div>
    </Show>
  </div>
}

const styles = {
  micCheck: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }),
  select: css({
    maxWidth: '260px',
    p: '4px 8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    color: 'black',
    background: 'white',
    border: '2px solid black',
    borderRadius: '10px',
    outline: 'none',
  }),
  bars: css({
    display: 'flex',
    alignItems: 'flex-end',
    gap: '3px',
    height: '28px',
  }),
  bar: css({
    width: '7px',
    background: '#3EE6E0',
    borderRadius: '2px',
    transition: 'height 60ms linear',
  }),
  problem: css({
    color: '#FF8A8A',
    fontSize: '16px',
  }),
}

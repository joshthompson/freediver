import { Component, createSignal, For, onCleanup, onMount } from 'solid-js'
import { css, cva } from '@style/css'
import { GameState } from '@/utils/GameStateContext'
import { Translations } from '@/game/freediver/data/Translations'
import { RealmName, RealmNames, Realms } from '@/game/freediver/data/Realms'
import { Button } from './Button'

// Asked when going through the King's Portal. Choose with the arrow keys and SPACE, or by clicking or tapping.
// It's opened from inside the game loop, outside the game state context, so it's handed the state
export const PortalMenu: Component<{
  gameState: GameState
  onChoose: (realm: RealmName) => void
  onStay: () => void
}> = props => {
  const t = () => Translations[props.gameState.options.locale]
  const options = [...RealmNames, 'stay'] as const
  const [selected, setSelected] = createSignal(0)

  const done = (option: typeof options[number]) => option !== 'stay' && !!props.gameState.questState.crystals[option]

  const choose = (option: typeof options[number]) => {
    if (option === 'stay') props.onStay()
    else props.onChoose(option)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp' || event.key === 'w') {
      setSelected(prev => (prev - 1 + options.length) % options.length)
    } else if (event.key === 'ArrowDown' || event.key === 's') {
      setSelected(prev => (prev + 1) % options.length)
    } else if (event.key === ' ' || event.key === 'Enter') {
      choose(options[selected()])
    }
  }
  onMount(() => window.addEventListener('keydown', handleKeyDown))
  onCleanup(() => window.removeEventListener('keydown', handleKeyDown))

  return <div class={styles.menu}>
    <div class={styles.title}>{t().realms.portalTitle}</div>
    <For each={options}>
      {(option, i) => <div class={styles.row} onMouseEnter={() => setSelected(i())}>
        {/* Each realm's Crystal Corgi, glowing once it's home and a faint silhouette until then */}
        <div class={styles.crystalSlot}>
          {option !== 'stay' && <img src={Realms[option].crystal} class={styles.crystal({ done: done(option) })} />}
        </div>
        <div class={styles.option({ selected: selected() === i() })}>
          <Button size="small" onClick={() => choose(option)}>
            {option === 'stay' ? t().realms.stay : t().realms[option]}
          </Button>
          {done(option) && <div class={styles.tick}>✓</div>}
        </div>
        <div class={styles.crystalSlot} />
      </div>}
    </For>
  </div>
}

const styles = {
  menu: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    p: '1.5rem 1rem',
    background: '#0E262Cee',
    color: 'white',
  }),
  title: css({
    fontSize: '2rem',
    textAlign: 'center',
    mb: '0.5rem',
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }),
  crystalSlot: css({
    width: '56px',
    display: 'flex',
    justifyContent: 'center',
  }),
  crystal: cva({
    base: {
      width: '56px',
      height: '40px',
      transition: 'filter 0.3s ease-in-out',
    },
    variants: {
      done: {
        true: { filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.9))' },
        false: { filter: 'grayscale(1) brightness(0.4)', opacity: 0.35 },
      },
    },
  }),
  tick: css({
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#2fbf4a',
    border: '2px solid white',
    color: 'white',
    fontSize: '18px',
    lineHeight: '24px',
    textAlign: 'center',
    boxShadow: '0 2px 4px #00000088',
    pointerEvents: 'none',
  }),
  option: cva({
    base: {
      position: 'relative',
      borderRadius: '18px',
      outline: '3px solid transparent',
      outlineOffset: '2px',
    },
    variants: {
      selected: {
        true: { outlineColor: 'white' },
      },
    },
  }),
}

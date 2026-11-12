import { Component, createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { css, cva } from '@style/css'
import { GameState } from '@/utils/GameStateContext'
import { Translations } from '@/game/freediver/data/Translations'
import { SuitColour, SuitColours, SuitSwatches, suitPrice } from '@/game/freediver/data/Suits'
import { corgiSheet } from '@/game/freediver/controllers/main/CorgiController'
import { suitSkin } from '@/game/freediver/multiplayer/skins'
import { effects } from '@/game/freediver/music/effects'
import { Button } from './Button'

const previewHeight = 44 // Linkosha in each suit, at the size he swims. Matches styles.preview

// The shopkeeper's swimsuits. Suits you own are free to swap back to. Choose with the arrow keys and
// SPACE, or by clicking or tapping. It's opened from inside the game loop, outside the game state
// context, so it's handed the state
export const SuitShop: Component<{
  gameState: GameState
  points: () => number
  buy: (suit: SuitColour) => boolean
  wear: (suit: SuitColour) => void
  onLeave: () => void
}> = props => {
  const t = () => Translations[props.gameState.options.locale]
  const options = [...SuitColours, 'leave'] as const
  // Starts on the suit being worn, so a stray SPACE does nothing
  const [selected, setSelected] = createSignal(SuitColours.indexOf(props.gameState.suits.wearing))
  const [tooPoor, setTooPoor] = createSignal<SuitColour>()

  const owned = (suit: SuitColour) => props.gameState.suits.owned.includes(suit)
  const wearing = (suit: SuitColour) => props.gameState.suits.wearing === suit

  const choose = (option: typeof options[number]) => {
    if (option === 'leave') return props.onLeave()
    setTooPoor(undefined)
    if (owned(option)) props.wear(option)
    else if (props.buy(option)) effects.purchase()
    else setTooPoor(option)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // A held key repeating, like the SPACE that closed the shopkeeper's dialog, shouldn't buy anything
    if (event.repeat) return
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

  const label = (suit: SuitColour) => wearing(suit) ? t().shop.wearing
    : owned(suit) ? t().shop.wear
      : `${t().shop.buy} ${suitPrice} ★`

  return <div class={styles.menu}>
    <div class={styles.title}>{t().shop.title}</div>
    <div class={styles.points}>{t().shop.points}: {props.points()} ★</div>
    <For each={options}>
      {(option, i) => <div class={styles.row} onMouseEnter={() => setSelected(i())}>
        <div class={styles.suit}>
          <Show when={option !== 'leave' && option}>
            {suit => <>
              <div class={styles.swatch} style={{ background: SuitSwatches[suit()] }} />
              <div class={styles.preview} style={{
                'background-image': `url(${suitSkin(suit()).corgi})`,
                'background-position': `${-corgiSheet.gutter / 2 * previewHeight / corgiSheet.cell.height}px 0`,
              }} />
              <div>{t().shop[suit()]}</div>
            </>}
          </Show>
        </div>
        <div class={styles.option({ selected: selected() === i() })}>
          <Button size="small" volume={props.gameState.options.volume} onClick={() => choose(option)}>
            {option === 'leave' ? t().shop.leave : label(option)}
          </Button>
          {option !== 'leave' && wearing(option) && <div class={styles.tick}>✓</div>}
        </div>
      </div>}
    </For>
    <div class={styles.message}>{tooPoor() ? t().shop.notEnough : ''}</div>
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
  }),
  points: css({
    fontSize: '1.2rem',
    mb: '0.5rem',
    color: '#FFD84A',
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }),
  suit: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '210px',
    fontSize: '1.1rem',
  }),
  swatch: css({
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2px solid white',
    flexShrink: 0,
  }),
  preview: css({
    width: '70px', // One frame of the corgi sheet, 44px tall
    height: '44px',
    backgroundSize: 'auto 100%',
    backgroundRepeat: 'no-repeat',
    flexShrink: 0,
  }),
  message: css({
    minHeight: '1.4rem',
    color: '#FF5A5A',
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

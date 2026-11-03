import { Component, createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { css } from '@style/css'
import { Scene } from '@/engine'
import { DiverController } from '../controllers/main/DiverController'
import { RoomSession } from '../multiplayer/room'
import { displayName, MAX_CHAT_LENGTH, PlayerInfo, slotColour, SlotTextColours } from '../multiplayer/protocol'
import { puppetDiverId } from '../scene/levels/EmptyOceanLevel'
import { Translations } from '../data/Translations'
import { isMobileBrowser } from '@/utils/game'
import { bubbleStyle } from './BackgroundDialog'
import { Button } from './Button'
import { Options } from './Options'

// Keeps bubbles (max 200px wide) and their tails inside the screen, as Background Dialog does
const edgeX = 110
const minTop = 80
const pointerMargin = 36
const offScreenMargin = 40 // Roughly half a diver, so the Pointer only shows once they're out of sight
const minTagTop = 20
const tagAbove = 95 // From the diver's centre, clear of their head whichever way they face
const bubbleAbove = 120

const colourOf = (player: PlayerInfo) => SlotTextColours[slotColour(player.slot)]

export const RoomOverlay: Component<{ scene: Scene, session: RoomSession, leave: () => void }> = props => {
  const t = () => Translations[props.scene.gameState.options.locale].multiplayer
  const canvas = () => props.scene.canvas.get()

  // Where a Player's Diver is on screen, and where their Pointer goes when it's off screen
  const placement = (player: PlayerInfo) => {
    const id = player.id === props.session.selfId ? 'diver' : puppetDiverId(player.id)
    const diver = props.scene.getControllerById<DiverController>(id)
    if (!diver) return
    const { width, height } = canvas()
    const x = diver.data.x() + diver.data.width() / 2 - canvas().x()
    const y = diver.data.y() + diver.data.height() / 2 - canvas().y()
    const onScreen = x >= -offScreenMargin && x <= width + offScreenMargin
      && y >= -offScreenMargin && y <= height + offScreenMargin
    if (onScreen) return { onScreen, x, y }

    // Follow the line from the middle of the screen towards them, stopping at the edge
    const dx = x - width / 2
    const dy = y - height / 2
    const scale = Math.min(
      dx ? (width / 2 - pointerMargin) / Math.abs(dx) : Infinity,
      dy ? (height / 2 - pointerMargin) / Math.abs(dy) : Infinity,
    )
    return {
      onScreen,
      x: width / 2 + dx * scale,
      y: height / 2 + dy * scale,
      angle: Math.atan2(dy, dx) * 180 / Math.PI,
    }
  }

  const bubblePosition = (player: PlayerInfo) => {
    const place = placement(player)
    if (!place) return
    // Off screen, the bubble sits just inside the Pointer
    const x = place.onScreen ? place.x : place.x + (canvas().width / 2 - place.x) * 0.2
    const y = place.onScreen ? place.y - bubbleAbove : place.y + (canvas().height / 2 - place.y) * 0.2
    return {
      left: `${Math.min(Math.max(x, edgeX), canvas().width - edgeX)}px`,
      top: `${Math.max(y, minTop)}px`,
    }
  }

  return <>
    <For each={props.session.roster()}>
      {player => <Show when={placement(player)}>
        {place => <>
          <Show when={place().onScreen}>
            <div
              class={styles.tag}
              style={{ left: `${place().x}px`, top: `${Math.max(place().y - tagAbove, minTagTop)}px`, color: colourOf(player) }}
            >{displayName(player)}</div>
          </Show>
          <Show when={!place().onScreen}>
            <div class={styles.pointer} style={{ left: `${place().x}px`, top: `${place().y}px`, color: colourOf(player) }}>
              <div class={styles.arrow} style={{ rotate: `${place().angle}deg` }} />
              <div class={styles.pointerName}>{displayName(player)}</div>
            </div>
          </Show>
        </>}
      </Show>}
    </For>
    <For each={props.session.roster()}>
      {player => <Show when={props.session.chat()[player.id]}>
        {bubble => <Show when={bubblePosition(player)}>
          <div class={bubbleStyle} style={bubblePosition(player)}>{bubble().text}</div>
        </Show>}
      </Show>}
    </For>
    <div class={styles.notices}>
      <For each={props.session.notices()}>
        {notice => <div style={{ color: SlotTextColours[slotColour(notice.slot)] }}>
          {notice.name} {notice.kind === 'joined' ? t().joined : t().left}
        </div>}
      </For>
    </div>
    <Show when={!isMobileBrowser()}>
      <ChatField session={props.session} placeholder={t().chatPlaceholder} hint={t().chatHint} />
    </Show>
    <Show when={props.scene.paused.get()}>
      <RoomPauseMenu scene={props.scene} leave={props.leave} />
    </Show>
  </>
}

// Tab opens it, Enter sends, and Escape or an empty Enter closes it. Game keys are ignored
// while it's open, so the Diver just drifts
const ChatField: Component<{ session: RoomSession, placeholder: string, hint: string }> = props => {
  const [open, setOpen] = createSignal(false)
  const [text, setText] = createSignal('')

  const onWindowKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return
    event.preventDefault()
    setOpen(true)
  }
  onMount(() => window.addEventListener('keydown', onWindowKeydown))
  onCleanup(() => window.removeEventListener('keydown', onWindowKeydown))

  const close = () => {
    setText('')
    setOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    event.stopPropagation()
    if (event.key === 'Tab') event.preventDefault()
    if (event.key === 'Escape') close()
    if (event.key === 'Enter') {
      props.session.sendChat(text())
      close()
    }
  }

  return <Show when={open()} fallback={<div class={styles.chatHint}>{props.hint}</div>}>
    <input
      ref={el => setTimeout(() => el.focus())}
      class={styles.chatInput}
      maxLength={MAX_CHAT_LENGTH}
      placeholder={props.placeholder}
      value={text()}
      onInput={event => setText(event.currentTarget.value)}
      onKeyDown={onKeyDown}
      onBlur={close}
    />
  </Show>
}

const RoomPauseMenu: Component<{ scene: Scene, leave: () => void }> = props => {
  const t = () => Translations[props.scene.gameState.options.locale]
  return <div class={styles.paused}>
    <div>{t().pause.title}</div>
    <Button onClick={() => props.scene.togglePause()} size="small">{t().pause.resume}</Button>
    <Options mode="pause" achievements={false} />
    <Button onClick={() => props.leave()} size="small">{t().multiplayer.leaveRoom}</Button>
  </div>
}

const styles = {
  tag: css({
    position: 'absolute',
    translate: '-50% -100%',
    fontSize: '16px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    textShadow: '0 0 3px black, 1px 1px 0 black',
  }),
  pointer: css({
    position: 'absolute',
    pointerEvents: 'none',
    width: 0,
    height: 0,
  }),
  // Points right before rotating
  arrow: css({
    position: 'absolute',
    left: '-12px',
    top: '-12px',
    width: '24px',
    height: '24px',
    background: 'currentColor',
    clipPath: 'polygon(0 0, 100% 50%, 0 100%, 25% 50%)',
    filter: 'drop-shadow(0 0 2px black)',
  }),
  pointerName: css({
    position: 'absolute',
    translate: '-50% 16px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    textShadow: '0 0 3px black, 1px 1px 0 black',
  }),
  notices: css({
    position: 'absolute',
    top: '10px',
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '22px',
    pointerEvents: 'none',
    textShadow: '0 0 3px black, 1px 1px 0 black',
  }),
  chatHint: css({
    position: 'absolute',
    bottom: '8px',
    left: '10px',
    fontSize: '14px',
    opacity: 0.7,
    pointerEvents: 'none',
  }),
  chatInput: css({
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    right: '10px',
    p: '6px 10px',
    fontSize: '18px',
    fontFamily: 'inherit',
    color: 'black',
    background: 'white',
    border: '2px solid black',
    borderRadius: '10px',
    outline: 'none',
  }),
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
    p: '20px',
  }),
}

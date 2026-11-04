import { createEffect, createSignal, For, on, onCleanup, Show } from 'solid-js'
import { css, cva } from '@style/css'
import { Scene, SceneComponent } from '@/engine'
import { Canvas } from '@/engine/components/Canvas'
import { useGameState } from '@/utils/GameStateContext'
import { Translations } from '@/game/freediver/data/Translations'
import { menu1Asset } from '@/assets'
import { Button } from '../ui/Button'
import { MicCheck } from '../ui/MicCheck'
import { mic } from '../multiplayer/mic'
import { lobby } from '../multiplayer/lobby'
import { createRoom, currentRoom, joinRoom, leaveMultiplayer, setUsername, username, validUsername } from '../multiplayer/session'
import { EndReason } from '../multiplayer/room'
import { MAX_PLAYERS, MAX_ROOM_NAME_LENGTH, MAX_USERNAME_LENGTH, RoomAnnouncement } from '../multiplayer/protocol'

// Choose a username, then join an open Room or create your own. The scene mode carries
// why the last Room ended, if it did
export const LobbyScene: SceneComponent = props => {
  const scene = new Scene('lobby', {
    ...useGameState()!,
    width: 700,
    height: 700,
    images: [menu1Asset],
  })
  onCleanup(() => scene.destroy())
  const t = () => Translations[scene.gameState.options.locale]

  lobby.connect()
  // The switch below sets whether the mic is on in the Room you create or join
  mic.restore()

  const [roomName, setRoomName] = createSignal('')
  const [joining, setJoining] = createSignal(false)
  const [problem, setProblem] = createSignal(props.mode as EndReason | undefined)

  const problemText = (reason: EndReason) => ({
    hostLeft: t().multiplayer.hostLeft,
    full: t().multiplayer.roomFull,
    couldNotJoin: t().multiplayer.couldNotJoin,
    lostConnection: t().multiplayer.lostConnection,
  })[reason]

  // Wait for the Host to seat us before swimming in
  createEffect(on(() => currentRoom()?.status(), status => {
    if (!joining()) return
    if (status === 'joined') props.setScene('multiplayer')
    if (status === 'ended') {
      setJoining(false)
      setProblem(currentRoom()?.endReason())
    }
  }))

  const join = (room: RoomAnnouncement) => {
    if (!validUsername() || joining()) return
    setProblem(undefined)
    setJoining(true)
    joinRoom(room)
  }

  const create = () => {
    if (!validUsername() || joining()) return
    const name = roomName().trim() || t().multiplayer.defaultRoomName(validUsername())
    if (createRoom(name)) props.setScene('multiplayer')
  }

  const back = () => {
    leaveMultiplayer()
    props.setScene('menu')
  }

  return <Canvas
    scene={scene}
    style={{ background: `url(${menu1Asset})`, 'background-size': 'cover' }}
    overlay={<div class={styles.overlay}>
      <div class={styles.panel}>
        <h1 class={styles.title}>{t().multiplayer.title}</h1>
        <Show when={problem()}>
          {reason => <div class={styles.problem}>{problemText(reason())}</div>}
        </Show>

        <label class={styles.label}>
          {t().multiplayer.username}
          <input
            class={styles.input}
            maxLength={MAX_USERNAME_LENGTH}
            value={username()}
            onInput={event => setUsername(event.currentTarget.value)}
          />
        </label>

        <MicCheck />

        <div class={styles.rooms}>
          <For each={lobby.rooms()} fallback={<div class={styles.empty}>{t().multiplayer.noRooms}</div>}>
            {room => {
              const full = () => room.players >= MAX_PLAYERS
              return <div class={styles.room({ full: full() })}>
                <div class={styles.roomName}>{room.name}</div>
                <div class={styles.roomHost}>{t().multiplayer.host}: {room.hostName}</div>
                <div>{room.players}/{MAX_PLAYERS}</div>
                <Button size="small" disabled={full() || !validUsername() || joining()} onClick={() => join(room)}>
                  {full() ? t().multiplayer.full : t().multiplayer.join}
                </Button>
              </div>
            }}
          </For>
        </div>

        <div class={styles.create}>
          <input
            class={styles.input}
            maxLength={MAX_ROOM_NAME_LENGTH}
            placeholder={validUsername() ? t().multiplayer.defaultRoomName(validUsername()) : t().multiplayer.roomName}
            value={roomName()}
            onInput={event => setRoomName(event.currentTarget.value)}
          />
          <Button size="small" disabled={!validUsername() || joining()} onClick={create}>
            {t().multiplayer.createRoom}
          </Button>
        </div>

        <Show when={!validUsername()}>
          <div class={styles.hint}>{t().multiplayer.needsUsername}</div>
        </Show>
        <Show when={joining()}>
          <div class={styles.hint}>{t().multiplayer.joining}</div>
        </Show>

        <Button size="small" onClick={back}>{t().common.back}</Button>
      </div>
    </div>}
  />
}

const styles = {
  overlay: css({
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    p: '20px',
  }),
  panel: css({
    width: '100%',
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    p: '20px',
    background: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '15px',
    color: 'white',
    backdropFilter: 'blur(2px)',
  }),
  title: css({
    fontSize: '2.5rem',
  }),
  problem: css({
    color: '#FF8A8A',
    fontSize: '20px',
  }),
  label: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '20px',
  }),
  input: css({
    p: '6px 10px',
    fontSize: '18px',
    fontFamily: 'inherit',
    color: 'black',
    background: 'white',
    border: '2px solid black',
    borderRadius: '10px',
    outline: 'none',
    minWidth: 0,
  }),
  rooms: css({
    width: '100%',
    minHeight: '120px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  }),
  empty: css({
    textAlign: 'center',
    opacity: 0.8,
    p: '40px 0',
    fontSize: '20px',
  }),
  room: cva({
    base: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto auto',
      alignItems: 'center',
      gap: '12px',
      p: '6px 10px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      fontSize: '18px',
    },
    variants: {
      full: {
        true: { opacity: 0.5 },
      },
    },
  }),
  roomName: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  roomHost: css({
    opacity: 0.8,
    fontSize: '15px',
  }),
  create: css({
    display: 'flex',
    gap: '10px',
    width: '100%',
    '& > input': { flex: 1 },
  }),
  hint: css({
    opacity: 0.8,
    fontSize: '16px',
  }),
}

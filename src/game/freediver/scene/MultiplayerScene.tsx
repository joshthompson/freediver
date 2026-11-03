import { createEffect, on, onCleanup } from 'solid-js'
import { css } from '@style/css'
import { SceneComponent } from '@/engine'
import { Canvas } from '@/engine/components/Canvas'
import { surfaceAsset } from '@/assets'
import { LoadingScreen } from '../ui/LoadingScreen'
import { RoomOverlay } from '../ui/RoomOverlay'
import { EmptyOceanLevel } from './levels/EmptyOceanLevel'
import { currentRoom, leaveRoom } from '../multiplayer/session'
import { lobby } from '../multiplayer/lobby'
import { RoomSession } from '../multiplayer/room'
import { createBubbleController } from '../controllers/scenary/BubbleController'

// A Room in the Empty Ocean. Reached from the Lobby once the Room has seated us
export const MultiplayerScene: SceneComponent = props => {
  const session = currentRoom()
  if (!session || session.status() !== 'joined') {
    props.setScene('lobby')
    return null
  }
  return <Room session={session} setScene={props.setScene} />
}

const Room: SceneComponent<{ session: RoomSession }> = props => {
  const session = props.session
  const level = EmptyOceanLevel({ session })
  onCleanup(() => level.scene.destroy())

  // Only a Host still needs the Lobby, to keep announcing the Room
  if (!session.isHost) lobby.disconnect()

  // Puppets come and go with the roster. Slots never change, so only arrivals and departures matter
  let puppets = new Set<string>()
  createEffect(() => {
    const others = session.roster().filter(p => p.id !== session.selfId)
    const ids = new Set(others.map(p => p.id))
    others.filter(p => !puppets.has(p.id)).forEach(p => level.addPuppet(p.id, p.slot))
    puppets.forEach(id => !ids.has(id) && level.removePuppet(id))
    puppets = ids
  })

  // However the Room ends, go back to the Lobby and say why
  createEffect(on(session.status, status => {
    if (status === 'ended') props.setScene('lobby', session.endReason())
  }))

  return <Canvas
    scene={level.scene}
    loading={LoadingScreen}
    overlay={<RoomOverlay scene={level.scene} session={session} leave={leaveRoom} />}
    underlay={<div class={styles.surface} style={{
      'background-image': `url(${surfaceAsset})`,
      'background-position-x': `${-level.scene.canvas.get().x() / 10}px`,
    }} />}
    class={styles.level}
    style={level.style()}
    onClick={event => {
      level.scene.addController(createBubbleController('bubble-click-' + Date.now(), event))
    }}
  />
}

const styles = {
  level: css({
    position: 'relative',
    color: 'white',
    maxWidth: '100%',
  }),
  surface: css({
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '50px',
    backgroundSize: 'auto 100%',
    filter: 'saturate(0) brightness(10)',
    opacity: '0.5',
  }),
}

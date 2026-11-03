import { joinRoom, Room, selfId } from 'trystero'
import { APP_ID } from './protocol'

export { selfId }

export function joinTrysteroRoom(roomId: string) {
  return joinRoom({ appId: APP_ID }, roomId)
}

export type Action<T> = ReturnType<typeof createAction<T>>

// A typed wrapper over Trystero's messages, which only knows about JSON
export function createAction<T>(room: Room, name: string, onMessage: (data: T, peerId: string) => void) {
  const action = room.makeAction(name, {
    onMessage: (data, { peerId }) => onMessage(data as T, peerId),
  })
  return {
    // Leaving out the target sends to everyone. An empty target list sends to nobody
    send(data: T, target?: string | string[]) {
      if (Array.isArray(target) && !target.length) return
      action.send(data as never, target === undefined ? undefined : { target }).catch(() => {})
    },
  }
}

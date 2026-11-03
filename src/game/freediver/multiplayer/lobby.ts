import { createSignal } from 'solid-js'
import type { Room } from 'trystero'
import { createAction, joinTrysteroRoom } from './net'
import { ANNOUNCE_EXPIRY, ANNOUNCE_INTERVAL, LOBBY_ROOM_ID, RoomAnnouncement } from './protocol'

interface ListedRoom extends RoomAnnouncement {
  seenAt: number
}

// Everyone on the Lobby screen, and every Host, shares one Trystero room. Hosts announce
// their Room there every few seconds, since Trystero can't list rooms itself
class LobbyConnection {
  #room: Room | undefined
  #announce: ReturnType<typeof createAction<RoomAnnouncement>> | undefined
  #unlist: ReturnType<typeof createAction<{ id: string }>> | undefined
  #timer: number | undefined
  #announcement: (() => RoomAnnouncement) | undefined
  #listed = createSignal<ListedRoom[]>([])

  // Newest first
  rooms = () => [...this.#listed[0]()].sort((a, b) => b.createdAt - a.createdAt)

  connect() {
    if (this.#room) return
    const room = joinTrysteroRoom(LOBBY_ROOM_ID)
    this.#room = room
    this.#announce = createAction<RoomAnnouncement>(room, 'announce', (announcement, peerId) => {
      if (announcement.hostId !== peerId) return
      const others = this.#listed[0]().filter(r => r.id !== announcement.id)
      this.#listed[1]([...others, { ...announcement, seenAt: Date.now() }])
    })
    this.#unlist = createAction<{ id: string }>(room, 'unlist', ({ id }) => {
      this.#listed[1](this.#listed[0]().filter(r => r.id !== id))
    })
    room.onPeerJoin = peerId => this.#sendAnnouncement(peerId)
    room.onPeerLeave = peerId => {
      this.#listed[1](this.#listed[0]().filter(r => r.hostId !== peerId))
    }
    this.#timer = window.setInterval(() => {
      this.#sendAnnouncement()
      const now = Date.now()
      const fresh = this.#listed[0]().filter(r => now - r.seenAt < ANNOUNCE_EXPIRY)
      if (fresh.length !== this.#listed[0]().length) this.#listed[1](fresh)
    }, ANNOUNCE_INTERVAL)
  }

  disconnect() {
    if (!this.#room) return
    window.clearInterval(this.#timer)
    this.#room.leave()
    this.#room = undefined
    this.#announcement = undefined
    this.#listed[1]([])
  }

  // While hosting, keep telling the Lobby about the Room
  host(announcement: () => RoomAnnouncement) {
    this.connect()
    this.#announcement = announcement
    this.#sendAnnouncement()
  }

  stopHosting() {
    const announcement = this.#announcement?.()
    this.#announcement = undefined
    if (announcement) this.#unlist?.send({ id: announcement.id })
  }

  #sendAnnouncement(target?: string) {
    const announcement = this.#announcement?.()
    if (announcement) this.#announce?.send(announcement, target)
  }
}

export const lobby = new LobbyConnection()

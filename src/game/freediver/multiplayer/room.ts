import { createSignal } from 'solid-js'
import type { Room } from 'trystero'
import { Action, createAction, joinTrysteroRoom, selfId } from './net'
import { lobby } from './lobby'
import { PoseBuffer } from './interpolate'
import { cleanName, seatPlayer } from './roster'
import { VoiceChat } from './voice'
import {
  displayName,
  JOIN_TIMEOUT,
  MAX_CHAT_LENGTH,
  MAX_USERNAME_LENGTH,
  PLAYER_TIMEOUT,
  PlayerInfo,
  Pose,
  PROTOCOL_VERSION,
  RejectReason,
  RoomAnnouncement,
} from './protocol'

export type RoomStatus = 'joining' | 'joined' | 'ended'
export type EndReason = 'hostLeft' | 'full' | 'couldNotJoin' | 'lostConnection'

export interface ChatBubble {
  key: number
  text: string
}

export interface Notice {
  key: number
  kind: 'joined' | 'left'
  name: string
  slot: number
}

const noticeDuration = 3000
let nextKey = 0

// One Player's view of a Room. The Host's game decides who is in it and passes everyone's
// poses and Chat Messages on to the others; every other Player only talks to the Host
export class RoomSession {
  readonly selfId = selfId
  readonly isHost: boolean
  readonly roomId: string
  readonly hostId: string
  readonly voice: VoiceChat

  #room: Room
  #status = createSignal<RoomStatus>('joining')
  #endReason = createSignal<EndReason | undefined>(undefined)
  #roster = createSignal<PlayerInfo[]>([])
  #chat = createSignal<Record<string, ChatBubble>>({})
  #notices = createSignal<Notice[]>([])
  #poses = new Map<string, PoseBuffer>()
  #lastSeen = new Map<string, number>()
  #timers: number[] = []
  #chatTimers = new Map<string, number>()

  #hello: Action<{ username: string }>
  #rosterAction: Action<PlayerInfo[]>
  #reject: Action<RejectReason>
  #pose: Action<{ id: string, pose: Pose }>
  #chatAction: Action<{ id: string, text: string }>
  #end: Action<null>

  status = () => this.#status[0]()
  endReason = () => this.#endReason[0]()
  roster = () => this.#roster[0]()
  chat = () => this.#chat[0]()
  notices = () => this.#notices[0]()
  self = () => this.roster().find(p => p.id === this.selfId)

  constructor(options: { host: { name: string, username: string } } | { join: RoomAnnouncement, username: string }) {
    this.isHost = 'host' in options
    this.roomId = 'host' in options
      ? `room-v${PROTOCOL_VERSION}-${selfId}-${Date.now().toString(36)}`
      : options.join.id
    this.hostId = 'host' in options ? selfId : options.join.hostId

    const room = joinTrysteroRoom(this.roomId)
    this.#room = room
    this.voice = new VoiceChat(room, id => id !== selfId && this.roster().some(p => p.id === id))

    this.#hello = createAction<{ username: string }>(room, 'hello', (data, peerId) => this.#onHello(data, peerId))
    this.#rosterAction = createAction<PlayerInfo[]>(room, 'roster', (data, peerId) => this.#onRoster(data, peerId))
    this.#reject = createAction<RejectReason>(room, 'reject', (_, peerId) => {
      if (peerId === this.hostId) this.#endSession('full')
    })
    this.#pose = createAction<{ id: string, pose: Pose }>(room, 'pose', (data, peerId) => this.#onPose(data, peerId))
    this.#chatAction = createAction<{ id: string, text: string }>(room, 'chat', (data, peerId) => this.#onChat(data, peerId))
    this.#end = createAction<null>(room, 'end', (_, peerId) => {
      if (peerId === this.hostId) this.#endSession('hostLeft')
    })

    if ('host' in options) {
      this.#setRoster([seatPlayer([], selfId, options.host.username)!])
      this.#status[1]('joined')
      const createdAt = Date.now()
      lobby.host(() => ({
        id: this.roomId,
        name: options.host.name,
        hostId: selfId,
        hostName: displayName(this.self()!),
        players: this.roster().length,
        createdAt,
      }))
      room.onPeerLeave = peerId => this.#removePlayer(peerId)
      this.#timers.push(window.setInterval(() => this.#dropSilentPlayers(), 1000))
    } else {
      const username = options.username
      room.onPeerJoin = peerId => {
        if (peerId === this.hostId) this.#hello.send({ username }, this.hostId)
      }
      room.onPeerLeave = peerId => {
        if (peerId === this.hostId) this.#endSession('hostLeft')
      }
      this.#timers.push(window.setTimeout(() => {
        if (this.status() === 'joining') this.#endSession('couldNotJoin')
      }, JOIN_TIMEOUT))
    }
  }

  // Where another Player's Puppet should be drawn now
  poseOf(id: string) {
    return this.#poses.get(id)?.poseAt()
  }

  sendPose(pose: Pose) {
    if (this.status() !== 'joined') return
    const message = { id: this.selfId, pose }
    if (this.isHost) this.#pose.send(message, this.#others())
    else this.#pose.send(message, this.hostId)
  }

  sendChat(text: string) {
    const clean = text.trim().slice(0, MAX_CHAT_LENGTH)
    if (!clean || this.status() !== 'joined') return
    this.#showChat(this.selfId, clean)
    const message = { id: this.selfId, text: clean }
    if (this.isHost) this.#chatAction.send(message, this.#others())
    else this.#chatAction.send(message, this.hostId)
  }

  leave() {
    if (this.isHost) {
      this.#end.send(null)
      lobby.stopHosting()
    }
    this.#endSession(undefined)
  }

  // Host: seat a new Player, or turn them away if the Room is full
  #onHello({ username }: { username: string }, peerId: string) {
    if (!this.isHost || this.roster().some(p => p.id === peerId)) return
    const name = cleanName(String(username), MAX_USERNAME_LENGTH)
    if (!name) return
    const player = seatPlayer(this.roster(), peerId, name)
    if (!player) {
      this.#reject.send('full', peerId)
      return
    }
    this.#lastSeen.set(peerId, Date.now())
    this.#setRoster([...this.roster(), player])
  }

  #onRoster(roster: PlayerInfo[], peerId: string) {
    if (this.isHost || peerId !== this.hostId) return
    const wasJoined = this.status() === 'joined'
    const included = roster.some(p => p.id === this.selfId)
    if (!included) {
      // The Host dropped us, or hasn't seated us yet
      if (wasJoined) this.#endSession('lostConnection')
      return
    }
    this.#setRoster(roster, wasJoined)
    if (!wasJoined) this.#status[1]('joined')
  }

  #onPose({ id, pose }: { id: string, pose: Pose }, peerId: string) {
    if (this.isHost) {
      // Only trust a Player to speak for themselves, and pass it on straight away rather than
      // on the game loop, which browsers slow right down in background tabs
      if (!this.roster().some(p => p.id === peerId)) return
      this.#lastSeen.set(peerId, Date.now())
      this.#bufferPose(peerId, pose)
      this.#pose.send({ id: peerId, pose }, this.#others(peerId))
    } else if (peerId === this.hostId && id !== this.selfId) {
      this.#bufferPose(id, pose)
    }
  }

  #onChat({ id, text }: { id: string, text: string }, peerId: string) {
    const clean = String(text).trim().slice(0, MAX_CHAT_LENGTH)
    if (!clean) return
    if (this.isHost) {
      if (!this.roster().some(p => p.id === peerId)) return
      this.#showChat(peerId, clean)
      this.#chatAction.send({ id: peerId, text: clean }, this.#others(peerId))
    } else if (peerId === this.hostId) {
      this.#showChat(id, clean)
    }
  }

  #bufferPose(id: string, pose: Pose) {
    let buffer = this.#poses.get(id)
    if (!buffer) this.#poses.set(id, buffer = new PoseBuffer())
    buffer.push(pose)
  }

  // A new message replaces that Player's bubble. Longer lines stay up longer
  #showChat(id: string, text: string) {
    window.clearTimeout(this.#chatTimers.get(id))
    this.#chat[1]({ ...this.chat(), [id]: { key: nextKey++, text } })
    this.#chatTimers.set(id, window.setTimeout(() => {
      const { [id]: _, ...rest } = this.chat()
      this.#chat[1](rest)
    }, (2 + text.length / 25) * 1000))
  }

  #removePlayer(id: string) {
    if (!this.roster().some(p => p.id === id)) return
    this.#poses.delete(id)
    this.#lastSeen.delete(id)
    this.#setRoster(this.roster().filter(p => p.id !== id))
  }

  #dropSilentPlayers() {
    const now = Date.now()
    this.roster().forEach(player => {
      if (player.id === this.selfId) return
      if (now - (this.#lastSeen.get(player.id) ?? now) > PLAYER_TIMEOUT) this.#removePlayer(player.id)
    })
  }

  // Everyone in the Room but us, and optionally but one more
  #others(except?: string) {
    return this.roster().map(p => p.id).filter(id => id !== this.selfId && id !== except)
  }

  #setRoster(roster: PlayerInfo[], announce = true) {
    const before = this.roster()
    if (announce && this.status() === 'joined') {
      roster.filter(p => !before.some(b => b.id === p.id)).forEach(p => this.#notify('joined', p))
      before.filter(b => !roster.some(p => p.id === b.id)).forEach(p => this.#notify('left', p))
    }
    before.filter(b => !roster.some(p => p.id === b.id)).forEach(p => {
      this.#poses.delete(p.id)
      this.voice.forget(p.id)
      const { [p.id]: _, ...rest } = this.chat()
      this.#chat[1](rest)
    })
    this.#roster[1](roster)
    this.voice.refreshSending()
    if (this.isHost) this.#rosterAction.send(roster, this.#others())
  }

  #notify(kind: Notice['kind'], player: PlayerInfo) {
    const notice = { key: nextKey++, kind, name: displayName(player), slot: player.slot }
    this.#notices[1]([...this.notices(), notice])
    this.#timers.push(window.setTimeout(() => {
      this.#notices[1](this.notices().filter(n => n.key !== notice.key))
    }, noticeDuration))
  }

  #endSession(reason: EndReason | undefined) {
    if (this.status() === 'ended') return
    this.#endReason[1](reason)
    this.#status[1]('ended')
    this.#timers.forEach(timer => window.clearTimeout(timer))
    this.#chatTimers.forEach(timer => window.clearTimeout(timer))
    if (this.isHost) lobby.stopHosting()
    this.voice.end()
    // Give the Host's goodbye a moment to reach everyone
    window.setTimeout(() => this.#room.leave(), this.isHost ? 500 : 0)
  }
}

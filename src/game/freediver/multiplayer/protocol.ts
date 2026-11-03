import type { DiverPose } from '../controllers/main/DiverController'
import type { CorgiPose } from '../controllers/main/CorgiController'

// Bump whenever messages change shape. Players only see Rooms on their own version
export const PROTOCOL_VERSION = 1
export const APP_ID = 'freediver-multiplayer'
export const LOBBY_ROOM_ID = `lobby-v${PROTOCOL_VERSION}`

export const MAX_PLAYERS = 4
export const MAX_USERNAME_LENGTH = 12
export const MAX_ROOM_NAME_LENGTH = 20
export const MAX_CHAT_LENGTH = 80

export const ANNOUNCE_INTERVAL = 2000 // How often a Host announces its Room in the Lobby
export const ANNOUNCE_EXPIRY = 7000 // A Room leaves the Lobby list once its announcements stop for this long
export const PLAYER_TIMEOUT = 5000 // The Host drops a Player who sends nothing for this long
export const JOIN_TIMEOUT = 15000 // Give up joining a Room whose Host never answers

// Teal is the original art, so the Host looks like the single-player diver
export const SlotColours = ['teal', 'red', 'yellow', 'pink'] as const
export type SlotColour = typeof SlotColours[number]

// Bright enough to read on the water, for name tags, Pointers and notices
export const SlotTextColours: Record<SlotColour, string> = {
  teal: '#3EE6E0',
  red: '#FF5A5A',
  yellow: '#FFD84A',
  pink: '#FF7AD0',
}

export interface RoomAnnouncement {
  id: string
  name: string
  hostId: string
  hostName: string
  players: number
  createdAt: number
}

export interface PlayerInfo {
  id: string // Trystero peer id
  username: string
  number: number // 1 shows the username as is, 2 shows " (2)" and so on
  slot: number
}

export interface Pose {
  diver: DiverPose
  corgi: CorgiPose
}

export type RejectReason = 'full'

export function displayName(player: Pick<PlayerInfo, 'username' | 'number'>) {
  return player.number > 1 ? `${player.username} (${player.number})` : player.username
}

export function slotColour(slot: number): SlotColour {
  return SlotColours[slot] ?? 'teal'
}

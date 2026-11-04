import { createSignal } from 'solid-js'
import { RoomSession } from './room'
import { lobby } from './lobby'
import { mic } from './mic'
import { cleanName } from './roster'
import { MAX_ROOM_NAME_LENGTH, MAX_USERNAME_LENGTH, RoomAnnouncement } from './protocol'

// The username is the only thing multiplayer remembers. It's kept apart from the
// single-player save, which multiplayer never touches
const usernameKey = 'multiplayer-username'

function loadUsername() {
  try {
    return localStorage.getItem(usernameKey) ?? ''
  } catch {
    return ''
  }
}

const [username, _setUsername] = createSignal(loadUsername())
export { username }

export function setUsername(name: string) {
  const value = name.slice(0, MAX_USERNAME_LENGTH)
  _setUsername(value)
  try {
    localStorage.setItem(usernameKey, value)
  } catch {
    // Not remembered, which is fine
  }
}

export const validUsername = () => cleanName(username(), MAX_USERNAME_LENGTH)

const [currentRoom, setCurrentRoom] = createSignal<RoomSession | undefined>(undefined)
export { currentRoom }

export function createRoom(name: string) {
  const user = validUsername()
  const roomName = cleanName(name, MAX_ROOM_NAME_LENGTH) || `${user}'s room`.slice(0, MAX_ROOM_NAME_LENGTH)
  if (!user) return
  leaveRoom()
  const room = new RoomSession({ host: { name: roomName, username: user } })
  setCurrentRoom(room)
  return room
}

export function joinRoom(announcement: RoomAnnouncement) {
  const user = validUsername()
  if (!user) return
  leaveRoom()
  const room = new RoomSession({ join: announcement, username: user })
  setCurrentRoom(room)
  return room
}

export function leaveRoom() {
  currentRoom()?.leave()
  setCurrentRoom(undefined)
}

// Leaving multiplayer altogether, back to the main menu
export function leaveMultiplayer() {
  leaveRoom()
  lobby.disconnect()
  mic.release()
}

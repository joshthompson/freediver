import { MAX_PLAYERS, PlayerInfo } from './protocol'

// The Host's rules for seating a new Player. Display Names and slots never change once given,
// so a newcomer takes the lowest free number for their username and the lowest free slot
export function seatPlayer(roster: PlayerInfo[], id: string, username: string): PlayerInfo | undefined {
  if (roster.length >= MAX_PLAYERS) return
  const takenNumbers = new Set(roster.filter(p => p.username === username).map(p => p.number))
  const takenSlots = new Set(roster.map(p => p.slot))
  return {
    id,
    username,
    number: lowestFree(takenNumbers, 1),
    slot: lowestFree(takenSlots, 0),
  }
}

function lowestFree(taken: Set<number>, from: number) {
  let n = from
  while (taken.has(n)) n++
  return n
}

export function cleanName(name: string, maxLength: number) {
  return name.trim().slice(0, maxLength).trim()
}

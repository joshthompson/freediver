import { SlotColour, SlotColours, SlotTextColours } from '../multiplayer/protocol'

// Swimsuits for the diver, with Linkosha's suit to match. They're the multiplayer colours: teal
// is the one you start in, and the shopkeeper in the Corgi Kingdom sells the rest
export type SuitColour = SlotColour
export const SuitColours = SlotColours
export const SuitSwatches = SlotTextColours

export const suitPrice = 50 // Points

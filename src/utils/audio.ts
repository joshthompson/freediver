let context: AudioContext | undefined

// One AudioContext for the whole game: realm music, Voice Chat and the Mic Check. Browsers only
// let it start after the player has tapped something, so call this from a tap when you can
export function audioContext() {
  context ??= new AudioContext()
  if (context.state === 'suspended') context.resume().catch(() => {})
  return context
}

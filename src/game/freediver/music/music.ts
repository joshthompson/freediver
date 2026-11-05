import { audioContext } from '@/utils/audio'
import { createSongPlayer } from './synth'
import { SongName, Songs } from './songs'

const loudness = 0.6 // About as loud as the main ocean music

// Plays one realm song at a time, crossfading when it changes
class Music {
  #playing: { name: SongName, player: ReturnType<typeof createSongPlayer> } | undefined
  #master: GainNode | undefined
  #volume = 1

  play(name: SongName) {
    if (this.#playing?.name === name) return
    this.#playing?.player.stop()
    this.#playing = { name, player: createSongPlayer(Songs[name], this.#output()) }
  }

  // Stops the music, or only stops `name` if that's what's playing, so a scene that's closing
  // doesn't cut off the song the next scene has just started
  stop(name?: SongName) {
    if (name && this.#playing?.name !== name) return
    this.#playing?.player.stop()
    this.#playing = undefined
  }

  // The game's Volume option
  setVolume(volume: number) {
    this.#volume = volume
    if (this.#master) this.#master.gain.setTargetAtTime(volume * loudness, audioContext().currentTime, 0.05)
  }

  #output() {
    if (!this.#master) {
      const ctx = audioContext()
      this.#master = ctx.createGain()
      this.#master.gain.value = this.#volume * loudness
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -14
      compressor.ratio.value = 4
      this.#master.connect(compressor).connect(ctx.destination)
    }
    return this.#master
  }
}

export const music = new Music()

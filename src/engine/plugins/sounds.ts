// A scene's sound effects, by name, built only on ScoopJS's public API so it can become a ScoopJS
// plugin. Each is an <audio> element, made up front so it's ready to play

export interface PlaySoundOptions {
  volume?: number // A multiple of the game's own volume
  loop?: boolean
  unique?: boolean // A fresh copy, so it can play over itself, removed once it ends
}

export function createSounds(paths: Record<string, string>, options: { volume: () => number }) {
  const sounds: Record<string, HTMLAudioElement> = {}
  Object.entries(paths).forEach(([name, path]) => {
    sounds[name] = new Audio(path)
  })

  const play = (name: string, playOptions?: PlaySoundOptions) => {
    let sound = sounds[name]
    if (!sound) return
    if (playOptions?.unique) {
      sound = new Audio(sound.src)
    }
    sound.volume = (playOptions?.volume ?? 1) * options.volume()
    sound.loop = playOptions?.loop ?? false
    sound.setAttribute('data-game-volume', `${playOptions?.volume ?? 1}`)
    sound.play()
    sound.style.setProperty('display', 'none')
    document.body.appendChild(sound)
    if (playOptions?.unique) {
      sound.addEventListener('ended', () => sound.remove())
    }
  }

  const stop = (name: string) => {
    const sound = sounds[name]
    if (!sound) return
    sound.pause()
    sound.currentTime = 0
  }

  // Loads every sound, calling loaded as each one is ready or fails, for the scene's loading count
  const preload = (loaded: () => void) => Object.values(paths).map(path => {
    return new Promise<void>((resolve) => {
      const audio = new Audio(path)
      const done = () => {
        audio.removeEventListener('canplay', done)
        audio.removeEventListener('loadeddata', done)
        audio.removeEventListener('error', done)
        loaded()
        resolve()
      }
      audio.addEventListener('canplay', done)
      audio.addEventListener('loadeddata', done)
      audio.addEventListener('error', done)
    }).catch(() => console.error(`Error preloading "${path}"`))
  })

  return { play, stop, preload }
}

export type Sounds = ReturnType<typeof createSounds>

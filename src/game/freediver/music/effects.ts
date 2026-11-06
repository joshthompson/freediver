import { audioContext } from '@/utils/audio'
import type { SpeechSound } from '@/utils/game'

// Sound effects synthesised on the spot, like the realm music, so they need no files

const loudness = 0.9 // Loud enough to cut through the music
const comboWindow = 800 // ms. Eggs collected closer together than this move along the scale
const comboScale = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19] // Major scale, in semitones
const fireGap = 70 // ms. A burst of bullets makes one sound, not a pile of them
const speechSteps = [0, 2, 3, 5, 7] // Semitones above a speaker's pitch, picked at random so it sounds like talking
const lowestClear = 260 // Hz. Roughly the lowest a phone or laptop speaker plays well

let master: GainNode | undefined
let volume = 1
let combo = 0
let lastCollect = 0
let lastFire = 0

function output() {
  if (!master) {
    master = audioContext().createGain()
    master.gain.value = volume * loudness
    master.connect(audioContext().destination)
  }
  return master
}

let noiseBuffer: AudioBuffer | undefined
function noise() {
  const ctx = audioContext()
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  source.buffer = noiseBuffer
  return source
}

// A gain that jumps to `level` and dies away over `length` seconds
function decay(level: number, length: number, attack = 0.005) {
  const ctx = audioContext()
  const t = ctx.currentTime
  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, t)
  env.gain.exponentialRampToValueAtTime(level, t + attack)
  env.gain.exponentialRampToValueAtTime(0.001, t + length)
  env.connect(output())
  return env
}

export const effects = {
  // The game's Volume option
  setVolume(value: number) {
    volume = value
    if (master) master.gain.setTargetAtTime(volume * loudness, audioContext().currentTime, 0.02)
  },

  // A bubbly bloop with a little sizzle, rising and falling along the scale while eggs come quickly
  eggCollect() {
    const ctx = audioContext()
    const t = ctx.currentTime
    const now = performance.now()
    combo = now - lastCollect < comboWindow ? combo + 1 : 0
    lastCollect = now
    // Up the scale and back down like a wave, lingering a little at the top and bottom
    const top = comboScale.length - 1
    const position = Math.round((1 - Math.cos(Math.PI * combo / top)) / 2 * top)
    const base = 520 * 2 ** (comboScale[position] / 12)

    const bloop = ctx.createOscillator()
    bloop.type = 'sine'
    bloop.frequency.setValueAtTime(base * 0.7, t)
    bloop.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.07)
    bloop.connect(decay(0.35, 0.16))
    bloop.start(t)
    bloop.stop(t + 0.18)

    const sizzle = noise()
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 5000
    sizzle.connect(filter).connect(decay(0.06, 0.12))
    sizzle.start(t)
    sizzle.stop(t + 0.14)
  },

  // The Scrambled Egg Monster spitting out an Egg Bullet: a soft, wet thwup
  eggFire() {
    const now = performance.now()
    if (now - lastFire < fireGap) return
    lastFire = now
    const ctx = audioContext()
    const t = ctx.currentTime
    const pitch = 1 + (Math.random() - 0.5) * 0.2

    const thwup = ctx.createOscillator()
    thwup.type = 'triangle'
    thwup.frequency.setValueAtTime(320 * pitch, t)
    thwup.frequency.exponentialRampToValueAtTime(110 * pitch, t + 0.1)
    thwup.connect(decay(0.3, 0.14))
    thwup.start(t)
    thwup.stop(t + 0.16)

    const puff = noise()
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1800, t)
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.1)
    puff.connect(filter).connect(decay(0.12, 0.1))
    puff.start(t)
    puff.stop(t + 0.12)
  },

  // One syllable of a character talking, somewhere around their pitch
  speech(sound: SpeechSound) {
    const ctx = audioContext()
    const t = ctx.currentTime
    const pitch = sound.pitch * 2 ** (speechSteps[Math.floor(Math.random() * speechSteps.length)] / 12)
    const wave = sound.wave ?? 'square'
    // Each wave at a level that sounds about as loud as the others
    const level = { sine: 0.12, triangle: 0.12, square: 0.1, sawtooth: 0.17, custom: 0.1 }[wave]
    // Small speakers barely play the lowest notes, so deep voices are louder and add the octave
    // above, which the ear hears as the deep note anyway
    const deep = Math.min(Math.max(lowestClear / pitch, 1), 3)
    const env = decay(level * Math.sqrt(deep) * (sound.volume ?? 1), 0.07, 0.004)
    const partials = deep > 1 ? [[1, 1], [2, 0.8], [3, wave === 'sine' ? 0.4 : 0]] : [[1, 1]]
    for (const [ratio, gain] of partials) {
      if (!gain) continue
      const beep = ctx.createOscillator()
      beep.type = wave
      beep.frequency.setValueAtTime(pitch * ratio, t)
      beep.frequency.exponentialRampToValueAtTime(pitch * ratio * (sound.slide ?? 1), t + 0.06)
      const partial = ctx.createGain()
      partial.gain.value = gain
      beep.connect(partial).connect(env)
      beep.start(t)
      beep.stop(t + 0.08)
    }
  },

  // A Portal powering up as it spins open: a rising, fluttering zhhhh over a humming charge, the
  // whole time it takes to open, then a bloom of sparkles once it's open. `from` is how far open it
  // already is, so it can carry on after gameplay was paused. Stop it if the Portal stops opening
  portalOpen(openTime: number, from = 0) { // Seconds the Portal takes to open
    const ctx = audioContext()
    const t = ctx.currentTime
    const open = t + openTime * (1 - from)
    const half = t + openTime * (0.5 - from) // Halfway open, if it isn't yet
    const at = (start: number, end: number, progress: number) => start * (end / start) ** progress // Exponential sweep
    const sweep = (param: AudioParam, start: number, end: number) => {
      param.setValueAtTime(at(start, end, from), t)
      param.exponentialRampToValueAtTime(end, open)
    }
    const sound = ctx.createGain()
    sound.connect(output())
    const sources: AudioScheduledSourceNode[] = []
    const play = (source: AudioScheduledSourceNode, start: number, stop: number) => {
      source.start(start)
      source.stop(stop)
      sources.push(source)
    }

    // A gain swelling from nothing to `level` as the Portal opens, then dropping away
    const swell = (level: number) => {
      const env = ctx.createGain()
      const now = from < 0.5 ? at(0.0001, level * 0.3, from / 0.5) : at(level * 0.3, level, (from - 0.5) / 0.5)
      env.gain.setValueAtTime(0.0001, t)
      env.gain.exponentialRampToValueAtTime(now, t + 0.05) // Quickly, when carrying on partway
      if (half > t + 0.05) env.gain.exponentialRampToValueAtTime(level * 0.3, half)
      env.gain.exponentialRampToValueAtTime(level, Math.max(open, t + 0.06))
      env.gain.exponentialRampToValueAtTime(0.001, open + 0.35)
      env.connect(sound)
      return env
    }

    // The zhhhh: noise through a band that climbs and narrows
    const zh = noise()
    zh.loop = true
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.setValueAtTime(1.2 + 3.8 * from, t)
    band.Q.linearRampToValueAtTime(5, open)
    sweep(band.frequency, 200, 5000)
    const zhEnv = swell(0.5)
    zh.connect(band).connect(zhEnv)
    play(zh, t, open + 0.4)

    // Fluttering faster and faster as it charges
    const flutter = ctx.createOscillator()
    sweep(flutter.frequency, 5, 28)
    const depth = ctx.createGain()
    depth.gain.value = 0.12
    flutter.connect(depth).connect(zhEnv.gain)
    play(flutter, t, open + 0.4)

    // The charge: two slightly out of tune saws climbing two octaves to the D the sparkles start on
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    sweep(filter.frequency, 300, 2500)
    filter.connect(swell(0.09))
    for (const detune of [-12, 12]) {
      const hum = ctx.createOscillator()
      hum.type = 'sawtooth'
      hum.detune.value = detune
      sweep(hum.frequency, 73.4, 293.7)
      hum.connect(filter)
      play(hum, t, open + 0.4)
    }

    // Open: a soft whump and sparkles climbing a D major chord, the ocean music's key
    const whump = ctx.createOscillator()
    whump.type = 'sine'
    whump.frequency.setValueAtTime(180, open)
    whump.frequency.exponentialRampToValueAtTime(60, open + 0.3)
    const whumpEnv = ctx.createGain()
    whumpEnv.gain.setValueAtTime(0.0001, open)
    whumpEnv.gain.exponentialRampToValueAtTime(0.35, open + 0.01)
    whumpEnv.gain.exponentialRampToValueAtTime(0.001, open + 0.4)
    whumpEnv.connect(sound)
    whump.connect(whumpEnv)
    play(whump, open, open + 0.45)

    ;[587, 740, 880, 1175, 1480].forEach((frequency, n) => {
      const sparkleAt = open + n * 0.07
      const sparkle = ctx.createOscillator()
      sparkle.type = 'sine'
      sparkle.frequency.value = frequency
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.0001, sparkleAt)
      env.gain.exponentialRampToValueAtTime(0.12, sparkleAt + 0.01)
      env.gain.exponentialRampToValueAtTime(0.001, sparkleAt + 0.6)
      env.connect(sound)
      sparkle.connect(env)
      play(sparkle, sparkleAt, sparkleAt + 0.65)
    })

    return {
      stop() {
        const now = ctx.currentTime
        sound.gain.setTargetAtTime(0, now, 0.03)
        // A source that hasn't started yet can still be told to stop sooner
        for (const source of sources) source.stop(now + 0.2)
      },
    }
  },

  // Finding a Crystal Corgi: glass bells climbing a D major chord and ringing on together, over a
  // rising shimmer
  crystalFound() {
    const ctx = audioContext()
    const t = ctx.currentTime

    // A struck glass bell. Glass rings with partials above the note that aren't quite in tune
    const bell = (frequency: number, at: number, level: number, length: number) => {
      for (const [ratio, gain, ring] of [[1, 1, 1], [2.32, 0.35, 0.5], [4.25, 0.15, 0.25]]) {
        const tone = ctx.createOscillator()
        tone.type = 'sine'
        tone.frequency.value = frequency * ratio
        const env = ctx.createGain()
        env.gain.setValueAtTime(0.0001, at)
        env.gain.exponentialRampToValueAtTime(level * gain, at + 0.008)
        env.gain.exponentialRampToValueAtTime(0.0005, at + length * ring)
        env.connect(output())
        tone.connect(env)
        tone.start(at)
        tone.stop(at + length * ring + 0.05)
      }
    }

    // Up the chord, D5 to A6
    ;[587, 740, 880, 1175, 1480, 1760].forEach((frequency, n) => bell(frequency, t + n * 0.075, 0.1, 0.7))
    // Then the chord rings out, with the D an octave down for weight
    const chord = t + 6 * 0.075 + 0.05
    ;[294, 587, 740, 880, 1175].forEach(frequency => bell(frequency, chord, frequency < 400 ? 0.14 : 0.07, 2.2))

    const shimmer = noise()
    shimmer.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(3000, t)
    filter.frequency.exponentialRampToValueAtTime(9000, chord)
    shimmer.connect(filter).connect(decay(0.05, chord - t + 1.2, chord - t))
    shimmer.start(t)
    shimmer.stop(chord + 1.3)
  },

  // Buying something: a ka-ching, two bright coin notes with a rattle
  purchase() {
    const ctx = audioContext()
    const t = ctx.currentTime
    ;[[988, 0], [1319, 0.09]].forEach(([frequency, delay]) => {
      for (const [ratio, level] of [[1, 0.14], [2, 0.05], [3.1, 0.03]]) {
        const coin = ctx.createOscillator()
        coin.type = 'square'
        coin.frequency.value = frequency * ratio
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 6000
        const env = ctx.createGain()
        env.gain.setValueAtTime(0.0001, t + delay)
        env.gain.exponentialRampToValueAtTime(level, t + delay + 0.005)
        env.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.45)
        env.connect(output())
        coin.connect(filter).connect(env)
        coin.start(t + delay)
        coin.stop(t + delay + 0.5)
      }
    })

    const rattle = noise()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 7000
    filter.Q.value = 3
    rattle.connect(filter).connect(decay(0.08, 0.15))
    rattle.start(t)
    rattle.stop(t + 0.17)
  },

  // An Egg Bullet hitting the Diver: a squelch over a low thump
  eggSplat() {
    const ctx = audioContext()
    const t = ctx.currentTime

    const squelch = noise()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 2
    filter.frequency.setValueAtTime(2200, t)
    filter.frequency.exponentialRampToValueAtTime(350, t + 0.2)
    squelch.connect(filter).connect(decay(0.45, 0.25))
    squelch.start(t)
    squelch.stop(t + 0.27)

    const thump = ctx.createOscillator()
    thump.type = 'sine'
    thump.frequency.setValueAtTime(140, t)
    thump.frequency.exponentialRampToValueAtTime(50, t + 0.12)
    thump.connect(decay(0.35, 0.18))
    thump.start(t)
    thump.stop(t + 0.2)
  },
}

import { audioContext } from '@/utils/audio'

// A small Web Audio step sequencer, so each Crystal Realm can have its own music without
// shipping mp3s. Adapted from the sandbox synth in scoopbusrunclub.
//
// A song is a list of sections played in order and looped. Each section holds tracks, and a
// track is a voice and a pattern, one token per step:
//
//   `C4`  play the note    `-`  rest    `_`  hold the previous note    `x`  hit (for drums)

export type Voice =
  | 'square'
  | 'triangle'
  | 'sawtooth'
  | 'sine'
  | 'lead' // A sine with vibrato and a soft attack
  | 'pluck'
  | 'bass' // Two detuned saws through a filter that snaps shut
  | 'sub' // A soft sine bass
  | 'pad' // Slow, warm and wide, for held chords
  | 'bell' // A struck, slightly metallic ping
  | 'kick'
  | 'snare'
  | 'hat'

export interface Track {
  voice: Voice
  pattern: string
  gain?: number
  gate?: number // Fraction of a step a note sounds for, before any `_` holds
  echo?: number // How much is sent to the song's echo
}

export interface Section {
  steps: number // Every track's pattern loops to fill this
  tracks: Track[]
}

export interface Song {
  bpm: number
  stepsPerBeat: number
  echo?: { beats: number, feedback: number } // Length of the echo, and how long it rings on
  cutoff?: number // Hz. Everything is a little muffled underwater, as the main music is
  gain?: number // Evens out how loud the songs are
  sections: Section[]
}

const NoteIndex: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

export function noteToFrequency(note: string) {
  const match = /^([A-G])([#b]?)(-?\d)$/.exec(note)
  if (!match) throw new Error(`Bad note ${note}`)
  const semitone = NoteIndex[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0)
  const midi = (Number(match[3]) + 1) * 12 + semitone
  return 440 * 2 ** ((midi - 69) / 12)
}

interface ParsedTrack extends Required<Omit<Track, 'pattern'>> {
  events: ({ note: string, length: number } | null)[] // Per step, a note to start and how many steps it's held
}

function parseTrack(track: Track, steps: number): ParsedTrack {
  const tokens = track.pattern.trim().split(/\s+/)
  const events: ParsedTrack['events'] = []
  for (let i = 0; i < steps; i++) {
    const token = tokens[i % tokens.length]
    if (token === '-' || token === '_') {
      events.push(null)
      continue
    }
    let length = 1
    for (let j = i + 1; j < steps && tokens[j % tokens.length] === '_'; j++) length++
    events.push({ note: token, length })
  }
  return { voice: track.voice, gain: track.gain ?? 0.2, gate: track.gate ?? 0.85, echo: track.echo ?? 0, events }
}

let noiseBuffer: AudioBuffer | undefined
function noise(ctx: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

const isDrum = (voice: Voice) => voice === 'kick' || voice === 'snare' || voice === 'hat'

function playVoice(ctx: AudioContext, out: AudioNode, voice: Voice, note: string, time: number, duration: number, gain: number) {
  const env = ctx.createGain()
  env.connect(out)

  switch (voice) {
    case 'kick': {
      const osc = ctx.createOscillator()
      osc.frequency.setValueAtTime(150, time)
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.12)
      env.gain.setValueAtTime(gain, time)
      env.gain.exponentialRampToValueAtTime(0.001, time + 0.3)
      osc.connect(env)
      osc.start(time)
      osc.stop(time + 0.35)
      return
    }
    case 'snare': {
      const src = ctx.createBufferSource()
      src.buffer = noise(ctx)
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1800
      filter.Q.value = 0.7
      env.gain.setValueAtTime(gain, time)
      env.gain.exponentialRampToValueAtTime(0.001, time + 0.15)
      src.connect(filter).connect(env)
      src.start(time)
      src.stop(time + 0.2)
      const body = ctx.createOscillator()
      body.frequency.setValueAtTime(220, time)
      body.frequency.exponentialRampToValueAtTime(120, time + 0.08)
      const bodyEnv = ctx.createGain()
      bodyEnv.gain.setValueAtTime(gain * 0.6, time)
      bodyEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.1)
      body.connect(bodyEnv).connect(out)
      body.start(time)
      body.stop(time + 0.12)
      return
    }
    case 'hat': {
      const src = ctx.createBufferSource()
      src.buffer = noise(ctx)
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 7000
      env.gain.setValueAtTime(gain, time)
      env.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
      src.connect(filter).connect(env)
      src.start(time)
      src.stop(time + 0.06)
      return
    }
    case 'pluck': {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = noteToFrequency(note)
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(4000, time)
      filter.frequency.exponentialRampToValueAtTime(600, time + 0.15)
      const end = time + Math.max(0.15, duration)
      env.gain.setValueAtTime(gain, time)
      env.gain.exponentialRampToValueAtTime(0.001, end)
      osc.connect(filter).connect(env)
      osc.start(time)
      osc.stop(end + 0.05)
      return
    }
    case 'lead': {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = noteToFrequency(note)
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 5.5
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = osc.frequency.value * 0.012
      lfo.connect(lfoGain).connect(osc.frequency)
      env.gain.setValueAtTime(0.0001, time)
      env.gain.exponentialRampToValueAtTime(gain, time + 0.03)
      env.gain.setValueAtTime(gain, time + Math.max(0.04, duration - 0.04))
      env.gain.exponentialRampToValueAtTime(0.001, time + duration)
      osc.connect(env)
      osc.start(time)
      lfo.start(time)
      osc.stop(time + duration + 0.02)
      lfo.stop(time + duration + 0.02)
      return
    }
    case 'bass': {
      const frequency = noteToFrequency(note)
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.Q.value = 6
      filter.frequency.setValueAtTime(frequency * 8, time)
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, time + 0.12)
      env.gain.setValueAtTime(gain, time)
      env.gain.setValueAtTime(gain, time + Math.max(0.01, duration - 0.02))
      env.gain.exponentialRampToValueAtTime(0.001, time + duration)
      for (const detune of [-7, 7]) {
        const osc = ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = frequency
        osc.detune.value = detune
        osc.connect(filter)
        osc.start(time)
        osc.stop(time + duration + 0.02)
      }
      filter.connect(env)
      return
    }
    case 'sub': {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = noteToFrequency(note)
      env.gain.setValueAtTime(0.0001, time)
      env.gain.exponentialRampToValueAtTime(gain, time + 0.06)
      env.gain.setValueAtTime(gain, time + Math.max(0.07, duration - 0.15))
      env.gain.exponentialRampToValueAtTime(0.001, time + duration)
      osc.connect(env)
      osc.start(time)
      osc.stop(time + duration + 0.02)
      return
    }
    case 'pad': {
      // Swells in and lets go slowly, so held chords blur into each other
      const attack = Math.min(0.6, duration / 2)
      const release = 0.8
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1400
      env.gain.setValueAtTime(0.0001, time)
      env.gain.exponentialRampToValueAtTime(gain, time + attack)
      env.gain.setValueAtTime(gain, time + duration)
      env.gain.exponentialRampToValueAtTime(0.001, time + duration + release)
      for (const detune of [-9, 0, 9]) {
        const osc = ctx.createOscillator()
        osc.type = detune ? 'sawtooth' : 'triangle'
        osc.frequency.value = noteToFrequency(note)
        osc.detune.value = detune
        osc.connect(filter)
        osc.start(time)
        osc.stop(time + duration + release + 0.05)
      }
      filter.connect(env)
      return
    }
    case 'bell': {
      // A sine and a quieter, out-of-tune overtone, both dying away
      const frequency = noteToFrequency(note)
      const ring = Math.max(1.2, duration)
      env.gain.setValueAtTime(gain, time)
      env.gain.exponentialRampToValueAtTime(0.001, time + ring)
      for (const [ratio, level] of [[1, 1], [2.76, 0.3], [5.4, 0.1]]) {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = frequency * ratio
        const partial = ctx.createGain()
        partial.gain.value = level
        osc.connect(partial).connect(env)
        osc.start(time)
        osc.stop(time + ring + 0.05)
      }
      return
    }
    default: {
      const osc = ctx.createOscillator()
      osc.type = voice
      osc.frequency.value = noteToFrequency(note)
      env.gain.setValueAtTime(0.0001, time)
      env.gain.exponentialRampToValueAtTime(gain, time + 0.008)
      env.gain.setValueAtTime(gain, time + Math.max(0.01, duration - 0.02))
      env.gain.exponentialRampToValueAtTime(0.001, time + duration)
      osc.connect(env)
      osc.start(time)
      osc.stop(time + duration + 0.02)
    }
  }
}

const lookahead = 0.12 // Seconds of music scheduled ahead of the audio clock
const fadeTime = 0.4 // Seconds to fade a song in or out

// Plays one song on a loop until stopped. Each player has its own output, so one song can fade
// out while the next fades in
export function createSongPlayer(song: Song, out: AudioNode) {
  const ctx = audioContext()
  const sections = song.sections.map(section => ({
    steps: section.steps,
    tracks: section.tracks.map(track => parseTrack(track, section.steps)),
  }))
  const totalSteps = sections.reduce((n, section) => n + section.steps, 0)
  const stepSeconds = 60 / song.bpm / song.stepsPerBeat

  const output = ctx.createGain()
  output.gain.setValueAtTime(0.0001, ctx.currentTime)
  output.gain.exponentialRampToValueAtTime(song.gain ?? 1, ctx.currentTime + fadeTime)
  const muffle = ctx.createBiquadFilter()
  muffle.type = 'lowpass'
  muffle.frequency.value = song.cutoff ?? 3000
  muffle.Q.value = 0.5
  output.connect(muffle).connect(out)

  // A feedback echo the tracks can send to, which suits being underwater
  const echoIn = ctx.createGain()
  const delay = ctx.createDelay(4)
  delay.delayTime.value = (song.echo?.beats ?? 0.75) * 60 / song.bpm
  const feedback = ctx.createGain()
  feedback.gain.value = song.echo?.feedback ?? 0.35
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 2200
  echoIn.connect(delay).connect(tone).connect(feedback).connect(delay)
  tone.connect(output)

  let step = 0
  let nextStepTime = ctx.currentTime + 0.05

  const locate = (absolute: number) => {
    let s = absolute % totalSteps
    for (const section of sections) {
      if (s < section.steps) return { section, step: s }
      s -= section.steps
    }
    throw new Error('unreachable')
  }

  const scheduleStep = (time: number) => {
    const { section, step: at } = locate(step)
    for (const track of section.tracks) {
      const event = track.events[at]
      if (!event) continue
      const duration = isDrum(track.voice) ? 0.1 : stepSeconds * (event.length - 1 + track.gate)
      playVoice(ctx, output, track.voice, event.note, time, duration, track.gain)
      if (track.echo) playVoice(ctx, echoIn, track.voice, event.note, time, duration, track.gain * track.echo)
    }
  }

  const tick = () => {
    while (nextStepTime < ctx.currentTime + lookahead) {
      // Background tabs only run timers about once a second. Skip what was missed rather than
      // playing it all at once on the way back
      if (nextStepTime >= ctx.currentTime) scheduleStep(nextStepTime)
      nextStepTime += stepSeconds
      step++
    }
  }
  const timer = window.setInterval(tick, 25)
  tick()

  return {
    stop() {
      window.clearInterval(timer)
      output.gain.cancelScheduledValues(ctx.currentTime)
      output.gain.setValueAtTime(Math.max(output.gain.value, 0.0001), ctx.currentTime)
      output.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fadeTime)
      window.setTimeout(() => output.disconnect(), fadeTime * 1000 + 2000) // Let the echo ring out
    },
  }
}

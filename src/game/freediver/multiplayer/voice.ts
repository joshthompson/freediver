import { createEffect, createRoot, createSignal, on } from 'solid-js'
import type { Room } from 'trystero'
import { Action, createAction } from './net'
import { audioContext, mic } from './mic'
import { EARSHOT, FULL_VOLUME_DISTANCE, LISTEN_DISTANCE, STOP_LISTENING_DISTANCE } from './protocol'

export interface Point {
  x: number
  y: number
}

interface Incoming {
  element: HTMLAudioElement
  source: MediaStreamAudioSourceNode
  analyser: AnalyserNode
  gain: GainNode
  panner: StereoPannerNode
  samples: Float32Array<ArrayBuffer>
  lastLoud: number
}

const maxPan = 0.5 // Never fully into one ear
const speakingLevel = 0.02 // Root mean square of the samples, above the hiss of a quiet room
const speakingHold = 300 // Keep showing the speaker icon through the gaps between words
const fadeTime = 0.05 // Seconds to glide to a new volume, so it never clicks
const resendEvery = 3000 // A request sent before two Players' connection was up is lost, so repeat them

// How loud a Player is, from 1 within FULL_VOLUME_DISTANCE to 0 at Earshot. Squared, because a
// straight line sounds loud right up until it cuts out
export function voiceVolume(distance: number) {
  const t = (distance - FULL_VOLUME_DISTANCE) / (EARSHOT - FULL_VOLUME_DISTANCE)
  const clamped = Math.min(Math.max(t, 0), 1)
  return (1 - clamped) ** 2
}

// Voice Chat in one Room. Unlike everything else, audio goes straight between Players rather
// than through the Host (see ADR 0002). Each listener asks a Player for their audio once their
// Diver is nearly in Earshot, and each Player only sends to those who've asked
export class VoiceChat {
  #room: Room
  #isPlayer: (id: string) => boolean
  #listen: Action<boolean>
  #track: MediaStreamTrack
  #stream: MediaStream
  #destination: MediaStreamAudioDestinationNode
  #master: GainNode
  #senders = new Map<string, RTCRtpSender>()
  #adding = new Set<string>()
  #askedBy = new Set<string>() // Players who want our audio
  #listeningTo = new Set<string>() // Players we've asked for theirs
  #incoming = new Map<string, Incoming>()
  #muted = createSignal<ReadonlySet<string>>(new Set())
  #speaking = createSignal<ReadonlySet<string>>(new Set())
  #dispose: () => void
  #ended = false
  #lastResend = 0

  muted = (id: string) => this.#muted[0]().has(id)
  speaking = (id: string) => this.#speaking[0]().has(id)

  // isPlayer says whether a peer is someone else in the Room's roster
  constructor(room: Room, isPlayer: (id: string) => boolean) {
    this.#room = room
    this.#isPlayer = isPlayer
    const ctx = audioContext()

    this.#destination = ctx.createMediaStreamDestination()
    mic.output.connect(this.#destination)
    this.#stream = this.#destination.stream
    this.#track = this.#stream.getAudioTracks()[0]

    this.#master = ctx.createGain()
    this.#master.connect(ctx.destination)

    // A request can arrive before the Host's roster says who's asking, so it's kept either way
    // and only acted on once they're in the Room
    this.#listen = createAction<boolean>(room, 'listen', (wanted, peerId) => {
      if (wanted === true) this.#askedBy.add(peerId)
      else this.#askedBy.delete(peerId)
      this.#updateSending(peerId)
    })
    room.onPeerStream = (stream, peerId) => this.#receive(stream, peerId)

    // Only send while the mic is actually on
    this.#dispose = createRoot(dispose => {
      createEffect(on(mic.status, () => this.refreshSending(), { defer: true }))
      return dispose
    })
  }

  // Check again who to send to, once the roster or the mic changes
  refreshSending() {
    this.#askedBy.forEach(id => this.#updateSending(id))
  }

  toggleMute(id: string) {
    const muted = new Set(this.#muted[0]())
    if (muted.has(id)) muted.delete(id)
    else muted.add(id)
    this.#muted[1](muted)
  }

  // Every frame: set each Player's volume and pan from where their Diver is, and ask for or
  // stop asking for their audio as they come and go
  update(listener: Point, others: Map<string, Point>, volume: number) {
    if (this.#ended) return
    const ctx = audioContext()
    const now = performance.now()
    const resend = now - this.#lastResend > resendEvery
    if (resend) this.#lastResend = now
    this.#master.gain.setTargetAtTime(volume, ctx.currentTime, fadeTime)

    const speaking = new Set(this.#speaking[0]())
    let speakingChanged = false
    const setSpeaking = (id: string, on: boolean) => {
      if (speaking.has(id) === on) return
      speakingChanged = true
      if (on) speaking.add(id)
      else speaking.delete(id)
    }

    others.forEach((at, id) => {
      const dx = at.x - listener.x
      const distance = Math.hypot(dx, at.y - listener.y)
      const muted = this.muted(id)
      const listening = this.#listeningTo.has(id)
      const wanted = !muted && distance <= (listening ? STOP_LISTENING_DISTANCE : LISTEN_DISTANCE)
      if (wanted !== listening || resend) {
        if (wanted) this.#listeningTo.add(id)
        else this.#listeningTo.delete(id)
        this.#listen.send(wanted, id)
      }

      const incoming = this.#incoming.get(id)
      if (!incoming) return setSpeaking(id, false)
      const loudness = muted ? 0 : voiceVolume(distance)
      incoming.gain.gain.setTargetAtTime(loudness, ctx.currentTime, fadeTime)
      incoming.panner.pan.setTargetAtTime(Math.min(Math.max(dx / EARSHOT, -1), 1) * maxPan, ctx.currentTime, fadeTime)

      incoming.analyser.getFloatTimeDomainData(incoming.samples)
      let sum = 0
      for (const sample of incoming.samples) sum += sample * sample
      if (Math.sqrt(sum / incoming.samples.length) > speakingLevel) incoming.lastLoud = now
      setSpeaking(id, loudness > 0 && now - incoming.lastLoud < speakingHold)
    })

    if (speakingChanged) this.#speaking[1](speaking)
  }

  // A Player left the Room
  forget(id: string) {
    this.#stopReceiving(id)
    this.#senders.delete(id)
    this.#askedBy.delete(id)
    this.#listeningTo.delete(id)
    if (this.muted(id)) this.toggleMute(id)
  }

  end() {
    if (this.#ended) return
    this.#ended = true
    this.#dispose()
    this.#incoming.forEach((_, id) => this.#stopReceiving(id))
    mic.output.disconnect(this.#destination)
    this.#track.stop()
    this.#master.disconnect()
  }

  // Send our audio to a Player only while they've asked for it and the mic is on. The first time,
  // the audio is added to their connection; after that it's only switched on and off, which is quick
  async #updateSending(id: string) {
    if (this.#ended) return
    const send = this.#askedBy.has(id) && this.#isPlayer(id) && mic.status() === 'on'
    const sender = this.#senders.get(id)
    if (sender) {
      const track = send ? this.#track : null
      if (sender.track !== track) sender.replaceTrack(track).catch(() => {})
      return
    }
    if (!send || this.#adding.has(id)) return
    this.#adding.add(id)
    await Promise.all(this.#room.addStream(this.#stream, { target: id })).catch(() => {})
    this.#adding.delete(id)
    const added = this.#room.getPeers()[id]?.getSenders().find(s => s.track === this.#track)
    if (!added || this.#ended || !this.#isPlayer(id)) return
    this.#senders.set(id, added)
    // They may have stopped asking, or the mic gone off, while it was being added
    this.#updateSending(id)
  }

  #receive(stream: MediaStream, id: string) {
    if (this.#ended || !this.#isPlayer(id)) return
    this.#stopReceiving(id)
    const ctx = audioContext()

    // Chrome only plays a peer's audio through Web Audio if it's also attached to a media element
    const element = new Audio()
    element.srcObject = stream
    element.muted = true
    element.play().catch(() => {})

    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    const gain = ctx.createGain()
    gain.gain.value = 0
    const panner = ctx.createStereoPanner()
    source.connect(analyser)
    source.connect(gain).connect(panner).connect(this.#master)

    this.#incoming.set(id, {
      element,
      source,
      analyser,
      gain,
      panner,
      samples: new Float32Array(analyser.fftSize),
      lastLoud: 0,
    })
  }

  #stopReceiving(id: string) {
    const incoming = this.#incoming.get(id)
    if (!incoming) return
    incoming.source.disconnect()
    incoming.gain.disconnect()
    incoming.panner.disconnect()
    incoming.element.srcObject = null
    this.#incoming.delete(id)
    if (this.speaking(id)) {
      const speaking = new Set(this.#speaking[0]())
      speaking.delete(id)
      this.#speaking[1](speaking)
    }
  }
}

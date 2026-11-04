import { createSignal } from 'solid-js'

export type MicStatus = 'off' | 'asking' | 'on' | 'blocked' | 'unavailable'

// Whether the mic was last left on, and which one, kept apart from the single-player save
const settingsKey = 'multiplayer-mic'

interface MicSettings {
  on: boolean
  deviceId?: string
}

function loadSettings(): MicSettings {
  try {
    return { on: false, ...JSON.parse(localStorage.getItem(settingsKey) ?? '{}') }
  } catch {
    return { on: false }
  }
}

let context: AudioContext | undefined

// One AudioContext for Voice Chat and the Mic Check. Browsers only let it start after the
// player has tapped something, so call this from a tap when you can
export function audioContext() {
  context ??= new AudioContext()
  if (context.state === 'suspended') context.resume().catch(() => {})
  return context
}

// Edges of the Mic Check's five bars, low to high pitch, in Hz
const bandEdges = [80, 250, 500, 1000, 2000, 4000]

// Your microphone, shared by the Lobby and the Room. Turning it off releases it altogether,
// so the browser's recording light goes out
class Microphone {
  #status = createSignal<MicStatus>('off')
  #settings = createSignal<MicSettings>(loadSettings())
  #devices = createSignal<MediaDeviceInfo[]>([])
  #activeDevice = createSignal<string | undefined>(undefined)
  #stream: MediaStream | undefined
  #source: MediaStreamAudioSourceNode | undefined
  #output: GainNode | undefined
  #analyser: AnalyserNode | undefined
  #frequencies: Uint8Array<ArrayBuffer> | undefined
  #attempt = 0

  status = () => this.#status[0]()
  wanted = () => this.#settings[0]().on
  devices = () => this.#devices[0]()
  activeDevice = () => this.#activeDevice[0]()

  constructor() {
    navigator.mediaDevices?.addEventListener('devicechange', () => this.#listDevices())
  }

  // Carries the mic's sound, and is silent while it's off. Anything listening connects here,
  // so switching mics or turning it off and on never disturbs them
  get output() {
    if (!this.#output) {
      const ctx = audioContext()
      this.#output = ctx.createGain()
      this.#analyser = ctx.createAnalyser()
      this.#analyser.fftSize = 1024
      this.#analyser.smoothingTimeConstant = 0.6
      this.#frequencies = new Uint8Array(this.#analyser.frequencyBinCount)
      // Some browsers only run an analyser that leads somewhere, so give it a silent way out
      const sink = ctx.createGain()
      sink.gain.value = 0
      this.#output.connect(this.#analyser).connect(sink).connect(ctx.destination)
    }
    return this.#output
  }

  toggle() {
    if (this.status() === 'on' || this.status() === 'asking') this.turnOff()
    else this.turnOn()
  }

  async turnOn(deviceId = this.#settings[0]().deviceId) {
    const attempt = ++this.#attempt
    this.#stop()
    this.#status[1]('asking')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { ideal: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
    } catch (error) {
      if (attempt !== this.#attempt) return
      const blocked = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError')
      this.#status[1](blocked ? 'blocked' : 'unavailable')
      this.#save({ on: false })
      return
    }
    // Turned off, or turned on again with another mic, while the browser was asking
    if (attempt !== this.#attempt) {
      stream.getTracks().forEach(track => track.stop())
      return
    }

    const track = stream.getAudioTracks()[0]
    track.addEventListener('ended', () => {
      if (this.#stream === stream) this.release()
    })
    this.#stream = stream
    this.#source = audioContext().createMediaStreamSource(stream)
    this.#source.connect(this.output)
    this.#activeDevice[1](track.getSettings().deviceId)
    this.#status[1]('on')
    this.#save({ on: true, deviceId })
    // Device names are hidden until the player has allowed the mic
    this.#listDevices()
  }

  turnOff() {
    this.release()
    this.#save({ on: false })
  }

  // Stop using the mic, but remember whether the player wants it on next time
  release() {
    this.#attempt++
    this.#stop()
    this.#status[1]('off')
  }

  // Turn the mic back on if the player last left it on
  restore() {
    if (this.wanted() && this.status() === 'off') this.turnOn()
  }

  setDevice(deviceId: string) {
    this.#save({ deviceId })
    if (this.status() === 'on') this.turnOn(deviceId)
  }

  // How loud each of the Mic Check's bars is, from 0 to 1
  levels() {
    if (!this.#analyser || !this.#frequencies || this.status() !== 'on') return bandEdges.slice(1).map(() => 0)
    this.#analyser.getByteFrequencyData(this.#frequencies)
    const binWidth = this.#analyser.context.sampleRate / this.#analyser.fftSize
    return bandEdges.slice(1).map((high, n) => {
      const from = Math.floor(bandEdges[n] / binWidth)
      const to = Math.max(from + 1, Math.floor(high / binWidth))
      let total = 0
      for (let bin = from; bin < to; bin++) total += this.#frequencies![bin]
      return total / (to - from) / 255
    })
  }

  #stop() {
    this.#source?.disconnect()
    this.#source = undefined
    this.#stream?.getTracks().forEach(track => track.stop())
    this.#stream = undefined
    this.#activeDevice[1](undefined)
  }

  async #listDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      this.#devices[1](devices.filter(device => device.kind === 'audioinput' && device.deviceId))
    } catch {
      this.#devices[1]([])
    }
  }

  #save(changes: Partial<MicSettings>) {
    const settings = { ...this.#settings[0](), ...changes }
    this.#settings[1](settings)
    try {
      localStorage.setItem(settingsKey, JSON.stringify(settings))
    } catch {
      // Not remembered, which is fine
    }
  }
}

export const mic = new Microphone()

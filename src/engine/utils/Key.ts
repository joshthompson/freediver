import { Accessor, createSignal, Setter } from 'solid-js'

// Typing in a text field shouldn't steer the diver or pause the game
export function isTyping(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  return !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
}

class KeyController {
  #keys = new Map<string, [Accessor<boolean>, Setter<boolean>]>()
  #timeouts = new Map<string, number>()

  constructor() {
    window.addEventListener('keydown', this.#keydown.bind(this))
    window.addEventListener('keyup', this.#keyup.bind(this))
  }

  emulateKeydown(key: string, time = 100) {
    this.#get(key)[1](true)
    if (this.#timeouts.has(key)) {
      window.clearTimeout(this.#timeouts.get(key))
    }
    this.#timeouts.set(key, window.setTimeout(() => {
      this.#get(key)[1](false)
    }, time))
  }

  destroy() {
    window.addEventListener('keydown', this.#keydown.bind(this))
    window.addEventListener('keyup', this.#keyup.bind(this))
  }

  #keydown(event: KeyboardEvent) {
    if (isTyping(event)) return
    this.#get(event.key)[1](true)
  }

  #keyup(event: KeyboardEvent) {
    this.#get(event.key)[1](false)
  }

  isDown(key: string) {
    return this.#get(key)[0]()
  }

  #get(key: string) {
    if (!this.#keys.has(key)) {
      this.#keys.set(key, createSignal(false))
    }
    return this.#keys.get(key)!
  }

  get(key: string) {
    return this.#get(key)[0]
  }
}

export const Key = new KeyController()

import { createObjectSignal, type Scene } from 'scoopjs'
import { createSignal } from 'solid-js'
import { isOnCanvas } from '../utils/isOnCanvas'

// Dialog over a scene, built only on ScoopJS's public API so it can become a ScoopJS plugin. It knows
// nothing of what a message says or who says it: that's the game's own, in the types it passes in.
//
// - A dialog is a run of messages, one at a time, and can pause the scene while it's open
// - A background dialog is a line a controller says, one at a time and never during a dialog. It goes
//   when its ticks run out or its speaker leaves the screen

export interface DialogOption<S> {
  next?: number // The message to go to, rather than the next one
  end?: boolean
  onSelect?: (scene: S) => void
}

export interface DialogMessage<S> {
  after?: () => void // Run as the message is answered
  options?: DialogOption<S>[]
}

export interface Dialog<M> {
  messages: M[]
  onComplete?: () => void
  pauseGameplay?: boolean
}

export interface BackgroundDialog {
  controllerId: string
  framesLeft: number // Ticks left to show for
}

export function createDialogs<
  S extends Scene,
  D extends Dialog<DialogMessage<S>>,
  B extends BackgroundDialog,
>(scene: S) {
  const [data, setData] = createSignal<D | undefined>(undefined)
  const [messageIndex, setMessageIndex] = createSignal<number>(0)
  const background = createObjectSignal([] as B[])

  const start = (dialog: D, options?: { firstMessageIndex?: number }) => {
    background.set([])
    setMessageIndex(options?.firstMessageIndex ?? 0)
    setData(() => dialog)
  }

  // Returns whether it started
  const startBackground = (backgroundDialog: B) => {
    if (data() || background.get().length) return false
    background.set([backgroundDialog])
    return true
  }

  const end = () => {
    data()?.onComplete?.()
    setData(undefined)
    setMessageIndex(0)
  }

  // Answers the message showing with one of its options, or just moves on from it
  const choose = (optionIndex: number) => {
    const dialog = data()
    const message = dialog?.messages[messageIndex()]
    if (!message) return

    message.after?.()
    const option = message.options?.[optionIndex]
    if (option?.end) {
      end()
    }
    option?.onSelect?.(scene)

    const next = option?.next ?? messageIndex() + 1
    if (dialog.messages[next]) {
      setMessageIndex(next)
    } else {
      end()
    }
  }

  // Drop background dialogs that have run out of ticks or whose speaker has left the screen. Only while
  // the scene is running, so they wait out a pause
  scene.tickers.add(() => {
    if (!scene.isActive()) return
    const dialogs = background.get()
    if (!dialogs.length) return
    const remaining = dialogs.filter(dialog => {
      dialog.framesLeft--
      const speaker = scene.getControllerById(dialog.controllerId)
      if (!speaker || dialog.framesLeft <= 0) return false
      return isOnCanvas(scene, speaker)
    })
    if (remaining.length !== dialogs.length) background.set(remaining)
  })

  return {
    dialog: { data, setData, messageIndex, setMessageIndex },
    background,
    start,
    startBackground,
    choose,
    end,
    // Whether the open dialog holds the scene still
    pausesScene: () => data()?.pauseGameplay === true,
  }
}

export type Dialogs<S extends Scene, D extends Dialog<DialogMessage<S>>, B extends BackgroundDialog>
  = ReturnType<typeof createDialogs<S, D, B>>

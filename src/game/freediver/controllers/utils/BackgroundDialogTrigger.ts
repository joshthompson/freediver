import { Controller, Scene } from '@/engine'
import { Localised } from '@/utils/game'

const range = 250
const chancePerFrame = 1 / 50
const cooldownSeconds = 20

// Lets a character occasionally say one of its lines as Linkosha swims past
export function createBackgroundDialogTrigger(lines: readonly Localised[]) {
  let cooldown = 0

  return ($scene: Scene, speaker: Controller<any>) => {
    const frames = (seconds: number) => Math.round(seconds * 1000 / ($scene.options.frameRate ?? 40))
    if (cooldown > 0) {
      cooldown--
      return
    }

    const corgi = $scene.getControllerById<Controller<any>>('corgi')
    if (!corgi) return
    const { x, y, width, height } = speaker.data
    if (corgi.distanceTo(x() + width() / 2, y() + height() / 2) > range) return
    if (Math.random() > chancePerFrame) return

    const text = lines[Math.floor(Math.random() * lines.length)]
    const started = $scene.startBackgroundDialog({
      controllerId: speaker.id,
      text,
      framesLeft: frames(2 + text[$scene.gameState.options.locale].length / 25), // Longer lines stay up longer
    })
    if (started) cooldown = frames(cooldownSeconds)
  }
}

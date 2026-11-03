import { Scene } from '@/engine'
import { DiverController } from '../main/DiverController'

export const HazardDamage = 15
const diverRadius = 30 // Roughly the diver's body, wherever they're facing

export function getDiver($scene: Scene) {
  return $scene.getControllerById<DiverController>('diver')
}

// Whether a circle overlaps the diver's body
export function touchesDiver($scene: Scene, x: number, y: number, radius: number) {
  const diver = getDiver($scene)
  if (!diver) return false
  const center = diver.data.center()
  return Math.hypot(center.x - x, center.y - y) < radius + diverRadius
}

// Takes oxygen from the diver unless they're still flashing from the last hit. Returns whether it hit
export function hitDiver($scene: Scene, amount = HazardDamage) {
  const diver = getDiver($scene)
  if (!diver || diver.data.invulnerable() > 0) return false
  diver.data.setInvulnerable(diver.data.invulnerableFrames)
  $scene.gameStateActions.damage(amount)
  $scene.playSound('thud', { unique: true })
  return true
}

export function hitDiverIfTouching($scene: Scene, x: number, y: number, radius: number, amount = HazardDamage) {
  return touchesDiver($scene, x, y, radius) && hitDiver($scene, amount)
}

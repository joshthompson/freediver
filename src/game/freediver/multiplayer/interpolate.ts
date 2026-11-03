import { Pose } from './protocol'

// Puppets are drawn this far behind real time so they can glide between updates
export const INTERPOLATION_DELAY = 100
const bufferSize = 10

interface Sample {
  at: number
  pose: Pose
}

// Holds a Player's recent poses and works out where their Puppet should be drawn now
export class PoseBuffer {
  #samples: Sample[] = []

  push(pose: Pose, at = performance.now()) {
    this.#samples.push({ at, pose })
    if (this.#samples.length > bufferSize) this.#samples.shift()
  }

  latest() {
    return this.#samples[this.#samples.length - 1]?.pose
  }

  poseAt(time = performance.now() - INTERPOLATION_DELAY): Pose | undefined {
    const samples = this.#samples
    if (!samples.length) return
    if (time <= samples[0].at) return samples[0].pose
    for (let i = samples.length - 1; i > 0; i--) {
      const before = samples[i - 1]
      const after = samples[i]
      if (before.at <= time && time <= after.at) {
        const t = (time - before.at) / Math.max(1, after.at - before.at)
        return lerpPose(before.pose, after.pose, t)
      }
    }
    // Updates have stopped arriving, so hold the last one
    return samples[samples.length - 1].pose
  }
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const arm = (type: 'back' | 'front') => ({
    swimPosition: (lerpAngle(a.diver.arms[type].swimPosition, b.diver.arms[type].swimPosition, t) + 360) % 360,
    rotation: (lerpAngle(a.diver.arms[type].rotation, b.diver.arms[type].rotation, t) + 360) % 360,
    isSwimming: b.diver.arms[type].isSwimming,
  })
  const rotation = lerpAngle(a.diver.rotation, b.diver.rotation, t)
  return {
    diver: {
      x: lerp(a.diver.x, b.diver.x, t),
      y: lerp(a.diver.y, b.diver.y, t),
      rotation: rotation > 180 ? rotation - 360 : rotation <= -180 ? rotation + 360 : rotation,
      speed: lerp(a.diver.speed, b.diver.speed, t),
      arms: { back: arm('back'), front: arm('front') },
    },
    corgi: {
      x: lerp(a.corgi.x, b.corgi.x, t),
      y: lerp(a.corgi.y, b.corgi.y, t),
      rotation: lerpAngle(a.corgi.rotation, b.corgi.rotation, t),
      xScale: b.corgi.xScale,
      speed: lerp(a.corgi.speed, b.corgi.speed, t),
    },
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// Takes the short way round
function lerpAngle(a: number, b: number, t: number) {
  const diff = ((b - a + 540) % 360) - 180
  return a + diff * t
}

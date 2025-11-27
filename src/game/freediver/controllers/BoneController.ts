import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { CorgiController } from './CorgiController'
import { boneAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export type BoneController = ReturnType<typeof createBoneController>

export function createBoneController(id: string, props: { x: number }) {
  return createController({
    frames: [boneAsset],
    init() {
      const claimed = createObjectSignal(false, 'claimed')
      return {
        id,
        type: 'bone',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(620, 'y'),
        ...claimed,
        ...createObjectSignal(-1, 'boneNumber'),
        width: () => claimed.claimed() ? 30 : 60,
        rotation: () => Math.random() * 20,
      }
    },
    onEnterFrame({ $, $scene, $controller }) {
      const corgi = $scene.getControllerById('corgi') as CorgiController
      if (!corgi) return

      if (!$.claimed() && corgi.hitTest($controller)) {
        $.setClaimed(true)
        $.setBoneNumber(corgi.data.bones())
        $scene.gameStateActions.score(1)
        corgi.data.setBones(corgi.data.bones() + 1)
        if (corgi.data.bones() === 5) $scene.gameStateActions.achievement('bone')
      }

      if ($.claimed()) {
        const targetX = corgi.data.x() + (
          corgi.data.xScale() > 0
            ? (-50 - $.boneNumber() * 40)
            : (50 + $.boneNumber() * 40)
        )
        const targetY = corgi.data.y() + 10
        const distance = Math.hypot($.x() - targetX, $.y() - targetY)
        const direction = Math.atan2($.y() - targetY, $.x() - targetX)
        const speed = Math.max(5, corgi.data.speed())
        if (distance > 20) {
          $.setX($.x() - speed * Math.cos(direction))
          $.setY($.y() - speed * Math.sin(direction))
        }
      }
    }
  })
}

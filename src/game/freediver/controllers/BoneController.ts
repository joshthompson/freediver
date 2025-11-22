import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { CorgiController } from './CorgiController'
import { boneAsset } from '@/assets'

export type BoneController = ReturnType<typeof createBoneController>

export function createBoneController(id: string, props: { x: number }) {
  return createController({
    frames: [boneAsset],
    init() {
      const [x, setX] = createSignal(props.x)
      const [y, setY] = createSignal(620)
      const [claimed, setClaimed] = createSignal(false)
      const [boneNumber, setBoneNumber] = createSignal(-1)
      return {
        id,
        type: 'bone',
        x, setX,
        y, setY,
        claimed, setClaimed,
        boneNumber, setBoneNumber,
        width: () => claimed() ? 30 : 60,
        rotation: () => Math.random() * 20,
      }
    },
    onEnterFrame({ $, $game, $controller }) {
      const corgi = $game.getControllerById('corgi') as CorgiController
      if (!corgi) return

      if (!$.claimed() && corgi.hitTest($controller)) {
        $.setClaimed(true)
        $.setBoneNumber(corgi.data.bones())
        $game.gameStateActions.score(1)
        corgi.data.setBones(corgi.data.bones() + 1)
        if (corgi.data.bones() === 5) $game.gameStateActions.achievement('bone')
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

import { createController } from '@/utils/game'
import { CorgiController } from './CorgiController'
import { boneAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export type BoneController = ReturnType<typeof createBoneController>

export function createBoneController(id: string, props: {
  x: number
  n: number
  boneNumber: number
  corgi: CorgiController
}) {
  const corgi = props.corgi
  const isClaimed = props.boneNumber >= 0

  function target(boneNumber: number) {
    return {
      x: corgi.data.x() + (
        corgi.data.xScale() > 0
          ? (-50 - boneNumber * 40)
          : (50 + boneNumber * 40)
      ),
      y: corgi.data.y() + 10,
    }
  }

  return createController({
    frames: [boneAsset],
    init() {
      const claimed = createObjectSignal(isClaimed, 'claimed')
      return {
        id,
        type: 'bone',
        ...createObjectSignal(isClaimed ? target(props.boneNumber).x : props.x, 'x'),
        ...createObjectSignal(isClaimed ? target(props.boneNumber).y : 620, 'y'),
        ...createObjectSignal(Math.random() * 20, 'rotation'),
        ...createObjectSignal(props.boneNumber, 'boneNumber'),
        ...claimed,
        width: () => claimed.claimed() ? 30 : 60,
      }
    },
    onEnterFrame({ $, $scene, $controller, $age }) {
      if (!$.claimed() && corgi.hitTest($controller)) {
        const boneNumber = $scene.gameStateActions.claimBone(props.n)
        $.setClaimed(true)
        $.setBoneNumber(boneNumber)
      }

      if ($.claimed()) {
        const {
          x: targetX,
          y: targetY,
        } = target($.boneNumber())
        const distance = Math.hypot($.x() - targetX, $.y() - targetY)
        const direction = Math.atan2($.y() - targetY, $.x() - targetX)
        const speed = Math.max(3, corgi.data.speed())
        if (distance > 20) {
          $.setX($.x() - speed * Math.cos(direction))
          $.setY($.y() - speed * Math.sin(direction))
        }
        $.setRotation($.rotation() + Math.cos(props.n * 3 + $age / 10))
      }
    }
  })
}

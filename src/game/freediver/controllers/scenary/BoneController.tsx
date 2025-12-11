import { createController } from '@/engine'
import { CorgiController } from '../main/CorgiController'
import { boneAsset } from '@/assets'
import { createObjectSignal } from '@/engine/utils'

export type BoneController = ReturnType<typeof createBoneController>

export function createBoneController(id: string, props: {
  x: number
  boneId: number
  boneNumber: number
  corgi: CorgiController
}) {
  const corgi = props.corgi
  const isClaimed = props.boneNumber >= 0

  function target(boneNumber: number, claimedBones: number) {

    const age = corgi.age()
    const center = {
      x: corgi.data.x() + corgi.data.width() / 2,
      y: corgi.data.y() + corgi.data.height() / 2,
    }
    const rotateDistance = 50
    const segmentSize = Math.PI * 2 / claimedBones


    return {
      x: center.x + Math.cos(segmentSize * boneNumber + age / 20) * rotateDistance,
      y: center.y + Math.sin(segmentSize * boneNumber + age / 20) * rotateDistance,
    }
  }

  return createController({
    frames: [boneAsset],
    init() {
      const claimed = createObjectSignal(isClaimed, 'claimed')
      return {
        id,
        type: 'bone',
        ...createObjectSignal(isClaimed ? target(props.boneNumber, 1).x : props.x, 'x'),
        ...createObjectSignal(isClaimed ? target(props.boneNumber, 1).y : 620, 'y'),
        ...createObjectSignal(Math.random() * 20, 'rotation'),
        ...claimed,
        width: () => 60 * (claimed.claimed() ? 0.4 : 1),
        height: () => 40 * (claimed.claimed() ? 0.4 : 1),
      }
    },
    onEnterFrame({ $, $scene, $controller, $age }) {
      const stateBoneNumber = $scene.gameState.questState.corgi.bones[props.boneId]
      let boneNumber = stateBoneNumber === 'delivered' ? -1 : stateBoneNumber


      if (!$.claimed() && corgi.hitTest($controller)) {
        boneNumber = $scene.gameStateActions.claimBone(props.boneId)
        $.setClaimed(true)
      }

      if ($.claimed()) {
        const claimedBones = $scene.gameState.questState.corgi.bones.filter(
          n => n !== 'delivered' && n !== -1,
        ).length

        const statueOffset = { x: 155, y: 380 }
        const statue = $scene.getControllerById('statue')
        const statueDistance = statue?.distanceTo($.x() - statueOffset.x, $.y() - statueOffset.y) ?? Infinity
        const goToStatue = statue && statueDistance < 300

        const { x: targetX, y: targetY } = goToStatue
          ? { x: statue.data.x() + statueOffset.x, y: statue.data.y() + statueOffset.y }
          : target(boneNumber, claimedBones)

        const distance = Math.hypot($.x() - targetX, $.y() - targetY)
        const direction = Math.atan2($.y() - targetY, $.x() - targetX)
        const speed = goToStatue ? 20 : distance / 4

        if (distance > speed) {
          $.setX($.x() - speed * Math.cos(direction))
          $.setY($.y() - speed * Math.sin(direction))
        }

        if (distance < 30 && goToStatue) {
          console.log('Deposited bone', props.boneId)
          $scene.gameStateActions.depositBone(props.boneId)
          $scene.removeController($.id)
          return
        }

        $.setRotation($.rotation() + Math.cos(props.boneId * 3 + $age / 10))

      }
    }
  })
}

import { createController } from '@/utils/game'
import { css } from '@style/css'
import { boatAsset } from '@/assets'
import { createObjectSignal } from '@/engine'

export function createBoatController(id: string) {
  const baseY = 300
  return createController({
    frames: [boatAsset],
    init() {
      return {
        id,
        type: 'boat',
        x: () => 250,
        ...createObjectSignal(baseY, 'y'),
        width: () => 200,
        class: () => css({
          _after: {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(0deg, #399cdcEE 20%, #399cdc00 30%)',
          },
        }),
      }
    },
    onEnterFrame({ $, $age }) {
      const float = Math.cos(10 + $age / 10) * 2
      $.setY(baseY + float)
    }
  })
}

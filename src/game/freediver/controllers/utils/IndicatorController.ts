import { indicatorAsset } from '@/assets'
import { Controller, createController } from '@/engine'

export function createIndicatorController(enemy: Controller<any>, type: 'enemy' | 'friend') {
  const width = 10
  const style = type === 'friend'
    ? () => ({ filter: 'hue-rotate(130deg) brightness(1.5)' })
    : undefined
  return createController({
    frames: [indicatorAsset],
    init() {
      return {
        id: enemy.data.id + '-indicator',
        type: 'indicator',
        x: () => enemy.data.x() + enemy.data.width() / 2 - width / 2,
        y: () => enemy.data.y() - 20,
        width: () => width,
        height: () => width / 2,
        style,
      }
    },
  })
}

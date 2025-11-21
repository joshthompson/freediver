import { Controller, createController } from '@/utils/game'
import indicator from '@assets/sprites/indicator.png'

export function createIndicatorController(enemy: Controller<any>, type: 'enemy' | 'friend') {
  const width = 10
  const style = type === 'friend'
    ? () => ({ filter: 'hue-rotate(130deg) brightness(1.5)' })
    : undefined
  return createController({
    frames: [indicator],
    init() {
      return {
        id: enemy.data.id + '-indicator',
        type: 'indicator',
        x: () => enemy.data.x() + enemy.data.width() / 2 - width / 2,
        y: () => enemy.data.y() - 20,
        width: () => width,
        style,
      }
    },
  })
}

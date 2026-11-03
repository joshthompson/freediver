import { createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { Sprite } from '@/engine/components/Sprite'
import { generateFrames } from '@/utils'
import { Dialog } from '@/utils/game'
import { getDiver } from './Hazard'

export type RealmGuideController = ReturnType<typeof createRealmGuideController>

const talkDistance = 220
const leaveDistance = 400
const swimSpeed = 8

// The themed corgi in each Crystal Realm. It talks whenever the diver swims up and `dialog` has something to say,
// and can be sent to swim (or pop) somewhere else with goTo
export function createRealmGuideController(id: string, props: {
  x: number
  y: number
  asset: string // A sprite sheet laid out like the corgi citizens'
  scale?: number
  dialog: () => Dialog | undefined
}) {
  const scale = props.scale ?? 1.2
  const width = 70 * scale
  const height = 44 * scale

  return createController({
    frames: generateFrames(props.asset, 634, 394, width, 3, true),
    randomStartFrame: true,
    init() {
      const x = createObjectSignal(props.x, 'x')
      const y = createObjectSignal(props.y, 'y')
      const home = createObjectSignal({ x: props.x, y: props.y } as Vector, 'home')
      return {
        id,
        type: 'realm-guide',
        ...x,
        ...y,
        ...home,
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal('play' as Sprite['state'], 'state'),
        ...createObjectSignal(false, 'talkedThisVisit'),
        width: () => width,
        height: () => height,
        frameInterval: () => 180,
        goTo: (point: Vector, options?: { teleport?: boolean }) => {
          home.setHome(point)
          if (options?.teleport) {
            x.setX(point.x)
            y.setY(point.y)
          }
        },
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      const home = $.home()
      const distanceHome = Math.hypot(home.x - $.x(), home.y - $.y())
      if (distanceHome > swimSpeed) {
        const direction = Math.atan2(home.y - $.y(), home.x - $.x())
        $.setX($.x() + Math.cos(direction) * swimSpeed)
        $.setY($.y() + Math.sin(direction) * swimSpeed)
      } else {
        $.setY(home.y + Math.sin($age / 12) * 4)
      }

      const diver = getDiver($scene)
      if (!diver) return
      const center = diver.data.center()
      $.setXScale(center.x > $.x() + width / 2 ? 1 : -1)

      const distance = diver.distanceTo($.x() + width / 2, $.y())
      if (distance < talkDistance && !$.talkedThisVisit() && distanceHome <= swimSpeed) {
        const dialog = props.dialog()
        if (dialog && !$scene.dialog.data()) {
          $.setTalkedThisVisit(true)
          $scene.startDialog(dialog)
        }
      } else if (distance > leaveDistance) {
        $.setTalkedThisVisit(false)
      }
    },
  })
}

import { createController } from '@/engine'
import { manateeAsset, manateeCryAsset } from '@/assets'
import { generateFrames } from '@/utils'
import { createObjectSignal } from '@/engine/utils'
import { CowQuest } from '../../data/Dialogs'
import { OCEAN } from '../../scene/levels/data'

export type ManateeController = ReturnType<typeof createManateeController>

type ManateeMood = 'happy' | 'sad'

export function createManateeController(id: string, props: { x: number, y: number }) {
  const width = 200
  
  const mooooods: Record<ManateeMood, { frames: string[], height: number }> = {
    happy: {
      frames: generateFrames(manateeAsset, 200, 106, width, 4, true),
      height: 106,
    },
    sad: {
      frames: generateFrames(manateeCryAsset, 400, 218, width, 6, true),
      height: 109,
    },
  }

  return createController({
    frames: mooooods.sad.frames,
    init() {
      return {
        id,
        type: 'manatee',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(props.y, 'y'),
        ...createObjectSignal(mooooods.sad.height, 'height'),
        ...createObjectSignal(-1, 'xScale'),
        ...createObjectSignal(mooooods.sad.frames, 'frames'),
        ...createObjectSignal(false, 'preQuestDialog'),
        ...createObjectSignal({
          x: Math.random() * 20000 - 10000,
          y: Math.random() * 400 + 100
        }, 'target'),
        width: () => 200,
        speed: () => 5,
        state: () => 'play',
      }
    },
    onEnterFrame({ $, $age, $scene }) {
      const float = Math.cos($age / 10 - 0.2)
      $.setY($.y() + float)

      const questState = $scene.gameState.questState.cow.state
      if (questState === 'waiting' || questState === 'lost') {
        if ($.preQuestDialog() === false) {
          const distance = $scene.getControllerById('corgi')?.distanceTo($.x(), $.y()) ?? Infinity
          if (distance < 200) {
            $scene.startDialog({
              messages: CowQuest.preQuestManatee,
              pauseGameplay: true,
            })
            $.setPreQuestDialog(true)
          }
        }
      }
      if (questState === 'reunited') {
        $.setFrames(mooooods.happy.frames)
        $.setHeight(mooooods.happy.height)
        const direction = Math.atan2($.y() - $.target().y, $.x() - $.target().x)
        const distance = Math.hypot($.x() - $.target().x, $.y() - $.target().y)
        $.setX($.x() - $.speed() * Math.cos(direction))
        $.setY($.y() - $.speed() * Math.sin(direction))
        $.setXScale($.x() < $.target().x ? 1 : -1)
        $scene.setGameState('questState', 'cow', 'x', $.x())
        if (distance < 20) {
          $.setTarget({
            x: Math.random() * (OCEAN.maxX - OCEAN.minX) + OCEAN.minX,
            y: Math.random() * 400 + 100
          })
        } 
      } else {
        $.setFrames(mooooods.sad.frames)
        $.setHeight(mooooods.sad.height)
      }
    }
  })
}

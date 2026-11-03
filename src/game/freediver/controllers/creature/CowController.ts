import { createController } from '@/engine'
import { cowAsset } from '@/assets'
import { CorgiController } from '../main/CorgiController'
import { BackgroundDialogLines, CowQuest } from '../../data/Dialogs'
import { createBackgroundDialogTrigger } from '../utils/BackgroundDialogTrigger'
import { ManateeController } from './ManateeController'
import { createObjectSignal } from '@/engine'
import { generateFrames } from '@/utils'
import { Sprite } from '@/engine/components'
import { QuestComplete, QuestCompleteModal } from '../../data/Quests'

export type CowController = ReturnType<typeof createCowController>

const crabMessageX = 400
const width = 233 / 2
const height = 178 / 2

export function createCowController(
  id: string,
  props: {
    x: number
    y?: number
  },
) {
  const backgroundDialog = createBackgroundDialogTrigger(BackgroundDialogLines.cow)

  return createController({
    frames: generateFrames(cowAsset, width, height, width, 4, true),
    init() {
      return {
        id,
        type: 'cow',
        ...createObjectSignal(props.x, 'x'),
        ...createObjectSignal(100, 'y'),
        ...createObjectSignal(0, 'rotation'),
        ...createObjectSignal(1, 'xScale'),
        ...createObjectSignal(undefined as CorgiController | undefined, 'target'),
        ...createObjectSignal(props.x >= crabMessageX, 'crabMessage'),
        ...createObjectSignal('pause' as Sprite['state'], 'state'),
        frameInterval: () => 150,
        width: () => width,
        height: () => height,
      }
    },
    onEnterFrame({ $, $scene, $age, $controller }) {
      const float = Math.cos($age / 10 - 0.8)
      $.setY($.y() + float)

      const cowState = $scene.gameState.questState.cow.state
      const corgi = $scene.getControllerById<CorgiController>('corgi')
      const manatee = $scene.getControllerById<ManateeController>('manatee')
      if (!corgi || !manatee) return
      const corgiDistance = corgi.distanceTo($.x(), $.y() + 80)
      const manateeDistance = manatee.distanceTo($.x() + manatee.data.width() / 2, $.y())

      $.setState(cowState === 'following' || cowState === 'reunited' ? 'play' : 'pause')

      // Waiting to meet Link
      if (cowState === 'waiting') {
        if (corgiDistance < 200) {
          $scene.startDialog({
            messages: CowQuest.intro,
            onComplete: () => $scene.setGameState('questState', 'cow', {
              state: 'following',
              x: $.x(),
            }),
            pauseGameplay: true,
          })
        }
      }

      // Following Link
      else if (cowState === 'following') { 
        const corgiDirection = corgi.direction($.x(), $.y() + 80)
        if ($.x() < corgi.data.x()) $.setXScale(1)
        else $.setXScale(-1)

        if (corgiDistance > 100 && corgiDistance < 300) {
          $.setX($.x() - corgi.data.speed() * 0.9 * Math.cos(corgiDirection))
          $.setY($.y() - corgi.data.speed() * 0.9 * Math.sin(corgiDirection))
          $scene.setGameState('questState', 'cow', 'x', $.x())
          if ($.x() < corgi.data.x()) $.setRotation((corgiDirection * 180 / Math.PI) + 180)
          else $.setRotation((corgiDirection * 180 / Math.PI) + 0)
        }

        if ($.x() > crabMessageX && !$.crabMessage() && corgiDistance < 250) {
          $.setCrabMessage(true)
          $scene.startDialog({
            messages: CowQuest.halfWay,
            pauseGameplay: false
          })
        }

        if (corgiDistance > 400) {
          $scene.setGameState('questState', 'cow', 'state', 'lost')
          $scene.startDialog({
            messages: CowQuest.slowDown,
            pauseGameplay: false
          })
        }

        if (manateeDistance < 300) {
          $scene.startDialog({
            messages: CowQuest.reunion,
            onComplete: () => {
              $scene.setGameState('questState', 'cow', 'state', 'reunited')
              $scene.setGameState('questState', 'cave', 'state', 'open')
              QuestComplete('cow', $scene).then(() => {
                $scene.gameStateActions.achievement('cow')
              })
            },
            pauseGameplay: true,
          })
        }
      }

      // Link was too fast
      else if (cowState === 'lost') {
        if (corgiDistance <= 300) {
          $scene.startDialog({
            messages: CowQuest.foundYou,
            pauseGameplay: false
          })
          $scene.setGameState('questState', 'cow', 'state', 'following')
        }
      }

      // Reunited with the manatee
      else if (cowState === 'reunited') {
        const manateeDirection = manatee.direction($.x() + manatee.data.width() / 2, $.y())
        const speed = manatee.data.speed() * (manateeDistance > 200 ? 1.1 : 0.9)

        if ($.x() < manatee.data.x()) $.setXScale(1)
        else $.setXScale(-1)
        $.setX($.x() - speed * Math.cos(manateeDirection))
        $.setY($.y() - speed * Math.sin(manateeDirection))
        backgroundDialog($scene, $controller)
      }
    },
  })
}

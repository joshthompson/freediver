import { createController } from '@/utils/game'
import { createSignal } from 'solid-js'
import { cowAsset } from '@/assets'
import { CorgiController } from './CorgiController'
import { CowQuest } from '../data/Dialogs'
import { ManateeController } from './ManateeController'

export type CowController = ReturnType<typeof createCowController>

const crabMessageX = 400

export function createCowController(
  id: string,
  props: {
    x: number
    y?: number
  },
) {
  return createController({
    frames: [cowAsset],
    init() {
      const [x, setX] = createSignal(props.x)
      const [y, setY] = createSignal(100)
      const [rotation, setRotation] = createSignal(0)
      const [xScale, setXScale] = createSignal(1)
      const [target, setTarget] = createSignal<CorgiController | undefined>(undefined)
      const [crabMessage, setCrabMessage] = createSignal(props.x >= crabMessageX)

      return {
        id,
        type: 'corgi',
        x,
        setX,
        y,
        setY,
        xScale,
        setXScale,
        rotation,
        setRotation,
        target,
        setTarget,
        crabMessage,
        setCrabMessage,
        width: () => 80,
      }
    },
    onEnterFrame({ $, $game, $age }) {
      const float = Math.cos($age / 10 - 0.8)
      $.setY($.y() + float)

      const state = $game.gameState.questState.cow?.state ?? 'waiting'
      const corgi = $game.getControllerById<CorgiController>('corgi')
      const manatee = $game.getControllerById<ManateeController>('manatee')
      if (!corgi || !manatee) return
      const corgiDistance = corgi.distanceTo($.x(), $.y() + 80)
      const manateeDistance = manatee.distanceTo($.x() + manatee.data.width() / 2, $.y())

      // Waiting to meet Link
      if (state === 'waiting') {
        if (corgiDistance < 200) {
          $game.startDialog({
            messages: CowQuest.intro,
            onComplete: () => $game.setGameState('questState', 'cow', {
              state: 'following',
              x: $.x(),
            }),
            pauseGameplay: true,
          })
        }
      }

      // Following Link
      else if (state === 'following') { 
        const corgiDirection = corgi.direction($.x(), $.y() + 80)
        if ($.x() < corgi.data.x()) $.setXScale(1)
        else $.setXScale(-1)

        if (corgiDistance > 100 && corgiDistance < 300) {
          $.setX($.x() - corgi.data.speed() * 0.9 * Math.cos(corgiDirection))
          $.setY($.y() - corgi.data.speed() * 0.9 * Math.sin(corgiDirection))
          $game.setGameState('questState', 'cow', 'x', $.x())
          if ($.x() < corgi.data.x()) $.setRotation((corgiDirection * 180 / Math.PI) + 180)
          else $.setRotation((corgiDirection * 180 / Math.PI) + 0)
        }

        if ($.x() > crabMessageX && !$.crabMessage() && corgiDistance < 250) {
          $.setCrabMessage(true)
          $game.startDialog({
            messages: CowQuest.halfWay,
            pauseGameplay: false
          })
        }

        if (corgiDistance > 400) {
          $game.setGameState('questState', 'cow', 'state', 'lost')
          $game.startDialog({
            messages: CowQuest.slowDown,
            pauseGameplay: false
          })
        }

        if (manateeDistance < 300) {
          $game.startDialog({
            messages: CowQuest.reunion,
            onComplete: () => {
              $game.setGameState('questState', 'cow', 'state', 'reunited')
              $game.setGameState('questState', 'cave', { state: 'open' })
              $game.gameStateActions.achievement('cow')
            },
            pauseGameplay: true,
          })
        }
      }

      // Link was too fast
      else if (state === 'lost') {
        if (corgiDistance <= 300) {
          $game.startDialog({
            messages: CowQuest.foundYou,
            pauseGameplay: false
          })
          $game.setGameState('questState', 'cow', 'state', 'following')
        }
      }

      // Reunited with the manatee
      else if (state === 'reunited') {
        const manateeDirection = manatee.direction($.x() + manatee.data.width() / 2, $.y())
        const speed = manatee.data.speed() * (manateeDistance > 200 ? 1.1 : 0.9)

        if ($.x() < manatee.data.x()) $.setXScale(1)
        else $.setXScale(-1)
        $.setX($.x() - speed * Math.cos(manateeDirection))
        $.setY($.y() - speed * Math.sin(manateeDirection))
      }
    },
  })
}

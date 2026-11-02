import { Level } from './Level'
import { SceneComponent } from '@/engine'
import { useGameState } from '@/utils/GameStateContext'
import { KingdomLevel } from './levels/KingdomLevel'

export const KingdomScene: SceneComponent = props => {
  const level = KingdomLevel({
    setScene: props.setScene,
    state: useGameState()!,
    mode: props.mode,
  })

  return <Level
    levelStyle={level.style}
    scene={level.scene}
    surface={level.surface}
    setScene={props.setScene}
  />
}

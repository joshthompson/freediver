import { Level } from './Level'
import { SceneComponent } from '@/engine'
import { useGameState } from '@/utils/GameStateContext'
import { CaveLevel } from './levels/CaveLevel'

export const CaveScene: SceneComponent = props => {
  const level = CaveLevel({
    setScene: props.setScene,
    state: useGameState()!,
    mode: props.mode,
  })

  return <><p>{props.mode}</p><Level
  levelStyle={level.style}
  scene={level.scene}
  surface={level.surface}
  setScene={props.setScene}
/></>
}

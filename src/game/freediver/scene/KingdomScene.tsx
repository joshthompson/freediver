import { Level } from './Level'
import { SceneComponent } from '@/engine'
import { useGameState } from '@/utils/GameStateContext'
import { KingdomLevel } from './levels/KingdomLevel'
import { music } from '../music/music'
import { onCleanup } from 'solid-js'

export const KingdomScene: SceneComponent = props => {
  const level = KingdomLevel({
    setScene: props.setScene,
    state: useGameState()!,
    mode: props.mode,
  })
  music.play('kingdom')
  onCleanup(() => music.stop('kingdom'))

  return <Level
    levelStyle={level.style}
    scene={level.scene}
    surface={level.surface}
    setScene={props.setScene}
  />
}

import { Canvas } from "@/game/core/Canvas"
import { Game, SceneComponent } from "@/utils/game"
import { Show } from "solid-js"

export const SurfaceScene: SceneComponent = props => {
  const game = new Game({
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    controllers: {},
  })
  return <Show when={props.active}>
    <Canvas
      debug={props.debug}
      game={game}
      style={{ background: 'yellow' }}
    />
  </Show>
}

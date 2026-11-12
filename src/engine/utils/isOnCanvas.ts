import type { Controller, Scene } from 'scoopjs'

// Whether any of a controller is within the canvas, or within margin px of it. Lets controllers skip
// purely visual work, like idle animation, while nobody can see them
export function isOnCanvas(scene: Scene, controller: Controller<any>, margin = 0) {
  const canvas = scene.canvas.get()
  const x = controller.data.x() - canvas.x()
  const y = controller.data.y() - canvas.y()
  return x + controller.data.width() > -margin && x < canvas.width() + margin
    && y + controller.data.height() > -margin && y < canvas.height() + margin
}

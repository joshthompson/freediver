import {
  type Controller,
  type ControllerBaseType,
  type ControllerProps,
  createConnectedController as createScoopConnectedController,
  createController as createScoopController,
} from 'scoopjs'
import { isOverlapping } from '@/utils/game'

export type { Controller, ControllerBaseType, ControllerProps } from 'scoopjs'

// Freediver's controllers collide where their sprites are drawn on the page, rotation and scale
// included, rather than by their own x and y as ScoopJS's do. That's what lets an attached controller,
// like the diver's arm, whose x and y are only where it sits on whatever carries it, catch things

// Kept when the sprite mounts, so hitTest doesn't have to search the document every tick
const elements = new WeakMap<Controller<any>, HTMLElement | undefined>()

function elementOf(controller: Controller<any>) {
  const element = elements.get(controller)
  return element?.isConnected
    ? element
    : document.querySelector<HTMLElement>(`[data-controller-id="${controller.id}"]`) ?? undefined
}

function collidesOnPage<C extends Controller<any>>(controller: C) {
  controller.hitTest = other => isOverlapping(elementOf(controller), elementOf(other))
  return controller
}

function keepElement<T extends ControllerBaseType>(onMount: ControllerProps<T>['onMount']): ControllerProps<T>['onMount'] {
  return data => {
    elements.set(data.$controller, data.$ref)
    onMount?.(data)
  }
}

export function createController<CP extends ControllerBaseType>(options: ControllerProps<CP>): Controller<CP> {
  return collidesOnPage(createScoopController({ ...options, onMount: keepElement(options.onMount) }))
}

export const createConnectedController: typeof createScoopConnectedController = options => {
  return collidesOnPage(createScoopConnectedController({ ...options, onMount: keepElement(options.onMount) }))
}

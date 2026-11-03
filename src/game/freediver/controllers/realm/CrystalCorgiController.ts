import { Accessor } from 'solid-js'
import { createController } from '@/engine'
import { createObjectSignal } from '@/engine/utils'
import { RealmName, Realms } from '../../data/Realms'
import { CorgiController } from '../main/CorgiController'

export type CrystalCorgiController = ReturnType<typeof createCrystalCorgiController>
export type CrystalCorgiStage = 'waiting' | 'carried' | 'delivering' | 'placed'

const height = 72 // Each statue is drawn at this height, as wide as its art's proportions make it
const fallbackAspect = 0.8 // Width over height until the art has loaded
const carriedScale = 0.6
const callDistance = 350 // Linkosha notices a Crystal Corgi this close and swims over to it
const pickUpDistance = 45
const corgiSize = { width: 70, height: 44 }

// A glass corgi statue. Linkosha fetches it at the end of a realm, carries it home and sets it on its Plinth.
// On a replay it's a see-through ghost that Linkosha only noses at
export function createCrystalCorgiController(id: string, props: {
  realm: RealmName
  x: number
  y: number
  stage?: CrystalCorgiStage
  ghost?: boolean
  plinth?: Vector // Where it stands on its Plinth, as its bottom centre
  visible?: Accessor<boolean>
  onFound?: () => void
  onPlaced?: () => void
}) {
  const visible = props.visible ?? (() => true)
  const art = Realms[props.realm].crystal

  // The art's own proportions, so redrawn statues never stretch
  const aspect = createObjectSignal(fallbackAspect, 'aspect')
  const image = new Image()
  image.onload = () => aspect.setAspect(image.naturalWidth / image.naturalHeight)
  image.src = art
  const width = () => height * aspect.aspect()

  // Standing on its Plinth, with the bottom of its crystal base on the Plinth's top
  const placedPosition = () => props.plinth
    ? { x: props.plinth.x - width() / 2, y: props.plinth.y - height }
    : { x: props.x, y: props.y }

  const start = props.stage === 'placed' ? placedPosition() : { x: props.x, y: props.y }

  return createController({
    frames: [art],
    init() {
      const stage = createObjectSignal(props.stage ?? 'waiting' as CrystalCorgiStage, 'stage')
      const scale = () => stage.stage() === 'carried' || stage.stage() === 'delivering' ? carriedScale : 1
      return {
        id,
        type: 'crystal-corgi',
        ...createObjectSignal(start.x, 'x'),
        ...createObjectSignal(start.y, 'y'),
        ...createObjectSignal(false, 'found'),
        ...stage,
        width: () => width() * scale(),
        height: () => height * scale(),
        style: () => ({
          opacity: !visible() ? 0 : props.ghost ? 0.35 : 1,
          filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))',
          transition: 'opacity 0.5s ease-in-out',
        }),
        // Where Linkosha should swim to, while this Crystal Corgi needs fetching or delivering
        ...createObjectSignal(undefined as Vector | undefined, 'corgiTarget'),
      }
    },
    onEnterFrame({ $, $scene, $age }) {
      const corgi = $scene.getControllerById<CorgiController>('corgi')
      if (!corgi) return
      const corgiCenter = {
        x: corgi.data.x() + corgiSize.width / 2,
        y: corgi.data.y() + corgiSize.height / 2,
      }
      const center = { x: $.x() + $.width() / 2, y: $.y() + $.height() / 2 }
      const towards = (point: Vector) => ({
        x: point.x - corgiSize.width / 2,
        y: point.y - corgiSize.height / 2,
      })
      const corgiDistance = Math.hypot(corgiCenter.x - center.x, corgiCenter.y - center.y)

      $.setCorgiTarget(undefined)

      if ($.stage() === 'waiting') {
        $.setY(props.y + Math.sin($age / 15) * 6)
        if (!visible() || $.found()) return
        if (corgiDistance < callDistance) $.setCorgiTarget(towards(center))
        if (corgiDistance < pickUpDistance) {
          $.setFound(true)
          if (!props.ghost) $.setStage('carried')
          props.onFound?.()
        }
      } else if ($.stage() === 'carried' || $.stage() === 'delivering') {
        // Held in Linkosha's mouth
        $.setX(corgiCenter.x - $.width() / 2 + corgi.data.xScale() * 20)
        $.setY(corgiCenter.y - $.height() / 2 - 6)

        if ($.stage() === 'delivering' && props.plinth) {
          const target = { x: props.plinth.x, y: props.plinth.y - height * carriedScale / 2 - 10 }
          $.setCorgiTarget(towards(target))
          if (Math.hypot(corgiCenter.x - target.x, corgiCenter.y - target.y) < pickUpDistance) {
            $.setStage('placed')
            const placed = placedPosition()
            $.setX(placed.x)
            $.setY(placed.y)
            props.onPlaced?.()
          }
        }
      } else if ($.stage() === 'placed') {
        // Stands still on its Plinth, kept centred in case its art loaded after it was placed
        const placed = placedPosition()
        $.setX(placed.x)
        $.setY(placed.y)
      }
    },
  })
}

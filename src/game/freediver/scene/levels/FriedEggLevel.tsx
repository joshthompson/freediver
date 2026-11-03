import { createSignal, JSX, Show } from 'solid-js'
import { Scene } from '@/engine'
import { eggyCorgiAsset, equalisationSound, starfishSound, thudSound } from '@/assets'
import { Translations } from '../../data/Translations'
import { EggMonsterDialog, RealmDialogs } from '../../data/Dialogs'
import { createFriedEggFishController } from '../../controllers/creature/FriedEggFish'
import {
  createEggBulletController,
  createFlyingEggController,
  createFriedEggController,
  createScrambledEggMonsterController,
} from '../../controllers/realm/EggControllers'
import { getDiver } from '../../controllers/realm/Hazard'
import { HudMeter, HudStack, HudTimer } from '../../ui/RealmHud'
import {
  addRealmArrival,
  addRealmFinish,
  addRealmGuide,
  createRealm,
  createRealmDirector,
  followDiver,
  RealmLevel,
  RealmLevelProps,
  seconds,
} from './realm'

const bounds = { x: 0, y: 0, width: 2100, height: 1400 }
const eggsNeeded = 100
const collectTime = seconds(60)
const rageTime = seconds(60)
const bulletSpeed = 5.5
const feedingTime = seconds(2.5)
const deliverDistance = 350 // How close you swim to him before he starts eating

type Phase = 'intro' | 'collect' | 'deliver' | 'feeding' | 'full' | 'rage' | 'calming' | 'sorry'

export function FriedEggLevel(props: RealmLevelProps): RealmLevel {
  const realm = createRealm('friedEgg', props)
  const t = () => Translations[props.state.gameState.options.locale]
  const [phase, setPhase] = createSignal<Phase>('intro')
  const [eggs, setEggs] = createSignal(0)
  const [timer, setTimer] = createSignal(collectTime)
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
  let phaseFrames = 0
  let feedingFrames = 0 // Counts up once he starts eating
  let bullets = 0
  let endSaid = false

  const scene = new Scene('friedEgg', {
    ...props.state,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      addRealmArrival($scene, realm, {
        bounds,
        entry: { x: 300, y: 700 },
        diver: { equalise: false, oxygenUse: () => 0 },
      })

      const guide = addRealmGuide($scene, {
        asset: eggyCorgiAsset,
        position: { x: 420, y: 560 },
        intro: RealmDialogs.friedEgg.intro,
        onIntroComplete: () => setPhase('collect'),
        end: () => {
          if (!finish?.found() || endSaid) return
          endSaid = true
          return { messages: RealmDialogs.friedEgg.end, pauseGameplay: true }
        },
      })

      // He hands over the Crystal Corgi wherever he says sorry, so it's added then
      let finish: ReturnType<typeof addRealmFinish> | undefined
      const giveCrystal = (spot: Vector) => {
        finish = addRealmFinish($scene, realm, {
          crystal: { x: spot.x - 230, y: spot.y + 40 },
          exit: { x: spot.x + 40, y: spot.y + 190 },
          onFound: () => guide.data.goTo({ x: spot.x - 180, y: spot.y - 120 }, { teleport: true }),
        })
      }

      // Plenty of eggs, scattered on a jittered grid so they're spread right across the realm
      const columns = 18
      const rows = 14
      Array(columns * rows).fill(null).forEach((_, n) => {
        const column = n % columns
        const row = Math.floor(n / columns)
        $scene.addController(createFriedEggController('fried-egg-' + n, {
          x: 100 + column * (bounds.width - 200) / (columns - 1) + (Math.random() - 0.5) * 80,
          y: 100 + row * (bounds.height - 200) / (rows - 1) + (Math.random() - 0.5) * 80,
          onCollect: () => {
            if (phase() !== 'collect') return
            setEggs(eggs() + 1)
            $scene.playSound('starfish', { unique: true, volume: 0.4 })
            if (eggs() >= eggsNeeded) {
              setPhase('deliver')
              $scene.startDialog({ messages: [...EggMonsterDialog.bring], pauseGameplay: true })
            }
          },
        }))
      })

      Array(8).fill(null).forEach((_, n) => {
        $scene.addController(...createFriedEggFishController('egg-fish-' + n, {
          x: Math.random() * bounds.width,
          y: 100 + n * (bounds.height - 200) / 7,
          wrap: { minX: -100, maxX: bounds.width + 100 },
          kissCooldown: seconds(8),
        }))
      })

      // The party host, waiting in the corner for his eggs
      const monster = createScrambledEggMonsterController('egg-monster', { x: bounds.width - 220, y: 220 })
      $scene.addController(monster)

      const fire = (from: Vector, angle: number, speed = bulletSpeed) => {
        $scene.addController(createEggBulletController('egg-bullet-' + bullets++, {
          ...from,
          velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          bounds,
        }))
      }

      $scene.addController(createRealmDirector('egg-party', ({ $scene }) => {
        const diver = getDiver($scene)
        if (!diver || realm.ending()) return
        const diverCenter = diver.data.center()
        const monsterCenter = { x: monster.data.centerX(), y: monster.data.centerY() }
        const canvas = $scene.canvas.get()
        // Where he's headed, kept far enough in from the screen's edges that all of him stays in view
        const onScreen = (spot: Vector) => {
          const marginX = monster.data.width() / 2 + 20
          const marginY = monster.data.height() / 2 + 20
          return {
            x: clamp(spot.x, canvas.x() + marginX, canvas.x() + canvas.width - marginX),
            y: clamp(spot.y, canvas.y() + marginY, canvas.y() + canvas.height - marginY),
          }
        }
        phaseFrames++

        if (phase() === 'collect') {
          setTimer(timer() - 1)
          if (timer() <= 0) realm.fail($scene)
        } else if (phase() === 'deliver') {
          // He waits in his corner for you to bring the eggs over, and starts eating the moment you're close
          if (Math.hypot(diverCenter.x - monsterCenter.x, diverCenter.y - monsterCenter.y) < deliverDistance) {
            setPhase('feeding')
            Array(24).fill(null).forEach((_, n) => {
              $scene.addController(createFlyingEggController('flying-egg-' + n, {
                from: () => diver.data.center(),
                to: () => ({ x: monster.data.centerX(), y: monster.data.centerY() }),
                delay: n * 2,
              }))
            })
          }
        } else if (phase() === 'feeding') {
          // Every egg you collected flies into his mouth. He stays put, only shuffling into view as he grows
          monster.data.setSpeed(8)
          monster.data.setTarget(onScreen(monsterCenter))
          feedingFrames++
          monster.data.setSize(1 + Math.min(1, feedingFrames / feedingTime))
          if (feedingFrames >= feedingTime) {
            setPhase('full')
            $scene.startDialog({
              messages: [
                ...EggMonsterDialog.full,
                // Off with the party face as he lets slip it was all a yolk
                { ...EggMonsterDialog.gulp[0], after: () => monster.data.setHappy(false) },
                ...EggMonsterDialog.reveal,
              ],
              pauseGameplay: true,
              onComplete: () => {
                setPhase('rage')
                setTimer(rageTime)
                phaseFrames = 0
              },
            })
          }
        } else if (phase() === 'rage') {
          setTimer(timer() - 1)
          // Circle the diver, staying on screen
          const orbit = phaseFrames / 120
          monster.data.setSpeed(3)
          monster.data.setTarget(onScreen({
            x: diverCenter.x + Math.cos(orbit) * 300,
            y: diverCenter.y + Math.sin(orbit) * 220,
          }))
          // Every egg he fires shrinks him back down
          monster.data.setSize(1 + timer() / rageTime)

          // A new pattern every 10 seconds, each harder than the last
          const elapsed = rageTime - timer()
          const pattern = Math.floor(elapsed / seconds(10))
          const aim = Math.atan2(diverCenter.y - monsterCenter.y, diverCenter.x - monsterCenter.x)
          if (pattern === 0) {
            // Aimed triple shots
            if (phaseFrames % 12 === 0) [-0.25, 0, 0.25].forEach(spread => fire(monsterCenter, aim + spread, 6))
          } else if (pattern === 1) {
            // Rotating rings
            if (phaseFrames % 28 === 0) {
              Array(16).fill(null).forEach((_, n) => fire(monsterCenter, n * Math.PI / 8 + phaseFrames / 30))
            }
          } else if (pattern === 2) {
            // A sprinkler sweeping back and forth across you
            if (phaseFrames % 3 === 0) fire(monsterCenter, aim + Math.sin(phaseFrames / 12) * 0.9, 6.5)
          } else if (pattern === 3) {
            // Rings with a gap off to one side, so you have to swim round to find it
            if (phaseFrames % 36 === 0) {
              const gap = aim + (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.6)
              Array(28).fill(null).forEach((_, n) => {
                const angle = n * Math.PI * 2 / 28
                const fromGap = Math.abs(Math.atan2(Math.sin(angle - gap), Math.cos(angle - gap)))
                if (fromGap > 0.35) fire(monsterCenter, angle, 4.5)
              })
            }
          } else if (pattern === 4) {
            // Egg rain from the top of the screen, while he keeps taking aim
            if (phaseFrames % 4 === 0) {
              fire({ x: canvas.x() + Math.random() * canvas.width, y: canvas.y() - 20 }, Math.PI / 2 + (Math.random() - 0.5) * 0.3, 4 + Math.random() * 2)
            }
            if (phaseFrames % 30 === 0) fire(monsterCenter, aim, 6.5)
          } else {
            // Double spiral finale
            if (phaseFrames % 3 === 0) fire(monsterCenter, phaseFrames * 0.25)
            if (phaseFrames % 5 === 0) fire(monsterCenter, -phaseFrames * 0.18)
          }

          if (timer() <= 0) {
            setPhase('calming')
            monster.data.setHappy(true)
            monster.data.setSpeed(6)
            $scene.getControllersByType('egg-bullet').forEach(bullet => $scene.removeController(bullet.id))
          }
        } else if (phase() === 'calming') {
          // He swims up beside you to apologise, keeping clear of the realm's edges
          const spot = {
            x: clamp(diverCenter.x + 180, 300, bounds.width - 300),
            y: clamp(diverCenter.y - 40, 200, bounds.height - 300),
          }
          monster.data.setTarget(spot)
          if (Math.hypot(spot.x - monsterCenter.x, spot.y - monsterCenter.y) < 10) {
            setPhase('sorry')
            $scene.startDialog({
              messages: [...EggMonsterDialog.sorry],
              pauseGameplay: true,
              onComplete: () => giveCrystal(spot),
            })
          }
        }
      }))
    },
    afterEnterFrames: ({ $scene }) => followDiver($scene, bounds),
    assetOrder: [
      ['egg-bullet'],
      ['bubble', 'indicator'],
      ['egg-monster'],
      ['crystal-corgi'],
      ['corgi', 'diver'],
      ['friedeggfish'],
      ['fried-egg'],
      ['realm-guide'],
      ['portal-vortex', 'portal'],
    ],
    sounds: {
      thud: thudSound,
      equalisation: equalisationSound,
      starfish: starfishSound,
    },
  })

  const style = () => {
    const canvas = scene.canvas.get()
    const x = canvas.x()
    const y = canvas.y()
    return {
      'background-image': `
        radial-gradient(circle at 50% 50%, #ffc21a 0 9px, transparent 10px),
        radial-gradient(circle at 50% 50%, #fffdf5 0 22px, transparent 23px),
        radial-gradient(circle at 50% 50%, #ffcf3366 0 30px, transparent 31px),
        linear-gradient(160deg, #ffe9a8 0%, #ffd1dc 50%, #c9f0ff 100%)
      `,
      'background-size': '240px 200px, 240px 200px, 170px 150px, 100% 100%',
      'background-position': `
        ${-x / 2 + 60}px ${-y / 2 + 40}px,
        ${-x / 2 + 60}px ${-y / 2 + 40}px,
        ${-x / 4}px ${-y / 4}px,
        0 0
      `,
    } satisfies JSX.CSSProperties
  }

  const hud = () => <HudStack>
    <Show when={phase() === 'collect'}>
      <HudTimer label={t().realms.time} seconds={timer() / 25} />
      <HudMeter label={t().realms.eggOMeter} value={eggs()} max={eggsNeeded} />
    </Show>
    <Show when={phase() === 'rage'}>
      <HudTimer label={t().realms.survive} seconds={timer() / 25} />
    </Show>
  </HudStack>

  return { scene, style, hud }
}

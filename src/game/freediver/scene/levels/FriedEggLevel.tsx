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
const bulletSpeed = 4.5
const feedingTime = seconds(2.5)

type Phase = 'intro' | 'collect' | 'feeding' | 'full' | 'rage' | 'calming' | 'sorry'

export function FriedEggLevel(props: RealmLevelProps): RealmLevel {
  const realm = createRealm('friedEgg', props)
  const t = () => Translations[props.state.gameState.options.locale]
  const [phase, setPhase] = createSignal<Phase>('intro')
  const [eggs, setEggs] = createSignal(0)
  const [timer, setTimer] = createSignal(collectTime)
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
  let phaseFrames = 0
  let feedingFrames: number | undefined // Counts up once he's reached you and starts eating
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
            if (eggs() >= eggsNeeded) setPhase('feeding')
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

      const fire = (from: Vector, angle: number) => {
        $scene.addController(createEggBulletController('egg-bullet-' + bullets++, {
          ...from,
          velocity: { x: Math.cos(angle) * bulletSpeed, y: Math.sin(angle) * bulletSpeed },
          bounds,
        }))
      }

      $scene.addController(createRealmDirector('egg-party', ({ $scene }) => {
        const diver = getDiver($scene)
        if (!diver || realm.ending()) return
        const diverCenter = diver.data.center()
        const monsterCenter = { x: monster.data.centerX(), y: monster.data.centerY() }
        phaseFrames++

        if (phase() === 'collect') {
          setTimer(timer() - 1)
          if (timer() <= 0) realm.fail($scene)
        } else if (phase() === 'feeding') {
          // He swims over, and every egg you collected flies into his mouth
          monster.data.setTarget({ x: diverCenter.x + 260, y: diverCenter.y - 60 })
          monster.data.setSpeed(8)
          const arrived = Math.hypot(monster.data.target().x - monsterCenter.x, monster.data.target().y - monsterCenter.y) < 20
          if (arrived && feedingFrames === undefined) {
            feedingFrames = 0
            Array(24).fill(null).forEach((_, n) => {
              $scene.addController(createFlyingEggController('flying-egg-' + n, {
                from: { x: diverCenter.x, y: diverCenter.y },
                to: () => ({ x: monster.data.centerX(), y: monster.data.centerY() }),
                delay: n * 2,
              }))
            })
          }
          if (feedingFrames !== undefined) {
            feedingFrames++
            monster.data.setSize(1 + Math.min(1, feedingFrames / feedingTime))
            if (feedingFrames >= feedingTime) {
              setPhase('full')
              $scene.startDialog({
                messages: [...EggMonsterDialog.full],
                pauseGameplay: true,
                onComplete: () => {
                  setPhase('rage')
                  setTimer(rageTime)
                  phaseFrames = 0
                },
              })
            }
          }
        } else if (phase() === 'rage') {
          setTimer(timer() - 1)
          // Circle the diver, staying on screen
          const orbit = phaseFrames / 120
          monster.data.setSpeed(3)
          monster.data.setTarget({
            x: diverCenter.x + Math.cos(orbit) * 300,
            y: diverCenter.y + Math.sin(orbit) * 220,
          })
          // Every egg he fires shrinks him back down
          monster.data.setSize(1 + timer() / rageTime)

          const elapsed = rageTime - timer()
          const aim = Math.atan2(diverCenter.y - monsterCenter.y, diverCenter.x - monsterCenter.x)
          if (elapsed < seconds(20)) {
            if (phaseFrames % 20 === 0) fire(monsterCenter, aim + (Math.random() - 0.5) * 0.3)
          } else if (elapsed < seconds(40)) {
            if (phaseFrames % 40 === 0) {
              Array(12).fill(null).forEach((_, n) => fire(monsterCenter, n * Math.PI / 6 + phaseFrames / 30))
            }
          } else {
            if (phaseFrames % 4 === 0) fire(monsterCenter, phaseFrames * 0.25)
            if (phaseFrames % 8 === 0) fire(monsterCenter, -phaseFrames * 0.18)
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

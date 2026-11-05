import { createSignal, JSX, Show } from 'solid-js'
import { createController, Scene } from '@/engine'
import { emptyAsset, equalisationSound, hellCorgiAsset, hellRockAsset, thudSound } from '@/assets'
import { randomItem } from '@/utils'
import { Translations } from '../../data/Translations'
import { DemonDialog, RealmDialogs } from '../../data/Dialogs'
import { createRockController } from '../../controllers/realm/LairControllers'
import { createAirBubbleController } from '../../controllers/realm/AirController'
import { getDiver } from '../../controllers/realm/Hazard'
import { createBoxController } from '../../controllers/utils/BoxController'
import { CorgiController } from '../../controllers/main/CorgiController'
import {
  createArenaEggFishController,
  createCurrentController,
  createDemonController,
  createDevilController,
  createFireballController,
  createHellFishController,
  createSteamVentController,
  DevilController,
} from '../../controllers/realm/HellControllers'
import { BossHealthBar, HudBanner } from '../../ui/RealmHud'
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

const bounds = { x: 0, y: 0, width: 7750, height: 1400 }
const finishLine = 6900
const arena = { x: 7050, y: 350, width: 700, height: 700 }
const demonSpeed = 8.5
const demonLead = 650 // It hangs about, taunting, rather than getting further ahead than this
const kissDamage = 0.2

type Phase = 'intro' | 'countdown' | 'race' | 'raceOver' | 'boss' | 'friends'

// Walls of rock alternating from the roof and the floor. The floor walls have a narrow tunnel through them,
// guarded by a steam vent, for a quicker way through if you time it right
const rocks: Rect[] = [
  { x: 900, y: -100, width: 250, height: 1000 },
  { x: 1800, y: 450, width: 250, height: 420 }, { x: 1800, y: 1030, width: 250, height: 470 },
  { x: 2700, y: -100, width: 250, height: 950 },
  { x: 3600, y: 500, width: 250, height: 400 }, { x: 3600, y: 1060, width: 250, height: 440 },
  { x: 4500, y: -100, width: 250, height: 1000 },
  { x: 5400, y: 450, width: 250, height: 420 }, { x: 5400, y: 1030, width: 250, height: 470 },
  { x: 6200, y: -100, width: 250, height: 950 },
]

const vents: Parameters<typeof createSteamVentController>[1][] = [
  // Tunnel guards
  { x: 1925, y: 1030, direction: 'up', length: 160, period: 90, onFor: 50 },
  { x: 3725, y: 1060, direction: 'up', length: 160, period: 80, onFor: 45, offset: 20 },
  { x: 5525, y: 1030, direction: 'up', length: 160, period: 70, onFor: 40, offset: 40 },
  // Along the main way round
  { x: 1350, y: 1400, direction: 'up', length: 380, offset: 10 },
  { x: 2350, y: 0, direction: 'down', length: 320, offset: 30 },
  { x: 3150, y: 1400, direction: 'up', length: 380, offset: 50 },
  { x: 4150, y: 0, direction: 'down', length: 320 },
  { x: 4950, y: 1400, direction: 'up', length: 380, offset: 25 },
  { x: 5950, y: 0, direction: 'down', length: 320, offset: 60 },
  { x: 6650, y: 1400, direction: 'up', length: 380, offset: 15 },
]

const currents: (Rect & { push: Vector })[] = [
  { x: 2100, y: 120, width: 520, height: 300, push: { x: 4, y: 0 } },
  { x: 3900, y: 1020, width: 520, height: 280, push: { x: 4, y: 0 } },
  { x: 5700, y: 120, width: 470, height: 300, push: { x: 4, y: 0 } },
  { x: 6480, y: 950, width: 400, height: 300, push: { x: 4, y: -1 } },
]

const hellFish: { from: Vector, to: Vector }[] = [
  { from: { x: 1450, y: 300 }, to: { x: 1450, y: 1300 } },
  { from: { x: 2450, y: 500 }, to: { x: 2450, y: 1300 } },
  { from: { x: 3300, y: 200 }, to: { x: 3300, y: 1300 } },
  { from: { x: 4300, y: 200 }, to: { x: 4300, y: 1250 } },
  { from: { x: 5100, y: 250 }, to: { x: 5100, y: 1300 } },
  { from: { x: 5950, y: 500 }, to: { x: 5950, y: 1300 } },
  { from: { x: 6050, y: 1150 }, to: { x: 6750, y: 1150 } },
  { from: { x: 600, y: 1250 }, to: { x: 1300, y: 1250 } },
]

const airBubbles: Vector[] = [
  { x: 700, y: 1150 }, { x: 1550, y: 950 }, { x: 2200, y: 300 }, { x: 2850, y: 1150 },
  { x: 3400, y: 800 }, { x: 4100, y: 300 }, { x: 4700, y: 1150 }, { x: 5250, y: 800 },
  { x: 5900, y: 300 }, { x: 6600, y: 1100 },
  // In the boss arena
  { x: 7130, y: 430 }, { x: 7670, y: 970 }, { x: 7400, y: 990 },
]

// The way the demon goes round: under the roof walls, over the floor walls
const demonPath: Vector[] = [
  { x: 300, y: 700 }, { x: 700, y: 1100 }, { x: 1300, y: 1150 }, { x: 1600, y: 700 },
  { x: 1925, y: 250 }, { x: 2300, y: 300 }, { x: 2600, y: 1000 }, { x: 3050, y: 1150 },
  { x: 3350, y: 700 }, { x: 3725, y: 300 }, { x: 4100, y: 350 }, { x: 4400, y: 1050 },
  { x: 4850, y: 1150 }, { x: 5150, y: 700 }, { x: 5525, y: 250 }, { x: 5900, y: 300 },
  { x: 6150, y: 1000 }, { x: 6550, y: 1150 }, { x: finishLine + 100, y: 700 },
]

function createFinishLineController(id: string) {
  return createController({
    frames: [emptyAsset],
    init() {
      return {
        id,
        type: 'finish-line',
        x: () => finishLine - 15,
        y: () => 0,
        width: () => 30,
        height: () => bounds.height,
        style: () => ({
          background: 'repeating-conic-gradient(#ffffff 0 25%, #1a0505 0 50%) 0 0 / 30px 30px',
          opacity: 0.5,
        }),
      }
    },
  })
}

export function HellLevel(props: RealmLevelProps): RealmLevel {
  const realm = createRealm('hell', props)
  const t = () => Translations[props.state.gameState.options.locale]
  const [phase, setPhase] = createSignal<Phase>('intro')
  const [devil, setDevil] = createSignal<DevilController>()
  const [crystalGiven, setCrystalGiven] = createSignal(false)
  let phaseFrames = 0
  let mockCooldown = seconds(4)
  let attackN = 0
  let fireballs = 0
  let endSaid = false

  const scene = new Scene('hell', {
    ...props.state,
    width: 700,
    height: 700,
    setup($scene: Scene) {
      rocks.forEach((rect, n) => $scene.addController(createRockController('rock-' + n, { ...rect, asset: hellRockAsset })))
      currents.forEach((current, n) => $scene.addController(createCurrentController('current-' + n, current)))
      vents.forEach((vent, n) => $scene.addController(...createSteamVentController('vent-' + n, vent)))
      hellFish.forEach((fish, n) => $scene.addController(createHellFishController('hell-fish-' + n, fish)))
      airBubbles.forEach((point, n) => $scene.addController(createAirBubbleController('air-bubble-' + n, point)))
      $scene.addController(createFinishLineController('finish-line'))

      const { corgi } = addRealmArrival($scene, realm, {
        bounds,
        entry: { x: 250, y: 600 },
      })

      const demon = createDemonController('demon', { path: demonPath, speed: demonSpeed })
      $scene.addController(demon)

      const guide = addRealmGuide($scene, {
        asset: hellCorgiAsset,
        position: { x: 340, y: 480 },
        intro: RealmDialogs.hell.intro,
        onIntroComplete: () => {
          setPhase('countdown')
          phaseFrames = 0
        },
        end: () => {
          if (!finish.found() || endSaid) return
          endSaid = true
          return { messages: RealmDialogs.hell.end, pauseGameplay: true }
        },
      })

      const finish = addRealmFinish($scene, realm, {
        crystal: { x: arena.x + 220, y: arena.y + 330 },
        exit: { x: arena.x + 520, y: arena.y + 360 },
        visible: crystalGiven,
        onFound: () => guide.data.goTo({ x: arena.x + 120, y: arena.y + 100 }, { teleport: true }),
      })

      const startBoss = () => {
        // Shut the arena, and bring everyone into it
        $scene.addController(
          createBoxController('arena-left', { x: arena.x - 100, y: 0, width: 100, height: bounds.height }),
          createBoxController('arena-top', { x: arena.x, y: 0, width: arena.width, height: arena.y }),
          createBoxController('arena-bottom', { x: arena.x, y: arena.y + arena.height, width: arena.width, height: bounds.height - arena.y - arena.height }),
        )
        const diver = getDiver($scene)
        diver?.data.setX(arena.x + 80)
        diver?.data.setY(arena.y + arena.height / 2 - 78)
        corgi.data.setX(arena.x + 60)
        corgi.data.setY(arena.y + arena.height / 2)
        $scene.removeController(demon.id)

        const boss = createDevilController('devil', { x: arena.x + arena.width - 180, y: arena.y + arena.height / 2, arena })
        $scene.addController(boss)
        setDevil(boss)
        Array(4).fill(null).forEach((_, n) => {
          const x = arena.x + 100 + n * 167
          $scene.addController(...createSteamVentController('arena-vent-floor-' + n, {
            x, y: arena.y + arena.height, direction: 'up', length: 300, period: 1, onFor: 0,
          }))
          $scene.addController(...createSteamVentController('arena-vent-roof-' + n, {
            x: x + 83, y: arena.y, direction: 'down', length: 300, period: 1, onFor: 0,
          }))
        })
        Array(3).fill(null).forEach((_, n) => {
          $scene.addController(createArenaEggFishController('arena-egg-fish-' + n, { arena, devil: boss, damage: kissDamage }))
        })
        setPhase('boss')
        phaseFrames = 0
      }

      // Every other vent around the arena, so there's always somewhere safe
      const eruptArenaVents = (half: number) => {
        $scene.getControllersByType<ReturnType<typeof createSteamVentController>[1]>('steam-vent')
          .filter(vent => vent.id.startsWith('arena-vent') && Number(vent.id.slice(-1)) % 2 === half)
          .forEach(vent => vent.data.erupt())
      }

      $scene.addController(createRealmDirector('hell', ({ $scene }) => {
        const diver = getDiver($scene)
        if (!diver || realm.ending()) return
        const diverCenter = diver.data.center()
        phaseFrames++

        if (phase() === 'countdown' && phaseFrames > seconds(1.5)) {
          setPhase('race')
          demon.data.setRacing(true)
        } else if (phase() === 'race') {
          const demonX = demon.data.x() + demon.data.width() / 2
          const canvas = $scene.canvas.get()
          const onScreen = demon.data.x() > canvas.x() && demon.data.x() + demon.data.width() < canvas.x() + canvas.width

          // It can't resist stopping to rub it in
          mockCooldown--
          const ahead = demonX - diverCenter.x
          if (mockCooldown <= 0 && onScreen && ahead > 180 && demon.data.waiting() === 0) {
            mockCooldown = seconds(7)
            demon.data.setWaiting(seconds(2.5))
            $scene.startBackgroundDialog({
              controllerId: demon.id,
              text: randomItem(DemonDialog.mocking),
              framesLeft: seconds(2.5),
            })
          } else if (ahead > demonLead && demon.data.waiting() === 0) {
            demon.data.setWaiting(seconds(0.5))
          }

          if (diverCenter.x > finishLine) {
            setPhase('raceOver')
            demon.data.setRacing(false)
            $scene.startDialog({ messages: [...DemonDialog.lost], pauseGameplay: true, onComplete: startBoss })
          } else if (demonX > finishLine) {
            setPhase('raceOver')
            $scene.startDialog({ messages: [...DemonDialog.won], pauseGameplay: true, onComplete: () => realm.fail($scene) })
          }
        } else if (phase() === 'boss') {
          const boss = devil()
          if (!boss) return
          const bossCenter = { x: boss.data.x() + boss.data.width() / 2, y: boss.data.y() + boss.data.height() / 2 }

          if (boss.data.health() <= 0) {
            setPhase('friends')
            boss.data.setAttack('friendly')
            $scene.getControllersByType('fireball').forEach(fireball => $scene.removeController(fireball.id))
            $scene.startDialog({
              messages: [...DemonDialog.defeated],
              pauseGameplay: true,
              onComplete: () => setCrystalGiven(true),
            })
            return
          }

          // Between attacks it slowly follows you. Then a charge, a spread of fireballs or the vents erupting
          const attack = boss.data.attack()
          if (attack === 'follow' && phaseFrames > seconds(3)) {
            phaseFrames = 0
            const next = (['charge', 'fireballs', 'vents'] as const)[attackN++ % 3]
            if (next === 'charge') {
              boss.data.setAttack('glow')
            } else if (next === 'fireballs') {
              boss.data.setAttack('fireballs')
              const aim = Math.atan2(diverCenter.y - bossCenter.y, diverCenter.x - bossCenter.x)
              Array(7).fill(null).forEach((_, n) => {
                const angle = aim + (n - 3) * 0.2
                $scene.addController(createFireballController('fireball-' + fireballs++, {
                  ...bossCenter,
                  velocity: { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 },
                }))
              })
            } else {
              boss.data.setAttack('vents')
              eruptArenaVents(attackN % 2)
            }
          } else if (attack === 'glow' && phaseFrames > seconds(1)) {
            phaseFrames = 0
            const direction = Math.atan2(diverCenter.y - bossCenter.y, diverCenter.x - bossCenter.x)
            boss.data.setChargeDirection({ x: Math.cos(direction), y: Math.sin(direction) })
            boss.data.setAttack('charge')
          } else if (attack === 'charge' && phaseFrames > seconds(1.2)) {
            phaseFrames = 0
            boss.data.setAttack('follow')
          } else if (attack === 'fireballs' && phaseFrames > seconds(0.5)) {
            phaseFrames = 0
            boss.data.setAttack('follow')
          } else if (attack === 'vents' && phaseFrames > seconds(2)) {
            phaseFrames = 0
            // Then the other half
            eruptArenaVents((attackN + 1) % 2)
            boss.data.setAttack('follow')
          }
        }
      }))
    },
    afterEnterFrames: ({ $scene }) => {
      const inArena = phase() === 'boss' || phase() === 'friends'
      followDiver($scene, inArena ? arena : bounds)
      // Linkosha follows the diver, but shouldn't be left outside once the arena shuts
      const corgi = $scene.getControllerById<CorgiController>('corgi')
      if (inArena && corgi && corgi.data.x() < arena.x) corgi.data.setX(arena.x + 20)
    },
    assetOrder: [
      ['steam', 'fireball'],
      ['steam-vent'],
      ['rock'],
      ['bubble'],
      ['hell-fish', 'devil', 'demon'],
      ['crystal-corgi'],
      ['corgi', 'diver'],
      ['arena-egg-fish', 'air-bubble'],
      ['realm-guide'],
      ['finish-line', 'current'],
      ['portal-vortex', 'portal'],
    ],
    sounds: {
      thud: thudSound,
      equalisation: equalisationSound,
    },
  })

  const style = () => {
    const canvas = scene.canvas.get()
    const x = canvas.x()
    const y = canvas.y()
    return {
      'background-image': `
        radial-gradient(300px 120px at 50% 100%, #ff440055, transparent),
        radial-gradient(160px 80px at 20% 0%, #ff220033, transparent),
        linear-gradient(180deg, #2b0805 0%, #4a0f08 50%, #7a1a0a 100%)
      `,
      'background-size': '600px 700px, 500px 700px, 100% 100%',
      'background-position': `${-x / 2}px ${-y / 2}px, ${-x / 3}px ${-y / 3}px, 0 0`,
    } satisfies JSX.CSSProperties
  }

  const hud = () => <>
    <Show when={phase() === 'countdown'}>
      <HudBanner>{t().realms.race}</HudBanner>
    </Show>
    <Show when={phase() === 'boss' && devil()}>
      {boss => {
        const canvas = scene.canvas.get()
        return <BossHealthBar
          label={t().realms.devil}
          health={boss().data.health()}
          x={boss().data.x() + boss().data.width() / 2 - canvas.x()}
          y={boss().data.y() + boss().data.height() - canvas.y() + 6}
        />
      }}
    </Show>
  </>

  return { scene, style, hud, music: () => phase() === 'boss' ? 'hellBoss' : 'hell' }
}

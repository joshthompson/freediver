import { Canvas } from "@/game/core/Canvas"
import { createBubbleController } from "../controllers/BubbleController"
import { createOctopusController } from "../controllers/OctopusController"
import { createCrabController } from "../controllers/CrabController"
import { createFishController } from "../controllers/FishController"
import { createDiverController, DiverController } from "../controllers/DiverController"
import { Game, SceneComponent } from "@/utils/game"
import { createCorgiController } from "../controllers/CorgiController"
import { createRopeController } from "../controllers/RopeController"
import { Component, onCleanup } from "solid-js"
import { css, cva } from "@style/css"
import depth1 from '@assets/depth1.png'
import depth2 from '@assets/depth2.png'
import depth3 from '@assets/depth3.png'
import surface from '@assets/surface.png'
import sand from '@assets/sand.png'
import thudSound from '@/assets/sounds/thud.mp3'
import starfishSound from '@/assets/sounds/starfish.mp3'
import equalisationSound from '@/assets/sounds/swoop.mp3'
import { PauseMenu } from "../ui/PauseMenu"
import { Bar } from "../ui/Bar"
import { DivingWatch } from "../ui/DivingWatch"
import { createStarfishController } from "../controllers/StarFishController"
import { useGameState } from "@/utils/GameStateContext"
import { LoadingScreen } from "../ui/LoadingScreen"
import { createWhaleController } from "../controllers/WhaleController"
import { Translations } from "@/utils/Translations"
import { createLightRayController } from "../controllers/LightRayController"
import { createWreckController } from "../controllers/WreckController"
import { createTriggerFishController } from "../controllers/TriggerFishController"
import { createStatueController } from "../controllers/StatueController"
import { createFriedEggFishController } from "../controllers/FriedEggFish"
import { createBoneController } from "../controllers/BoneController"
import { createSharkController } from "../controllers/SharkController"
import { createWhaleSharkController } from "../controllers/WhaleSharkController"
import { createWallController } from "../controllers/WallController"

export const OceanScene: SceneComponent = props => {
  const minX = -10000
  const maxX = 10000
  const state = useGameState()!
  const game = new Game('ocean', {
    ...state!,
    width: Math.min(700, window.innerWidth - 20),
    height: 700,
    setup($game: Game) {
      $game.addController(createWhaleController('whale'))
      $game.addController(createWhaleSharkController('whale-shark'))
      $game.addController(createSharkController('shark'))
      $game.addController(createWreckController('wreck'))
      $game.addController(createStatueController('statue'))
      $game.addController(...createDiverController('diver', {
        goToSurface: () => {
          props.setScene('surface')
          if ($game.gameState.diver.oxygen <= 1) {
            game.gameStateActions.achievement('almostFaint')
          }
        },
        blackout: () => {
          props.setScene('blackout')
          game.gameStateActions.achievement('blackout')
        },
        maxX,
        minX,
      }))
      $game.addController(createWallController('wall-left', { x: minX - 500 }))
      $game.addController(createWallController('wall-right', { x: maxX + 40 }))
      $game.addController(createCorgiController('corgi'))
      $game.addController(createRopeController('rope'))
      $game.addController(createFriedEggFishController('fried-egg-fish-1', { x: -7000 }))
      $game.addController(createFriedEggFishController('fried-egg-fish-2', { x: 4000 }))
      $game.addController(createFriedEggFishController('fried-egg-fish-3', { x: 9000 }))
      $game.addController(createTriggerFishController('triggerfish-1', { x: 8000 }))
      $game.addController(createTriggerFishController('triggerfish-2', { x: -5000 }))
      
      const totalBones = 20
      const boneGap = 1000
      Array(totalBones).fill(null).forEach((_, n) => {
        const x = n < totalBones / 2
          ? 0 + (n + 1) * boneGap
          : 0 - (n - totalBones / 2 + 1) * boneGap
        $game.addController(createBoneController('bone-' + n, { x: x + Math.random() * 200 - 100 }) )
      })

      const totalStarfish = 30
      const starfishMargin = 500
      Array(totalStarfish).fill(null).forEach((_, n) => {
        const totalSpace = maxX - minX - starfishMargin * 2
        const gap = totalSpace / (totalStarfish - 1)
        const x = minX + starfishMargin + n * gap
        $game.addController(createStarfishController('starfish-' + n, {
          x: x + Math.random() * 300 - 150,
        }) )
      })

      Array(20).fill(null).forEach((_, n) => {
        $game.addController(createFishController('fish-' + n, {
          x: Math.random() * 700 - 350,
          y: Math.random() * 500 + 100,
        }))
      })

      Array(10).fill(null).forEach((_, n) => {
        $game.addController(createLightRayController('light-' + n, { x: n * 70 }))
      })
    
      const crabs = Array(3).fill(null).map((_, n) => 
        createCrabController('crab-' + n, {
          x: -100 + n * 200 + Math.random() * 200,
        })
      ).sort((a, b) => a.data.y() - b.data.y())
      crabs.forEach(crab => $game.addController(crab))
    
      const octopi = Array(4).fill(null).map((_, n) => 
        createOctopusController('octopus-' + n, {
          x: Math.random() * 700 - 350,
          y: Math.random() * 500 + 100,
        })
      ).sort((a, b) => b.data.y() - a.data.y())
      octopi.forEach(octopus => $game.addController(octopus))
    },
    afterEnterFrames: ({ $game }) => {
      const diver = $game.getControllerById<DiverController>('diver')
      // Center camera
      if (diver) {
        $game.canvas().setX(diver.data.x() - $game.canvas().width / 2 + diver.data.width() / 2)
      }
    },
    sounds: {
      thud: thudSound,
      starfish: starfishSound,
      equalisation: equalisationSound,
    },
    images: [depth1, depth2, depth3, surface, sand],
  })
  onCleanup(() => game.destroy())

  const exitToMenu = () => {
    props.setScene('menu')
  }

  return <Canvas
    debug={game.gameState.options.debug}
    game={game}
    loading={LoadingScreen}
    overlay={<GameOverlay game={game} exitToMenu={exitToMenu} />}
    underlay={<GameUnderlay game={game} />}
    class={styles.level}
    style={{
      'background-image': `
        url(${sand}),
        url(${depth1}),
        url(${depth2}),
        url(${depth3}),
        linear-gradient(
          0deg,
          rgba(7, 0, 145, 1) 0%,
          rgba(10, 182, 250, 1) 90%,
          rgba(230, 240, 255, 1) 100%
        )
      `,
      'background-position': `
        ${-game.canvas().x()}px bottom,
        ${-game.canvas().x() / 1.5}px 85%,
        ${-game.canvas().x() / 2.0}px 85%,
        ${-game.canvas().x() / 2.5}px 85%,
        ${-game.canvas().x()}px bottom
      `,
    }}
    onClick={event => {
      if (!game.paused()) {
        game.addController(createBubbleController('bubble-click-' + Date.now(), event))
      }
    }}
  />
}

const GameOverlay: Component<{ game: Game, exitToMenu: () => void }> = props => {
  const t = () => Translations[props.game.gameState.options.locale]
  const depth = () => {
    const diver = props.game.getControllerById<DiverController>('diver')
    if (!diver) return 0
    return diver.data.depth()
  }

  const eqWarn = () => {
    const diver = props.game.getControllerById<DiverController>('diver')
    if (!diver) return false
    const { eqLevel, eqTolerance } = diver.data
    return eqLevel() > eqTolerance
  }

  const eqBar = () => {
    const diver = props.game.getControllerById<DiverController>('diver')
    if (!diver) return 0
    const { holdSpace, holdSpaceMax } = diver.data
    return Math.min(100, holdSpace() / holdSpaceMax * 100)
  }

  const blackoutWarning = () => {
    const { oxygen } = props.game.gameState.diver
    if (oxygen < 10) {
      return (10 - oxygen) / 10
    } else {
      return 0
    }
  }

  return <>
    <div class={styles.equalisation({ warn: eqWarn() })}>
      <div class={styles.equalisationBackground({ paused: props.game.paused() })} />
      <div class={styles.key}>{t().ocean.holdSpace}</div>
      <Bar percent={eqBar()} />
    </div>
    <div
      class={styles.blackoutWarning({ warn: blackoutWarning() > 0, superWarn: blackoutWarning() > 0.9 })}
      style={{ '--percent': blackoutWarning() }}
    >
      {t().ocean.warningLowOxygen}
    </div>
    <DivingWatch depth={depth()} />
    {props.game.paused() && <PauseMenu game={props.game} exitToMenu={props.exitToMenu} />}
  </>
}

const GameUnderlay: Component<{ game: Game }> = props => {
  return <div class={styles.surface} style={{
    'background-image': `url(${surface})`,
    'background-position-x': `${-props.game.canvas().x() / 10}px`
  }} />
}

const styles = {
  level: css({
    position: 'relative',
    backgroundRepeat: 'repeat-x',
    backgroundSize: '330px, 612px, 612px, 612px, cover',
    color: 'white',
    maxWidth: '100%',
  }),
  equalisation: cva({
    base: {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '3rem',
      gap: '3rem',
      transition: 'opacity 0.5s ease-in-out',
      opacity: 0,
      p: '0.5rem',
      textAlign: 'center',
    },
    variants: {
      warn: {
        true: {
          opacity: '1',
        },
      },
    },
  }),
  equalisationBackground: cva({
    base: {
      position: 'absolute',
      inset: '0',
      background: 'red',
      opacity: 0,
      animation: 'flash 1s ease-in-out infinite'
    },
    variants: {
      paused: {
        true: {
          animationPlayState: 'paused',
        },
      },
    },
  }),
  surface: css({
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '50px',
    backgroundSize: 'auto 100%',
    filter: 'saturate(0) brightness(10)',
    opacity: '0.5',
  }),
  key: css({
    '& > em': {
      display: 'inline-block',
      background: 'white',
      color: 'black',
      p: '0px 15px',
      lineHeight: '1.2em',
      mx: '0.15em',
      fontStyle: 'normal',
    },
  }),
  blackoutWarning: cva({
    base: {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      flexDirection: 'column',
      pt: '100px',
      alignItems: 'center',
      fontSize: '3rem',
      gap: '3rem',
      transition: `
        opacity 0.5s ease-in-out,
        box-shadow 0.5s ease-in-out,
        background 0.5s ease-in-out,
        color 0.5s ease-in-out
      `,
      opacity: 0,
      p: '0.5rem',
      textAlign: 'center',
      boxShadow: 'inset 0 0 calc(200px * var(--percent)) calc(100px * var(--percent)) #000000',
      background: '#00000000',
    },
    variants: {
      warn: {
        true: {
          opacity: 1,
        },
      },
      superWarn: {
        true: {
          background: '#000000FF',
          color: 'black',
        },
      }
    },
  }),
}

import { Canvas } from '@/engine/components/Canvas'
import { createBubbleController } from '../controllers/scenary/BubbleController'
import { DiverController } from '../controllers/DiverController'
import { SceneComponent } from '@/engine'
import { Accessor, Component, JSX, onCleanup } from 'solid-js'
import { css, cva } from '@style/css'
import { PauseMenu } from '../ui/PauseMenu'
import { Bar } from '../ui/Bar'
import { DivingWatch } from '../ui/DivingWatch'
import { LoadingScreen } from '../ui/LoadingScreen'
import { Translations } from '@/game/freediver/data/Translations'
import { surfaceAsset } from '@/assets'
import { Dialog } from '../ui/Dialog'
import { Scene } from '@/engine'
import { Controller } from '@/utils/game'

export const Level: SceneComponent<{
  scene: Scene<Controller<any>>,
  levelStyle: Accessor<JSX.CSSProperties>
  surface: boolean
}> = props => {
  onCleanup(() => props.scene.destroy())

  const exitToMenu = () => {
    props.setScene('menu')
  }

  return <Canvas
    debug={props.scene.gameState.options.debug}
    scene={props.scene}
    loading={LoadingScreen}
    dialog={Dialog}
    overlay={<GameOverlay scene={props.scene} exitToMenu={exitToMenu} />}
    underlay={props.surface && <GameUnderlay scene={props.scene} />}
    class={styles.level}
    style={props.levelStyle()}
    onClick={event => {
      if (props.scene.isActive()) {
        props.scene.addController(createBubbleController('bubble-click-' + Date.now(), event))
      }
    }}
  />
}

const GameOverlay: Component<{ scene: Scene, exitToMenu: () => void }> = props => {
  const t = () => Translations[props.scene.gameState.options.locale]
  const depth = () => {
    const diver = props.scene.getControllerById<DiverController>('diver')
    if (!diver) return 0
    return diver.data.depth()
  }

  const eqWarn = () => {
    const diver = props.scene.getControllerById<DiverController>('diver')
    if (!diver) return false
    const { eqLevel, eqTolerance } = diver.data
    return eqLevel() > eqTolerance
  }

  const eqBar = () => {
    const diver = props.scene.getControllerById<DiverController>('diver')
    if (!diver) return 0
    const { holdSpace, holdSpaceMax } = diver.data
    return Math.min(100, holdSpace() / holdSpaceMax * 100)
  }

  const blackoutWarning = () => {
    const { oxygen } = props.scene.gameState.diver
    if (oxygen < 10) {
      return (10 - oxygen) / 10
    } else {
      return 0
    }
  }

  return <>
    <div class={styles.equalisation({ warn: eqWarn() })}>
      <div class={styles.equalisationBackground({ paused: props.scene.paused.get() })} />
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
    {props.scene.paused.get() && <PauseMenu scene={props.scene} exitToMenu={props.exitToMenu} />}
  </>
}

const GameUnderlay: Component<{ scene: Scene }> = props => {
  return <div class={styles.surface} style={{
    'background-image': `url(${surfaceAsset})`,
    'background-position-x': `${-props.scene.canvas.get().x() / 10}px`
  }} />
}

const styles = {
  level: css({
    position: 'relative',
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
          background: '#000000DD',
          color: 'black',
        },
      }
    },
  }),
}

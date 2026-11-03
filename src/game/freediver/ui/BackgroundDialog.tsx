import { Scene } from '@/engine'
import { BackgroundDialog as BackgroundDialogData } from '@/utils/game'
import { css } from '@style/css'
import { Component, For, Show } from 'solid-js'

// Keeps bubbles (max 200px wide) and their tails inside the screen
const edgeX = 110
const minTop = 80

export const BackgroundDialog: Component<{ scene: Scene }> = props => {
  return <For each={props.scene.backgroundDialogs.get()}>
    {dialog => <Bubble scene={props.scene} dialog={dialog} />}
  </For>
}

const Bubble: Component<{ scene: Scene, dialog: BackgroundDialogData }> = props => {
  const position = () => {
    const speaker = props.scene.getControllerById(props.dialog.controllerId)
    if (!speaker) return
    const canvas = props.scene.canvas.get()
    const x = speaker.data.x() - canvas.x() + speaker.data.width() / 2
    const y = speaker.data.y() - canvas.y()
    return {
      left: `${Math.min(Math.max(x, edgeX), canvas.width - edgeX)}px`,
      top: `${Math.max(y, minTop)}px`,
    }
  }

  return <Show when={position()}>
    <div class={styles.bubble} style={position()}>{props.dialog.text[props.scene.gameState.options.locale]}</div>
  </Show>
}

const styles = {
  bubble: css({
    position: 'absolute',
    translate: '-50% calc(-100% - 12px)',
    maxWidth: '200px',
    width: 'max-content',
    p: '4px 10px',
    background: 'white',
    color: 'black',
    borderRadius: '10px',
    fontSize: '18px',
    lineHeight: '1.1',
    textAlign: 'center',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 0 3px #00000088)',

    _after: {
      content: '""',
      position: 'absolute',
      left: '50%',
      bottom: '-8px',
      translate: '-50% 0',
      borderWidth: '8px 8px 0 8px',
      borderStyle: 'solid',
      borderColor: 'white transparent transparent transparent',
    },
  }),
}

// Chat Messages use the same speech bubble
export const bubbleStyle = styles.bubble

import { Scene } from "@/engine";
import { css } from "@style/css";
import { Component, createSignal, onCleanup } from "solid-js";

export const Debugger: Component<{ scene: Scene }> = props => {
  const [rendered, setRendered] = createSignal(0)

  const interval = setInterval(() => {
    setRendered(document.querySelectorAll('[data-controller-id]').length)
  }, 50)

  onCleanup(() => clearInterval(interval))

  return <div class={styles.debugger}>
    <div>
      <div>Controllers:</div>
      <div>{Object.keys(props.scene.controllers.get()).length}</div>
      <div>Rendered:</div>
      <div>{rendered()}</div>
      <div>Assets Loaded:</div>
      <div>{props.scene.loadingAssetCount.get()} / {props.scene.loadingAssetTotal.get()}</div>
      <div>Canvas:</div>
      <div>
        {Math.round(props.scene.canvas.get().x())},
        {Math.round(props.scene.canvas.get().y())}
      </div>
    </div>
  </div>
}

const styles = {
  debugger: css({
    position: 'absolute',
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gap: '0 2rem',
    top: '10px',
    left: '10px',
    width: 'max-content',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    fontSize: '12px',
    overflowY: 'auto',
    p: '10px',
    zIndex: 1000,

    '& > div': {
      display: 'contents',
    },
  }),
}

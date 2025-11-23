import { Component, JSX } from "solid-js"
import { cva } from "@style/css"
import { playSound } from "@/utils/game"
import { useGameState } from "@/utils/GameStateContext"
import { clickSound } from "@/assets"

export const Button: Component<{
  size?: 'medium' | 'small'
  onClick?: (event: MouseEvent) => void
  children?: JSX.Element
}> = props => {

  const volume = useGameState()?.gameState.options.volume ?? 1
  const onClick = (event: MouseEvent) => {
    playSound(clickSound, { volume })
    props.onClick?.(event)
  }
  return <button
    class={styles.button({ size: props.size ?? 'medium' })}
    onClick={onClick}
    children={props.children}
  />
}

const styles = {
  button: cva({
    base: {
      background: '#FDD000',
      p:'7px 30px',
      borderRadius: '15px',
      border: '2px solid #000000',
      fontSize: '30px',
      lineHeight: '110%',
      color: 'white',
      minWidth: '180px',
      textShadow: `
        0.06em 0.06em 0 black,
        0.06em 0.06em 0.1em black
      `,
      textTransform: 'uppercase',
      boxShadow: `
        inset 0 12px 3px -7px rgba(255, 255, 255, 0.8),
        inset 0 -3px 3px 0px rgba(0, 0, 0, 0.4)
      `,
      cursor: 'pointer',
      transition: 'background 0.1s linear, padding 0.05s linear',

      _active: {
        boxShadow: `
          inset 0 10px 3px -7px rgba(0, 0, 0, 0.4),
          inset 0 0px 6px 0px rgba(255, 255, 255, 0.8)
        `,
        pt: '9px',
        pb: '5px',
      },

      _hover: {
        background: '#FDBA00',
      },
    },
    variants: {
      size: {
        medium: {},
        small: {
          fontSize: '22px',
          px: '15px',
        }
      },
    }
  }),
}

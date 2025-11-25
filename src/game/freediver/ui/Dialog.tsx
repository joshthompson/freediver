import { Game } from '@/utils/game'
import { css, cva, cx } from '@style/css'
import { Component, createEffect, createSignal, For, onCleanup, onMount, Show } from 'solid-js'

export const Dialog: Component<{game: Game}> = props => {
  const [text, setText] = createSignal('')
  const [canProceed, setCanProceed] = createSignal(true)
  const [selectedOption, setSelectedOption] = createSignal<number>(0)

  createEffect(() => {
    const text = message()?.text ?? undefined
    if (!text) {
      setText('')
      return
    }
    fillTextGradually(text)
  })

  const fillTextGradually = (fullText: string) => {
    setCanProceed(false)
    let currentIndex = 0
    setText('')
    const interval = setInterval(() => {
      currentIndex++
      setText(fullText.slice(0, currentIndex))
      if (currentIndex >= fullText.length) {
        setCanProceed(true)
        setSelectedOption(0)
        clearInterval(interval)
      }
    }, 30)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!message()) return
    const space = event.key === ' '
    const left = event.key === 'ArrowLeft' || event.key === 'a'
    const right = event.key === 'ArrowRight' || event.key === 'd'
    if (space && canProceed()) {
      props.game.diaglogAction(selectedOption())
    }
    if (left && canProceed()) {
      setSelectedOption(prev => (prev - 1 + options().length) % options().length)
    }
    if (right && canProceed()) {
      setSelectedOption(prev => (prev + 1) % options().length)
    }
  }

  const message = () => props.game.dialog.data()?.messages[props.game.dialog.messageIndex()]
  const options = () => message()?.options || []
  onMount(() => window.addEventListener('keydown', handleKeyDown))
  onCleanup(() => window.removeEventListener('keydown', handleKeyDown))

  return <Show when={message()}>
    <div class={styles.dialog({ hasImage: !!message()!.image })}>
      <Show when={message()!.image}>
        <img src={message()!.image} class={styles.image} />
      </Show>
      <div class={styles.message}>
        <Show when={message()!.speaker}>
          <div class={styles.speaker}>{message()!.speaker}:</div>
        </Show>
        <div class={styles.text}>{text() || '&nbsp;'}</div>
        <div class={styles.options({ canProceed: canProceed() })}>
          <Show
            when={options().length > 0}
            children={
                <For each={options()}>
                  {(option, n) =>
                    <div
                      class={styles.option({ selected: n() === selectedOption()})}
                      children={option.text}
                    />
                  }
                </For>
            }
            fallback={<div class={cx(styles.continue, styles.option({ selected: true }))}>Continue</div>}
          />
        </div>
      </div>
    </div>
  </Show>
}

const styles = {
  dialog: cva({
    base: {
      position: 'absolute',
      left: '20px',
      right: '20px',
      bottom: '50px',
      background: '#000000cc',
      color: 'white',
      display: 'flex',
      p: '5px 10px',
      borderRadius: '10px',
      filter: 'drop-shadow(0 0 5px black)',
    },
    variants: {
      hasImage: {
        true: {
          left: '50px',
        },
      },
    },
  }),
  image: css({
    m: '-15px 10px -15px -50px',
    height: '100px',
    aspectRatio: '1',
    border: '4px solid black',
    borderRadius: '50%',
    background: 'white',
  }),
  message: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontSize: '22px',
    lineHeight: '1.2',
  }),
  speaker: css({
    color: '#AAAAAA',
  }),
  text: css({}),
  continue: css({
    position: 'absolute',
    right: '5px',
    top: '5px',
  }),
  options: cva({
    base: {
      position: 'absolute',
      inset: 'auto 0 -6px 0',
      translate: '0 100%',
      display: 'flex',
      gap: '10px',
      mt: '10px',
      alignItems: 'center',
      justifyContent: 'flex-end',
      transition: 'opacity 0.3s ease-in-out',
    },
    variants: {
      canProceed: {
        true: { opacity: '1', transitionDuration: '0.3s' },
        false: { opacity: '0', transitionDuration: '0s' },
      },
    },
  }),
  option: cva({
    base: {
      borderRadius: '5px',
      fontSize: '20px',
      color: '#555555',
      background: 'white',
      p: '2px 10px',
      textTransform: 'uppercase',
      cursor: 'pointer',
  
      _hover: {
        background: '#eeeeee',
      }
    },
    variants: {
      selected: {
        true: {
          color: 'black',
          outline: '2px solid black',
        },
      },
    },
  }),
}

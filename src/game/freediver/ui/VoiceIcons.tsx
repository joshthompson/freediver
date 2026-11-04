import { Component, Show } from 'solid-js'

export const MicIcon: Component<{ crossed?: boolean, size?: number }> = props => (
  <svg viewBox="0 0 24 24" width={props.size ?? 28} height={props.size ?? 28} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
    <Show when={props.crossed}>
      <path d="M3 3l18 18" stroke-width="2.5" />
    </Show>
  </svg>
)

// Beside a Player's name while they're talking
export const SpeakerIcon: Component = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" style={{ 'vertical-align': '-0.15em', 'margin-left': '0.25em' }}>
    <path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
)

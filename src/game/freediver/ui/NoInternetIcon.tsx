import { Component } from 'solid-js'

// Wi-Fi with a line through it, for things that need the internet while you're offline
export const NoInternetIcon: Component<{ title?: string }> = props => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
    style={{ 'vertical-align': '-0.1em', filter: 'drop-shadow(0.06em 0.06em 0 black)' }}>
    <title>{props.title}</title>
    <path d="M2 8.5a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16.2a5 5 0 0 1 6 0" />
    <circle cx="12" cy="20" r="1.2" fill="currentColor" stroke="none" />
    <path d="M3 3l18 18" stroke-width="3" />
  </svg>
)

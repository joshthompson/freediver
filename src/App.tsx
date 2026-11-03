import { lazy, onMount, type Component } from 'solid-js'
import { FreediverGame } from './game/freediver/FreediverGame'
import { warmupOfflineAssets } from './offline-warmup';

// Dev only, and loaded separately so it never ships with the game
const ArtChecklistPage = import.meta.env.DEV
  ? lazy(() => import('./game/freediver/ArtChecklistPage').then(m => ({ default: m.ArtChecklistPage })))
  : undefined
const isArtChecklist = window.location.pathname.replace(/\/$/, '').endsWith('/art-checklist')

const App: Component = () => {

  onMount(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready
      warmupOfflineAssets()
    }
  });
  
  if (ArtChecklistPage && isArtChecklist) return <ArtChecklistPage />
  return <FreediverGame />
};

export default App

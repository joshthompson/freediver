import { onMount, type Component } from 'solid-js'
import { FreediverGame } from './game/freediver/FreediverGame'
import { warmupOfflineAssets } from './offline-warmup';

const App: Component = () => {

  onMount(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready
      warmupOfflineAssets()
    }
  });
  
  return <FreediverGame />
};

export default App

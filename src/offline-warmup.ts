import * as Assets from '@assets/index'

export async function warmupOfflineAssets() {
  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.ready;
  }
  const files = Object.values(Assets)
  try {
    const cache = await caches.open('offline-warmup')
    await cache.addAll(files)
  } catch (e) {
    console.warn('Warmup caching failed', e)
  }
}

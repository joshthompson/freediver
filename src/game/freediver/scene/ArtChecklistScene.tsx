import { createResource, createSignal, For, onCleanup, Show } from 'solid-js'
import { css, cva } from '@style/css'
import { Canvas } from '@/engine/components/Canvas'
import { Scene, SceneComponent } from '@/engine'
import { useGameState } from '@/utils/GameStateContext'
import { menu2Asset } from '@/assets'
import { PlaceholderArt } from '../data/PlaceholderArt'
import { Button } from '../ui/Button'

// Every image a placeholder could live in, by its path under src/assets
const assetUrls = Object.fromEntries(
  Object.entries(import.meta.glob<string>(
    ['/src/assets/realms/**/*.png', '/src/assets/kingdom/*.png', '/src/assets/sprites/statue/*.png'],
    { eager: true, query: '?url', import: 'default' },
  )).map(([path, url]) => [path.replace('/src/assets/', ''), url]),
)

interface ArtFile {
  path: string
  url: string
  origin: string
  bytes: number
  replaced: boolean
}

// Reads each file's current size, which differs from the generated one once it's been replaced
async function loadArt(): Promise<ArtFile[]> {
  return Promise.all(PlaceholderArt.map(async art => {
    const url = assetUrls[art.path]
    const bytes = url ? (await (await fetch(url, { cache: 'no-store' })).blob()).size : 0
    return { ...art, url, bytes, replaced: bytes !== art.bytes }
  }))
}

const folderOf = (path: string) => path.split('/').slice(0, -1).join('/')

// Dev only: the generated art still waiting for hand-drawn replacements. Not translated
export const ArtChecklistScene: SceneComponent = props => {
  const scene = new Scene('artChecklist', {
    ...useGameState()!,
    width: 700,
    height: 700,
  })
  onCleanup(() => scene.destroy())

  const [art] = createResource(loadArt)
  const [hideReplaced, setHideReplaced] = createSignal(false)
  const replacedCount = () => art()?.filter(file => file.replaced).length ?? 0
  const folders = () => {
    const files = (art() ?? []).filter(file => !hideReplaced() || !file.replaced)
    return [...new Set(files.map(file => folderOf(file.path)))]
      .map(folder => ({ folder, files: files.filter(file => folderOf(file.path) === folder) }))
  }

  return <Canvas
    scene={scene}
    style={{ background: `url(${menu2Asset})`, 'background-size': 'cover' }}
    overlay={<div class={styles.overlay}>
      <div class={styles.title}>Art Checklist</div>
      <div class={styles.summary}>
        <Show when={art()} fallback="Checking files...">
          {replacedCount()} of {art()!.length} replaced
        </Show>
      </div>
      <div class={styles.list}>
        <For each={folders()}>
          {group => <>
            <div class={styles.folder}>src/assets/{group.folder}</div>
            <For each={group.files}>
              {file => <ArtRow file={file} />}
            </For>
          </>}
        </For>
      </div>
      <div class={styles.buttons}>
        <Button onClick={() => setHideReplaced(!hideReplaced())} size="small">
          {hideReplaced() ? 'Show All' : 'Hide Replaced'}
        </Button>
        <Button onClick={() => props.setScene('menu')} size="small">Back</Button>
      </div>
    </div>}
  />
}

const ArtRow = (props: { file: ArtFile }) => {
  const [dimensions, setDimensions] = createSignal('')
  return <div class={styles.row({ replaced: props.file.replaced })}>
    <div class={styles.preview}>
      <img
        src={props.file.url}
        class={styles.image}
        onLoad={event => setDimensions(`${event.currentTarget.naturalWidth} × ${event.currentTarget.naturalHeight} px`)}
      />
    </div>
    <div class={styles.details}>
      <div class={styles.name}>{props.file.path.split('/').at(-1)}</div>
      <div>{dimensions()} · {(props.file.bytes / 1024).toFixed(1)} KB</div>
      <div class={styles.origin}>{props.file.origin}</div>
    </div>
    <div class={styles.status({ replaced: props.file.replaced })}>
      {props.file.replaced ? '✓ Replaced' : 'Placeholder'}
    </div>
  </div>
}

const styles = {
  overlay: css({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    p: '16px',
    color: 'white',
  }),
  title: css({
    fontSize: '2rem',
    textShadow: '2px 2px 4px #000',
  }),
  summary: css({
    fontSize: '1.2rem',
    textShadow: '1px 1px 3px #000',
  }),
  list: css({
    flex: '1',
    minHeight: 0,
    width: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    p: '8px',
    borderRadius: '12px',
    background: '#000000aa',
  }),
  folder: css({
    mt: '8px',
    fontSize: '1.1rem',
    color: '#FDD000',
  }),
  row: cva({
    base: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      p: '6px',
      borderRadius: '8px',
      background: '#ffffff14',
    },
    variants: {
      replaced: {
        true: { opacity: 0.55 },
      },
    },
  }),
  preview: css({
    flex: '0 0 84px',
    height: '64px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '6px',
    // A checkerboard so transparent parts show
    background: 'repeating-conic-gradient(#9a9a9a 0 25%, #d0d0d0 0 50%) 0 0 / 12px 12px',
  }),
  image: css({
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  }),
  details: css({
    flex: '1',
    minWidth: 0,
    fontSize: '0.95rem',
    lineHeight: '1.25',
    wordBreak: 'break-all',
  }),
  name: css({
    fontSize: '1.05rem',
  }),
  origin: css({
    color: '#bbbbbb',
    fontSize: '0.85rem',
  }),
  status: cva({
    base: {
      flex: '0 0 auto',
      p: '2px 10px',
      borderRadius: '10px',
      fontSize: '0.9rem',
      background: '#c98a00',
    },
    variants: {
      replaced: {
        true: { background: '#2fbf4a' },
      },
    },
  }),
  buttons: css({
    display: 'flex',
    gap: '10px',
  }),
}

import { Component, createResource, createSignal, For, Show } from 'solid-js'
import { css, cva } from '@style/css'
import { PlaceholderArt } from './data/PlaceholderArt'
import { Button } from './ui/Button'

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

// A page of its own at /art-checklist, in dev only: the generated art still waiting for hand-drawn replacements.
// Not translated
export const ArtChecklistPage: Component = () => {
  const [art] = createResource(loadArt)
  const [hideReplaced, setHideReplaced] = createSignal(false)
  const replacedCount = () => art()?.filter(file => file.replaced).length ?? 0
  const folders = () => {
    const files = (art() ?? []).filter(file => !hideReplaced() || !file.replaced)
    return [...new Set(files.map(file => folderOf(file.path)))]
      .map(folder => ({ folder, files: files.filter(file => folderOf(file.path) === folder) }))
  }

  return <div class={styles.page}>
    <div class={styles.header}>
      <div class={styles.title}>Art Checklist</div>
      <div class={styles.summary}>
        <Show when={art()} fallback="Checking files...">
          {replacedCount()} of {art()!.length} replaced
        </Show>
      </div>
      <Button onClick={() => setHideReplaced(!hideReplaced())} size="small">
        {hideReplaced() ? 'Show All' : 'Hide Replaced'}
      </Button>
    </div>
    <For each={folders()}>
      {group => <section>
        <div class={styles.folder}>src/assets/{group.folder}</div>
        <div class={styles.grid}>
          <For each={group.files}>
            {file => <ArtRow file={file} />}
          </For>
        </div>
      </section>}
    </For>
  </div>
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
  page: css({
    minHeight: '100vh',
    maxWidth: '1200px',
    mx: 'auto',
    p: '24px 16px 48px',
    color: 'white',
    background: '#0E262C',
  }),
  header: css({
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '16px',
    py: '12px',
    background: '#0E262C',
  }),
  title: css({
    fontSize: '2rem',
  }),
  summary: css({
    flex: '1',
    fontSize: '1.2rem',
  }),
  folder: css({
    mt: '24px',
    mb: '8px',
    fontSize: '1.2rem',
    color: '#FDD000',
  }),
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '8px',
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
    flex: '0 0 120px',
    height: '96px',
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
  }),
  name: css({
    fontSize: '1.05rem',
    overflowWrap: 'anywhere', // Long file names can break anywhere, nothing else should
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
}

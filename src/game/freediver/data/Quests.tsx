import { cowQuestCompleteAsset } from '@/assets'
import { css } from '@style/css'
import { LetterBounce } from '../ui/LetterBounce'
import { Scene } from '@/engine'

const fade = 500
const duration = 5000

const styles = {
  questCompleteModal: css({
    width: '100%',
    aspectRatio: '732/565',
    backgroundSize: 'contain',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textShadow: '2px 2px 4px #000',
    fontSize: '5rem',
    animation: 'fadeIn var(--fade) ease-in-out, fadeOut var(--fade) ease-in-out calc(var(--duration) - var(--fade))',
  }),
}

export const QuestCompleteModal = {
  cow: <div
    class={styles.questCompleteModal}
    style={{
      'background-image': `url('${cowQuestCompleteAsset}')`,
      '--duration': `${duration}ms`,
      '--fade': `${fade}ms`,
    }}
  >
    <LetterBounce children="Quest complete!" />
  </div>,
}

export function QuestComplete(quest: keyof typeof QuestCompleteModal, scene: Scene) {
  scene.modal.set(QuestCompleteModal[quest])
  setTimeout(() => {
    scene.modal.set(null)
  }, duration)
}


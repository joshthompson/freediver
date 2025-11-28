import { cowDialogAsset, linkDialogAsset, manateeDialogAsset } from '@/assets'
import { DialogMessage } from '@/utils/game'

const cow = { speaker: 'Wanda the Cow', image: cowDialogAsset }
const link = { speaker: 'Linkosha', image: linkDialogAsset }
const manatee = { speaker: 'Manny the Manatee', image: manateeDialogAsset }

export const CowQuest = {
  intro: [
    { ...cow, text: 'Moooooooo!' },
    { ...cow, text: `My name is Wanda the Cow and I'm in a really a bad mooood` },
    { ...link, text: 'Woof woof!' },
    { ...cow, text: 'You really want to help me?!' },
    { ...link, text: 'Woof woof!' },
    { ...cow, text: 'So I got seperated from my cousin the sea-cow. Could you help reunite us?' },
    { ...link, text: 'Woof woof!' },
    { ...cow, text: `Wow, your kindness has really moooved me!` },
    { ...link, text: 'Woof woof!' },
    { ...cow, text: `I'll try and keep up with you but I'm not the fastest swimmer` },
  ],
  preQuestManatee: [
    { ...manatee, text: 'Mwoorp, I lost my cousin somewhere. Mwoorp!'}
  ],
  slowDown: [
    { ...cow, text: `Slow down, I've lost you!` },
  ],
  foundYou: [
    { ...cow, text: `Ahhh, there you are!` },
  ],
  halfWay: [
    { ...cow, text: `I think I recognise those crabs, let's keep going this way!` },
  ],
  reunion: [
    { ...manatee, text: 'Mwoorp?' },
    { ...cow, text: 'Mooooo!' },
    { ...manatee, text: 'Mwoooorrrp!!!' },
    { ...cow, text: `Manny! It's really you!` },
    { ...cow, text: 'Thank you for helping! Linkosha, you are legen-dairy!' },
    { ...link, text: 'Woof woof!' },
    { ...manatee, text: 'I was hiding in my cave, but to say thank you, maybe I can let you swim through it?' },
    { ...link, text: 'Woof woof!' },
  ],
} as const satisfies Record<string, DialogMessage[]>


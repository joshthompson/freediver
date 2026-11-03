import { cowDialogAsset, kingDialogAsset, linkDialogAsset, manateeHappyDialogAsset, manateeSadDialogAsset } from '@/assets'
import { DialogMessage } from '@/utils/game'

const cow = { speaker: 'Wanda the Cow', image: cowDialogAsset }
const link = { speaker: 'Linkosha', image: linkDialogAsset }
const manateeSad = { speaker: 'Manny the Manatee', image: manateeSadDialogAsset }
const manateeHappy = { ...manateeSad, image: manateeHappyDialogAsset }
const king = { speaker: 'The Corgi King', image: kingDialogAsset }

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
    { ...manateeSad, text: 'Mwoorp, I lost my cousin somewhere. Mwoorp!'}
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
    { ...manateeHappy, text: 'Mwoorp?' },
    { ...cow, text: 'Mooooo!' },
    { ...manateeHappy, text: 'Mwoooorrrp!!!' },
    { ...cow, text: `Manny! It's really you!` },
    { ...cow, text: 'Thank you for helping! Linkosha, you are legen-dairy!' },
    { ...link, text: 'Woof woof!' },
    { ...manateeHappy, text: 'I was hiding in my cave, but to say thank you, maybe I can let you swim through it?' },
    { ...link, text: 'Woof woof!' },
  ],
} as const satisfies Record<string, DialogMessage[]>

// TODO: Placeholder lines until they're rewritten
export const BackgroundDialogLines = {
  cow: [
    'Moo-rning, Linkosha!',
    'Hay there, pup!',
    'Manny and I are having a whale of a time!',
    'What an udderly lovely day for a swim!',
  ],
  manatee: [
    'Mwoorp! Hello again!',
    'Mwoorp mwoorp!',
    'Thanks again, little pup!',
    'Sea-cows never forget a friend. Mwoorp!',
  ],
} as const satisfies Record<string, readonly string[]>

// TODO: Placeholder quest text until the king's quest is written
export const KingQuest = {
  intro: [
    { ...king, text: 'Who dares swim into the Corgi Kingdom?' },
    { ...link, text: 'Woof woof!' },
    { ...king, text: 'Linkosha! Welcome, brave pup. You have come at just the right time.' },
    { ...king, text: 'Link, I have a royal quest for you.' },
    { ...king, text: 'I need to you to bring to me the 5 crystal corgis.' },
    // { ...king, text: 'The first is lost in the Corgosphere.' },
    { ...link, text: 'Woof woof!' },
    { ...king, text: 'Link Return to me when it is done, and you shall be rewarded!' },
  ],
  reminder: [
    { ...king, text: 'Link Have you completed my royal quest yet?' },
  ],
} as const satisfies Record<string, DialogMessage[]>

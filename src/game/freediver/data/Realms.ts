import {
  crystalCorgiBlackAsset,
  crystalCorgiFireAsset,
  crystalCorgiRubyAsset,
  crystalCorgiWhiteAsset,
  crystalCorgiYellowAsset,
} from '@/assets'
import { Achievement } from './Achievements'

// The five Crystal Realms behind the King's Portal, in the order the portal lists them.
// Each realm's name is also the name of its scene
export const RealmNames = ['corgosphere', 'triggerFishLair', 'friedEgg', 'depths', 'hell'] as const
export type RealmName = typeof RealmNames[number]

export const Realms: Record<RealmName, {
  crystal: string
  achievement: Achievement
}> = {
  corgosphere: { crystal: crystalCorgiRubyAsset, achievement: 'rubyCorgi' },
  triggerFishLair: { crystal: crystalCorgiYellowAsset, achievement: 'yellowCorgi' },
  friedEgg: { crystal: crystalCorgiWhiteAsset, achievement: 'whiteCorgi' },
  depths: { crystal: crystalCorgiBlackAsset, achievement: 'blackCorgi' },
  hell: { crystal: crystalCorgiFireAsset, achievement: 'fireCorgi' },
}

export const isRealm = (scene: string): scene is RealmName => (RealmNames as readonly string[]).includes(scene)

// Points added to the current dive for finishing a realm
export const RealmPoints = { first: 10, replay: 5 }

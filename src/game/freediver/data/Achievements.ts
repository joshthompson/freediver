export const AllAchievements = [
  // Basic
  'firstDive', // First dive
  'total100', // Obtain a total score of over 100
  'dive15', // Get 10 points in a single dive
  'dive30', // Get 20 points in a single dive
  'almostFaint', // Return to the surface with 1 oxygen remaining
  'blackout', // Experience a blackout

  // Random
  'prequalisation', // Equalise near the surface
  'bone', // Find Linkosha 5 bones
  'crabJump', // Make a crab jump
  'bilingual', // Change language
  'surviveTitanTriggerFish', // Survive an encounter with a titan trigger fish
  'eggFishKiss', // Get kissed by a fried egg fish

  // Explore
  'whale', // Find a whale
  'whaleShark', // Find a whale-shark
  'shark', // Find a shark
  'wreck', // Find a ship wreck
  'statue', // Find the Linkosha statue
  'endOfTheWorld', // Reach the end of the world

  // Quests
  'cow', // Reunite the cow with her cousin
] as const

export type Achievement = typeof AllAchievements[number]
export type AchievementState = 'new' | 'shown'
export type AchievementsRecord = Partial<Record<Achievement, AchievementState>>
export const AchievementEmojis: Record<Achievement, string> = {
  almostFaint: '😵‍💫',
  bilingual: '🗣️',
  bone: '🦴',
  blackout: '😵',
  crabJump: '🦀',
  dive15: '🤿',
  dive30: '🏆',
  endOfTheWorld: '🌍',
  firstDive: '🏊',
  eggFishKiss: '💋',
  prequalisation: '👃',
  shark: '🦈',
  statue: '🗿',
  surviveTitanTriggerFish: '🐡',
  total100: '💯',
  whale: '🐋',
  whaleShark: '🌊',
  wreck: '⚓️',
  cow: '🐄',
}

export const AchievementDisplayDuration = 5000

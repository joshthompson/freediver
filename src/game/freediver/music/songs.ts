import type { Song, Track, Voice } from './synth'

// Music for each Crystal Realm, written as step patterns for the synth. They borrow from the main
// ocean music: muffled, with slow chord changes and small stepwise melodies

const hold = (note: string, steps: number) => [note, ...Array(steps - 1).fill('_')].join(' ')
const rest = (steps: number) => Array(steps).fill('-').join(' ')
const join = (...parts: string[]) => parts.join(' ')
const repeat = (part: string, times: number) => Array(times).fill(part).join(' ')

// Every note in a pattern, an octave higher
const octaveUp = (pattern: string) => pattern.replace(/([A-G][#b]?)(-?\d)/g, (_, note, octave) => `${note}${Number(octave) + 1}`)

// Cycles through the notes, one every `every` steps
const arp = (notes: string[], steps: number, every = 1) =>
  Array.from({ length: steps }, (_, i) => i % every === 0 ? notes[(i / every) % notes.length] : '-').join(' ')

// Held chords as one track per voice, each chord lasting `steps`
const chords = (voice: Voice, list: string[][], steps: number, options: Omit<Track, 'voice' | 'pattern'> = {}): Track[] =>
  list[0].map((_, n) => ({ voice, pattern: list.map(chord => hold(chord[n], steps)).join(' '), ...options }))

// Root on the beat and fifth in between, for each bar
const oomPah = (bars: [root: string, fifth: string][]) =>
  bars.map(([root, fifth]) => join(root, rest(3), fifth, rest(3), root, rest(3), fifth, rest(3))).join(' ')

// Spacey and floaty
const corgosphere: Song = {
  bpm: 72,
  stepsPerBeat: 4,
  cutoff: 2600,
  echo: { beats: 0.75, feedback: 0.45 },
  sections: ['intro', 'melody'].map(part => ({
    steps: 128,
    tracks: [
      { voice: 'sub', pattern: join(hold('F2', 32), hold('A2', 32), hold('Db2', 32), hold('C2', 32)), gain: 0.22 },
      ...chords('pad', [['A3', 'C4', 'E4'], ['A3', 'E4', 'G4'], ['Ab3', 'C4', 'F4'], ['G3', 'B3', 'E4']], 32, { gain: 0.05 }),
      {
        voice: 'bell',
        pattern: join(
          arp(['F5', 'A5', 'C6', 'E6'], 32, 2),
          arp(['E5', 'A5', 'C6', 'G5'], 32, 2),
          arp(['F5', 'Ab5', 'C6', 'Db6'], 32, 2),
          arp(['E5', 'G5', 'B5', 'C6'], 32, 2),
        ),
        gain: 0.05,
        echo: 0.6,
      },
      ...part === 'melody' ? [{
        voice: 'lead' as const,
        pattern: join(
          hold('C5', 8), hold('E5', 8), hold('D5', 4), hold('C5', 4), hold('A4', 8),
          hold('E5', 12), hold('G5', 4), hold('E5', 8), rest(8),
          hold('F5', 8), hold('Eb5', 4), hold('C5', 4), hold('Ab4', 16),
          hold('G4', 8), hold('B4', 8), hold('C5', 16),
        ),
        gain: 0.1,
        echo: 0.5,
      }] : [],
    ],
  })),
}

// Deep, tense and creeping
const triggerFishLair: Song = {
  bpm: 84,
  stepsPerBeat: 4,
  cutoff: 1300,
  gain: 1.5,
  echo: { beats: 1, feedback: 0.3 },
  sections: ['creep', 'theremin'].map(part => ({
    steps: 64,
    tracks: [
      { voice: 'bass', pattern: repeat('C2 - - C2 - - - - Db2 - - - C2 - - -', 4), gain: 0.16, gate: 0.6 },
      ...chords('pad', [['C3', 'Eb3', 'G3'], ['Db3', 'F3', 'Ab3']], 32, { gain: 0.04 }),
      { voice: 'kick', pattern: repeat('x - - - - - - - x - x - - - - -', 4), gain: 0.22 },
      { voice: 'hat', pattern: repeat('x - - - x - - - x - - - x - x -', 4), gain: 0.025 },
      { voice: 'bell', pattern: join(rest(32), 'C6', rest(31)), gain: 0.04, echo: 0.7 }, // A drip
      ...part === 'theremin' ? [{
        voice: 'lead' as const,
        pattern: join(
          hold('G4', 4), hold('Ab4', 4), hold('G4', 4), hold('F#4', 4),
          hold('G4', 12), rest(4),
          hold('Eb4', 4), hold('D4', 4), hold('Db4', 4), hold('C4', 4),
          hold('B3', 12), rest(4),
        ),
        gain: 0.09,
        echo: 0.4,
      }] : [],
    ],
  })),
}

const friedEggBass = oomPah([['F2', 'C3'], ['D2', 'A2'], ['Bb1', 'F2'], ['C2', 'G2']])
const friedEggDrums: Track[] = [
  { voice: 'kick', pattern: 'x - - - - - - - x - - - - - - -', gain: 0.2 },
  { voice: 'snare', pattern: '- - - - x - - - - - - - x - - -', gain: 0.12 },
  { voice: 'hat', pattern: 'x x x x', gain: 0.03 },
]

// Silly and frantic
const friedEgg: Song = {
  bpm: 152,
  stepsPerBeat: 4,
  cutoff: 6000,
  gain: 2.1,
  echo: { beats: 0.5, feedback: 0.2 },
  sections: ['bounce', 'tune'].map(part => ({
    steps: 64,
    tracks: [
      { voice: 'bass', pattern: friedEggBass, gain: 0.18, gate: 0.4 },
      // The "pah" of the oom-pah, on the offbeats
      { voice: 'pluck', pattern: join(...['A3', 'F3', 'D4', 'E3'].map(n => repeat(`- - ${n} -`, 4))), gain: 0.09 },
      { voice: 'pluck', pattern: join(...['C4', 'A3', 'F4', 'G3'].map(n => repeat(`- - ${n} -`, 4))), gain: 0.09 },
      ...friedEggDrums,
      part === 'bounce'
        ? { voice: 'square', pattern: repeat(join(rest(12), 'C6 - A5 -'), 4), gain: 0.08, gate: 0.4, echo: 0.3 } // Cuckoo
        : {
          voice: 'square',
          pattern: join(
            'F5 A5 C6 A5 F5 A5 C6 A5 G5 - E5 - C5 - - -',
            'D5 F5 A5 F5 D5 F5 A5 F5 G5 - F5 - D5 - - -',
            'Bb4 D5 F5 D5 Bb4 D5 F5 D5 C5 - D5 - Bb4 - - -',
            'C5 - E5 - G5 - C6 - B5 - Bb5 - A5 - G5 -',
          ),
          gain: 0.09,
          gate: 0.5,
          echo: 0.2,
        },
    ],
  })),
}

// When the Scrambled Egg Monster rages
const friedEggBoss: Song = {
  bpm: 168,
  stepsPerBeat: 4,
  cutoff: 7000,
  gain: 1.3,
  echo: { beats: 0.75, feedback: 0.25 },
  sections: ['stabs', 'tune'].map(part => ({
    steps: 64,
    tracks: [
      { voice: 'bass', pattern: join(...['F', 'Db', 'Eb', 'C'].map(n => repeat(`${n}2 ${n}2 ${n}3 ${n}2`, 4))), gain: 0.15, gate: 0.6 },
      { voice: 'kick', pattern: 'x - - -', gain: 0.32 },
      { voice: 'snare', pattern: '- - - - x - - - - - - - x - x -', gain: 0.13 },
      { voice: 'hat', pattern: 'x x x x', gain: 0.04 },
      part === 'stabs'
        ? {
          voice: 'square',
          pattern: join(
            arp(['F5', 'Ab5', 'C6', 'Ab5'], 16),
            arp(['F5', 'Ab5', 'Db6', 'Ab5'], 16),
            arp(['G5', 'Bb5', 'Eb6', 'Bb5'], 16),
            arp(['E5', 'G5', 'C6', 'G5'], 16),
          ),
          gain: 0.04,
          gate: 0.5,
        }
        : {
          voice: 'square',
          pattern: join(
            hold('C6', 4), hold('Ab5', 4), hold('F5', 4), hold('G5', 4),
            hold('Ab5', 8), hold('F5', 8),
            hold('G5', 4), hold('Bb5', 4), hold('Eb6', 4), hold('Db6', 4),
            hold('C6', 4), hold('Bb5', 4), hold('G5', 4), hold('E5', 4),
          ),
          gain: 0.06,
          gate: 0.9,
          echo: 0.3,
        },
    ],
  })),
}

// Sparse and calm, like a real freediving contest. The closest to the main ocean music: in D at
// 60 bpm, the bass moving between D and F#, with a slow heartbeat
const depths: Song = {
  bpm: 60,
  stepsPerBeat: 4,
  cutoff: 1600,
  echo: { beats: 1.5, feedback: 0.5 },
  sections: ['breathe', 'dive'].map(part => ({
    steps: 128,
    tracks: [
      { voice: 'sub', pattern: join(hold('D2', 32), hold('F#2', 32), hold('D2', 32), hold('Bb1', 32)), gain: 0.22 },
      ...chords('pad', [['D3', 'A3', 'E4'], ['D3', 'A3', 'C#4'], ['D3', 'F3', 'E4'], ['D3', 'F3', 'A3']], 32, { gain: 0.045 }),
      { voice: 'kick', pattern: 'x - x - - - - - x - x - - - - -', gain: 0.12 }, // Lub-dub
      { voice: 'bell', pattern: join('A5', rest(63)), gain: 0.04, echo: 0.6 }, // Sonar
      ...part === 'dive' ? [{
        voice: 'lead' as const,
        pattern: join(
          rest(8), hold('F4', 8), hold('E4', 16),
          hold('D4', 16), rest(16),
          rest(8), hold('A4', 8), hold('G4', 4), hold('F4', 4), hold('E4', 8),
          hold('D4', 24), rest(8),
        ),
        gain: 0.08,
        echo: 0.5,
      }] : [],
    ],
  })),
}

const hellDrums: Track[] = [
  { voice: 'kick', pattern: 'x - - -', gain: 0.32 },
  { voice: 'snare', pattern: '- - - - x - - -', gain: 0.13 },
  { voice: 'hat', pattern: 'x x x x', gain: 0.035 },
]

// A fast race track
const hell: Song = {
  bpm: 150,
  stepsPerBeat: 4,
  cutoff: 5000,
  gain: 1.3,
  echo: { beats: 0.75, feedback: 0.25 },
  sections: [
    {
      steps: 64,
      tracks: [
        { voice: 'bass', pattern: join(...['E', 'E', 'F', 'E'].map(n => repeat(`${n}2 ${n}2 ${n}3 ${n}2`, 4))), gain: 0.15, gate: 0.6 },
        ...hellDrums,
        {
          voice: 'sawtooth',
          pattern: join(
            'E5 - - E5 - - G5 - - E5 - - B5 - A5 -',
            'G5 - F5 - E5 - - - D5 - E5 - - - - -',
            'F5 - - F5 - - A5 - - F5 - - C6 - B5 -',
            'A5 - G5 - F5 - - - E5 - - - - - - -',
          ),
          gain: 0.045,
          gate: 0.7,
          echo: 0.3,
        },
      ],
    },
    {
      steps: 64,
      tracks: [
        { voice: 'bass', pattern: join(...['C', 'D', 'E', 'E'].map(n => repeat(`${n}2 ${n}2 ${n}3 ${n}2`, 4))), gain: 0.15, gate: 0.6 },
        ...hellDrums,
        ...chords('pad', [['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['E4', 'G4', 'B4'], ['E4', 'G#4', 'B4']], 16, { gain: 0.04 }),
        { voice: 'sawtooth', pattern: join(arp(['G5', 'C6', 'E6'], 16), arp(['A5', 'D6', 'F6'], 16), arp(['B5', 'E6', 'G6'], 32)), gain: 0.025, gate: 0.5 },
      ],
    },
  ],
}

// The devil boss fight: faster than the race, with galloping drums, the devil's interval (the
// tritone, D against Ab) and the old Dies Irae chant
const hellBoss: Song = {
  bpm: 176,
  stepsPerBeat: 4,
  cutoff: 4500,
  gain: 1.1,
  echo: { beats: 0.75, feedback: 0.3 },
  sections: [
    {
      steps: 64,
      tracks: [
        { voice: 'bass', pattern: join(...['D', 'Eb', 'D', 'Ab'].map(n => repeat(`${n}2 ${n}2 ${n}3 ${n}2`, 4))), gain: 0.16, gate: 0.6 },
        ...chords('pad', [['D3', 'F3', 'Ab3'], ['Eb3', 'G3', 'Bb3'], ['D3', 'F3', 'Ab3'], ['Ab3', 'B3', 'D4']], 16, { gain: 0.05 }),
        { voice: 'kick', pattern: 'x - x - x - x x x - x - x - x x', gain: 0.28 },
        { voice: 'snare', pattern: '- - - - x - - - - - - - x - - -', gain: 0.15 },
        { voice: 'hat', pattern: 'x - x -', gain: 0.035 },
        {
          voice: 'sawtooth',
          pattern: join(
            'D4 - D4 Ab4 - D4 - G4 F4 - Eb4 - D4 - - -',
            'Eb4 - Eb4 A4 - Eb4 - Bb4 G4 - F4 - Eb4 - - -',
            'D4 - D4 Ab4 - D4 - G4 F4 - Eb4 - D4 - C#4 -',
            'D4 - - - Ab4 - - - D5 - - - Ab4 - B4 -',
          ),
          gain: 0.045,
          gate: 0.7,
          echo: 0.25,
        },
      ],
    },
    {
      steps: 64,
      tracks: [
        { voice: 'bass', pattern: join(...['D', 'Bb', 'D', 'Ab'].map(n => repeat(`${n}2 ${n}2 ${n}3 ${n}2`, 4))), gain: 0.16, gate: 0.6 },
        ...chords('pad', [['D3', 'F3', 'A3'], ['Bb2', 'D3', 'F3'], ['D3', 'F3', 'Ab3'], ['Ab3', 'B3', 'D4']], 16, { gain: 0.05 }),
        { voice: 'kick', pattern: 'x - x - x - x x x - x - x - x x', gain: 0.28 },
        { voice: 'snare', pattern: '- - - - x - - - - - - - x - - -', gain: 0.15 },
        { voice: 'hat', pattern: 'x x x x', gain: 0.03 },
        // The chant, in two octaves at once
        ...['5', '4'].map(octave => ({
          voice: octave === '5' ? 'square' as const : 'sawtooth' as const,
          pattern: join(
            ['F', 'E', 'F', 'D', 'E', 'C', 'D', 'D'].map(n => `${n}${octave} _`).join(' '),
            ['F', 'F', 'G', 'F', 'E', 'D', 'E', 'C'].map(n => `${n}${octave} _`).join(' '),
            hold(`D${octave}`, 8), hold(`F${octave}`, 4), hold(`Ab${octave}`, 4),
            hold(`D${octave}`, 12), rest(4),
          ),
          gain: octave === '5' ? 0.05 : 0.04,
          gate: 0.9,
          echo: 0.3,
        })),
      ],
    },
  ],
}

// The Corgi Kingdom: a gentle royal waltz in D, the key of the ocean music, with harp and horn.
// Its parts come back in the credits
const kingdomBass = join(...['D2', 'D2', 'C#2', 'B1', 'G1', 'F#2', 'E2', 'A1'].map(n => hold(n, 12)))
const kingdomChords = [
  ['F#3', 'A3', 'D4'], ['G3', 'B3', 'D4'], ['E3', 'A3', 'C#4'], ['F#3', 'B3', 'D4'],
  ['G3', 'B3', 'D4'], ['F#3', 'A3', 'D4'], ['G3', 'B3', 'E4'], ['E3', 'A3', 'C#4'],
]
const kingdomHarp = join(
  arp(['D4', 'A4', 'D5', 'F#5', 'D5', 'A4'], 12, 2),
  arp(['D4', 'G4', 'B4', 'D5', 'B4', 'G4'], 12, 2),
  arp(['C#4', 'E4', 'A4', 'C#5', 'A4', 'E4'], 12, 2),
  arp(['B3', 'F#4', 'B4', 'D5', 'B4', 'F#4'], 12, 2),
  arp(['G3', 'D4', 'G4', 'B4', 'G4', 'D4'], 12, 2),
  arp(['F#3', 'A3', 'D4', 'F#4', 'D4', 'A3'], 12, 2),
  arp(['E3', 'B3', 'D4', 'G4', 'D4', 'B3'], 12, 2),
  arp(['A3', 'E4', 'A4', 'C#5', 'A4', 'E4'], 12, 2),
)
const kingdomAnthem = join(
  hold('A4', 6), hold('F#4', 3), hold('A4', 3),
  hold('B4', 6), hold('A4', 3), hold('G4', 3),
  hold('E4', 6), hold('A4', 6),
  hold('F#4', 9), rest(3),
  hold('G4', 6), hold('B4', 3), hold('D5', 3),
  hold('A4', 6), hold('F#4', 6),
  hold('G4', 4), hold('F#4', 4), hold('E4', 4),
  hold('E4', 9), rest(3),
)
const kingdomSteps = kingdomChords.length * 12 // Three beats to a bar, so 12 steps

const kingdom: Song = {
  bpm: 80,
  stepsPerBeat: 4,
  cutoff: 2400,
  echo: { beats: 0.5, feedback: 0.35 },
  sections: ['harp', 'anthem'].map(part => ({
    steps: kingdomSteps,
    tracks: [
      { voice: 'sub', pattern: kingdomBass, gain: 0.2 },
      ...chords('pad', kingdomChords, 12, { gain: 0.035 }),
      { voice: 'pluck', pattern: kingdomHarp, gain: 0.06, echo: 0.3 },
      { voice: 'kick', pattern: join('x', rest(11)), gain: 0.1 }, // A soft timpani on each bar
      ...part === 'anthem' ? [{ voice: 'lead' as const, pattern: kingdomAnthem, gain: 0.09, echo: 0.3 }] : [], // Horn
    ],
  })),
}

// The credits: the Kingdom's waltz again, quicker and fuller, its tune climbing an octave the
// second time round. Two times through lasts as long as the credits roll
const credits: Song = {
  bpm: 96,
  stepsPerBeat: 4,
  cutoff: 3200,
  echo: { beats: 0.5, feedback: 0.3 },
  sections: ['reprise', 'finale'].map(part => ({
    steps: kingdomSteps,
    tracks: [
      { voice: 'sub', pattern: kingdomBass, gain: 0.2 },
      ...chords('pad', kingdomChords, 12, { gain: 0.04 }),
      { voice: 'pluck', pattern: kingdomHarp, gain: 0.06, echo: 0.3 },
      { voice: 'kick', pattern: join('x', rest(11)), gain: 0.16 },
      { voice: 'hat', pattern: part === 'finale' ? '- - x - x - x - x - x -' : '- - - - x - - - x - - -', gain: 0.03 },
      { voice: 'lead', pattern: part === 'finale' ? octaveUp(kingdomAnthem) : kingdomAnthem, gain: 0.09, echo: 0.3 },
      ...part === 'finale' ? [{ voice: 'bell' as const, pattern: kingdomAnthem, gain: 0.05, echo: 0.4 }] : [],
    ],
  })),
}

// The cave under the statue: mysterious and curious, with a marimba picking its way about,
// the odd drip and a slow tune in A dorian
const cave: Song = {
  bpm: 76,
  stepsPerBeat: 4,
  cutoff: 2000,
  echo: { beats: 1, feedback: 0.45 },
  sections: ['plink', 'explore'].map(part => ({
    steps: 128,
    tracks: [
      { voice: 'sub', pattern: join(hold('A1', 32), hold('D2', 32), hold('F1', 32), hold('E2', 32)), gain: 0.22 },
      ...chords('pad', [['E3', 'G3', 'C4'], ['F#3', 'A3', 'D4'], ['E3', 'A3', 'C4'], ['D3', 'G3', 'B3']], 32, { gain: 0.035 }),
      {
        voice: 'bell', // Marimba, every third step so it never quite lines up with the beat
        pattern: join(
          arp(['A4', 'C5', 'E5', 'G5'], 32, 3),
          arp(['A4', 'D5', 'F#5', 'A5'], 32, 3),
          arp(['A4', 'C5', 'E5', 'F5'], 32, 3),
          arp(['G4', 'B4', 'E5', 'D5'], 32, 3),
        ),
        gain: 0.035,
        echo: 0.4,
      },
      { voice: 'bell', pattern: join(rest(20), 'E6', rest(63), 'B5', rest(43)), gain: 0.03, echo: 0.7 }, // Drips
      { voice: 'hat', pattern: '- - x -', gain: 0.015 },
      ...part === 'explore' ? [{
        voice: 'lead' as const,
        pattern: join(
          rest(8), hold('E5', 4), hold('D5', 4), hold('C5', 8), hold('B4', 4), hold('A4', 4),
          hold('A4', 8), hold('B4', 4), hold('C5', 4), hold('D5', 16),
          hold('C5', 8), hold('B4', 4), hold('A4', 4), hold('G4', 8), hold('A4', 8),
          hold('B4', 16), hold('G4', 8), rest(8),
        ),
        gain: 0.08,
        echo: 0.45,
      }] : [],
    ],
  })),
}

export const Songs = { cave, kingdom, credits, corgosphere, triggerFishLair, friedEgg, friedEggBoss, depths, hell, hellBoss } satisfies Record<string, Song>
export type SongName = keyof typeof Songs

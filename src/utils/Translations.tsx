import { enFlagAsset, ruFlagAsset, svFlagAsset } from '@/assets'
import { Achievement } from './GameStateContext'

export type Locale = keyof typeof Translations

export const LocaleNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  sv: 'Svenska',
}

export const LocaleFlags: Record<Locale, string> = {
  en: enFlagAsset,
  sv: svFlagAsset,
  ru: ruFlagAsset,
}

const baseTranslations = {
  common: {
    back: 'Back',
    volumeOn: 'Volume: On',
    volumeOff: 'Volume: Off',
    resume: 'Resume',
    exitToMenu: 'Exit to Menu',
  },
  menu: {
    start: 'Start',
    continue: 'Continue',
    instructions: 'Instructions',
    options: 'Options',
    credits: 'A game by Josh Thompson and Olesya Vasileva',
  },
  options: {
    clearGameData: 'Clear Game Data',
  },
  surface: {
    relax: 'Relax!',
    getReady: 'Once you are ready, tap SPACE to breathe in',
  },
  score: {
    lastDive: 'Last Dive',
    bestDive: 'Best Dive',
    totalScore: 'Total Score',
  },
  ocean: {
    holdSpace: <>Hold <em>SPACE</em> to equalise</>,
    warningLowOxygen: 'Warning: Low Oxygen!',
  },
  watch: {
    meters: 'm',
    oxygen: <>O<sub>2</sub></>,
  },
  blackout: {
    youBlackedOut: 'You blacked out',
  },
  pause: {
    title: 'PAUSED',
    resume: 'Resume',
  },
  instructions: {
    description: 'Dive and explore with your friend Linkosha the corgi!',
    up: 'Swim forward',
    down: 'Swim backwards',
    left: 'Rotate left',
    right: 'Rotate right',
    space: 'Breathe in / Equalise air pressure',
    spacebar: 'SPACEBAR',
    pause: 'Pause',
    or: 'OR',
  },
  achievements: {
    new: 'New Achievement!',
    title: 'Achievements',
    firstDive: 'First Dive',
    whale: 'Whale Whisperer',
    whaleShark: 'Whale Shark Sighter',
    shark: 'Shark Spotter',
    wreck: 'Wreck Explorer',
    almostFaint: 'Almost Fainted',
    crabJump: 'Crab Jumper',
    total100: '100 Total',
    dive10: 'Good Dive',
    dive20: 'Amazing Dive',
    bilingual: 'Bilingual',
    surviveTitanTriggerFish: 'Titan Trigger Survivor',
    prequalisation: 'Prequalisation',
    statue: 'All hail Linkosha',
    eggFishKiss: 'Fried Egg Fish Kiss',
    blackout: 'Blackout',
    bone: 'Give A Dog A Bone',
    endOfTheWorld: 'The End of the World',
  } satisfies Record<Achievement | 'new' | 'title', string>,
}

export const Translations = {
  en: baseTranslations,
  ru: {
    common: {
      back: 'Назад',
      volumeOn: 'Громкость: Вкл',
      volumeOff: 'Громкость: Выкл',
      resume: 'Продолжить',
      exitToMenu: 'Выйти в меню',
    },
    menu: {
      start: 'Начать',
      continue: 'Продолжить',
      instructions: 'Инструкции',
      options: 'Настройки',
      credits: 'Игра от Джоша Томпсона и Олеси Васильевой',
    },
    options: {
      clearGameData: 'Очистить данные игры',
    },
    surface: {
      relax: 'Расслабься!',
      getReady: 'Когда будешь готов, нажми ПРОБЕЛ для вдоха',
    },
    score: {
      lastDive: 'Посл. погр.',
      bestDive: 'Лучший погр.',
      totalScore: 'Итог',
    },
    ocean: {
      holdSpace: <>Удерживай <em>ПРОБЕЛ</em> для выравнивания</>,
      warningLowOxygen: 'Внимание: Низкий уровень кислорода!',
    },
    watch: {
      meters: 'м',
      oxygen: <>О<sub>2</sub></>,
    },
    blackout: {
      youBlackedOut: 'Ты потерял сознание',
    },
    pause: {
      title: 'ПАУЗА',
      resume: 'Продолжить',
    },
    instructions: {
      description: 'Ныряй и исследуй вместе со своим другом корги Линкошей!',
      up: 'Вперед',
      down: 'Назад',
      left: 'Повернуть влево',
      right: 'Повернуть вправо',
      space: 'Вдохнуть / Выровнять давление',
      spacebar: 'ПРОБЕЛ',
      pause: 'Пауза',
      or: 'ИЛИ',
    },
    achievements: {
      new: 'Новое достижение!',
      title: 'Достижения',
      firstDive: 'Первое погружение',
      whale: 'Шепчущий кит',
      whaleShark: 'Наблюдатель китовой акулы',
      shark: 'Наблюдатель акул',
      wreck: 'По обломкам',
      almostFaint: 'Почти потерял сознание',
      crabJump: 'Прыжок краба',
      total100: 'Итого 100',
      dive10: 'Хорошее погружение',
      dive20: 'Потрясающее погружение',
      bilingual: 'Двуязычный',
      surviveTitanTriggerFish: 'Выживший после титана - триггера',
      prequalisation: 'Предвыравнивание',
      statue: 'Да здравствует Линкоша!',
      eggFishKiss: 'Поцелуй рыбки-яичницы',
      blackout: 'Потеря сознания',
      bone: 'Дай Собачке кость',
      endOfTheWorld: 'Доберись до края мира',
    },
  },
  sv: {
    common: {
      back: 'Tillbaka',
      volumeOn: 'Volym: På',
      volumeOff: 'Volym: Av',
      resume: 'Återuppta',
      exitToMenu: 'Gå till menyn',
    },
    menu: {
      start: 'Starta',
      continue: 'Fortsätt',
      instructions: 'Instruktioner',
      options: 'Inställningar',
      credits: 'Ett spel av Josh Thompson och Olesya Vasileva',
    },
    options: {
      clearGameData: 'Rensa speldata',
    },
    surface: {
      relax: 'Koppla av!',
      getReady: 'När du är redo, tryck på MELLANSLAG för att andas in',
    },
    score: {
      lastDive: 'Senaste dyket',
      bestDive: 'Bästa dyket',
      totalScore: 'Total poäng',
    },
    ocean: {
      holdSpace: <>Håll <em>MELLANSLAG</em> för att utjämna</>,
      warningLowOxygen: 'Varning: Låg syrenivå!',
    },
    watch: {
      meters: 'm',
      oxygen: <>O<sub>2</sub></>,
    },
    blackout: {
      youBlackedOut: 'Du svimmar av',
    },
    pause: {
      title: 'PAUSAD',
      resume: 'Återuppta',
    },
    instructions: {
      description: 'Dyk och utforska med din vän corgin Linkosha!',
      up: 'Simma framåt',
      down: 'Simma bakåt',
      left: 'Rotera vänster',
      right: 'Rotera höger',
      space: 'Andas in / Tryckutjämna',
      spacebar: 'MELLANSLAG',
      pause: 'Pausa',
      or: 'ELLER',
    },
    achievements: {
      new: 'Ny Prestation!',
      title: 'Prestationer',
      firstDive: 'Första dyket',
      whale: 'Valviskaren',
      whaleShark: 'Valhajspan',
      shark: 'Hajspanaren',
      wreck: 'Vrakutforsk',
      almostFaint: 'Svimma nästan',
      crabJump: 'Krabphoppare',
      total100: '100 Totalt',
      dive10: 'Bra dyk',
      dive20: 'Otroligt dyk',
      bilingual: 'Tvåspråkig',
      surviveTitanTriggerFish: 'Överlevare av Titan Triggerfish',
      prequalisation: 'Förtryckutjämning',
      statue: 'Heja Linkosha!',
      eggFishKiss: 'Kyss av en Stekt Äggfisk',
      blackout: 'Blackout',
      bone: 'Ge Hunden Ett Ben',
      endOfTheWorld: 'Världens ände',
    },
  }
} as const satisfies  Record<string, typeof baseTranslations>

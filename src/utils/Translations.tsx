import enFlag from '@assets/flags/en.png'
import svFlag from '@assets/flags/sv.png'
import ruFlag from '@assets/flags/ru.png'

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
    instructions: 'Instructions',
    options: 'Options',
    credits: 'A game by Josh Thompson and Olesya Vasileva',
  },
  options: {
    clearScoreData: 'Clear Score Data',
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
    oxygen: 'O₂',
  },
  blackout: {
    youBlackedOut: 'You blacked out',
  },
  pause: {
    title: 'PAUSED',
    resume: 'Resume',
  },
  instructions: {
    description: 'Dive and explore with your friend Linkosha the corgi',
    up: 'Swim forward',
    down: 'Swim backwards',
    left: 'Rotate left',
    right: 'Rotate right',
    space: 'Breathe in / Equalise air pressure',
    spacebar: 'SPACEBAR',
  },
}

export const languageNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  sv: 'Svenska',
}

export const flags: Record<Locale, string> = {
  en: enFlag,
  sv: svFlag,
  ru: ruFlag,
}

export type Locale = keyof typeof translations
type TranslationSet = typeof baseTranslations

export const translations = {
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
      instructions: 'Инструкции',
      options: 'Настройки',
      credits: 'Игра от Джоша Томпсона и Олеси Васильевой',
    },
    options: {
      clearScoreData: 'Очистить данные счета',
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
      oxygen: 'О₂',
    },
    blackout: {
      youBlackedOut: 'Ты потерял сознание',
    },
    pause: {
      title: 'ПАУЗА',
      resume: 'Продолжить',
    },
    instructions: {
      description: 'Ныряй и исследуй вместе со своим другом корги Линкошей',
      up: 'Вперед',
      down: 'Назад',
      left: 'Повернуть влево',
      right: 'Повернуть вправо',
      space: 'Вдохнуть / Выровнять давление',
      spacebar: 'ПРОБЕЛ',
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
      instructions: 'Instruktioner',
      options: 'Inställningar',
      credits: 'Ett spel av Josh Thompson och Olesya Vasileva',
    },
    options: {
      clearScoreData: 'Rensa Poängdata',
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
      oxygen: 'O₂',
    },
    blackout: {
      youBlackedOut: 'Du svimmar av',
    },
    pause: {
      title: 'PAUSAD',
      resume: 'Återuppta',
    },
    instructions: {
      description: 'Dyk och utforska med din vän corgin Linkosha',
      up: 'Simma framåt',
      down: 'Simma bakåt',
      left: 'Rotera vänster',
      right: 'Rotera höger',
      space: 'Andas in / Tryckutjämna',
      spacebar: 'MELLANSLAG',
    },
  }
} as const satisfies  Record<string, TranslationSet>

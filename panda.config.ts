import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customisation
  theme: {
    tokens: {
      fonts: {
        main: {
          value: '"Mona Sans", sans-serif',
        },
      },
      colors: {
        primary: { value: '#0F1F29' },
      },
      spacing: {
        'spacing-4': { value: '4px' },
        'spacing-8': { value: '8px' },
        'spacing-16': { value: '16px' },
        'spacing-24': { value: '24px' },
        'spacing-32': { value: '32px' },
        'spacing-64': { value: '64px' },
      },
    },
    textStyles: {
      title: {
        description: 'Page titles',
        value: {
          fontSize: '32px',
          fontWeight: '700',
          lineHeight: '45px',
        },
      },
    },
    breakpoints: {
      sm: '400px',
      md: '600px',
      lg: '800px',
    },

    keyframes: {
      flash: {
        '0%, 100%': { opacity: 0 },
        '50%': { opacity: 0.2 },
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      lightRay: {
        '0%, 100%': { opacity: 0 },
        '50%': { opacity: 0.2 },
      },
      gift: {
        '0%': {
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.5)',
        },
        '10%, 90%': {
          opacity: 1,
        },
        '100%': {
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(1.5)',
        },
      }
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',
})

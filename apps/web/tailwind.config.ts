import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'notebook-paper': 'var(--notebook-paper)',
        'notebook-paper-alt': 'var(--notebook-paper-alt)',
        'notebook-paper-white': 'var(--notebook-paper-white)',
        'notebook-line': 'var(--notebook-line)',
        'notebook-ink': 'var(--notebook-ink)',
        'notebook-ink-medium': 'var(--notebook-ink-medium)',
        'notebook-ink-light': 'var(--notebook-ink-light)',
        'notebook-ink-red': 'var(--notebook-ink-red)',
        'notebook-ink-blue': 'var(--notebook-ink-blue)',
        'notebook-ink-green': 'var(--notebook-ink-green)',
        'notebook-highlight-yellow': 'var(--notebook-highlight-yellow)',
        'notebook-highlight-pink': 'var(--notebook-highlight-pink)',
        'notebook-highlight-mint': 'var(--notebook-highlight-mint)',
      },
      fontFamily: {
        caveat: ['var(--font-caveat)', 'cursive'],
        'patrick-hand': ['var(--font-patrick-hand)', 'cursive'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'notebook-sm': 'var(--notebook-shadow-sm)',
        'notebook-md': 'var(--notebook-shadow-md)',
        'notebook-lg': 'var(--notebook-shadow-lg)',
        'notebook-hover': 'var(--notebook-shadow-hover)',
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      addUtilities({
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
      })
    },
  ],
}

export default config

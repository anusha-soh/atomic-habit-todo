import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints (default Tailwind breakpoints)
      screens: {
        'sm': '640px',   // Large phones, landscape
        'md': '768px',   // Tablets
        'lg': '1024px',  // Small desktops
        'xl': '1280px',  // Large desktops
        '2xl': '1536px', // Extra large screens
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [
    // Custom touch-target utility plugin
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

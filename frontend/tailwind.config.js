/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F5F0',
        sand: '#EAE5DC',
        charcoal: '#24231F',
        warmgrey: '#858078',
        bronze: {
          DEFAULT: '#A68155',
          light: '#BA966D',
          dark: '#8C6940'
        },
        olive: {
          DEFAULT: '#777B60',
          light: '#8F9377',
          dark: '#5F634A'
        },
        beige: '#DDD7CC',
        espresso: '#25241F',
        sage: {
          DEFAULT: '#72816B',
          light: '#87977F',
          dark: '#5D6B57'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'editorial': '0 4px 20px -2px rgba(36, 35, 31, 0.05), 0 2px 6px -1px rgba(36, 35, 31, 0.03)',
        'editorial-lg': '0 12px 32px -4px rgba(36, 35, 31, 0.08), 0 4px 12px -2px rgba(36, 35, 31, 0.04)',
        'bronze-glow': '0 0 15px rgba(166, 129, 85, 0.25)',
      }
    },
  },
  plugins: [],
}

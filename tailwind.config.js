/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        campus: {
          950: '#05070d',
          900: '#070a12',
          850: '#0a0e1a',
          800: '#0e1424',
          750: '#131b31',
          700: '#192440',
          border: '#1e293b',
          'border-light': '#2d3b55',
          blue: '#3b82f6',
          'blue-electric': '#2563eb',
          cyan: '#06b6d4',
          'cyan-bright': '#22d3ee',
          purple: '#8b5cf6',
          'purple-accent': '#a855f7',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% -20%, rgba(56, 189, 248, 0.15), rgba(59, 130, 246, 0.08) 35%, rgba(139, 92, 246, 0.03) 60%, transparent 80%)',
        'card-glow': 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
      },
      boxShadow: {
        'glow-blue': '0 0 35px -5px rgba(59, 130, 246, 0.3)',
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.3)',
        'glow-purple': '0 0 35px -5px rgba(139, 92, 246, 0.25)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}

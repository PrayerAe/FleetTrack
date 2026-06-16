/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070810',
          900: '#0b0d18',
          850: '#0f1222',
          800: '#141831',
          700: '#1b2042',
        },
        brand: {
          violet: '#7c3aed',
          blue: '#2563eb',
          cyan: '#0ea5e9',
          green: '#16a34a',
        },
        status: {
          rented: '#3b82f6',
          available: '#22c55e',
          alert: '#ef4444',
          maint: '#94a3b8',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,58,237,0.25), 0 8px 40px -8px rgba(124,58,237,0.45)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(1200px 600px at 15% -10%, rgba(124,58,237,0.18), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(14,165,233,0.14), transparent 55%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.7)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
}

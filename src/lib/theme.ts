export type Theme = 'light' | 'dark'

const KEY = 'ft-theme'

export function getTheme(): Theme {
  const saved = localStorage.getItem(KEY)
  return saved === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  localStorage.setItem(KEY, theme)
}

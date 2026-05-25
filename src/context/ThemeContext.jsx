import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'pnlq:theme'
const THEMES = ['light', 'dark', 'hc']
const ThemeContext = createContext(null)

function readInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && THEMES.includes(stored)) return stored
  } catch {
    // localStorage no disponible (modo privado estricto): caer al default
  }
  if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) return 'hc'
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme)

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage no disponible: no persistir, sin romper
    }
  }, [theme])

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) setThemeState(next)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEMES.indexOf(prev)
      return THEMES[(idx + 1) % THEMES.length]
    })
  }, [])

  const value = useMemo(() => ({ theme, setTheme, cycleTheme, themes: THEMES }), [theme, setTheme, cycleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}

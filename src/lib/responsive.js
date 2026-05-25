import { useEffect, useState } from 'react'

/**
 * Suscripción reactiva a un media query CSS.
 * Devuelve true cuando el query coincide.
 */
export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false)
  const [matches, setMatches] = useState(get)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    setMatches(mql.matches)
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }
    // Safari < 14
    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [query])

  return matches
}

/** Atajos comunes. Mantienen la API de Tailwind (`lg` = 1024px). */
export const useIsMobile = () => useMediaQuery('(max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

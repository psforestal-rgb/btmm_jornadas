import { useEffect, useId, useRef } from 'react'

/**
 * Hook ligero que cierra un modal al pulsar Escape, sin requerir restructurar
 * su JSX. Útil para los modales existentes que no usan <Modal/> directamente.
 */
export function useEscapeClose(onClose) {
  useEffect(() => {
    if (!onClose) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
}


const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function focusableInside(root) {
  if (!root) return []
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null)
}

/**
 * Hook que dota a un modal de:
 *  - foco inicial (al primer focusable o al contenedor),
 *  - trampa de foco (Tab/Shift+Tab no escapa al contenido bajo el modal),
 *  - cierre con Esc,
 *  - restauración del foco al disparador al cerrarse.
 *
 * Devuelve { ref, titleId, descId }. Aplique ref al contenedor del modal y
 * use titleId/descId en aria-labelledby/aria-describedby.
 */
export function useModalA11y({ open = true, onClose, initialFocusRef } = {}) {
  const ref = useRef(null)
  const previousActive = useRef(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!open) return undefined
    previousActive.current = typeof document !== 'undefined' ? document.activeElement : null

    const root = ref.current
    if (!root) return undefined

    const focusInitial = () => {
      const target = initialFocusRef?.current ?? focusableInside(root)[0] ?? root
      try {
        target.focus({ preventScroll: true })
      } catch {
        // Ignorar: si el elemento no es focusable, dejarlo
      }
    }
    const t = window.setTimeout(focusInitial, 0)

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = focusableInside(root)
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !root.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKeyDown)
      const prev = previousActive.current
      if (prev && typeof prev.focus === 'function') {
        try { prev.focus({ preventScroll: true }) } catch { /* ignore */ }
      }
    }
  }, [open, onClose, initialFocusRef])

  return { ref, titleId, descId }
}

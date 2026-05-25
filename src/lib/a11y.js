import { useEffect, useId, useRef } from 'react'

/**
 * Pila global de handlers de Escape. Solo el handler del modal "topmost"
 * (último en montarse) consume la pulsación. Esto evita que dos modales
 * apilados se cierren con una sola tecla Esc.
 *
 * El listener de `document` se instala una sola vez (perezosamente).
 */
const escStack = []
let escListenerInstalled = false

function handleDocumentEscape(e) {
  if (e.key !== 'Escape') return
  const top = escStack[escStack.length - 1]
  if (!top) return
  // stopImmediatePropagation evita que otros listeners en document corran
  // y stopPropagation evita que el evento siga subiendo al window.
  if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation()
  e.stopPropagation()
  top()
}

function ensureEscListenerInstalled() {
  if (escListenerInstalled || typeof document === 'undefined') return
  // capture=true para correr antes que otros listeners en burbuja.
  document.addEventListener('keydown', handleDocumentEscape, true)
  escListenerInstalled = true
}

function pushEscHandler(handler) {
  ensureEscListenerInstalled()
  escStack.push(handler)
  return () => {
    // Removemos la última ocurrencia del handler (no usamos índice fijo por
    // si el mismo handler se registra dos veces — improbable, pero seguro).
    const idx = escStack.lastIndexOf(handler)
    if (idx >= 0) escStack.splice(idx, 1)
  }
}

// Export solo para tests.
export function _getEscStackSize() {
  return escStack.length
}

/**
 * Hook ligero que cierra un modal al pulsar Escape, sin requerir
 * restructurar su JSX. Solo el modal topmost consume la pulsación.
 */
export function useEscapeClose(onClose) {
  useEffect(() => {
    if (!onClose) return undefined
    return pushEscHandler(() => onClose())
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
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null,
  )
}

/**
 * Hook que dota a un modal de:
 *  - foco inicial (al primer focusable o al contenedor),
 *  - trampa de foco scoped al ref del modal (no se mezcla con modales padre),
 *  - cierre con Esc (vía pila global; solo topmost responde),
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

    // Tab/Shift+Tab: trap scoped al root del modal. Listener directamente
    // sobre el root para que los modales hijos lo intercepten antes que
    // los padres (al estar más profundos en la captura/burbuja).
    const onTab = (e) => {
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

    root.addEventListener('keydown', onTab)

    // Esc: registrado en la pila global; solo topmost dispara.
    const popEsc = onClose ? pushEscHandler(() => onClose()) : undefined

    return () => {
      window.clearTimeout(t)
      root.removeEventListener('keydown', onTab)
      popEsc?.()
      const prev = previousActive.current
      if (prev && typeof prev.focus === 'function') {
        try { prev.focus({ preventScroll: true }) } catch { /* ignore */ }
      }
    }
  }, [open, onClose, initialFocusRef])

  return { ref, titleId, descId }
}

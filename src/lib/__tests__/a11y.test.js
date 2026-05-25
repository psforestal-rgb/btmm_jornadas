/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEscapeClose, _getEscStackSize } from '../a11y.js'

function dispatchEscape() {
  const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  document.dispatchEvent(ev)
}

describe('useEscapeClose — stack de modales', () => {
  let outer, inner
  beforeEach(() => {
    outer = vi.fn()
    inner = vi.fn()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('un solo modal: Esc dispara onClose', () => {
    const r = renderHook(() => useEscapeClose(outer))
    expect(_getEscStackSize()).toBeGreaterThanOrEqual(1)
    dispatchEscape()
    expect(outer).toHaveBeenCalledTimes(1)
    r.unmount()
  })

  it('dos modales apilados: Esc cierra solo el topmost (innerm) y no el outer', () => {
    const a = renderHook(() => useEscapeClose(outer))
    const b = renderHook(() => useEscapeClose(inner))
    dispatchEscape()
    expect(inner).toHaveBeenCalledTimes(1)
    expect(outer).toHaveBeenCalledTimes(0)
    b.unmount()
    a.unmount()
  })

  it('tras cerrar el topmost, una nueva pulsación cierra el siguiente', () => {
    const a = renderHook(() => useEscapeClose(outer))
    const b = renderHook(() => useEscapeClose(inner))
    dispatchEscape()           // cierra inner (en lógica real)
    b.unmount()                // simula cierre del inner
    dispatchEscape()           // ahora outer es el top
    expect(outer).toHaveBeenCalledTimes(1)
    expect(inner).toHaveBeenCalledTimes(1)
    a.unmount()
  })

  it('handler null/undefined no se registra ni rompe', () => {
    const r = renderHook(() => useEscapeClose(null))
    dispatchEscape()
    r.unmount()
    // no debe lanzar
    expect(true).toBe(true)
  })

  it('al desmontar, el handler sale del stack', () => {
    const before = _getEscStackSize()
    const r = renderHook(() => useEscapeClose(outer))
    expect(_getEscStackSize()).toBe(before + 1)
    r.unmount()
    expect(_getEscStackSize()).toBe(before)
  })
})

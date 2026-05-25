/**
 * Persistencia local del estado de la aplicación.
 *
 * Fase 5 paso 0: localStorage con `schemaVersion`.
 * Diseñado para evolucionar a IndexedDB (Dexie) preservando la misma API
 * pública (loadState/saveState/exportSnapshot/importSnapshot).
 *
 * Si la versión persistida no coincide con `SCHEMA_VERSION`, se crea un
 * backup automático (`pnlq:backup:vN`) y se descarta el estado obsoleto
 * para evitar leer estructuras incompatibles.
 */

export const STORAGE_KEY = 'pnlq:state'
export const SCHEMA_VERSION = 1
export const LAST_SAVED_KEY = 'pnlq:lastSavedAt'

const BACKUP_PREFIX = 'pnlq:backup:v'

function safeStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const k = '__pnlq_probe__'
    window.localStorage.setItem(k, '1')
    window.localStorage.removeItem(k)
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Carga el estado persistido. Devuelve null si no hay nada, si el JSON
 * está corrupto o si la versión de esquema no coincide.
 */
export function loadState() {
  const ls = safeStorage()
  if (!ls) return null
  const raw = ls.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      // Backup automático antes de descartar.
      const backupKey = `${BACKUP_PREFIX}${parsed.schemaVersion ?? 'unknown'}-${Date.now()}`
      try { ls.setItem(backupKey, raw) } catch { /* sin espacio: ignorar */ }
      return null
    }
    return parsed.state ?? null
  } catch {
    return null
  }
}

/**
 * Persiste el estado completo. Captura excepciones (cuota llena, modo
 * privado estricto) sin propagar al árbol React.
 *
 * Devuelve true si el guardado fue exitoso.
 */
export function saveState(state) {
  const ls = safeStorage()
  if (!ls) return false
  try {
    const payload = JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      state,
    })
    ls.setItem(STORAGE_KEY, payload)
    ls.setItem(LAST_SAVED_KEY, new Date().toISOString())
    return true
  } catch {
    return false
  }
}

export function clearState() {
  const ls = safeStorage()
  if (!ls) return false
  try {
    ls.removeItem(STORAGE_KEY)
    ls.removeItem(LAST_SAVED_KEY)
    return true
  } catch {
    return false
  }
}

export function getLastSavedAt() {
  const ls = safeStorage()
  if (!ls) return null
  try {
    return ls.getItem(LAST_SAVED_KEY)
  } catch {
    return null
  }
}

/** Devuelve un objeto exportable (snapshot) con metadatos. */
export function exportSnapshot(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    appName: 'PNLQ — Gestión de Jornadas',
    unidad: 'PNLQ-BTMM',
    areaConservacion: 'ACC',
    exportadoEn: new Date().toISOString(),
    state,
  }
}

/**
 * Valida que un snapshot importado sea compatible con la versión actual.
 * No mezcla con el estado existente: la decisión queda en el llamador.
 *
 * Retorna { ok, reason, state }.
 */
export function parseSnapshot(text) {
  try {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object') return { ok: false, reason: 'JSON inválido' }
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return { ok: false, reason: `Versión de esquema incompatible: encontrada v${parsed.schemaVersion ?? '?'} esperada v${SCHEMA_VERSION}` }
    }
    if (!parsed.state || typeof parsed.state !== 'object') return { ok: false, reason: 'Snapshot sin estado' }
    return { ok: true, state: parsed.state, exportadoEn: parsed.exportadoEn }
  } catch (e) {
    return { ok: false, reason: `JSON malformado: ${e.message}` }
  }
}

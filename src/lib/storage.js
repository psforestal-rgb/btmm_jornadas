/**
 * Persistencia local del estado de la aplicación.
 *
 * Fase 5 paso 0: localStorage con `schemaVersion`.
 * Fase 5 paso 1: dual-write con IndexedDB vía Dexie (src/lib/db.js).
 *
 * Estrategia:
 *  - `loadState()` SIGUE SIENDO SÍNCRONO y lee de localStorage. Esto
 *    permite arranque inmediato sin esperar a IndexedDB.
 *  - `loadStateAsync()` lee de IndexedDB (si está disponible) y mezcla
 *    con localStorage como fallback. Es lo que el AppContext usa para
 *    hidratar tras el primer render.
 *  - `saveState()` escribe en localStorage (caché) Y dispara una
 *    escritura async a IndexedDB (durable). Si el sync local falla
 *    pero Dexie no, los datos no se pierden.
 *  - `clearState()` borra ambos backends.
 *
 * Migración: la primera vez que se llame a `loadStateAsync()`, si
 * IndexedDB está vacío y localStorage tiene datos, se copia
 * automáticamente. Idempotente.
 *
 * Si la versión persistida no coincide con `SCHEMA_VERSION`, se crea
 * un backup automático (`pnlq:backup:vN`) y se descarta el estado
 * obsoleto para evitar leer estructuras incompatibles.
 */

import {
  loadFromDexie,
  saveToDexie,
  clearDexie,
  migrateFromLocalStorageIfNeeded,
  getLastSavedFromDexie,
  wipeDexie,
} from "./db.js";

export const STORAGE_KEY = "pnlq:state";
export const SCHEMA_VERSION = 1;
export const LAST_SAVED_KEY = "pnlq:lastSavedAt";

const BACKUP_PREFIX = "pnlq:backup:v";

function safeStorage() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const k = "__pnlq_probe__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Carga el estado persistido desde localStorage (síncrono). Devuelve
 * null si no hay nada, si el JSON está corrupto o si la versión de
 * esquema no coincide.
 */
export function loadState() {
  const ls = safeStorage();
  if (!ls) return null;
  const raw = ls.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      const backupKey = `${BACKUP_PREFIX}${parsed.schemaVersion ?? "unknown"}-${Date.now()}`;
      try { ls.setItem(backupKey, raw); } catch { /* sin espacio: ignorar */ }
      return null;
    }
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

/**
 * Carga el estado desde IndexedDB (asíncrono). Si IndexedDB está
 * vacío y localStorage tiene datos, los migra automáticamente.
 *
 * Devuelve `{ state, source, migrated }` donde `source` indica de
 * dónde provino el snapshot (`indexeddb` | `localStorage` | `null`).
 */
export async function loadStateAsync() {
  // Migración automática (idempotente): copia LS → Dexie si Dexie vacío.
  const mig = await migrateFromLocalStorageIfNeeded();

  const fromDexie = await loadFromDexie();
  if (fromDexie) {
    return { state: fromDexie, source: "indexeddb", migrated: mig.migrated };
  }
  // Fallback síncrono si Dexie no devolvió nada.
  const fromLS = loadState();
  if (fromLS) {
    return { state: fromLS, source: "localStorage", migrated: false };
  }
  return { state: null, source: null, migrated: false };
}

/**
 * Persiste el estado: escribe sincrónicamente a localStorage (caché
 * rápido) y dispara escritura async a IndexedDB (durable). El
 * resultado boolean refleja solo el éxito de localStorage; la
 * escritura a Dexie es "fire and forget" para no bloquear React.
 */
export function saveState(state) {
  const ls = safeStorage();
  let okLs = false;
  if (ls) {
    try {
      const payload = JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        state,
      });
      ls.setItem(STORAGE_KEY, payload);
      ls.setItem(LAST_SAVED_KEY, new Date().toISOString());
      okLs = true;
    } catch {
      okLs = false;
    }
  }
  // Async a Dexie. No await — el caller no necesita esperar.
  saveToDexie(state).catch(() => { /* silencioso */ });
  return okLs;
}

/** Borra el estado de ambos backends. */
export function clearState() {
  const ls = safeStorage();
  if (ls) {
    try {
      ls.removeItem(STORAGE_KEY);
      ls.removeItem(LAST_SAVED_KEY);
    } catch { /* ignorar */ }
  }
  // Async a Dexie. No await.
  wipeDexie().catch(() => { /* silencioso */ });
  return true;
}

export function getLastSavedAt() {
  const ls = safeStorage();
  if (!ls) return null;
  try {
    return ls.getItem(LAST_SAVED_KEY);
  } catch {
    return null;
  }
}

/**
 * Igual que `getLastSavedAt` pero consulta IndexedDB; útil para
 * mostrar al usuario cuándo se guardó en el backend durable.
 */
export async function getLastSavedAtAsync() {
  return await getLastSavedFromDexie();
}

/** Devuelve un objeto exportable (snapshot) con metadatos. */
export function exportSnapshot(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    appName: "PNLQ — Gestión de Jornadas",
    unidad: "PNLQ-BTMM",
    areaConservacion: "ACC",
    exportadoEn: new Date().toISOString(),
    state,
  };
}

/**
 * Valida que un snapshot importado sea compatible con la versión actual.
 * No mezcla con el estado existente: la decisión queda en el llamador.
 *
 * Retorna { ok, reason, state }.
 */
export function parseSnapshot(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") return { ok: false, reason: "JSON inválido" };
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return { ok: false, reason: `Versión de esquema incompatible: encontrada v${parsed.schemaVersion ?? "?"} esperada v${SCHEMA_VERSION}` };
    }
    if (!parsed.state || typeof parsed.state !== "object") return { ok: false, reason: "Snapshot sin estado" };
    return { ok: true, state: parsed.state, exportadoEn: parsed.exportadoEn };
  } catch (e) {
    return { ok: false, reason: `JSON malformado: ${e.message}` };
  }
}

/**
 * Indica qué backend de almacenamiento durable está activo en este
 * entorno: `'indexeddb'` (Dexie OK), `'localStorage'` (Dexie no
 * disponible pero LS sí), o `'none'` (modo privado estricto sin
 * almacenamiento alguno).
 */
export function getBackendInfo() {
  const hasIDB = typeof indexedDB !== "undefined";
  const hasLS = !!safeStorage();
  if (hasIDB) return { kind: "indexeddb", hasIDB, hasLS };
  if (hasLS) return { kind: "localStorage", hasIDB: false, hasLS: true };
  return { kind: "none", hasIDB: false, hasLS: false };
}


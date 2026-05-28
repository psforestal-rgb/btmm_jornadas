/**
 * IndexedDB con Dexie. Fase 5 paso 1 del plan.
 *
 * Diseño:
 *  - Un solo store `state` con clave fija (`SNAPSHOT_ID`) que contiene
 *    el snapshot completo del estado (personas, actividadesPlan, roleData,
 *    reglas). Este patrón "single-document store" mantiene la semántica
 *    actual (snapshot atómico) y facilita la migración futura a stores
 *    por entidad sin romper compatibilidad de API.
 *  - Un store `auditoria` con índice por fecha; preparado para Fase 5
 *    paso 2 (registro de quién hizo qué). Hoy se crea pero no se usa.
 *  - Un store `pendientes` con cola de cambios offline; preparado para
 *    futuro sync con backend SINAC.
 *
 * Optimización de bundle:
 *  - Dexie se carga DINÁMICAMENTE con `import("dexie")` la primera vez
 *    que algún consumidor pide la base. Esto deja Dexie fuera del bundle
 *    inicial (~30 KB gzip), permitiendo arranques rápidos sin perder
 *    persistencia durable.
 *
 * Migración:
 *  - Si IndexedDB está vacío y hay localStorage de Fase 5 paso 0,
 *    `migrateFromLocalStorageIfNeeded()` copia el snapshot.
 *  - El localStorage existente se conserva como caché sincrónico para
 *    arranques rápidos (loadState() sigue siendo síncrono).
 */

export const SCHEMA_VERSION_DB = 1;
export const SNAPSHOT_ID = "current";
const LS_STATE_KEY = "pnlq:state";
const LS_LAST_SAVED_KEY = "pnlq:lastSavedAt";

let dbInstance = null;
let dbLoadPromise = null;

/**
 * Devuelve la instancia singleton de Dexie. La primera invocación carga
 * el módulo de forma dinámica (lazy) para mantener el bundle inicial
 * pequeño. Llamadas posteriores son síncronas a través de `dbInstance`.
 */
export async function getDb() {
  if (dbInstance) return dbInstance;
  if (typeof indexedDB === "undefined") return null;
  if (dbLoadPromise) return dbLoadPromise;
  dbLoadPromise = (async () => {
    try {
      const { default: Dexie } = await import("dexie");
      const db = new Dexie("pnlq");
      db.version(1).stores({
        state: "id",
        auditoria: "++id, fecha, accion",
        pendientes: "++id, creadoEn, tipo",
      });
      dbInstance = db;
      return db;
    } catch {
      return null;
    } finally {
      dbLoadPromise = null;
    }
  })();
  return dbLoadPromise;
}

/**
 * Lee el snapshot desde IndexedDB. Devuelve null si:
 *  - IndexedDB no está disponible (modo privado estricto, SSR),
 *  - el snapshot no existe todavía,
 *  - la schemaVersion guardada no coincide con la actual.
 */
export async function loadFromDexie() {
  const db = await getDb();
  if (!db) return null;
  try {
    const row = await db.state.get(SNAPSHOT_ID);
    if (!row) return null;
    if (row.schemaVersion !== SCHEMA_VERSION_DB) return null;
    return row.payload ?? null;
  } catch {
    return null;
  }
}

/**
 * Persiste el snapshot en IndexedDB. Retorna `true` si el guardado
 * fue exitoso, `false` si falló (no propaga excepciones).
 */
export async function saveToDexie(payload) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.state.put({
      id: SNAPSHOT_ID,
      schemaVersion: SCHEMA_VERSION_DB,
      savedAt: new Date().toISOString(),
      payload,
    });
    return true;
  } catch {
    return false;
  }
}

/** Borra el snapshot. */
export async function clearDexie() {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.state.delete(SNAPSHOT_ID);
    return true;
  } catch {
    return false;
  }
}

/**
 * Si IndexedDB está vacío y existe un snapshot en localStorage (Fase 5
 * paso 0), lo copia a IndexedDB. Sin efecto si IndexedDB ya tiene datos
 * o si localStorage no tiene nada. Idempotente.
 *
 * Devuelve `{ migrated: boolean, source: 'localStorage' | null }`.
 */
export async function migrateFromLocalStorageIfNeeded() {
  const db = await getDb();
  if (!db) return { migrated: false, source: null };
  try {
    const existing = await db.state.get(SNAPSHOT_ID);
    if (existing) return { migrated: false, source: null };
    if (typeof window === "undefined" || !window.localStorage) return { migrated: false, source: null };
    const raw = window.localStorage.getItem(LS_STATE_KEY);
    if (!raw) return { migrated: false, source: null };
    const parsed = JSON.parse(raw);
    if (!parsed?.state) return { migrated: false, source: null };
    await db.state.put({
      id: SNAPSHOT_ID,
      schemaVersion: SCHEMA_VERSION_DB,
      savedAt: parsed.savedAt || new Date().toISOString(),
      payload: parsed.state,
      migradoDeLocalStorage: true,
    });
    return { migrated: true, source: "localStorage" };
  } catch {
    return { migrated: false, source: null };
  }
}

/** Devuelve la marca de tiempo del último snapshot guardado en Dexie. */
export async function getLastSavedFromDexie() {
  const db = await getDb();
  if (!db) return null;
  try {
    const row = await db.state.get(SNAPSHOT_ID);
    return row?.savedAt || null;
  } catch {
    return null;
  }
}

/**
 * Encola un cambio para sincronizar con el backend SINAC en el futuro.
 * Hoy es un campo informativo; cuando exista la API REST se procesará.
 */
export async function encolarCambio({ tipo, datos }) {
  const db = await getDb();
  if (!db) return null;
  try {
    return await db.pendientes.add({
      tipo,
      datos,
      creadoEn: new Date().toISOString(),
    });
  } catch {
    return null;
  }
}

/** Cuenta cuántos cambios hay sin sincronizar (placeholder Fase 5 paso 2). */
export async function contarPendientes() {
  const db = await getDb();
  if (!db) return 0;
  try {
    return await db.pendientes.count();
  } catch {
    return 0;
  }
}

/** Limpia toda la base. Usado por "Reiniciar datos semilla". */
export async function wipeDexie() {
  const db = await getDb();
  if (!db) return false;
  try {
    await Promise.all([
      db.state.clear(),
      db.pendientes.clear(),
      db.auditoria.clear(),
    ]);
    return true;
  } catch {
    return false;
  }
}

// Exports auxiliares usados por tests (no romper si Dexie no inicia).
export const __INTERNALS__ = {
  LS_STATE_KEY,
  LS_LAST_SAVED_KEY,
  resetSingleton() { dbInstance = null; },
};

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { baseFuncionarios } from "../data/seedFuncionarios.js";
import { baseActividadesPlan } from "../data/seedActividades.js";
import {
  loadState,
  loadStateAsync,
  saveState,
  clearState,
  getLastSavedAt,
  getBackendInfo,
  SCHEMA_VERSION,
} from "../lib/storage.js";
import { REGLAS_DEFAULT, mergeReglas } from "../config/reglas.js";

const AppContext = createContext(null);

// Estado por defecto (datos semilla) cuando no hay nada persistido.
const seedState = {
  view: "dashboard",
  personas: baseFuncionarios,
  month: 4,
  year: 2026,
  compact: false,
  roleData: {},
  actividadesPlan: baseActividadesPlan,
  diaVista: "2026-05-19",
  reglas: { ...REGLAS_DEFAULT },
};

// Inicializador perezoso: intenta cargar desde storage, cae al seed.
function initialState() {
  const stored = loadState();
  if (!stored) return seedState;
  // Mezcla defensiva: si el shape persistido no tiene todos los campos,
  // completamos con seed para evitar `undefined`. Las reglas se mezclan
  // con los defaults para garantizar que campos nuevos (futuras versiones)
  // siempre tengan un valor.
  return {
    ...seedState,
    ...stored,
    reglas: mergeReglas(stored.reglas),
  };
}

function resolveUpdater(value, current) {
  return typeof value === "function" ? value(current) : value;
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.payload };
    case "SET_MONTH":
      return { ...state, month: resolveUpdater(action.payload, state.month) };
    case "SET_YEAR":
      return { ...state, year: resolveUpdater(action.payload, state.year) };
    case "SET_PERIODO":
      return { ...state, month: action.month, year: action.year };
    case "SET_COMPACT":
      return { ...state, compact: resolveUpdater(action.payload, state.compact) };
    case "SET_DIA_VISTA":
      return { ...state, diaVista: resolveUpdater(action.payload, state.diaVista) };
    case "SET_PERSONAS":
      return { ...state, personas: resolveUpdater(action.payload, state.personas) };
    case "SET_ACTIVIDADES_PLAN":
      return { ...state, actividadesPlan: resolveUpdater(action.payload, state.actividadesPlan) };
    case "SET_ROLE_DATA":
      return { ...state, roleData: resolveUpdater(action.payload, state.roleData) };
    case "SET_REGLAS": {
      const next = resolveUpdater(action.payload, state.reglas);
      return { ...state, reglas: mergeReglas(next) };
    }
    case "REPLACE_STATE":
      // Reemplaza completamente el estado persistido (import JSON o reset).
      return {
        ...seedState,
        ...action.payload,
        reglas: mergeReglas(action.payload?.reglas),
      };
    default:
      return state;
  }
}

// Campos del estado que NO se persisten (UI ephemera).
const EPHEMERAL_KEYS = new Set(["view", "compact", "diaVista", "month", "year"]);

function pickPersistable(state) {
  const out = {};
  for (const k of Object.keys(state)) {
    if (!EPHEMERAL_KEYS.has(k)) out[k] = state[k];
  }
  return out;
}

const SAVE_DEBOUNCE_MS = 500;

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [lastSavedAt, setLastSavedAt] = useState(() => getLastSavedAt());
  const [pendingChanges, setPendingChanges] = useState(0);
  const [storageBackend, setStorageBackend] = useState(() => getBackendInfo());
  const [migracionLs, setMigracionLs] = useState(false);
  const saveTimerRef = useRef(null);
  const firstRunRef = useRef(true);
  const hydratedFromIDBRef = useRef(false);

  // Hidratación asíncrona desde IndexedDB tras el primer render. Si Dexie
  // tiene datos distintos o más nuevos que los de localStorage, los aplica
  // con REPLACE_STATE. Si Dexie estaba vacío, migra desde localStorage
  // automáticamente (idempotente).
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const { state: dbState, source, migrated } = await loadStateAsync();
      if (cancelado) return;
      if (migrated) setMigracionLs(true);
      if (dbState && source === "indexeddb") {
        // Solo reemplazar si el snapshot es realmente distinto al de LS,
        // para evitar un render extra cuando ya coinciden (caso común).
        const lsSerialized = JSON.stringify(pickPersistable(state));
        const dbSerialized = JSON.stringify(dbState);
        if (lsSerialized !== dbSerialized) {
          dispatch({ type: "REPLACE_STATE", payload: dbState });
        }
      }
      hydratedFromIDBRef.current = true;
    })();
    return () => {
      cancelado = true;
    };
    // Solo se ejecuta una vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistencia con debounce. El primer render no dispara guardado para no
  // sobrescribir storage con el seed si la app cargó sin datos. saveState
  // ahora escribe a localStorage Y a IndexedDB (fire-and-forget).
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return undefined;
    }
    setPendingChanges((n) => n + 1);
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      const ok = saveState(pickPersistable(state));
      if (ok) {
        setLastSavedAt(new Date().toISOString());
        setPendingChanges(0);
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  const setView = useCallback((v) => dispatch({ type: "SET_VIEW", payload: v }), []);
  const setMonth = useCallback((v) => dispatch({ type: "SET_MONTH", payload: v }), []);
  const setYear = useCallback((v) => dispatch({ type: "SET_YEAR", payload: v }), []);
  const setCompact = useCallback((v) => dispatch({ type: "SET_COMPACT", payload: v }), []);
  const setDiaVista = useCallback((v) => dispatch({ type: "SET_DIA_VISTA", payload: v }), []);
  const setPersonas = useCallback((v) => dispatch({ type: "SET_PERSONAS", payload: v }), []);
  const setActividadesPlan = useCallback((v) => dispatch({ type: "SET_ACTIVIDADES_PLAN", payload: v }), []);
  const setRoleData = useCallback((v) => dispatch({ type: "SET_ROLE_DATA", payload: v }), []);
  const setReglas = useCallback((v) => dispatch({ type: "SET_REGLAS", payload: v }), []);

  const replaceState = useCallback((next) => {
    dispatch({ type: "REPLACE_STATE", payload: next });
  }, []);

  const resetReglas = useCallback(() => {
    dispatch({ type: "SET_REGLAS", payload: { ...REGLAS_DEFAULT } });
  }, []);

  const resetToSeed = useCallback(() => {
    clearState();
    dispatch({ type: "REPLACE_STATE", payload: seedState });
    setLastSavedAt(null);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setView,
      setMonth,
      setYear,
      setCompact,
      setDiaVista,
      setPersonas,
      setActividadesPlan,
      setRoleData,
      setReglas,
      resetReglas,
      replaceState,
      resetToSeed,
      lastSavedAt,
      pendingChanges,
      schemaVersion: SCHEMA_VERSION,
      storageBackend,
      migracionLs,
      dispatch,
    }),
    [
      state,
      setView,
      setMonth,
      setYear,
      setCompact,
      setDiaVista,
      setPersonas,
      setActividadesPlan,
      setRoleData,
      setReglas,
      resetReglas,
      replaceState,
      resetToSeed,
      lastSavedAt,
      pendingChanges,
      storageBackend,
      migracionLs,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an <AppProvider>");
  return ctx;
}

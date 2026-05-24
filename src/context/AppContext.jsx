import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { baseFuncionarios } from "../data/seedFuncionarios.js";
import { baseActividadesPlan } from "../data/seedActividades.js";

const AppContext = createContext(null);

const initialState = {
  view: "dashboard",
  personas: baseFuncionarios,
  month: 4,
  year: 2026,
  compact: false,
  roleData: {},
  actividadesPlan: baseActividadesPlan,
  diaVista: "2026-05-19",
};

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
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setView = useCallback((v) => dispatch({ type: "SET_VIEW", payload: v }), []);
  const setMonth = useCallback((v) => dispatch({ type: "SET_MONTH", payload: v }), []);
  const setYear = useCallback((v) => dispatch({ type: "SET_YEAR", payload: v }), []);
  const setCompact = useCallback((v) => dispatch({ type: "SET_COMPACT", payload: v }), []);
  const setDiaVista = useCallback((v) => dispatch({ type: "SET_DIA_VISTA", payload: v }), []);
  const setPersonas = useCallback((v) => dispatch({ type: "SET_PERSONAS", payload: v }), []);
  const setActividadesPlan = useCallback((v) => dispatch({ type: "SET_ACTIVIDADES_PLAN", payload: v }), []);
  const setRoleData = useCallback((v) => dispatch({ type: "SET_ROLE_DATA", payload: v }), []);

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
      dispatch,
    }),
    [state, setView, setMonth, setYear, setCompact, setDiaVista, setPersonas, setActividadesPlan, setRoleData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an <AppProvider>");
  return ctx;
}

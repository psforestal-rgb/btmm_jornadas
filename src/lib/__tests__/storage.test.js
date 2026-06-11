/**
 * @vitest-environment jsdom
 */
import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  loadState,
  saveState,
  clearState,
  exportSnapshot,
  parseSnapshot,
} from '../storage.js'

describe('storage — localStorage round-trip', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('loadState devuelve null cuando no hay nada persistido', () => {
    expect(loadState()).toBeNull()
  })

  it('saveState + loadState preservan el estado', () => {
    const state = { personas: [{ id: 'f1', nombre: 'X' }], actividadesPlan: [], roleData: {} }
    saveState(state)
    expect(loadState()).toEqual(state)
  })

  it('clearState elimina el contenido persistido', () => {
    saveState({ a: 1 })
    expect(loadState()).not.toBeNull()
    clearState()
    expect(loadState()).toBeNull()
  })

  it('loadState ignora JSON corrupto sin lanzar', () => {
    localStorage.setItem(STORAGE_KEY, '{no es json válido')
    expect(loadState()).toBeNull()
  })

  it('loadState con schemaVersion diferente: descarta y crea backup', () => {
    const obsolete = JSON.stringify({ schemaVersion: 0, savedAt: '2020-01-01', state: { x: 1 } })
    localStorage.setItem(STORAGE_KEY, obsolete)
    expect(loadState()).toBeNull()
    // Debe existir al menos una clave de backup que empiece con pnlq:backup:v0-
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('pnlq:backup:v0-'))
    expect(keys.length).toBeGreaterThan(0)
    expect(localStorage.getItem(keys[0])).toBe(obsolete)
  })
})

describe('storage — snapshot import/export', () => {
  it('exportSnapshot incluye metadatos y schemaVersion', () => {
    const snap = exportSnapshot({ personas: [], actividadesPlan: [], roleData: {} })
    expect(snap.schemaVersion).toBe(SCHEMA_VERSION)
    expect(snap.appName).toMatch(/PNLQ/)
    expect(snap.unidad).toBe('PNLQ-BTMM')
    expect(snap.exportadoEn).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(snap.state).toBeDefined()
  })

  it('parseSnapshot acepta uno válido', () => {
    const snap = exportSnapshot({ personas: [{ id: 'a' }] })
    const r = parseSnapshot(JSON.stringify(snap))
    expect(r.ok).toBe(true)
    expect(r.state.personas).toEqual([{ id: 'a' }])
  })

  it('parseSnapshot rechaza JSON corrupto', () => {
    const r = parseSnapshot('{')
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/malformado/i)
  })

  it('parseSnapshot rechaza schemaVersion distinta', () => {
    const r = parseSnapshot(JSON.stringify({ schemaVersion: 999, state: {} }))
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/incompatible/i)
  })

  it('parseSnapshot rechaza payload sin state', () => {
    const r = parseSnapshot(JSON.stringify({ schemaVersion: SCHEMA_VERSION }))
    expect(r.ok).toBe(false)
  })
})

describe('storage — IndexedDB (Fase 5 paso 1)', () => {
  it('getBackendInfo identifica IndexedDB cuando está disponible', async () => {
    const { getBackendInfo } = await import('../storage.js')
    const info = getBackendInfo()
    expect(info.kind).toBe('indexeddb')
    expect(info.hasIDB).toBe(true)
  })

  it('loadStateAsync devuelve null cuando ambos backends están vacíos', async () => {
    const { loadStateAsync } = await import('../storage.js')
    const { __INTERNALS__ } = await import('../db.js')
    __INTERNALS__.resetSingleton()
    const r = await loadStateAsync()
    expect(r.state).toBeNull()
    expect(r.source).toBeNull()
  })

  it('saveState también escribe a Dexie (dual-write)', async () => {
    const { saveState, loadStateAsync } = await import('../storage.js')
    const state = { personas: [{ id: 'f1' }], reglas: {} }
    saveState(state)
    // dar tiempo al fire-and-forget de Dexie
    await new Promise((r) => setTimeout(r, 50))
    const loaded = await loadStateAsync()
    expect(loaded.state.personas).toEqual([{ id: 'f1' }])
  })

  it('loadStateAsync migra desde localStorage si Dexie está vacío', async () => {
    // Sembrar solo localStorage (sin Dexie).
    const { saveState } = await import('../storage.js')
    const { __INTERNALS__, wipeDexie } = await import('../db.js')
    saveState({ personas: [{ id: 'migrado' }] })
    await wipeDexie() // borrar el dexie de la escritura dual
    __INTERNALS__.resetSingleton()

    const { loadStateAsync } = await import('../storage.js')
    const r = await loadStateAsync()
    expect(r.state.personas).toEqual([{ id: 'migrado' }])
    // Tras la migración, Dexie debería tener el snapshot.
    expect(['indexeddb', 'localStorage']).toContain(r.source)
  })
})

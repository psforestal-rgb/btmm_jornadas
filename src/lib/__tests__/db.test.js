/**
 * @vitest-environment jsdom
 */
import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getDb,
  loadFromDexie,
  saveToDexie,
  clearDexie,
  migrateFromLocalStorageIfNeeded,
  encolarCambio,
  contarPendientes,
  wipeDexie,
  __INTERNALS__,
} from "../db.js";
import { STORAGE_KEY, SCHEMA_VERSION } from "../storage.js";

beforeEach(async () => {
  // Reset singleton + base entre tests para aislamiento.
  __INTERNALS__.resetSingleton();
  // fake-indexeddb mantiene estado entre tests; lo borramos manualmente.
  try {
    const db = await getDb();
    if (db) {
      await db.delete();
    }
  } catch { /* ignorar */ }
  __INTERNALS__.resetSingleton();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("db — Dexie round-trip", () => {
  it("loadFromDexie devuelve null cuando no hay nada", async () => {
    const r = await loadFromDexie();
    expect(r).toBeNull();
  });

  it("saveToDexie + loadFromDexie preservan el payload", async () => {
    const payload = { personas: [{ id: "f1", nombre: "X" }], reglas: { diaCorteViaticos: 15 } };
    const ok = await saveToDexie(payload);
    expect(ok).toBe(true);
    const r = await loadFromDexie();
    expect(r).toEqual(payload);
  });

  it("clearDexie elimina el snapshot", async () => {
    await saveToDexie({ a: 1 });
    expect(await loadFromDexie()).not.toBeNull();
    await clearDexie();
    expect(await loadFromDexie()).toBeNull();
  });
});

describe("db — migración desde localStorage", () => {
  it("copia snapshot de LS a Dexie cuando Dexie está vacío", async () => {
    const payload = { personas: [{ id: "x" }], reglas: {} };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, savedAt: "2026-01-01T00:00:00Z", state: payload }),
    );
    const r = await migrateFromLocalStorageIfNeeded();
    expect(r.migrated).toBe(true);
    expect(r.source).toBe("localStorage");
    expect(await loadFromDexie()).toEqual(payload);
  });

  it("no migra si Dexie ya tiene datos (idempotente)", async () => {
    await saveToDexie({ marcador: "ya-existe" });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, savedAt: "x", state: { marcador: "otro" } }),
    );
    const r = await migrateFromLocalStorageIfNeeded();
    expect(r.migrated).toBe(false);
    const dexieData = await loadFromDexie();
    expect(dexieData.marcador).toBe("ya-existe");
  });

  it("no hace nada si LS está vacío", async () => {
    const r = await migrateFromLocalStorageIfNeeded();
    expect(r.migrated).toBe(false);
    expect(await loadFromDexie()).toBeNull();
  });

  it("rechaza snapshot de LS con schemaVersion distinta", async () => {
    // Sembrar LS con un schemaVersion antiguo (e.g. 0).
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 0,
        savedAt: "2020-01-01T00:00:00Z",
        state: { personas: [{ id: "viejo" }] },
      }),
    );
    const r = await migrateFromLocalStorageIfNeeded();
    expect(r.migrated).toBe(false);
    // Dexie NO debe contener el payload incompatible.
    expect(await loadFromDexie()).toBeNull();
  });

  it("rechaza snapshot de LS sin schemaVersion (payload corrupto)", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { personas: [{ id: "sin-version" }] } }),
    );
    const r = await migrateFromLocalStorageIfNeeded();
    expect(r.migrated).toBe(false);
    expect(await loadFromDexie()).toBeNull();
  });
});

describe("db — cola de pendientes", () => {
  it("encolarCambio aumenta el contador", async () => {
    expect(await contarPendientes()).toBe(0);
    await encolarCambio({ tipo: "actividad.upsert", datos: { id: "a1" } });
    await encolarCambio({ tipo: "persona.upsert", datos: { id: "f1" } });
    expect(await contarPendientes()).toBe(2);
  });

  it("wipeDexie limpia state y pendientes", async () => {
    await saveToDexie({ x: 1 });
    await encolarCambio({ tipo: "x", datos: {} });
    await wipeDexie();
    expect(await loadFromDexie()).toBeNull();
    expect(await contarPendientes()).toBe(0);
  });
});

/**
 * @vitest-environment jsdom
 */
import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { AppProvider } from "../../context/AppContext.jsx";
import SyncStatus from "../SyncStatus.jsx";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderConProvider() {
  return render(
    <AppProvider>
      <SyncStatus />
    </AppProvider>,
  );
}

describe("SyncStatus — indicador global de respaldo", () => {
  it("renderiza con role=status y etiqueta accesible", async () => {
    await act(async () => {
      renderConProvider();
    });
    const pill = screen.getByRole("status");
    expect(pill).toBeDefined();
    expect(pill.getAttribute("aria-label")).toMatch(/En línea|Sin conexión/);
  });

  it("sin respaldo previo muestra el estado inicial", async () => {
    await act(async () => {
      renderConProvider();
    });
    const pill = screen.getByRole("status");
    expect(pill.getAttribute("aria-label")).toMatch(/Sin respaldo aún|Respaldo/);
  });

  it("reacciona al evento offline del navegador", async () => {
    await act(async () => {
      renderConProvider();
    });
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });
    const pill = screen.getByRole("status");
    expect(pill.getAttribute("aria-label")).toMatch(/Sin conexión/);
    // Y vuelve a en línea.
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.getByRole("status").getAttribute("aria-label")).toMatch(/En línea/);
  });
});

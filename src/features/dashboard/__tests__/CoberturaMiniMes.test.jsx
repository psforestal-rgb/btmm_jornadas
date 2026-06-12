/**
 * @vitest-environment jsdom
 */
import "fake-indexeddb/auto";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppProvider } from "../../../context/AppContext.jsx";
import Dashboard from "../Dashboard.jsx";

// Fuerza el modo angosto: useIsMobile consulta (max-width: 1023px).
beforeAll(() => {
  window.matchMedia = (query) => ({
    matches: query === "(max-width: 1023px)",
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderDashboard() {
  return render(
    <AppProvider>
      <Dashboard
        personas={[]}
        alerts={[]}
        setView={vi.fn()}
        actividadesPlan={[]}
        setActividadesPlan={vi.fn()}
        roleData={{}}
        month={5}
        year={2026}
      />
    </AppProvider>,
  );
}

describe("Dashboard — mini-calendario de cobertura en móvil", () => {
  it("muestra una celda por día del mes y la pista inicial", () => {
    renderDashboard();
    // Junio 2026 tiene 30 días.
    expect(screen.getByRole("button", { name: "Resumen del día 1" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Resumen del día 30" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Resumen del día 31" })).toBeNull();
    expect(screen.getByText(/Toque un día para ver su resumen/)).toBeDefined();
  });

  it("tocar un día abre el panel con Turno/Plan/Visit. y botón de detalle", () => {
    renderDashboard();
    fireEvent.click(screen.getByRole("button", { name: "Resumen del día 5" }));
    expect(screen.getByRole("button", { name: /^Ver detalle del día$/ })).toBeDefined();
    // El panel reusa las etiquetas completas de la grilla.
    expect(screen.getAllByText("Turno").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Plan").length).toBeGreaterThan(0);
  });

  it("desde el panel se abre el modal de detalle completo (mismo de la grilla)", () => {
    renderDashboard();
    fireEvent.click(screen.getByRole("button", { name: "Resumen del día 5" }));
    fireEvent.click(screen.getByRole("button", { name: /^Ver detalle del día$/ }));
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});

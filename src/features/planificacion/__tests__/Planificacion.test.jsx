/**
 * @vitest-environment jsdom
 */
import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppProvider } from "../../../context/AppContext.jsx";
import Planificacion from "../Planificacion.jsx";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const personas = [
  {
    id: "f1",
    nombre: "Ana Pérez",
    puesto: "Guardaparques",
    puestoOperativo: "Puesto Quetzales",
    jornada: "Acumulativa",
    modalidad: "10x5",
    estado: "Activo",
  },
];

function renderPlanificacion(props = {}) {
  const base = {
    year: 2026,
    month: 5, // junio
    personas,
    actividadesPlan: [
      {
        id: "a1",
        titulo: "Patrullaje sector norte",
        inicio: "2026-06-10",
        fin: "2026-06-10",
        unDia: true,
        funcionarios: ["Ana Pérez"],
        lugar: "Puesto Quetzales",
        observaciones: "",
        viatico: false,
      },
    ],
    setActividadesPlan: vi.fn(),
    roleData: {},
    setView: vi.fn(),
    setDiaVista: vi.fn(),
  };
  return render(
    <AppProvider>
      <Planificacion {...base} {...props} />
    </AppProvider>,
  );
}

describe("Planificación — modos agenda y cuadrícula", () => {
  it("en escritorio (sin matchMedia móvil) arranca en cuadrícula con las 7 columnas", () => {
    renderPlanificacion();
    expect(screen.getByText("LUNES")).toBeDefined();
    expect(screen.getByText("DOMINGO")).toBeDefined();
    expect(screen.getByText("Patrullaje sector norte")).toBeDefined();
  });

  it("el toggle cambia a agenda y conserva la actividad visible", () => {
    renderPlanificacion();
    fireEvent.click(screen.getByRole("button", { name: /^Agenda$/ }));
    // En agenda no hay encabezado de columnas, pero la actividad sigue ahí.
    expect(screen.queryByText("LUNES")).toBeNull();
    expect(screen.getByText("Patrullaje sector norte")).toBeDefined();
    // Días sin actividades muestran el texto vacío (junio 2026 tiene 30 días, 29 vacíos).
    expect(screen.getAllByText("Sin actividades").length).toBeGreaterThan(0);
    // Vuelta a cuadrícula.
    fireEvent.click(screen.getByRole("button", { name: /^Cuadrícula$/ }));
    expect(screen.getByText("LUNES")).toBeDefined();
  });

  it("la alta rápida de la agenda abre el modal con la fecha del día prellenada", () => {
    renderPlanificacion();
    fireEvent.click(screen.getByRole("button", { name: /^Agenda$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Agregar actividad el día 5" }));
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getAllByDisplayValue("2026-06-05").length).toBeGreaterThan(0);
  });

  it("tocar una actividad de la agenda abre su modal de edición", () => {
    renderPlanificacion();
    fireEvent.click(screen.getByRole("button", { name: /^Agenda$/ }));
    fireEvent.click(screen.getByRole("button", { name: /Patrullaje sector norte/ }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-label")).toMatch(/Editar actividad/);
  });
});

/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "../EmptyState.jsx";

describe("EmptyState", () => {
  it("renderiza título y descripción", () => {
    render(<EmptyState icon="info" title="Vacío" description="Sin datos por mostrar." />);
    expect(screen.getByText("Vacío")).toBeDefined();
    expect(screen.getByText("Sin datos por mostrar.")).toBeDefined();
  });

  it("renderiza el CTA cuando se pasa como acción", () => {
    render(
      <EmptyState
        icon="info"
        title="Vacío"
        description="X"
        action={<button>Crear primero</button>}
      />,
    );
    expect(screen.getByRole("button", { name: /Crear primero/i })).toBeDefined();
  });

  it("aplica tono 'warning' al contenedor (clase con bg-warning-soft)", () => {
    const { container } = render(<EmptyState title="W" tone="warning" />);
    const root = container.firstChild;
    expect(root.className).toMatch(/bg-warning-soft|warning/i);
  });

  it("sin título ni descripción sigue siendo válido (solo icono)", () => {
    render(<EmptyState icon="info" />);
    // No lanza
    expect(document.body.textContent).toBeDefined();
  });
});

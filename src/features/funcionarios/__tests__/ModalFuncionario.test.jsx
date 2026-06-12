/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ModalFuncionario from "../ModalFuncionario.jsx";

afterEach(cleanup);

const valorNuevo = {
  nombre: "",
  cedula: "",
  email: "",
  puesto: "Guardaparques",
  puestoOperativo: "Puesto Quetzales",
  condicion: "Propiedad",
  jornada: "Ordinaria",
  modalidad: "10x5",
  resolucion: "",
  contrato: "",
  vencimiento: "",
  ingreso: "",
  disponibilidad: false,
  policia: false,
  brigada: false,
  ong: false,
  estado: "Activo",
  obs: "",
};

function renderModal(props = {}) {
  const guardar = vi.fn();
  const cerrar = vi.fn();
  render(<ModalFuncionario valor={valorNuevo} cerrar={cerrar} guardar={guardar} {...props} />);
  return { guardar, cerrar };
}

describe("ModalFuncionario — formulario seccionado", () => {
  it("muestra las cinco secciones y observaciones", () => {
    renderModal();
    for (const titulo of [
      "Identificación",
      "Puesto y condición",
      "Jornada y modalidad",
      "Contratación y fechas",
      "Atributos",
      "Observaciones",
    ]) {
      expect(screen.getByRole("heading", { name: titulo })).toBeDefined();
    }
  });

  it("el campo Nombre conserva el foco al teclear (regresión: Field se remontaba)", () => {
    renderModal();
    const input = screen.getByLabelText("Nombre");
    input.focus();
    fireEvent.change(input, { target: { value: "J" } });
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: "Juana" } });
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Juana");
  });

  it("guardar entrega el estado editado completo", () => {
    const { guardar } = renderModal();
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Juana Solís" } });
    fireEvent.change(screen.getByLabelText("Cédula"), { target: { value: "1-1111-1111" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(guardar).toHaveBeenCalledTimes(1);
    const enviado = guardar.mock.calls[0][0];
    expect(enviado.nombre).toBe("Juana Solís");
    expect(enviado.cedula).toBe("1-1111-1111");
    expect(enviado.estado).toBe("Activo");
  });
});

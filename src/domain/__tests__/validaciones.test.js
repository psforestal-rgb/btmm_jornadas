import { describe, it, expect } from 'vitest'
import {
  validarCedula,
  validarCorreo,
  validarRangoFechas,
  detectarTraslape,
  validarFuncionario,
  validarActividad,
} from '../validaciones.js'

describe('validaciones.validarCedula', () => {
  it('null/empty pasa (campo opcional)', () => {
    expect(validarCedula('')).toBeNull()
    expect(validarCedula(null)).toBeNull()
  })
  it('formato 1-XXXX-XXXX pasa', () => {
    expect(validarCedula('1-2345-6789')).toBeNull()
  })
  it('9 dígitos sin guiones pasa', () => {
    expect(validarCedula('123456789')).toBeNull()
  })
  it('formato inesperado falla', () => {
    expect(validarCedula('abc')).toMatch(/formato inesperado/i)
    expect(validarCedula('1-23-4')).toMatch(/formato inesperado/i)
  })
})

describe('validaciones.validarCorreo', () => {
  it('vacío pasa', () => {
    expect(validarCorreo('')).toBeNull()
  })
  it('email válido pasa', () => {
    expect(validarCorreo('a@b.cr')).toBeNull()
    expect(validarCorreo('usuario.x@sinac.go.cr')).toBeNull()
  })
  it('email inválido falla', () => {
    expect(validarCorreo('sin-arroba')).toMatch(/formato/i)
    expect(validarCorreo('a@b')).toMatch(/formato/i)
  })
})

describe('validaciones.validarRangoFechas', () => {
  it('fechas vacías pasan', () => {
    expect(validarRangoFechas('', '')).toBeNull()
  })
  it('fin >= inicio pasa', () => {
    expect(validarRangoFechas('2026-05-01', '2026-05-01')).toBeNull()
    expect(validarRangoFechas('2026-05-01', '2026-05-15')).toBeNull()
  })
  it('fin < inicio falla', () => {
    expect(validarRangoFechas('2026-05-15', '2026-05-01')).toMatch(/anterior/i)
  })
})

describe('validaciones.detectarTraslape', () => {
  const todas = [
    { id: 'a1', inicio: '2026-05-10', fin: '2026-05-12', funcionarios: ['Pablo'] },
    { id: 'a2', inicio: '2026-05-20', fin: '2026-05-20', funcionarios: ['Pablo'] },
    { id: 'a3', inicio: '2026-05-10', fin: '2026-05-10', funcionarios: ['Karen'] },
  ]
  it('detecta solapamiento por funcionario', () => {
    const nueva = { id: 'nueva', inicio: '2026-05-11', fin: '2026-05-11', funcionarios: ['Pablo'] }
    const t = detectarTraslape(nueva, todas)
    expect(t.map((x) => x.id)).toEqual(['a1'])
  })
  it('no detecta si funcionarios distintos', () => {
    const nueva = { id: 'nueva', inicio: '2026-05-11', fin: '2026-05-11', funcionarios: ['Karen'] }
    expect(detectarTraslape(nueva, todas)).toEqual([])
  })
  it('ignora la propia actividad', () => {
    const nueva = { id: 'a1', inicio: '2026-05-10', fin: '2026-05-12', funcionarios: ['Pablo'] }
    expect(detectarTraslape(nueva, todas)).toEqual([])
  })
  it('vacío si no hay funcionarios o fecha', () => {
    expect(detectarTraslape({ inicio: '2026-05-11', funcionarios: [] }, todas)).toEqual([])
    expect(detectarTraslape({ inicio: '', funcionarios: ['Pablo'] }, todas)).toEqual([])
  })
})

describe('validaciones.validarFuncionario — advertencias', () => {
  it('funcionario válido no genera advertencias', () => {
    const f = {
      nombre: 'X', cedula: '1-0000-0001', email: 'x@y.cr',
      disponibilidad: false, jornada: 'Ordinaria',
    }
    expect(validarFuncionario(f)).toEqual([])
  })
  it('detecta nombre vacío', () => {
    const w = validarFuncionario({ nombre: '' })
    expect(w.some((m) => /Nombre/i.test(m))).toBe(true)
  })
  it('detecta disponibilidad sin vencimiento', () => {
    const w = validarFuncionario({ nombre: 'X', disponibilidad: true, vencimiento: '' })
    expect(w.some((m) => /vencimiento/i.test(m))).toBe(true)
  })
  it('detecta acumulativa sin resolución (no ONG)', () => {
    const w = validarFuncionario({ nombre: 'X', jornada: 'Acumulativa', resolucion: '', ong: false })
    expect(w.some((m) => /resolución/i.test(m))).toBe(true)
  })
})

describe('validaciones.validarActividad — advertencias', () => {
  it('actividad válida sin traslape no genera advertencias', () => {
    const a = { titulo: 'X', inicio: '2026-05-10', fin: '2026-05-10', funcionarios: ['Pablo'] }
    expect(validarActividad(a, [])).toEqual([])
  })
  it('detecta título vacío', () => {
    const w = validarActividad({ inicio: '2026-05-10', funcionarios: ['Pablo'] }, [])
    expect(w.some((m) => /Título/i.test(m))).toBe(true)
  })
  it('detecta sin funcionarios', () => {
    const w = validarActividad({ titulo: 'X', inicio: '2026-05-10', funcionarios: [] }, [])
    expect(w.some((m) => /funcionarios/i.test(m))).toBe(true)
  })
  it('detecta traslape', () => {
    const todas = [{ id: 'a1', titulo: 'Otra', inicio: '2026-05-10', fin: '2026-05-12', funcionarios: ['Pablo'] }]
    const a = { id: 'nueva', titulo: 'X', inicio: '2026-05-11', funcionarios: ['Pablo'] }
    const w = validarActividad(a, todas)
    expect(w.some((m) => /Traslape/i.test(m))).toBe(true)
  })
})

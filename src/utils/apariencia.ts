export type Tema = 'sistema' | 'claro' | 'oscuro'
const CLAVE = 'estadliga-tema'
export function leerTema(): Tema {
  try { const valor = localStorage.getItem(CLAVE); if (valor === 'claro' || valor === 'oscuro' || valor === 'sistema') return valor } catch { /* almacenamiento deshabilitado */ }
  return 'sistema'
}
export function aplicarTema(tema: Tema, guardar = true) {
  document.documentElement.dataset.tema = tema
  if (guardar) { try { localStorage.setItem(CLAVE, tema) } catch { /* almacenamiento deshabilitado */ } }
  window.dispatchEvent(new CustomEvent('estadliga:tema', { detail: tema }))
}
export function temaValido(valor: string): valor is Tema { return valor === 'claro' || valor === 'oscuro' || valor === 'sistema' }

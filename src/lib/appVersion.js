/* global __APP_VERSION__, __APP_BUILD_TIME__, __APP_COMMIT__, __APP_VERSION_URL__ */
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
export const APP_BUILD_TIME = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : new Date().toISOString()
export const APP_COMMIT = typeof __APP_COMMIT__ !== 'undefined' ? __APP_COMMIT__ : 'dev'
export const APP_VERSION_URL = typeof __APP_VERSION_URL__ !== 'undefined' ? __APP_VERSION_URL__ : '/version.json'

export function formatBuildTime(iso = APP_BUILD_TIME) {
  try {
    const d = new Date(iso)
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return iso
  }
}

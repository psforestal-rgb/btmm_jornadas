import { APP_VERSION, APP_VERSION_URL } from './appVersion.js'

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000

async function fetchRemoteVersion() {
  const url = `${APP_VERSION_URL}?t=${Date.now()}`
  const res = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function startVersionCheck({ intervalMs = DEFAULT_INTERVAL_MS, onOutdated } = {}) {
  let stopped = false
  let timer = null

  const check = async () => {
    if (stopped || typeof navigator === 'undefined' || !navigator.onLine) return
    try {
      const remote = await fetchRemoteVersion()
      if (remote?.version && remote.version !== APP_VERSION) {
        onOutdated?.({ local: APP_VERSION, remote: remote.version, remoteBuildTime: remote.buildTime, remoteCommit: remote.commit })
      }
    } catch {
      // silencioso: sin red o JSON ausente; reintenta en el siguiente tick.
    }
  }

  const schedule = () => {
    if (stopped) return
    timer = setTimeout(async () => {
      await check()
      schedule()
    }, intervalMs)
  }

  const onVisible = () => { if (document.visibilityState === 'visible') check() }
  const onOnline = () => check()

  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('online', onOnline)

  check()
  schedule()

  return () => {
    stopped = true
    if (timer) clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('online', onOnline)
  }
}

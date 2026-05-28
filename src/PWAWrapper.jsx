import { useState, useEffect, useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { APP_VERSION, formatBuildTime } from './lib/appVersion.js'
import { startVersionCheck } from './lib/versionCheck.js'
import { t } from './i18n/es-CR.js'

const LAST_LOADED_KEY = 'pnlq:lastLoadedAt'

function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div
      className="pnlq-no-print fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl ring-1 ring-emerald-100"
      role="alertdialog"
      aria-label={t("pwa.instalarAria")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-2xl shadow-sm">
          🌲
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">
            {t("pwa.instalarTitulo")}
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">
            {t("pwa.instalarSub")}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onInstall}
              className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700 active:scale-95"
            >
              {t("acciones.instalar")}
            </button>
            <button
              onClick={onDismiss}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 active:scale-95"
            >
              {t("acciones.ahoraNo")}
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-lg p-1 font-black text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={t("acciones.cerrar")}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function OfflineBanner({ lastLoadedAt }) {
  return (
    <div
      className="pnlq-no-print fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 shadow-xl ring-1 ring-amber-200"
      role="alert"
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <div className="flex items-center gap-2 text-sm font-black text-amber-900">
          <span className="text-lg">📡</span>
          {t("pwa.sinConexion")}
        </div>
        {lastLoadedAt && (
          <div className="text-[11px] font-bold text-amber-800/80">
            {t("pwa.ultimaCarga", { fecha: lastLoadedAt })}
          </div>
        )}
      </div>
    </div>
  )
}

function UpdateBanner({ onUpdate, onDismiss, urgent = false, remoteVersion }) {
  const titulo = urgent ? t("pwa.versionDesactualizada") : t("pwa.nuevaVersion")
  const detalleNota = urgent ? t("pwa.urgente") : t("pwa.sugerido")
  const versionLine = `${t("pwa.versionActual", { actual: APP_VERSION })}${remoteVersion ? t("pwa.versionDisponible", { remoto: remoteVersion }) : ""}.${detalleNota}`
  return (
    <div
      className={`pnlq-no-print fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border p-4 shadow-2xl ${
        urgent ? 'border-red-300 bg-red-50 ring-1 ring-red-200' : 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200'
      }`}
      role="alertdialog"
      aria-live="assertive"
      aria-label={t("pwa.bannerAria")}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm ${
            urgent ? 'bg-red-700 text-white' : 'bg-emerald-800 text-white'
          }`}
        >
          ⟳
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">
            {titulo}
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-600">
            {versionLine}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onUpdate}
              className={`rounded-xl px-4 py-2 text-xs font-black text-white shadow-sm active:scale-95 ${
                urgent ? 'bg-red-700 hover:bg-red-800' : 'bg-emerald-800 hover:bg-emerald-700'
              }`}
            >
              {t("acciones.actualizarAhora")}
            </button>
            <button
              onClick={onDismiss}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 active:scale-95"
            >
              {t("acciones.verLuego")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PWAWrapper({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [dismissedInstall, setDismissedInstall] = useState(false)
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const [installed, setInstalled] = useState(false)

  const [versionOutdated, setVersionOutdated] = useState(null)
  const [updateDismissed, setUpdateDismissed] = useState(false)

  const [lastLoadedAt, setLastLoadedAt] = useState(() => {
    try { return localStorage.getItem(LAST_LOADED_KEY) } catch { return null }
  })

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      try {
        const stamp = formatBuildTime(new Date().toISOString())
        localStorage.setItem(LAST_LOADED_KEY, stamp)
        setLastLoadedAt(stamp)
      } catch {
        // localStorage no disponible (modo privado estricto): ignorar.
      }
    },
  })

  useEffect(() => {
    const onBeforeInstall = (e) => { e.preventDefault(); setInstallPrompt(e) }
    const onAppInstalled = () => { setInstalled(true); setInstallPrompt(null) }
    const onOnline  = () => setOffline(false)
    const onOffline = () => setOffline(true)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    const stop = startVersionCheck({
      onOutdated: (info) => setVersionOutdated(info),
    })
    return stop
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
    setDismissedInstall(true)
  }

  const applyUpdate = useCallback(() => {
    setUpdateDismissed(false)
    setVersionOutdated(null)
    setNeedRefresh(false)
    updateServiceWorker(true)
  }, [setNeedRefresh, updateServiceWorker])

  const dismissUpdate = () => setUpdateDismissed(true)

  const showInstall = installPrompt && !dismissedInstall && !installed
  const showUpdate = (needRefresh || !!versionOutdated) && !updateDismissed
  const remoteVersionLabel = versionOutdated?.remote

  return (
    <>
      {children}
      {showInstall && <InstallBanner onInstall={handleInstall} onDismiss={() => setDismissedInstall(true)} />}
      {offline && !showUpdate && <OfflineBanner lastLoadedAt={lastLoadedAt} />}
      {showUpdate && (
        <UpdateBanner
          onUpdate={applyUpdate}
          onDismiss={dismissUpdate}
          urgent={!!versionOutdated}
          remoteVersion={remoteVersionLabel}
        />
      )}
    </>
  )
}

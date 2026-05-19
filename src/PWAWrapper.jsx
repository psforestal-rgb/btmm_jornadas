import { useState, useEffect } from 'react'

function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl ring-1 ring-emerald-100"
      role="alertdialog"
      aria-label="Instalar aplicación PNLQ"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-2xl shadow-sm">
          🌲
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">
            Instalar PNLQ en este dispositivo
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">
            Acceso sin internet · Pantalla completa · Sin navegador
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onInstall}
              className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-emerald-700 active:scale-95"
            >
              Instalar
            </button>
            <button
              onClick={onDismiss}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 active:scale-95"
            >
              Ahora no
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="rounded-lg p-1 font-black text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function OfflineBanner() {
  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 shadow-xl ring-1 ring-amber-200"
      role="alert"
    >
      <div className="flex items-center gap-2 text-sm font-black text-amber-900">
        <span className="text-lg">📡</span>
        Sin conexión — mostrando datos en caché
      </div>
    </div>
  )
}

export default function PWAWrapper({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }
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

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
    }
    setDismissed(true)
  }

  const showBanner = installPrompt && !dismissed && !installed

  return (
    <>
      {children}
      {showBanner  && <InstallBanner onInstall={handleInstall} onDismiss={() => setDismissed(true)} />}
      {offline     && <OfflineBanner />}
    </>
  )
}

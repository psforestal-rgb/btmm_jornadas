import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import PWAWrapper from './PWAWrapper.jsx'
import './index.css'

registerSW({
  onNeedRefresh() {
    // La nueva versión del SW está disponible: actualiza automáticamente.
  },
  onOfflineReady() {
    // La app está lista para funcionar sin conexión.
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PWAWrapper>
      <App />
    </PWAWrapper>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PWAWrapper from './PWAWrapper.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { APP_VERSION, APP_BUILD_TIME, APP_COMMIT } from './lib/appVersion.js'
import './index.css'

if (typeof console !== 'undefined') {
  console.info(`PNLQ v${APP_VERSION} · build ${APP_BUILD_TIME} · commit ${APP_COMMIT}`)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <PWAWrapper>
        <App />
      </PWAWrapper>
    </ThemeProvider>
  </React.StrictMode>,
)

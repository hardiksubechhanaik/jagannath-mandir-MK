import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import App from './App.jsx'
import { disableAutomaticScrollRestoration, setupScrollOnNavigate } from './lib/scrollToTop.js'
import 'leaflet/dist/leaflet.css'
import './lib/leafletIcons.js'
import './styles/global.css'

disableAutomaticScrollRestoration()
setupScrollOnNavigate()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)

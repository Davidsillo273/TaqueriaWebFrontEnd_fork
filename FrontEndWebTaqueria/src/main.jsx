import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'
import { installNumberInputGuard } from './utils/numberInputGuard'

// Ningún campo numérico del sistema acepta "e", "+" ni "-".
installNumberInputGuard()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

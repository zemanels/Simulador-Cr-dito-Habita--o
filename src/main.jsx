import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SimulatorProvider } from './context/SimulatorContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SimulatorProvider>
      <App />
    </SimulatorProvider>
  </StrictMode>,
)

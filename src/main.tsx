import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import './index.css'
import App from './App.tsx'
import { UserProvider } from './context/UserContext.tsx'
import { initTelegramWebApp } from './utils/telegram.ts'

// Initialize Telegram WebApp
initTelegramWebApp()

// Disable zoom (ctrl+wheel, pinch, etc.)
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault()
  }
}, { passive: false })

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
    e.preventDefault()
  }
})

document.addEventListener('gesturestart', (e) => {
  e.preventDefault()
})

document.addEventListener('gesturechange', (e) => {
  e.preventDefault()
})

document.addEventListener('gestureend', (e) => {
  e.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl="https://clicker-dimond.vercel.app/tonconnect-manifest.json">
      <UserProvider>
        <App />
      </UserProvider>
    </TonConnectUIProvider>
  </StrictMode>,
)

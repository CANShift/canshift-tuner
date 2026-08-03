import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { inject } from '@vercel/analytics'
import { initPostHog } from './lib/posthog'
import { initSentry } from './lib/sentry'
import './index.css'

inject()
initPostHog()
initSentry()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BPProvider } from './context/BPContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BPProvider>
      <App />
    </BPProvider>
  </React.StrictMode>
)
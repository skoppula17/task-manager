import React from 'react'
import ReactDOM from 'react-dom/client'
// If the file exists at a different path, update the import accordingly, for example:
import { ThemeProvider } from "./components/theme-provider.tsx"
// Or, if the file does not exist, create it at src/components/theme-provider.tsx or .tsx
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
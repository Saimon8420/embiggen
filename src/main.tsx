import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import '@fontsource-variable/geist'
import '@fontsource/geist-mono/500.css'
import './index.css'
import App from './App.tsx'
import { Toaster } from '@/components/ui/sonner'
import { slugFromPath } from '@/lib/site'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <App initialSlug={slugFromPath(window.location.pathname)} />
      <Toaster position="top-center" />
    </ThemeProvider>
  </StrictMode>,
)

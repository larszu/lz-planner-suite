import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui/App'
import { liesThema, wendeAn } from './lib/thema'
import './index.css'

// VOR dem ersten Rendern, nicht danach. Wer die Entscheidung erst in einem
// Effekt anwendet, zeigt einen Lidschlag lang das falsche Thema — und auf
// einem hellen Schirm ist das ein dunkles Aufblitzen.
wendeAn(liesThema())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

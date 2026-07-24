import { Routes, Route } from 'react-router-dom'

// COMPONENTES IMPORTADOS 
import HomePage from './pages/Home.jsx'
import NotFoundPage from './pages/404.jsx'

import './App.css'

function App() {
  return (
    // -------------- AQUI VA EL HEADER 

    <Routes>
      {/* RUTA PRINCIPAL HOME */}
      <Route path="/" element={<HomePage />} /> 
      {/* RUTA TRABAJOS (EN EL FUTURO SE TENDRAN QUE AÑADIR POR BUCLE TODAS LAS RUTAS DE LOS DIFERENTES TRABAJOS) */}
      <Route path="/works" element={<div>AÑADIR TRABAJOS</div>} />
      {/* RUTA RECURSOS (GEN AI TRAINING) */}
      <Route path="/resources" element={<div>AÑADIR RECURSOS</div>} />
      {/* RUTA BLOG (EN EL FUTURO SE TENDRAN QUE AÑADIR POR BUCLE TODAS LAS RUTAS DE LAS ENTRADAS DEL BLOG)*/}
      <Route path="/blog" element={<div>AÑADIR ENTRADAS DEL BLOG</div>} />
      {/* RUTA CONTACTANOS */}
      <Route path="/contact" element={<div>AÑADIR FORMULARIO DE CONTACTO</div>} />
      {/* RUTA ERROR 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>

    // -------------- AQUI VA EL FOOTER
  )
}

export default App
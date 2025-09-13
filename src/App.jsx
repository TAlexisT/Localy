import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import RegistroUsuario from './pages/registro_usuario'; // Importa el nuevo componente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro-usuario" element={<RegistroUsuario />} />
        {/* Otras rutas */}
      </Routes>
    </Router>
  );
}

export default App;
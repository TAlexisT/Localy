import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import RegistroUsuario from './pages/registro_usuario';
import RegistroAnunciante from './pages/registro_anunciante';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro_usuario" element={<RegistroUsuario />} />
        <Route path="/registro_anunciante" element={<RegistroAnunciante />} />
        {/* Otras rutas de tu aplicación */}
      </Routes>
    </Router>
  );
}

export default App;
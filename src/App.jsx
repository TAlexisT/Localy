import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaginaPrincipal from "./pages/pagina_principal";
import Login from "./pages/login";
import RegistroUsuario from "./pages/registro_usuario";
import RegistroAnunciante from "./pages/registro_anunciante";
import PagoExito from "./pages/pago_exitoso";
import ConfigurarPerfil from "./pages/configura_perfil";
import PerfilRestaurante from "./pages/perfil_restaurante";
import AgregarProducto from "./pages/agregar_producto";
import InformacionProducto from "./pages/informacion_producto";
import Favoritos from "./pages/favoritos";
import Administrador from "./pages/administrador";
import RenovacionExitosa from "./pages/renovacion_exitosa";
import CambiarContrasena from "./pages/cambiar_contrasena";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaginaPrincipal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro_usuario" element={<RegistroUsuario />} />
        <Route path="/registro_anunciante" element={<RegistroAnunciante />} />
        <Route path="/pago_exitoso" element={<PagoExito />} />
        <Route path="/configura_perfil" element={<ConfigurarPerfil />} />
        <Route
          path="/perfil_restaurante/:negocioId"
          element={<PerfilRestaurante />}
        />
        <Route path="/agregar_producto" element={<AgregarProducto />} />
        <Route path="/informacion_producto" element={<InformacionProducto />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/administrador" element={<Administrador />} />
        <Route path="/renovacion_exitosa" element={<RenovacionExitosa />} />
        <Route path="/cambiar_contrasena" element={<CambiarContrasena />} />

        {/* Otras rutas de tu aplicación */}
      </Routes>
    </Router>
  );
}

export default App;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const navigate = useNavigate();

  async function loginUsuario() {
    // Validar campos
    if (!correo || !contrasena) {
      setErrorMessage("Por favor, completa todos los campos");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const url = `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.LOGIN}`;
    const data = { correo, contrasena };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Correo o contraseña incorrecto");
        return;
      }

      setErrorMessage("");

      // ✅ NUEVA LÓGICA DE REDIRECCIÓN
      if (result.exito && result.datos) {
        const usuario = result.datos;

        // Guardar datos del usuario en localStorage para uso posterior
        localStorage.setItem("usuario", JSON.stringify(usuario));

        if (usuario.tipo === "negocio") {
          // Usuario es un negocio - verificar si tiene perfil completo
          await verificarPerfilNegocio(usuario);
        } else if (usuario.tipo === "usuario") {
          // Usuario normal - redirigir a página principal
          navigate("/");
        } else {
          // Tipo no reconocido - redirigir a principal
          navigate("/");
        }
      } else {
        // Fallback si no hay datos
        navigate("/");
      }
    } catch (error) {
      console.error("Error al hacer fetch:", error);
      setErrorMessage("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ FUNCIÓN PARA VERIFICAR PERFIL DEL NEGOCIO
  const verificarPerfilNegocio = async (usuario) => {
    try {
      // Verificar si el negocio ya tiene perfil configurado
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NEGOCIOS.PERFIL(usuario.negocioId)}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const perfil = await response.json();

        // Verificar si el perfil tiene información básica (nombre)
        if (perfil.datos.nombre && perfil.datos.nombre.trim() !== "") {
          // ✅ Perfil completo - redirigir a perfil_restaurante
          navigate("/");
        } else {
          // ❌ Perfil incompleto - redirigir a configura_perfil
          navigate("/configura_perfil", {
            state: {
              negocioId: usuario.negocioId,
              usuario: usuario,
            },
          });
        }
      } else {
        // Si no puede cargar el perfil, asumir que no existe
        navigate("/configura_perfil", {
          state: {
            negocioId: usuario.negocioId,
            usuario: usuario,
          },
        });
      }
    } catch (error) {
      console.error("Error al verificar perfil:", error);
      // En caso de error, redirigir a configura_perfil
      navigate("/configura_perfil", {
        state: {
          negocioId: usuario.negocioId,
          usuario: usuario,
        },
      });
    }
  };

  // Función para recuperar contraseña
  const handlePasswordRecovery = async () => {
    if (!recoveryEmail) {
      setRecoveryMessage("Por favor, ingresa tu correo electrónico");
      return;
    }

    setRecoveryLoading(true);
    setRecoveryMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.PETICION_CAMBIAR_CONTRASENA}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ correo: recoveryEmail }),
        }
      );

      const result = await response.json();

      if (response.ok && result.exito) {
        setRecoveryMessage(
          "Se ha enviado un enlace de recuperación a tu correo electrónico"
        );
        setTimeout(() => {
          setShowPasswordRecovery(false);
          setRecoveryEmail("");
          setRecoveryMessage("");
        }, 3000);
      } else {
        setRecoveryMessage(
          result.message || "Error al enviar la solicitud de recuperación"
        );
      }
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      setRecoveryMessage("Error al conectar con el servidor");
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Manejar envío del formulario con Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      loginUsuario();
    }
  };

  // Manejar Enter en el popup de recuperación
  const handleRecoveryKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePasswordRecovery();
    }
  };

  // Función para redirigir a registro de usuario
  const redirectToUserRegister = () => {
    navigate("/registro_usuario");
  };

  // Función para redirigir a registro de anunciante
  const redirectToAdvertiserRegister = () => {
    navigate("/registro_anunciante");
  };

  // Función para cerrar el popup
  const closeRecoveryPopup = () => {
    setShowPasswordRecovery(false);
    setRecoveryEmail("");
    setRecoveryMessage("");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8">
      {/* Imagen de fondo con capa de oscurecimiento */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/fondoLogin.jpg')",
          }}
        ></div>
        {/* Capa oscura superpuesta */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Contenido */}
      <div className="relative w-full max-w-md p-6 md:p-8 rounded-2xl shadow-lg z-10 bg-white bg-opacity-90">
        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
          LOCALY
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-800">
          Iniciar sesión
        </h2>

        {/* Formulario */}
        <div className="flex flex-col gap-4" onKeyPress={handleKeyPress}>
          {/* Input Correo electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="text"
              placeholder="Ingresa tu correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
              disabled={isLoading}
            />
          </div>

          {/* Input Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
              disabled={isLoading}
            />

            {/* Enlace "Olvidé mi contraseña" */}
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => setShowPasswordRecovery(true)}
                className="text-sm text-green-600 hover:text-green-700 underline"
                disabled={isLoading}
              >
                Olvidé mi contraseña
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {errorMessage && (
            <p className="mt-2 text-red-600 text-sm font-medium text-center">
              {errorMessage}
            </p>
          )}

          {/* Botón iniciar sesión */}
          <button
            onClick={loginUsuario}
            disabled={isLoading}
            className={`w-full text-white font-semibold py-3 rounded-full transition mt-2 ${
              isLoading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </div>

        {/* Separador */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-600 text-sm">o</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Botones registro */}
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            ¿No tienes cuenta? Regístrate como:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={redirectToAdvertiserRegister}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition flex-1 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              Anunciante
            </button>
            <button
              onClick={redirectToUserRegister}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition flex-1 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              Usuario
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-green-600 hover:text-green-700 underline"
            disabled={isLoading}
          >
            Volver a la página principal
          </button>
        </div>
      </div>

      {/* Popup de recuperación de contraseña */}
      {showPasswordRecovery && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
            onKeyPress={handleRecoveryKeyPress}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Recuperar contraseña
            </h3>

            <p className="text-gray-600 mb-4 text-center">
              Ingresa tu correo electrónico para recibir un enlace de
              recuperación
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-black"
                disabled={recoveryLoading}
                autoFocus
              />
            </div>

            {recoveryMessage && (
              <p
                className={`text-sm font-medium text-center mb-4 ${
                  recoveryMessage.includes("Error") ||
                  recoveryMessage.includes("ingresa")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {recoveryMessage}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeRecoveryPopup}
                disabled={recoveryLoading}
                className="flex-1 bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-full hover:bg-gray-400 transition disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordRecovery}
                disabled={recoveryLoading || !recoveryEmail}
                className={`flex-1 text-white font-medium py-2 px-4 rounded-full transition ${
                  recoveryLoading || !recoveryEmail
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {recoveryLoading ? "Enviando..." : "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

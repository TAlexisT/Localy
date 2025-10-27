import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CambiarContrasena() {
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Obtener el token y tramite de la URL
  const token = searchParams.get("token");
  const tramite = searchParams.get("tramite");

  // Verificar si el botón debe estar deshabilitado
  const isButtonDisabled =
    !nuevaContrasena ||
    !confirmarContrasena ||
    nuevaContrasena.length < 6 ||
    nuevaContrasena !== confirmarContrasena ||
    !token ||
    !tramite;

  const handleCambiarContrasena = async () => {
    // Validaciones (por si acaso se llama la función directamente)
    if (!nuevaContrasena || !confirmarContrasena) {
      setErrorMessage("Por favor, completa todos los campos");
      return;
    }

    if (nuevaContrasena.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    if (!token || !tramite) {
      setErrorMessage("Enlace de recuperación no válido");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/usuarios/cambiar-contrasena?tramite=${tramite}&token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contrasena: nuevaContrasena,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.exito) {
        setSuccessMessage("Contraseña cambiada exitosamente");
        setNuevaContrasena("");
        setConfirmarContrasena("");

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrorMessage(result.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setErrorMessage("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isButtonDisabled && !isLoading) {
      handleCambiarContrasena();
    }
  };

  const toggleMostrarNuevaContrasena = () => {
    setMostrarNuevaContrasena(!mostrarNuevaContrasena);
  };

  const toggleMostrarConfirmarContrasena = () => {
    setMostrarConfirmarContrasena(!mostrarConfirmarContrasena);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
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

      <div className="relative w-full max-w-md z-10">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 bg-opacity-95">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              LOCALY
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Cambiar Contraseña
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Ingresa tu nueva contraseña
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-6" onKeyPress={handleKeyPress}>
            {/* Campo Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarNuevaContrasena ? "text" : "password"}
                  placeholder="Ingresa tu nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition text-black"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleMostrarNuevaContrasena}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  {mostrarNuevaContrasena ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m4.242 4.242L15 15m-5.122-5.122A3 3 0 009.878 9.88"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-4">
                Mínimo 8 caracteres
              </p>
            </div>

            {/* Campo Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmarContrasena ? "text" : "password"}
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition text-black"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleMostrarConfirmarContrasena}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  {mostrarConfirmarContrasena ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m4.242 4.242L15 15m-5.122-5.122A3 3 0 009.878 9.88"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mensajes de estado */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm font-medium text-center">
                  {successMessage}
                </p>
                <p className="text-green-600 text-xs text-center mt-1">
                  Redirigiendo al login...
                </p>
              </div>
            )}

            {/* Botón Cambiar Contraseña */}
            <button
              onClick={handleCambiarContrasena}
              disabled={isButtonDisabled || isLoading}
              className={`w-full text-white font-semibold py-3 md:py-4 rounded-full transition ${
                isButtonDisabled || isLoading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 transform hover:scale-105"
              }`}
            >
              {isLoading ? "Cambiando contraseña..." : "Cambiar Contraseña"}
            </button>
          </div>

          {/* Enlaces adicionales */}
          <div className="text-center mt-6 space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="block w-full text-green-600 hover:text-green-700 font-medium py-2 rounded-full transition hover:bg-green-50"
              disabled={isLoading}
            >
              Volver al Inicio de Sesión
            </button>

            <button
              onClick={() => navigate("/")}
              className="block w-full text-gray-600 hover:text-gray-700 font-medium py-2 rounded-full transition hover:bg-gray-50"
              disabled={isLoading}
            >
              Ir a la Página Principal
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center mt-6">
          <p className="text-white text-xs md:text-sm bg-black bg-opacity-50 rounded-lg p-3">
            ¿Problemas para cambiar tu contraseña?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-green-300 hover:text-green-400 underline font-medium"
            >
              Solicitar nuevo enlace
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

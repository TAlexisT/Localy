import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";

export default function RegistroUsuario() {
  const [formData, setFormData] = useState({
    usuario: "",
    contrasena: "",
    correo: "",
    termsAccepted: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" o "error"
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar email antes de enviar
    if (!isValidEmail(formData.correo)) {
      setMessage("Por favor, ingresa un correo electrónico válido.");
      setMessageType("error");
      return;
    }

    // Iniciar estado de carga
    setIsLoading(true);
    setMessage("");

    try {
      // Realizar petición fetch al endpoint
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.USUARIOS.REGISTRO}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Registro exitoso - mostrar mensaje de verificación
        setMessageType("success");
        setVerificationSent(true);

        // Limpiar formulario
        setFormData({
          usuario: "",
          contrasena: "",
          correo: "",
          termsAccepted: false,
        });
      } else {
        // Error del servidor
        setMessage(data.message || "Error en el registro. Intenta nuevamente.");
        setMessageType("error");
        setVerificationSent(false);
      }
    } catch (error) {
      // Error de conexión
      setMessage(
        "Error de conexión. Verifica tu internet o intenta más tarde."
      );
      setMessageType("error");
      setVerificationSent(false);
      console.error("Error:", error);
    } finally {
      // Finalizar estado de carga
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          Regístrate
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="usuario"
              placeholder="Ingresa tu nombre de usuario"
              value={formData.usuario}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isLoading || verificationSent}
            />
          </div>

          {/* Contraseña con icono de visibilidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="contrasena"
                placeholder="Crea una contraseña segura"
                value={formData.contrasena}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isLoading || verificationSent}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 disabled:opacity-50"
                disabled={isLoading || verificationSent}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83"
                    />
                  </svg>
                )}
              </button>
            </div>
            {/* Leyenda de requisitos de contraseña */}
            <p className="text-xs text-gray-500 mt-1 flex items-start">
              <svg
                className="w-4 h-4 mr-1 mt-0.5 text-green-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              La contraseña debe tener al menos 8 caracteres, incluir una letra
              minúscula, una mayúscula, un número y un signo especial.
            </p>
          </div>

          {/* Correo electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              placeholder="Ingresa tu correo electrónico"
              value={formData.correo}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isLoading || verificationSent}
            />
          </div>

          {/* Términos y Condiciones */}
          <div className="mt-2">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 focus:ring-green-400 mt-0.5 flex-shrink-0 disabled:opacity-50 cursor-pointer"
                disabled={isLoading || verificationSent}
                required
              />
              <span
                className={`text-sm ${
                  isLoading || verificationSent
                    ? "text-gray-400"
                    : "text-gray-700"
                }`}
              >
                Al registrarte, aceptas nuestros{" "}
                <a
                  href="/terminos_condiciones"
                  className="text-green-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Términos y Condiciones
                </a>{" "}
                y{" "}
                <a
                  href="/politica_privacidad"
                  className="text-green-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Privacidad
                </a>
              </span>
            </label>
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={isLoading || verificationSent || !formData.termsAccepted}
            className={`w-full text-white font-semibold py-3 rounded-full transition mt-2 ${
              isLoading || verificationSent || !formData.termsAccepted
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-white hover:border hover:text-green-600 hover:border-green-600 hover:scale-105 duration-500"
            }`}
          >
            {isLoading
              ? "Registrando..."
              : verificationSent
              ? "Verificación Enviada"
              : "Regístrate"}
          </button>
        </form>

        {/* Mensaje de retroalimentación */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-center ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Mensaje específico de verificación */}
        {verificationSent && (
          <div className="mt-4 p-3 rounded-lg text-center bg-blue-100 text-blue-700">
            Hemos enviado un enlace de verificación a tu correo. Ábrelo para
            activar tu cuenta.
          </div>
        )}

        {/* Enlace para volver al login */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-white font-semibold bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full transition hover:scale-105 duration-300 disabled:opacity-50"
            disabled={isLoading}
          >
            Volver a la página principal
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";

export default function RegistroAnunciante() {
  const [formData, setFormData] = useState({
    usuario: "",
    contrasena: "",
    correo: "",
    telefono: "",
    price_id: "",
    recurrente: false,
    businessType: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const navigate = useNavigate();

  // 🔹 Aquí defines tus price IDs de Stripe
  const PRICE_IDS = {
    ambulante: {
      recurrente: "price_1STF5iCRgr9HG3VZQLVpwPO3",
      puntual: "price_1SPx5yCRgr9HG3VZEEFVHVHc",
    },
    restaurante: {
      recurrente: "price_1SNPTOC0yYHfNuR2tSp0Dism",
      puntual: "price_1SNPSlC0yYHfNuR2D0PZnjRM",
    },
  };

  const updatePriceId = (tipo, recurrente) => {
    if (!tipo) return "";
    return recurrente ? PRICE_IDS[tipo].recurrente : PRICE_IDS[tipo].puntual;
  };

  // Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    setFormData((prev) => {
      let updated = { ...prev };

      if (name === "businessType") {
        updated.businessType = value;
        updated.price_id = updatePriceId(value, prev.recurrente);
      } else if (name === "recurrente") {
        updated.recurrente = checked;
        updated.price_id = updatePriceId(prev.businessType, checked);
      } else {
        updated[name] = value;
      }

      return updated;
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar email antes de enviar
    if (!isValidEmail(formData.correo)) {
      setMessage("Por favor, ingresa un correo electrónico válido.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NEGOCIOS.CREAR_SESION_PAGO}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Error en la petición al servidor");
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      // 🔹 Cambiado: No redirigir a Stripe, mostrar mensaje de verificación
      setMessageType("success");
      setVerificationSent(true);
    } catch (error) {
      console.error("Error al crear la sesión de pago:", error);
      setMessage(
        "Hubo un problema al procesar tu registro. Intenta nuevamente."
      );
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/fondoLogin.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Contenido */}
      <div className="relative w-full max-w-md p-6 md:p-8 rounded-2xl shadow-lg z-10 bg-white bg-opacity-90">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800">
          LOCALY
        </h1>

        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Regístrate y anuncia tu
          </h2>
          <h2 className="text-xl md:text-2xl font-bold text-green-600 hover:scale-105 duration-300">
            Restaurante
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="usuario"
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
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isLoading || verificationSent}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isLoading || verificationSent}
            />
          </div>

          {/* Tamaño del local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <strong>Tamaño del local / restaurante</strong>
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="businessType"
                  value="ambulante"
                  checked={formData.businessType === "ambulante"}
                  onChange={handleChange}
                  className="text-green-600 focus:ring-green-400 disabled:opacity-50"
                  disabled={isLoading || verificationSent}
                />
                <span
                  className={`text-sm ${
                    isLoading || verificationSent
                      ? "text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  Ambulante (horario limitado)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="businessType"
                  value="restaurante"
                  checked={formData.businessType === "restaurante"}
                  onChange={handleChange}
                  className="text-green-600 focus:ring-green-400 disabled:opacity-50"
                  disabled={isLoading || verificationSent}
                />
                <span
                  className={`text-sm ${
                    isLoading || verificationSent
                      ? "text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  Restaurante
                </span>
              </label>
            </div>
          </div>

          {/* Pago recurrente */}
          <div className="flex items-center mt-4">
            <label
              className={`text-sm font-medium ${
                isLoading || verificationSent
                  ? "text-gray-400"
                  : "text-gray-700"
              }`}
            >
              Pago recurrente
            </label>
            <input
              type="checkbox"
              name="recurrente"
              checked={formData.recurrente}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 focus:ring-green-400 ml-3 disabled:opacity-50  cursor-pointer"
              disabled={isLoading || verificationSent}
            />
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={isLoading || verificationSent}
            className={`w-full text-white font-semibold py-3 rounded-full transition mt-4 ${
              isLoading || verificationSent
                ? "bg-green-400 cursor-not-allowed "
                : "bg-green-600 hover:bg-white hover:border hover:text-green-600 hover:border-green-600 hover:scale-105 duration-500"
            }`}
          >
            {isLoading
              ? "Procesando..."
              : verificationSent
              ? "Registro Enviado"
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
            continuar con el proceso.
          </div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-white font-semibold bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full transition disabled:opacity-50 hover:scale-105 duration-300"
            disabled={isLoading}
          >
            Volver a la página principal
          </button>
        </div>
      </div>
    </div>
  );
}

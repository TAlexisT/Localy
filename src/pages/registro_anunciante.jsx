import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistroAnunciante() {
  const [formData, setFormData] = useState({
    usuario: "",
    contrasena: "",
    correo: "",
    telefono: "",
    price_id: "",
    recurrente: false,
    businessType: "", // 👈 guardamos el tipo para poder recalcular
  });

  const navigate = useNavigate();

  // 🔹 Aquí defines tus price IDs de Stripe
  const PRICE_IDS = {
    ambulante: {
      recurrente: "price_1S8W421rnZa5ePTMqg8QtLWm",
      puntual: "price_1S8W4V1rnZa5ePTMuLtfNJXM"
    },
    restaurante: {
      recurrente: "price_1S8W4q1rnZa5ePTMI7llDwgK",
      puntual: "price_1S8W5A1rnZa5ePTM3nz80AnR"
    }
  };

  const updatePriceId = (tipo, recurrente) => {
    if (!tipo) return "";
    return recurrente ? PRICE_IDS[tipo].recurrente : PRICE_IDS[tipo].puntual;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3000/api/negocios/crear-sesion-pago",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // 👈 mandamos todo el formData
        }
      );

      if (!response.ok) {
        throw new Error("Error en la petición al servidor");
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      // 🔹 Si tu backend responde con la URL de Stripe Checkout:
      if (data.url) {
        window.location.href = data.url; // Redirigir a Stripe Checkout
      } else {
        alert("No se recibió una URL de pago");
      }
    } catch (error) {
      console.error("Error al crear la sesión de pago:", error);
      alert("Hubo un problema al procesar tu registro");
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
          <h2 className="text-xl md:text-2xl font-bold text-green-600">
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
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
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
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
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
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Tamaño del local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <strong>Tamaño del local / restaurante</strong>
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="businessType"
                  value="ambulante"
                  checked={formData.businessType === "ambulante"}
                  onChange={handleChange}
                  className="text-green-600 focus:ring-green-400"
                />
                <span className="text-sm text-gray-700">
                  Ambulante (horario limitado)
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="businessType"
                  value="restaurante"
                  checked={formData.businessType === "restaurante"}
                  onChange={handleChange}
                  className="text-green-600 focus:ring-green-400"
                />
                <span className="text-sm text-gray-700">Restaurante</span>
              </label>
            </div>
          </div>

          {/* Pago recurrente */}
          <div className="flex items-center mt-4">
            <label className="text-sm font-medium text-gray-700">
              Pago recurrente
            </label>
            <input
              type="checkbox"
              name="recurrente"
              checked={formData.recurrente}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 focus:ring-green-400 ml-3"
            />
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition mt-4"
          >
            Registrate
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-green-600 hover:text-green-700 underline"
          >
            Volver a la página principal
          </button>
        </div>
      </div>
    </div>
  );
}

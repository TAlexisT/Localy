import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistroAnunciante() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    businessType: ""
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos del formulario
    console.log("Datos del formulario:", formData);
    // navigate('/'); // Redirigir después del registro exitoso
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8">
      {/* Imagen de fondo con capa de oscurecimiento */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/fondoLogin.jpg')"
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
        
        {/* Subtítulo */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Regístrate y anuncia tu
          </h2>
          <h2 className="text-xl md:text-2xl font-bold text-green-600">
            Restaurante
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Correo electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* Número de teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
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
                <span className="text-sm text-gray-700">Ambulante (horario limitado)</span>
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

          {/* Botón de registro */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition mt-4"
          >
            Registrate
          </button>
        </form>

        {/* Enlace para volver al login */}
        <div className="text-center mt-4">
          <button 
            onClick={() => navigate('/')}
            className="text-sm text-green-600 hover:text-green-700 underline"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}
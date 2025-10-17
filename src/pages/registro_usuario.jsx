import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistroUsuario() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" o "error"
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Iniciar estado de carga
    setIsLoading(true);
    setMessage("");
    
    try {
      // Realizar petición fetch al endpoint
      const response = await fetch('http://localhost:3000/api/usuarios/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials:"include",
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Registro exitoso
        setMessage("¡Registro exitoso! Bienvenido/a.");
        setMessageType("success");
        
        // Limpiar formulario
        setFormData({
          username: "",
          password: "",
          email: ""
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        // Error del servidor
        setMessage(data.message || "Error en el registro. Intenta nuevamente.");
        setMessageType("error");
      }
    } catch (error) {
      // Error de conexión
      setMessage("Error de conexión. Verifica tu internet o intenta más tarde.");
      setMessageType("error");
      console.error("Error:", error);
    } finally {
      // Finalizar estado de carga
      setIsLoading(false);
    }
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
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={isLoading}
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
              placeholder="Crea una contraseña segura"
              value={formData.contrasena}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={isLoading}
            />
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
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={isLoading}
            />
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold py-3 rounded-full transition mt-2 ${
              isLoading 
                ? "bg-green-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Registrando..." : "Regístrate"}
          </button>
        </form>

        {/* Mensaje de retroalimentación */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            messageType === "success" 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}>
            {message}
          </div>
        )}

        {/* Enlace para volver al login */}
        <div className="text-center mt-4">
          <button 
            onClick={() => navigate('/')}
            className="text-sm text-white font-semibold bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full transition"
            disabled={isLoading}
          >
            Volver a la página principal
          </button>
        </div>
      </div>
    </div>
  );
}
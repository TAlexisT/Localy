import { useState } from "react";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loginUsuario() {
    const url = "http://localhost:3000/api/usuarios/login";
    const data = { correo, contrasena };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        // Mostrar mensaje si las credenciales no son correctas
        setErrorMessage("Correo o contraseña incorrecto");
        return;
      }

      setErrorMessage(""); // Limpiar mensaje si el login es exitoso
      console.log("Respuesta del servidor:", result);
      // Aquí podrías redirigir o guardar token en localStorage
    } catch (error) {
      console.error("Error al hacer fetch:", error);
      setErrorMessage("Error al conectar con el servidor");
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center px-6"
      style={{
        backgroundImage: "url('/images/fondoLogin.jpg')"
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Contenido */}
      <div className="relative flex flex-col items-center text-white">
        <h1 className="text-5xl font-bold">LOCALY</h1>
        <h2 className="mt-2 text-2xl font-semibold">Iniciar sesión</h2>

        {/* Inputs */}
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="mt-6 w-72 px-4 py-2 rounded-full outline-none text-black"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          className="mt-4 w-72 px-4 py-2 rounded-full outline-none text-black"
        />

        {/* Mensaje de error */}
        {errorMessage && (
          <p className="mt-4">{errorMessage}</p>
        )}

        {/* Botón iniciar sesión */}
        <button
          onClick={loginUsuario}
          className="mt-4 w-72 bg-green-600 text-white py-2 rounded-full font-semibold hover:bg-green-700 transition"
        >
          Iniciar sesión
        </button>

        {/* Botones registro */}
        <p className="mt-6">Registrarse como:</p>
        <div className="flex gap-4 mt-2">
          <button className="bg-red-700 text-white px-6 py-2 rounded-full hover:bg-red-800 transition">
            Anunciante
          </button>
          <button className="bg-red-700 text-white px-6 py-2 rounded-full hover:bg-red-800 transition">
            Usuario
          </button>
        </div>
      </div>
    </div>
  );
}
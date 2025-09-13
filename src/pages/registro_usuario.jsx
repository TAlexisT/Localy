import { useState } from "react";

export default function Registro() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center px-6">
      {/* Imagen de fondo con opacidad */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-opacity-50"
        style={{
          backgroundImage: "url('/images/fondoLogin.jpg')"
        }}
      ></div>
      
      {/* Contenido */}
      <div className="relative w-full max-w-md p-8 rounded-2xl shadow-lg z-10">
        {/* Título */}
        <h1 className="text-5xl font-extrabold text-white text-center mb-2">
          LOCALY
        </h1>
        <h2 className="text-xl font-bold text-white text-center mb-8">
          Regístrate
        </h2>

        {/* Formulario */}
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="w-full px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full transition"
          >
            Regístrate
          </button>
        </form>
      </div>
    </div>
  );
}

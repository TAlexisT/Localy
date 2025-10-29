// src/pages/ConfigurarPerfil.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from '../../configs.js';

export default function ConfigurarPerfil() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    borrar_logo: false,
    ubicacion: { latitude: 0, longitude: 0 },
    horario: {
      Lunes: { apertura: "", cierre: "" },
      Martes: { apertura: "", cierre: "" },
      Miercoles: { apertura: "", cierre: "" },
      Jueves: { apertura: "", cierre: "" },
      Viernes: { apertura: "", cierre: "" },
      Sabado: { apertura: "", cierre: "" },
      Domingo: { apertura: "", cierre: "" },
    },
    redes: {
      WhatsApp: "",
      X: "",
      Facebook: "",
      Instagram: "",
      TikTok: "",
    },
  });

  // ✅ Obtener negocioId de múltiples fuentes
  const obtenerNegocioId = () => {
    const negocioIdFromState = location.state?.negocioId;
    const usuarioStorage = localStorage.getItem("usuario");
    const usuario = usuarioStorage ? JSON.parse(usuarioStorage) : null;
    const negocioIdFromUsuario = usuario?.negocioId;
    const negocioExistente = location.state?.negocio;
    const negocioIdFromNegocio = negocioExistente?.datos?.negocioId;

    return negocioIdFromState || negocioIdFromUsuario || negocioIdFromNegocio;
  };

  const negocioId = obtenerNegocioId();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  useEffect(() => {
    if (!negocioId) {
      setError("No se pudo identificar el negocio. Redirigiendo...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (usuario.negocioId && usuario.negocioId !== negocioId) {
      setError(
        "No tienes permisos para configurar este perfil. Redirigiendo..."
      );
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const cargarDatosExistente = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.NEGOCIOS.PERFIL(negocioId)}`,
          
          { credentials: "include" }
        );

        if (response.ok) {
          const negocioData = await response.json();

          setFormData((prev) => ({
            ...prev,
            nombre: negocioData.nombre || "",
            descripcion: negocioData.descripcion || "",
            ubicacion: negocioData.ubicacion || { latitude: 0, longitude: 0 },
            horario: negocioData.horario || prev.horario,
            redes: negocioData.redes || prev.redes,
          }));

          if (negocioData.logo) {
            setImagePreview(negocioData.logo);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos existentes:", err);
      } finally {
        setLoading(false);
      }
    };

    const negocioFromState = location.state?.negocio;
    if (negocioFromState) {
      setFormData((prev) => ({
        ...prev,
        nombre: negocioFromState.nombre || "",
        descripcion: negocioFromState.descripcion || "",
        ubicacion: negocioFromState.ubicacion || { latitude: 0, longitude: 0 },
        horario: negocioFromState.horario || prev.horario,
        redes: negocioFromState.redes || prev.redes,
      }));

      if (negocioFromState.logo) {
        setImagePreview(negocioFromState.logo);
      }
    } else {
      cargarDatosExistente();
    }
  }, [negocioId, location.state, navigate, usuario.negocioId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHorarioChange = (dia, tipo, value) => {
    setFormData((prev) => ({
      ...prev,
      horario: {
        ...prev.horario,
        [dia]: {
          ...prev.horario[dia],
          [tipo]: value,
        },
      },
    }));
  };

  const handleRedesChange = (red, value) => {
    setFormData((prev) => ({
      ...prev,
      redes: {
        ...prev.redes,
        [red]: value,
      },
    }));
  };

  // ✅ VALIDACIÓN MEJORADA según el esquema Joi
  const validarFormulario = () => {
    // Validar nombre (requerido, max 100 caracteres)
    if (!formData.nombre.trim()) {
      return "El nombre del negocio es obligatorio";
    }
    if (formData.nombre.length > 100) {
      return "El nombre no puede tener más de 100 caracteres";
    }

    // Validar descripción (max 500 caracteres)
    if (formData.descripcion.length > 500) {
      return "La descripción no puede tener más de 500 caracteres";
    }

    // Validar ubicación
    if (!formData.ubicacion.latitude || !formData.ubicacion.longitude) {
      return "La ubicación es requerida";
    }
    if (formData.ubicacion.latitude < -90 || formData.ubicacion.latitude > 90) {
      return "La latitud debe estar entre -90 y 90";
    }
    if (
      formData.ubicacion.longitude < -180 ||
      formData.ubicacion.longitude > 180
    ) {
      return "La longitud debe estar entre -180 y 180";
    }

    // Validar formato de horas
    const tiempoRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const [dia, horario] of Object.entries(formData.horario)) {
      if (horario.apertura && !tiempoRegex.test(horario.apertura)) {
        return `Formato de hora de apertura inválido para ${dia}`;
      }
      if (horario.cierre && !tiempoRegex.test(horario.cierre)) {
        return `Formato de hora de cierre inválido para ${dia}`;
      }
    }

    // Validar redes sociales
    const whatsappRegex = /^\+?[1-9]\d{1,14}$/;
    if (
      formData.redes.WhatsApp &&
      !whatsappRegex.test(formData.redes.WhatsApp)
    ) {
      return "Formato de WhatsApp inválido. Use formato internacional: +5215512345678";
    }

    // Validar URLs
    const urlRegex = /^https?:\/\/.+\..+$/;
    if (formData.redes.Facebook && !urlRegex.test(formData.redes.Facebook)) {
      return "Formato de Facebook inválido. Debe ser una URL válida";
    }
    if (formData.redes.Instagram && !urlRegex.test(formData.redes.Instagram)) {
      return "Formato de Instagram inválido. Debe ser una URL válida";
    }
    if (formData.redes.TikTok && !urlRegex.test(formData.redes.TikTok)) {
      return "Formato de TikTok inválido. Debe ser una URL válida";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // ✅ Validación del formulario según esquema Joi
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      setLoading(false);
      return;
    }

    // Validación de imagen (opcional)
    const fileInput = document.getElementById("imagen");
    if (fileInput?.files[0]) {
      const file = fileInput.files[0];
      const allowedTypes = ["image/jpeg", "image/png"];

      if (!allowedTypes.includes(file.type)) {
        setError("Por favor selecciona un archivo JPG o PNG");
        setLoading(false);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setError("El tamaño del archivo debe ser menor a 2MB");
        setLoading(false);
        return;
      }
    }

    try {
      // ✅ Crear FormData como espera el backend
      const formDataToSend = new FormData();

      // Agregar campos individuales (el backend espera en req.body)
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("descripcion", formData.descripcion || "");
      formDataToSend.append("ubicacion", JSON.stringify(formData.ubicacion));
      formDataToSend.append("horario", JSON.stringify(formData.horario));
      formDataToSend.append("redes", JSON.stringify(formData.redes));
      formDataToSend.append(
        "borrar_logo",
        formData.borrar_logo && !fileInput?.files[0]
      );

      // Agregar imagen si existe (el backend espera en req.file)
      if (fileInput?.files[0]) {
        formDataToSend.append("imagen", fileInput.files[0]);
        console.log("📁 Archivo seleccionado:", fileInput.files[0]);
      }

      // Debug: mostrar contenido del FormData
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.NEGOCIOS.PERFIL(negocioId)}`,
        {
          method: "PUT",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.mensaje || errorData.error || "Error al actualizar perfil"
          );
        } catch {
          throw new Error(errorText || "Error al actualizar perfil");
        }
      }

      const result = await response.json();
      console.log("✅ Success:", result);

      setSuccess("¡Perfil actualizado exitosamente!");

      // Redirigir después de éxito
      setTimeout(() => {
        navigate(`/perfil_restaurante/${negocioId}`);
      }, 2000);
    } catch (err) {
      console.error("❌ Error completo:", err);
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];

      if (!allowedTypes.includes(file.type)) {
        setError("Por favor selecciona un archivo JPG o PNG");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setError("El tamaño del archivo debe ser menor a 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const obtenerUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            ubicacion: {
              latitude: parseFloat(latitude.toFixed(6)),
              longitude: parseFloat(longitude.toFixed(6)),
            },
          }));
          setError("");
        },
        (error) => {
          setError("No se pudo obtener la ubicación: " + error.message);
        }
      );
    } else {
      setError("Geolocalización no es soportada por este navegador");
    }
  };

  const handleEliminarImagen = () => {
    setImagePreview(null);
    const input = document.getElementById("imagen");
    if (input) input.value = "";
    setFormData((prev) => ({ ...prev, borrar_logo: true }));
    setError("");
  };

  // ✅ Mostrar loading o error de autenticación
  if (!negocioId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error || "No se pudo identificar el negocio"}
          </div>
          <p>Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  if (loading && !formData.nombre) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Cargando datos del negocio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className=" my-5">
          <h1 className="text-3xl font-bold">
            Configura tu perfil ⋅ Negocio
          </h1>
          <h1 className="text-sm text-gray-500 font-semibold mt-2">
           ✓ Esta es una configuración de tu perfil, la podras modificar en cualquier momento.
          </h1>
          
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          {/* Sección de Información Básica */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Local/Restaurante *
                </label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  placeholder="Ej: Restaurante La Delicia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.nombre.length}/100 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción general
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe tu negocio..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.descripcion.length}/1000 caracteres
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Imagen */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Selecciona una imagen o logotipo de tu restaurante para tu perfil.</h2>
            <div className="flex items-center gap-4">
              <input
                id="imagen"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="imagen"
                className="px-4 py-2 bg-green-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition"
              >
                {imagePreview ? "Cambiar Imagen" : "Seleccionar Imagen"}
              </label>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview?.url || imagePreview}
                    alt="Vista previa"
                    className="w-20 h-20 object-cover rounded-md border-2 border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleEliminarImagen}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                  <span className="text-gray-400 text-xs text-center">
                    Sin imagen
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Formatos soportados: JPG, PNG. Tamaño máximo: 2MB
            </p>
          </div>

          {/* Sección de Ubicación */}
          <div className="py-5">
            <div className="flex space-x-2 items-center align-center">
              <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
              <h2 className="text-base font-semibold mb-4 text-gray-500"> - Selecciona "Obtener ubicación  actual"</h2>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={obtenerUbicacionActual}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Obtener Ubicación Actual
              </button>
              <span className="text-sm text-gray-600">
                Lat: {formData.ubicacion.latitude.toFixed(6)}, Lng:{" "}
                {formData.ubicacion.longitude.toFixed(6)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              La ubicación es requerida. Usa el botón para obtener tu ubicación
              actual.
            </p>
          </div>


          {/* Sección de Redes Sociales */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Redes Sociales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  value={formData.redes.WhatsApp}
                  onChange={(e) =>
                    handleRedesChange("WhatsApp", e.target.value)
                  }
                  placeholder="+5215512345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato internacional
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X (Twitter)
                </label>
                <input
                  value={formData.redes.X}
                  onChange={(e) => handleRedesChange("X", e.target.value)}
                  placeholder="@tuusuario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.redes.Facebook}
                  onChange={(e) =>
                    handleRedesChange("Facebook", e.target.value)
                  }
                  placeholder="https://facebook.com/tupagina"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.redes.Instagram}
                  onChange={(e) =>
                    handleRedesChange("Instagram", e.target.value)
                  }
                  placeholder="https://instagram.com/tucuenta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TikTok
                </label>
                <input
                  type="url"
                  value={formData.redes.TikTok}
                  onChange={(e) => handleRedesChange("TikTok", e.target.value)}
                  placeholder="https://tiktok.com/@tuusuario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Las URLs deben comenzar con http:// o https://
            </p>
          </div>

          {/* Sección de Horario */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Horario de Atención</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.horario).map(([dia, horario]) => (
                <div key={dia} className="border p-3 rounded-md">
                  <h3 className="font-medium mb-2 capitalize">{dia}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Apertura
                      </label>
                      <input
                        type="time"
                        value={horario.apertura}
                        onChange={(e) =>
                          handleHorarioChange(dia, "apertura", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Cierre
                      </label>
                      <input
                        type="time"
                        value={horario.cierre}
                        onChange={(e) =>
                          handleHorarioChange(dia, "cierre", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Formato: HH:MM (24 horas)
            </p>
          </div>

          

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

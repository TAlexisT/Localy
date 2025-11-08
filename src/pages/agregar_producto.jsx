// src/pages/AgregarProducto.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Save,
  Loader,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Ban,
} from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS } from "../../configs.js";

export default function AgregarProducto() {
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    descripcion: "",
    en_oferta: false,
  });
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [camposCompletos, setCamposCompletos] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [botonDeshabilitado, setBotonDeshabilitado] = useState(false); // Nuevo estado
  const navigate = useNavigate();
  const location = useLocation();

  const categorias = [
    "Mexicana",
    "China",
    "Italiana",
    "Americana",
    "Internacional",
    "Francesa",
    "Asiatica",
    "Vegetariana",
    "Mariscos",
    "Postres",
    "Bebidas",
    "Otras",
  ];

  // Obtener negocioId del state de navegación
  const negocioId = location.state?.negocioId;
  const negocioNombre = location.state?.negocioNombre;

  useEffect(() => {
    // Verificar que tenemos el negocioId
    if (!negocioId) {
      setError("No se pudo identificar el negocio. Redirigiendo...");
      setTimeout(() => navigate("/"), 3000);
      return;
    }
  }, [negocioId, navigate]);

  // Efecto para verificar si todos los campos requeridos están llenos
  useEffect(() => {
    const { nombre, precio, categoria, descripcion } = formData;
    const todosCamposLlenos =
      nombre.trim() !== "" &&
      precio !== "" &&
      categoria !== "" &&
      descripcion.trim() !== "" &&
      imagen !== null;

    setCamposCompletos(todosCamposLlenos);
  }, [formData, imagen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoriaSelect = (categoria) => {
    setFormData((prev) => ({
      ...prev,
      categoria,
    }));
    setIsSelectOpen(false);
  };

  const handleImageChange = (e) => {
    const image = e.target.files[0];
    if (!image) return;

    // Validar tipo de archivo
    if (!image.type.startsWith("image/")) {
      setError(
        "Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.)",
      );
      return;
    }

    // Validar tamaño (max 5MB)
    if (image.size > 2 * 1024 * 1024) {
      setError("La imagen debe ser menor a 2MB");
      return;
    }

    setImagen(image);
    setError("");

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagenPreview(e.target.result);
    };
    reader.readAsDataURL(image);
  };

  const handleRemoveImage = () => {
    setImagen(null);
    setImagenPreview(null);
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      return "El nombre del platillo es requerido";
    }
    if (formData.nombre.length > 100) {
      return "El nombre no puede exceder los 100 caracteres";
    }
    if (!formData.precio) {
      return "El precio es requerido";
    }
    if (isNaN(formData.precio) || parseFloat(formData.precio) < 0) {
      return "El precio debe ser un número válido y no puede ser negativo";
    }
    if (!formData.categoria) {
      return "La categoría es requerida";
    }
    if (formData.descripcion && formData.descripcion.length > 500) {
      return "La descripción no puede exceder los 500 caracteres";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ⬇️⬇️⬇️ DESHABILITAR EL BOTÓN INMEDIATAMENTE ⬇️⬇️⬇️
    setBotonDeshabilitado(true);
    setLoading(true);
    setError("");
    setSuccess("");

    // Validar formulario
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      setLoading(false);
      setBotonDeshabilitado(false); // Rehabilitar en caso de error de validación
      return;
    }

    try {
      // Crear FormData para enviar imagen y datos
      const formDataToSend = new FormData();

      // Agregar campos del formulario
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("precio", formData.precio.toString());
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("descripcion", formData.descripcion || "");
      formDataToSend.append("en_oferta", formData.en_oferta.toString());

      // Agregar imagen si existe
      if (imagen) {
        formDataToSend.append("image", imagen);
      }

      // Enviar datos al backend
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTOS.CREAR(negocioId)}`,
        {
          method: "POST",
          credentials: "include", // Incluir cookies para autenticación
          body: formDataToSend,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.mensaje || `Error ${response.status}: ${response.statusText}`,
        );
      }

      if (!result.exito) {
        throw new Error(result.mensaje || "Error al crear el producto");
      }

      setSuccess("¡Producto creado exitosamente!");

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/perfil_restaurante/${negocioId}`);
      }, 2000);
    } catch (err) {
      console.error("Error al crear producto:", err);
      setError(err.message || "Error de conexión al servidor");

      // ⬇️⬇️⬇️ REHABILITAR EL BOTÓN EN CASO DE ERROR ⬇️⬇️⬇️
      setBotonDeshabilitado(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSelectOpen &&
        !event.target.closest(".categoria-select-container")
      ) {
        setIsSelectOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectOpen]);

  if (!negocioId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error || "No se pudo identificar el negocio"}
          </div>
          <p>Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleVolver}
            className="bg-gray-300 text-white p-3 rounded-full hover:bg-gray-700 transition hover:scale-105 duration-300"
            title="Atrás"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Agrega tu producto
            </h1>
          </div>
        </div>

        {/* Información */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-gray-600">
            Los datos que introduzca serán vistos por las personas que visiten
            la página.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del platillo */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Nombre del platillo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Tacos de carne a la cerveza"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.nombre.length}/100 caracteres
            </p>
          </div>

          {/* Selección de imagen */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Selecciona una imagen para mostrar tu platillo
            </label>

            {imagenPreview ? (
              <div className="relative">
                <img
                  src={imagenPreview}
                  alt="Vista previa"
                  className="w-full h-64 object-cover rounded-lg border-2 border-blue-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 duration-300"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-600 font-medium">
                  Seleccionar imagen
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Formatos soportados: JPG, PNG, etc. Tamaño máximo: 2MB
            </p>
          </div>

          {/* Precio y Oferta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="precio"
                className="block text-lg font-semibold text-gray-900 mb-2"
              >
                Introduce el precio del producto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  placeholder="320"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="en_oferta"
                  checked={formData.en_oferta}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-lg font-semibold text-gray-900">
                  Oferta
                </span>
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="descripcion"
              className="block text-lg font-semibold text-gray-900 mb-2"
            >
              Descripción general
            </label>
            <p className="text-gray-600 mb-3">
              Introduce una pequeña descripción sobre el platillo.
            </p>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe tu platillo..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Separador */}
          <hr className="border-gray-300" />

          {/* Categoría - Select Personalizado */}
          <div className="categoria-select-container">
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Selecciona la categoría a la que pertenece
            </label>

            <div className="relative">
              {/* Botón que simula el select */}
              <button
                type="button"
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between hover:scale-105 duration-300 ${
                  !formData.categoria ? "text-gray-400" : "text-gray-900"
                }`}
              >
                <span>{formData.categoria || "Selecciona una categoría"}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isSelectOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown de opciones */}
              {isSelectOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria}
                      type="button"
                      onClick={() => handleCategoriaSelect(categoria)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors hover:scale-105 duration-300 ${
                        formData.categoria === categoria
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-900"
                      } first:rounded-t-lg last:rounded-b-lg`}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {success}
            </div>
          )}

          {/* Botón de enviar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !camposCompletos || botonDeshabilitado}
              className={`flex items-center gap-2 text-white px-8 py-3 rounded-lg transition hover:scale-105 duration-300 ${
                camposCompletos && !botonDeshabilitado
                  ? "bg-[#12B400] hover:bg-[#0F9A00]"
                  : "bg-[#9B9B9B] cursor-not-allowed"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : botonDeshabilitado ? (
                <>
                  <Ban className="w-5 h-5" />
                  Procesando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar platillo
                </>
              )}
            </button>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">
            Información importante:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Todos los campos marcados con * son obligatorios</li>
            <li>
              • La imagen debe ser de buena calidad y representativa del
              platillo
            </li>
            <li>• El precio debe ser en la moneda local</li>
            <li>
              • Los productos en oferta se mostrarán de manera especial en la
              página
            </li>
            <li>
              • Haz clic solo una vez en "Guardar platillo" para evitar
              duplicados
            </li>
          </ul>
        </div>

        {/* Alerta de protección contra múltiples clics */}
        {(loading || botonDeshabilitado) && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-blue-800 font-medium text-sm">
                  {botonDeshabilitado && !loading
                    ? "✅ Producto guardado. Redirigiendo..."
                    : "⏳ Procesando tu solicitud, por favor espera..."}
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  El botón está deshabilitado para prevenir duplicados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
